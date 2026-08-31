import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCustomToken,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useTelegram } from '@/hooks/useTelegram';
import { toast } from 'sonner';

// Dev mode user for testing without Firebase
const DEV_USER: User = {
  uid: 'dev-user-123',
  email: 'dev@habittracker.test',
  displayName: 'Dev Tester',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'dev-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: 'dev',
} as unknown as User;

export type ReauthPayload = {
  password?: string;
};

export type AuthProvider = 'email' | 'google' | 'telegram' | 'unknown';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPreviewMode: boolean;
  isDevMode: boolean;
  isTelegramUser: boolean;
  telegramUsername: string | null;
  setPreviewMode: (val: boolean) => void;
  setDevMode: (val: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithTelegram: () => Promise<void>;
  logout: () => Promise<void>;
  requestSignIn: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setPassword: (newPassword: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  deleteAccount: (reauth?: ReauthPayload) => Promise<void>;
  getAuthProvider: () => AuthProvider;
  isEmailProvider: boolean;
  isGoogleProvider: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isTelegram, initData } = useTelegram();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);
  const [forceShowLogin, setForceShowLogin] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null);
  const isLoggingOut = useRef(false);
  const telegramAuthAttempted = useRef(false);

  // Auto sign-in if inside Telegram Mini App
  useEffect(() => {
    if (!isTelegram || !initData || telegramAuthAttempted.current) return;
    telegramAuthAttempted.current = true;

    async function authenticateTelegram() {
      setLoading(true);
      try {
        const endpoint = import.meta.env.VITE_TELEGRAM_AUTH_URL || '/api/telegram-auth';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to authenticate Telegram user');
        }

        const data = await res.json();
        if (data.customToken) {
          if (data.user?.username) {
            setTelegramUsername(data.user.username);
          }
          const userCredential = await signInWithCustomToken(auth, data.customToken);
          // Update profile Firebase Client langsung agar displayName & photoURL terisi instan
          if (userCredential.user && (data.user?.displayName || data.user?.photoURL)) {
            await updateProfile(userCredential.user, {
              displayName: data.user.displayName || userCredential.user.displayName,
              photoURL: data.user.photoURL || userCredential.user.photoURL,
            }).catch(() => {});
            // Update state user lokal agar re-render langsung menampilkan avatar dan nama
            setUser({ ...userCredential.user });
          }
          setIsPreviewMode(false);
          setForceShowLogin(false);
        }
      } catch (err) {
        console.error('Telegram auto-login failed:', err);
        // Fallback: stay on guest/preview mode inside Telegram if backend fails
        setIsPreviewMode(true);
      } finally {
        setLoading(false);
      }
    }

    authenticateTelegram();
  }, [isTelegram, initData]);

  useEffect(() => {
    // Reset isLoggingOut on mount to prevent stuck loading state
    isLoggingOut.current = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    // Handle any pending redirect result from a previous auth attempt
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          setIsPreviewMode(false);
          setForceShowLogin(false);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('getRedirectResult error:', err);
        setLoading(false);
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        setIsPreviewMode(false);
        setForceShowLogin(false);
      }
      // Always set loading to false when auth state changes
      setLoading(false);
      clearTimeout(timeoutId);
    });

    // Timeout fallback: stop loading if auth is slow (increased for Brave)
    timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (isTelegram) {
      throw new Error('Login Google tidak didukung di dalam Telegram Mini App.');
    }
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser(result.user);
        setIsPreviewMode(false);
        setForceShowLogin(false);
      }
    } catch (error: any) {
      console.error('Popup sign-in failed, falling back to redirect:', error);
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError) {
        console.error('Error signing in with Google:', redirectError);
        setLoading(false);
        throw redirectError;
      }
    } finally {
      // Don't set loading false here because redirect might be happening 
      // or onAuthStateChanged will handle it for popup
    }
  };

  const signInWithTelegram = async () => {
    const currentInitData = initData || window.Telegram?.WebApp?.initData;
    if (!currentInitData) {
      toast.error('Data sesi Telegram tidak ditemukan.');
      throw new Error('Telegram session data not found.');
    }
    setLoading(true);
    try {
      const endpoint = import.meta.env.VITE_TELEGRAM_AUTH_URL || '/api/telegram-auth';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: currentInitData }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.error || `Error ${res.status}: Autentikasi Telegram gagal`;
        toast.error(msg);
        throw new Error(msg);
      }

      const data = await res.json();
      if (data.customToken) {
        if (data.user?.username) {
          setTelegramUsername(data.user.username);
        }
        const userCredential = await signInWithCustomToken(auth, data.customToken);
        if (userCredential.user && (data.user?.displayName || data.user?.photoURL)) {
          await updateProfile(userCredential.user, {
            displayName: data.user.displayName || userCredential.user.displayName,
            photoURL: data.user.photoURL || userCredential.user.photoURL,
          }).catch(() => {});
          setUser({ ...userCredential.user });
        }
        setIsPreviewMode(false);
        setForceShowLogin(false);
        toast.success('Berhasil login dengan Telegram!');
      }
    } catch (err: any) {
      console.error('Error signing in with Telegram:', err);
      toast.error(err.message || 'Gagal masuk dengan Telegram');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsPreviewMode(false);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      setIsPreviewMode(false);
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const logout = async () => {
    isLoggingOut.current = true;
    setLoading(true);
    try {
      // Always enable preview mode (main menu) after logout - no login required
      if (!isPreviewMode && !isDevMode) {
        await signOut(auth);
      }
      setIsPreviewMode(true);
      setIsDevMode(false);
      setForceShowLogin(false);
    } catch (error) {
      console.error('Error signing out:', error);
      // Still enable preview mode even if signOut fails
      setIsPreviewMode(true);
      setIsDevMode(false);
      setForceShowLogin(false);
    } finally {
      isLoggingOut.current = false;
      setLoading(false);
    }
  };

  const requestSignIn = () => {
    // Exit preview mode so the login page is rendered
    setIsPreviewMode(false);
    setForceShowLogin(true);
  };

  const setDevMode = (val: boolean) => {
    setIsDevMode(val);
    if (val) {
      setUser(DEV_USER);
      setIsPreviewMode(false);
      setForceShowLogin(false);
    } else {
      setUser(null);
      setIsPreviewMode(true);
    }
  };

  const reauthenticateCurrent = async (currentUser: User, reauth?: ReauthPayload) => {
    const providerId = currentUser.providerData[0]?.providerId;
    if (providerId === EmailAuthProvider.PROVIDER_ID) {
      if (!reauth?.password) {
        throw new Error('Password diperlukan untuk konfirmasi.');
      }
      const credential = EmailAuthProvider.credential(
        currentUser.email ?? '',
        reauth.password,
      );
      await reauthenticateWithCredential(currentUser, credential);
      return;
    }
    if (providerId === GoogleAuthProvider.PROVIDER_ID) {
      // Reauthentication via redirect will cause page reload; user will re-authenticate
      throw new Error('Silakan login ulang menggunakan tombol Login Google.');
    }
    throw new Error('Metode login tidak dikenali. Tidak dapat mengautentikasi ulang.');
  };

  const getAuthProvider = (): AuthProvider => {
    if (auth.currentUser?.uid.startsWith('telegram:')) return 'telegram';
    const providerId = auth.currentUser?.providerData[0]?.providerId;
    if (providerId === EmailAuthProvider.PROVIDER_ID) return 'email';
    if (providerId === GoogleAuthProvider.PROVIDER_ID) return 'google';
    return 'unknown';
  };

  const sendPasswordReset = async (email: string) => {
    if (!email) {
      throw new Error('Email wajib diisi.');
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-email') {
        throw new Error('Email tidak ditemukan atau tidak valid.');
      }
      if (err?.code === 'auth/too-many-requests') {
        throw new Error('Terlalu banyak percobaan. Coba lagi nanti.');
      }
      throw new Error(err?.message || 'Gagal mengirim email reset password.');
    }
  };

  const setPassword = async (newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error('Tidak ada pengguna yang sedang masuk.');
    }
    if (auth.currentUser.providerData[0]?.providerId !== GoogleAuthProvider.PROVIDER_ID) {
      throw new Error('Hanya akun Google yang dapat mengatur password dengan fitur ini.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password baru minimal 6 karakter.');
    }
    // Link credential (Google account) to add email/password sign-in method
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email ?? '',
      newPassword,
    );
    try {
      await linkWithCredential(auth.currentUser, credential);
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        throw new Error('Email sudah digunakan oleh akun lain.');
      }
      if (err?.code === 'auth/provider-already-linked') {
        throw new Error('Akun ini sudah memiliki password.');
      }
      throw err;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error('Tidak ada pengguna yang sedang masuk.');
    }
    if (auth.currentUser.providerData[0]?.providerId !== EmailAuthProvider.PROVIDER_ID) {
      throw new Error('Hanya akun email & password yang dapat mengganti password.');
    }
    if (!currentPassword) {
      throw new Error('Password saat ini wajib diisi.');
    }
    if (newPassword.length < 6) {
      throw new Error('Password baru minimal 6 karakter.');
    }
    try {
      await reauthenticateCurrent(auth.currentUser, { password: currentPassword });
    } catch (err: any) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        throw new Error('Password saat ini salah.');
      }
      throw err;
    }
    await updatePassword(auth.currentUser, newPassword);
  };

  const deleteAccount = async (reauth?: ReauthPayload) => {
    if (!auth.currentUser) {
      throw new Error('Tidak ada pengguna yang sedang masuk.');
    }
    try {
      await reauthenticateCurrent(auth.currentUser, reauth);
    } catch (err: any) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        throw new Error('Password salah. Akun tidak dapat dihapus.');
      }
      throw err;
    }
    await deleteUser(auth.currentUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isPreviewMode: isPreviewMode && !forceShowLogin,
      isDevMode,
      isTelegramUser: Boolean(user?.uid.startsWith('telegram:') || isTelegram),
      telegramUsername,
      setPreviewMode: (val: boolean) => {
        setIsPreviewMode(val);
        setForceShowLogin(!val);
        if (val) setIsDevMode(false);
      },
      setDevMode,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signInWithTelegram,
      logout,
      requestSignIn,
      changePassword,
      setPassword,
      sendPasswordReset,
      deleteAccount,
      getAuthProvider,
      isEmailProvider: getAuthProvider() === 'email',
      isGoogleProvider: getAuthProvider() === 'google',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
