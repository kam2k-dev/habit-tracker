"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, LogOut, Trash2, Moon, Sun, User, UserCircle } from "lucide-react"
import { ThemeSwitch } from "./theme-switch-button"
import { UserDropdown } from "./user-dropdown"
import { ProfileDialog } from "./profile-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Navbar1Props {
  user: {
    photoURL: string | null
    displayName: string | null
    email: string | null
  } | null
  activeHabitsCount: number
  onLogout: () => void
  onRequestSignIn?: () => void
  onDeleteAll: () => void
  onScrollToTop: () => void
  onAvatarChange?: (avatarUrl: string | null) => void
  isPreviewMode?: boolean
}

const Navbar1 = ({ user, activeHabitsCount, onLogout, onRequestSignIn, onDeleteAll, onScrollToTop, onAvatarChange, isPreviewMode }: Navbar1Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Get current theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(savedTheme as 'light' | 'dark')
  }, [isOpen])

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="sticky top-4 z-50 flex justify-center w-full px-4">
      <div className="flex items-center justify-between px-4 md:px-6 py-2 md:py-2.5 bg-card/95 backdrop-blur-sm rounded-full shadow-lg border border-border w-full max-w-4xl relative">
        {/* Logo */}
        <motion.div
          className="flex items-center cursor-pointer -ml-1"
          onClick={onScrollToTop}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-[42px] h-[42px] mr-2 md:mr-3 flex items-center justify-center overflow-hidden rounded-full">
            <img 
              src="/logo.webp" 
              alt="Habit Tracker" 
              className="w-[42px] h-[42px] rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-base md:text-sm font-semibold leading-tight">Habit Tracker</h1>
            <p className="text-xs md:text-[10px] text-muted-foreground leading-tight">
              {activeHabitsCount} kebiasaan aktif
            </p>
          </div>
        </motion.div>

        {/* Desktop: Theme Switch + User Dropdown */}
        {user && (
          <div className="hidden md:flex items-center gap-2">
            <ThemeSwitch />
            {isPreviewMode ? (
              <div className="flex gap-2">
                <button
                  onClick={onRequestSignIn}
                  className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-semibold leading-none bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm"
                >
                  Sign In / Sign Up
                </button>
              </div>
            ) : (
              <UserDropdown
                user={{
                  name: user.displayName || user.email?.split('@')[0] || 'User',
                  email: user.email || '',
                  avatar: user.photoURL,
                  initials: (user.displayName || 'U').slice(0, 2).toUpperCase(),
                  status: 'online'
                }}
                onLogout={onLogout}
                onDeleteAll={onDeleteAll}
                onProfileClick={() => setIsProfileOpen(true)}
              />
            )}
          </div>
        )}

      {/* Profile Dialog */}
      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onAvatarChange={onAvatarChange || (() => {})}
      />

        {/* Mobile: Avatar Button */}
        {user && (
          <motion.button
            className="md:hidden flex items-center -mr-1"
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
          >
            {isPreviewMode ? (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            ) : (
              <Avatar className="w-11 h-11 border border-white dark:border-gray-700 overflow-hidden shadow-sm">
                {user.photoURL ? (
                  <AvatarImage
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-muted flex items-center justify-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
          </motion.button>
        )}
      </div>

      {/* Mobile Popup Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
            />
            {/* Popup Menu */}
            <motion.div
              className="fixed top-24 left-4 right-4 bg-card border border-border rounded-2xl shadow-2xl z-50 p-4 md:hidden"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header: User Info + Close Button */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between mb-2"
                >
                    <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14 border border-white dark:border-gray-700 overflow-hidden">
                      {user.photoURL ? (
                        <AvatarImage
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      ) : (
                        <AvatarImage
                          src="/logo.webp"
                          alt="Logo"
                          className="object-cover opacity-50"
                        />
                      )}
                      <AvatarFallback className="bg-muted flex items-center justify-center">
                        <User className="h-7 w-7 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={toggleMenu}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full hover:bg-muted"
                  >
                    <X className="h-5 w-5 text-foreground" />
                  </motion.button>
                </motion.div>
              )}

              {/* Mobile Menu Items */}
              <div className="flex flex-col space-y-2">
                {isPreviewMode ? (
                  <>
                    {/* Theme Toggle for Preview Mode */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      onClick={() => {
                        const newTheme = theme === 'light' ? 'dark' : 'light'
                        setTheme(newTheme)
                        localStorage.setItem('theme', newTheme)
                        document.documentElement.classList.toggle('dark', newTheme === 'dark')
                      }}
                      className="flex items-center gap-3 p-3 text-gray-600 dark:text-gray-400 hover:bg-muted rounded-xl transition-colors text-left"
                    >
                      {theme === 'light' ? (
                        <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                      <span>Mode {theme === 'light' ? 'Gelap' : 'Terang'}</span>
                    </motion.button>

                    {/* Sign In button for Preview Mode */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => {
                        if (onRequestSignIn) onRequestSignIn();
                        toggleMenu()
                      }}
                      className="flex items-center gap-3 p-3 bg-primary text-primary-foreground hover:opacity-90 rounded-xl transition-colors text-left font-semibold justify-center"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign In / Sign Up</span>
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* Profile - First after account header */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      onClick={() => {
                        setIsProfileOpen(true)
                        toggleMenu()
                      }}
                      className="flex items-center gap-3 p-3 text-gray-600 dark:text-gray-400 hover:bg-muted rounded-xl transition-colors text-left"
                    >
                      <UserCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span>Profil</span>
                    </motion.button>

                    {/* Theme Toggle */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => {
                        const newTheme = theme === 'light' ? 'dark' : 'light'
                        setTheme(newTheme)
                        localStorage.setItem('theme', newTheme)
                        document.documentElement.classList.toggle('dark', newTheme === 'dark')
                      }}
                      className="flex items-center gap-3 p-3 text-gray-600 dark:text-gray-400 hover:bg-muted rounded-xl transition-colors text-left"
                    >
                      {theme === 'light' ? (
                        <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                      <span>Mode {theme === 'light' ? 'Gelap' : 'Terang'}</span>
                    </motion.button>

                    {/* Delete All */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      onClick={() => {
                        onDeleteAll()
                        toggleMenu()
                      }}
                      className="flex items-center gap-3 p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                    >
                      <Trash2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span>Hapus Semua Kebiasaan</span>
                    </motion.button>

                    {/* Logout */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      onClick={() => {
                        onLogout()
                        toggleMenu()
                      }}
                      className="flex items-center gap-3 p-3 text-gray-600 dark:text-gray-400 hover:bg-muted rounded-xl transition-colors text-left"
                    >
                      <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span>Keluar</span>
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Dialog for Mobile */}
      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onAvatarChange={onAvatarChange || (() => {})}
      />
    </div>
  )
}

export { Navbar1 }
