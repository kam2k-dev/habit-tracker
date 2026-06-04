import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import {
  signInWithPopup,
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

export type ReauthPayload = {
  password?: string;
};

export type AuthProvider = 'email' | 'google' | 'unknown';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPreviewMode: boolean;
  setPreviewMode: (val: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const isLoggingOut = useRef(false);

  useEffect(() => {
    // Reset isLoggingOut on mount to prevent stuck loading state
    isLoggingOut.current = false;

    let timeoutId: ReturnType<typeof setTimeout>;

    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        setIsPreviewMode(false);
      }
      // Always set loading to false when auth state changes
      setLoading(false);
      clearTimeout(timeoutId);
    });

    // Timeout fallback: stop loading after 5 seconds
    timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsPreviewMode(false);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
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
      if (isPreviewMode) {
        setIsPreviewMode(false);
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // Reset loading state immediately after signOut
      // onAuthStateChanged will handle the user state update
      isLoggingOut.current = false;
      setLoading(false);
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
      await signInWithPopup(auth, googleProvider);
      return;
    }
    throw new Error('Metode login tidak dikenali. Tidak dapat mengautentikasi ulang.');
  };

  const getAuthProvider = (): AuthProvider => {
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
      isPreviewMode,
      setPreviewMode: setIsPreviewMode,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
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
