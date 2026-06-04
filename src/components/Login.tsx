import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingDots } from '@/components/ui/loading-dots';
import { ArrowLeft, ArrowRight, Lock, LogOut, Mail, Target, User } from 'lucide-react';
import { toast } from 'sonner';

type AuthView = 'landing' | 'login' | 'register' | 'forgot';

export function Login() {
  const {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    logout,
  } = useAuth();
  const [view, setView] = useState<AuthView>('landing');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const goTo = (nextView: AuthView) => {
    resetForm();
    setView(nextView);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      toast.success('Berhasil masuk dengan Google!');
    } catch (error: any) {
      toast.error(error.message || 'Gagal masuk dengan Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      if (view === 'login' || view === 'landing') {
        await signInWithEmail(email, password);
        toast.success('Berhasil masuk!');
      }

      if (view === 'register') {
        await signUpWithEmail(email, password, name);
        toast.success('Akun berhasil dibuat!');
      }

      if (view === 'forgot') {
        await sendPasswordReset(email);
        toast.success('Email recovery berhasil dikirim. Cek inbox Anda.');
        goTo('login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingDots size={6} />
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {(user.displayName || user.email || '?')[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.displayName || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const title = view === 'landing'
    ? 'Habit Tracker Minimalis'
    : view === 'login'
      ? 'Masuk ke Akun'
      : view === 'register'
        ? 'Daftar Akun Baru'
        : 'Recovery Password';

  const subtitle = view === 'landing'
    ? 'Bangun rutinitas kecil, dapatkan hasil besar.'
    : view === 'login'
      ? 'Masuk untuk melanjutkan tracking kebiasaanmu.'
      : view === 'register'
        ? 'Buat akun supaya data kebiasaanmu tersimpan.'
        : 'Masukkan email akun untuk menerima link reset password.';

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.18, 1], x: [0, 45, 0], y: [0, 25, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[10%] -left-[10%] w-[60vh] h-[60vh] rounded-full bg-emerald-400/10 blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.24, 1], x: [0, -35, 0], y: [0, -45, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[10%] -right-[10%] w-[70vh] h-[70vh] rounded-full bg-rose-400/10 blur-[120px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.10]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="relative bg-card/60 backdrop-blur-2xl rounded-[2rem] p-7 border border-white/30 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.18)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative text-center space-y-4 mb-7">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mx-auto w-[42px] h-[42px] rounded-full border border-white/50 flex items-center justify-center bg-white shadow-[0_12px_26px_-12px_rgba(15,23,42,0.45)] overflow-hidden"
            >
              <img src="/favicon.webp" alt="Habit Tracker" className="w-[42px] h-[42px] rounded-full object-cover" />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground/80 leading-relaxed px-4">{subtitle}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="relative"
            >
              {view === 'landing' || view === 'login' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div className="group/field relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within/field:text-primary" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="h-12 pl-11 rounded-2xl bg-background/45 border-white/25 focus:bg-background/80 transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="group/field relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within/field:text-primary" />
                        <Input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          minLength={6}
                          className="h-12 pl-11 rounded-2xl bg-background/45 border-white/25 focus:bg-background/80 transition-all duration-300"
                          required
                        />
                      </div>
                      <div className="flex justify-end px-1">
                        <button
                          type="button"
                          onClick={() => goTo('forgot')}
                          className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                          Lupa password?
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-2xl gap-2 shadow-lg transition-all duration-300 active:scale-[0.98]"
                    >
                      {isSubmitting ? <LoadingDots size={4} /> : 'Masuk ke Dashboard'}
                      {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                    </Button>

                    <div className="relative py-1">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-card/70 backdrop-blur px-2 text-muted-foreground/60 font-medium tracking-wider">
                          Opsi lainnya
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                      variant="outline"
                      className="w-full h-12 rounded-2xl gap-3 bg-white/85 border border-slate-200/80 text-foreground shadow-[0_10px_24px_-12px_rgba(15,23,42,0.55)] hover:bg-white hover:shadow-[0_14px_30px_-14px_rgba(15,23,42,0.7)] transition-all duration-300 active:scale-[0.98]"
                    >
                      <svg className="w-6 h-6 bg-white rounded-full p-0.5 shadow-sm" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="text-sm font-medium">Masuk dengan Google</span>
                    </Button>
                  </div>

                  <p className="pt-2 text-center text-[11px] text-muted-foreground">
                    Baru di sini?{' '}
                    <button
                      type="button"
                      onClick={() => goTo('register')}
                      className="text-primary font-semibold hover:underline underline-offset-4 decoration-2"
                    >
                      Buat akun gratis
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {view === 'register' && (
                    <div className="group/field relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within/field:text-primary" />
                      <Input
                        type="text"
                        placeholder="Nama lengkap"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="h-12 pl-11 rounded-2xl bg-background/45 border-white/25 focus:bg-background/80 transition-all duration-300"
                        required
                      />
                    </div>
                  )}

                  <div className="group/field relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within/field:text-primary" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-12 pl-11 rounded-2xl bg-background/45 border-white/25 focus:bg-background/80 transition-all duration-300"
                      required
                    />
                  </div>

                  {view !== 'forgot' && (
                    <div className="group/field relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within/field:text-primary" />
                      <Input
                        type="password"
                        placeholder="Password minimal 6 karakter"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={6}
                        className="h-12 pl-11 rounded-2xl bg-background/45 border-white/25 focus:bg-background/80 transition-all duration-300"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-3 pt-1">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-2xl gap-2 shadow-lg transition-all duration-300 active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <LoadingDots size={4} />
                      ) : (
                        <>
                          {view === 'register' ? 'Buat Akun Sekarang' : 'Kirim Instruksi Reset'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => goTo('landing')}
                      className="w-full h-12 rounded-2xl gap-2 text-muted-foreground hover:bg-background/45 transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Kembali
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-5 -right-5 w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 z-0 flex items-center justify-center shadow-lg"
        >
          <Target className="w-5 h-5 text-primary/50" />
        </motion.div>
      </motion.div>
    </div>
  );
}
