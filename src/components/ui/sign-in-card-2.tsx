'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeClosed, ArrowRight, User } from 'lucide-react';

import { Input } from "@/components/ui/input"

interface SignInCard2Props {
  onGoogleSignIn: () => void;
  onEmailSignIn: (email: string, pass: string) => Promise<void>;
  onEmailSignUp: (email: string, pass: string, name: string) => Promise<void>;
  loading?: boolean;
}

export function SignInCard2({ onGoogleSignIn, onEmailSignIn, onEmailSignUp, loading: externalLoading }: SignInCard2Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const isLoading = externalLoading || internalLoading;

  // For 3D card effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setInternalLoading(true);
    try {
      if (isSignUp) {
        await onEmailSignUp(email, password, name);
      } else {
        await onEmailSignIn(email, password);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Background gradient effect - adjusted to Habit Tracker colors (Emerald/Rose/Slate) */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(150deg, #B39DDB 0%, #D1C4E9 20%, #F3E5F5 40%, #FCE4EC 60%, #FFCDD2 80%, #FFAB91 100%)`,
          opacity: 0.15
        }}
      />
      
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Top radial glows */}
      <div className="absolute top-0 left-1/4 transform -translate-x-1/2 w-[60vh] h-[40vh] rounded-b-[50%] bg-emerald-400/10 blur-[80px]" />
      <div className="absolute top-0 right-1/4 transform translate-x-1/2 w-[60vh] h-[40vh] rounded-b-[50%] bg-rose-400/10 blur-[80px]" />
      
      <motion.div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[80vh] h-[80vh] rounded-t-full bg-slate-400/5 dark:bg-slate-400/10 blur-[100px]"
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Card glow effect */}
            <motion.div 
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 10px 2px rgba(var(--primary),0.03)",
                  "0 0 15px 5px rgba(var(--primary),0.05)",
                  "0 0 10px 2px rgba(var(--primary),0.03)"
                ],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut", 
                repeatType: "mirror" 
              }}
            />

              {/* Traveling light beam effect */}
              <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
                <motion.div 
                  className="absolute top-0 left-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
                  animate={{ left: ["-50%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute bottom-0 right-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-rose-400/50 to-transparent"
                  animate={{ right: ["-50%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                />
              </div>

              {/* Glass card background */}
              <div className="relative bg-card/60 backdrop-blur-xl rounded-2xl p-6 border border-border shadow-2xl overflow-hidden">
                {/* Logo and header */}
                <div className="text-center space-y-1 mb-5">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="mx-auto w-[42px] h-[42px] rounded-full border border-border flex items-center justify-center relative overflow-hidden bg-white shadow-sm"
                  >
                    <img src="/favicon.webp" alt="Logo" className="w-[42px] h-[42px] rounded-full object-cover" />
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-foreground"
                  >
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground text-xs"
                  >
                    {isSignUp ? "Join us to start tracking your habits" : "Sign in to continue tracking your habits"}
                  </motion.p>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div className="space-y-3">
                    <AnimatePresence mode='popLayout'>
                      {isSignUp && (
                        <motion.div 
                          key="name-input"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`relative ${focusedInput === "name" ? 'z-10' : ''}`}
                        >
                          <div className="relative flex items-center overflow-hidden rounded-lg">
                            <User className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                              focusedInput === "name" ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                            <Input
                              type="text"
                              placeholder="Full Name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              onFocus={() => setFocusedInput("name")}
                              onBlur={() => setFocusedInput(null)}
                              className="pl-10 h-10 bg-background/50 border-border focus:border-primary/50"
                              required={isSignUp}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Email input */}
                    <div className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}>
                      <div className="relative flex items-center overflow-hidden rounded-lg">
                        <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "email" ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocusedInput("email")}
                          onBlur={() => setFocusedInput(null)}
                          className="pl-10 h-10 bg-background/50 border-border focus:border-primary/50"
                          required
                        />
                      </div>
                    </div>

                    {/* Password input */}
                    <div className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}>
                      <div className="relative flex items-center overflow-hidden rounded-lg">
                        <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "password" ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedInput("password")}
                          onBlur={() => setFocusedInput(null)}
                          className="pl-10 pr-10 h-10 bg-background/50 border-border focus:border-primary/50"
                          required
                        />
                        <div 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-3 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <Eye className="w-4 h-4" /> : <EyeClosed className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Sign in button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative group/button mt-4"
                  >
                    <div className="relative overflow-hidden bg-primary text-primary-foreground font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-primary/20">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-sm font-medium">
                          {isSignUp ? "Sign Up" : "Sign In"}
                          <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                        </span>
                      )}
                    </div>
                  </motion.button>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="mx-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      or continue with
                    </span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  {/* Google Sign In and Preview Mode */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={onGoogleSignIn}
                      disabled={isLoading}
                      className="flex-1 relative group/google"
                    >
                      <div className="relative overflow-hidden bg-background text-foreground font-medium h-10 rounded-lg border border-border hover:bg-accent transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-xs">Google</span>
                      </div>
                    </motion.button>
                  </div>


                {/* Toggle sign in/up */}
                <motion.p 
                  className="text-center text-xs text-muted-foreground mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
                  <button 
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:underline font-medium"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
