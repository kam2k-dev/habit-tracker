"use client";

import { useState, useRef, useCallback, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/context/language-context";
import { useSettings } from "@/context/settings-context";

// Preset avatar options from local provided images
const PRESET_AVATARS = [
  "/avatars/1.webp",
  "/avatars/2.webp",
  "/avatars/3.webp",
  "/avatars/4.webp",
  "/avatars/5.webp",
  "/avatars/6.webp",
  "/avatars/7.webp",
  "/avatars/8.webp",
  "/avatars/9.webp"
];

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    email: string | null;
    photoURL: string | null;
    displayName: string | null;
  } | null;
  onAvatarChange: (avatarUrl: string | null) => void;
}

export function ProfileDialog({ isOpen, onClose, user, onAvatarChange }: ProfileDialogProps) {
  const { t } = useLanguage();
  const { swipeDirection, setSwipeDirection } = useSettings();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(user?.photoURL || null);
  const [_uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isAvatarSettingsOpen, setIsAvatarSettingsOpen] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [saveAvatarLoading, setSaveAvatarLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const { changePassword, setPassword, deleteAccount, isGoogleProvider, getAuthProvider, telegramUsername } = useAuth();
  const isTelegramUser = getAuthProvider() === 'telegram';

  // Sync selectedAvatar with user.photoURL when dialog opens or user changes
  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(prev => prev !== (user?.photoURL || null) ? (user?.photoURL || null) : prev);
    }
  }, [isOpen, user?.photoURL]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSelectPreset = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setUploadedImage(null);
  };

  const handleSaveAvatar = async () => {
    setSaveAvatarLoading(true);
    try {
      // Update Firebase profile photoURL if user is logged in
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { photoURL: selectedAvatar ?? null });
        } catch (err: any) {
          console.error("Failed to update Firebase profile:", err);
        }
      }
      onAvatarChange(selectedAvatar);
      toast.success("Avatar berhasil diperbarui!");
      setIsAvatarSettingsOpen(false);
    } catch (err: any) {
      toast.error("Gagal menyimpan avatar");
    } finally {
      setSaveAvatarLoading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatar(null);
    setUploadedImage(null);
  };

  const handleChangePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChangePasswordError(null);
    setChangePasswordLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const newPassword = formData.get("newPassword") as string;

      if (isGoogleProvider) {
        await setPassword(newPassword);
      } else {
        const currentPassword = formData.get("currentPassword") as string;
        await changePassword(currentPassword, newPassword);
      }

      setIsChangePasswordOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setChangePasswordError(err?.message ?? "Terjadi kesalahan");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleDeleteAccountSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDeleteAccountError(null);
    setDeleteAccountLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const password = formData.get("password") as string;
      await deleteAccount({ password });
      onClose(); // Close profile dialog after account deletion
    } catch (err: any) {
      setDeleteAccountError(err?.message ?? "Terjadi kesalahan");
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[92vw] rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            {t('profile.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Current Avatar Preview */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative group cursor-pointer"
              onClick={() => setIsAvatarSettingsOpen(true)}
            >
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white dark:border-gray-700 shadow-lg transition-transform group-hover:scale-105">
                {selectedAvatar ? (
                  <AvatarImage 
                    src={selectedAvatar} 
                    alt={displayName} 
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-muted text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              {selectedAvatar && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-rose-500 text-white rounded-full shadow-md z-10"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              )}
            </motion.div>
            
            <div className="text-center">
              <p className="font-medium text-sm">{displayName}</p>
              {isTelegramUser && (
                <p className="text-xs text-[#24A1DE] font-medium">
                  {telegramUsername ? `@${telegramUsername}` : 'Telegram User'}
                </p>
              )}
              {!isTelegramUser && (
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              )}
            </div>
          </div>

          {/* Action Buttons - hidden when avatar settings open */}
          {!isAvatarSettingsOpen && (
            <div className="space-y-3">
              {/* Swipe Direction Setting */}
              <div className="space-y-2 rounded-xl border border-border bg-card/40 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{t('profile.swipeDirection')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('profile.swipeDirectionDesc')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={swipeDirection === 'left' ? 'default' : 'outline'}
                    onClick={() => setSwipeDirection('left')}
                    className="flex-1"
                  >
                    {t('profile.swipeLeft')}
                  </Button>
                  <Button
                    variant={swipeDirection === 'right' ? 'default' : 'outline'}
                    onClick={() => setSwipeDirection('right')}
                    className="flex-1"
                  >
                    {t('profile.swipeRight')}
                  </Button>
                </div>
              </div>

              {!isTelegramUser && (
                <Button
                  variant="outline"
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="w-full"
                >
                  {isGoogleProvider ? "Set Password" : "Ubah Password"}
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => setIsDeleteAccountOpen(true)}
                className="w-full"
              >
                Hapus Akun
              </Button>
            </div>
          )}

          {/* Avatar Settings Panel */}
          {isAvatarSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 rounded-xl border border-border bg-card/40 p-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold">Setting Avatar</p>
                <p className="text-xs text-muted-foreground">
                  Upload foto baru atau pilih dari avatar yang tersedia di webapp.
                </p>
              </div>

              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 hover:border-primary/50"
                }`}
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Klik atau drop gambar di sini
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {/* Preset Avatars */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Avatar Tersedia
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.map((avatarUrl, idx) => {
                    const isSelected = selectedAvatar === avatarUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(avatarUrl)}
                        className={`relative aspect-square overflow-hidden rounded-full border-2 transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/40 scale-105"
                            : "border-transparent hover:scale-105"
                        }`}
                      >
                        <img
                          src={avatarUrl}
                          alt={`Avatar ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Check className="h-4 w-4 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save / Cancel buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAvatarSettingsOpen(false);
                    setSelectedAvatar(user?.photoURL ?? null);
                    setUploadedImage(null);
                  }}
                  className="flex-1"
                  disabled={saveAvatarLoading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSaveAvatar}
                  className="flex-1"
                  disabled={saveAvatarLoading}
                >
                  {saveAvatarLoading ? "Menyimpan..." : "Simpan Avatar"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Change Password Form */}
          {isChangePasswordOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <p className="font-medium text-sm">{isGoogleProvider ? "Set Password" : "Ubah Password"}</p>
                <p className="text-xs text-muted-foreground">
                  {isGoogleProvider
                    ? "Tambahkan password untuk akun Google agar bisa login dengan email juga."
                    : "Masukkan password saat ini dan password baru untuk mengganti password akun Anda."}
                </p>
              </div>
              {changePasswordError && (
                <p className="text-xs text-destructive">{changePasswordError}</p>
              )}
              <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                {!isGoogleProvider && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Password Saat Ini
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      required={!isGoogleProvider}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground/40"
                      placeholder="••••••••"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {isGoogleProvider ? "Password Baru" : "Password Baru"}
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground/40"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsChangePasswordOpen(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={changePasswordLoading}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {changePasswordLoading ? "Menyimpan..." : isGoogleProvider ? "Set Password" : "Ubah Password"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Delete Account Form */}
          {isDeleteAccountOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <p className="font-medium text-sm text-destructive">Hapus Akun</p>
                <p className="text-xs text-muted-foreground">
                  Tindakan ini tidak dapat dibatalkan. Akun Anda dan semua data akan dihapus secara permanen.
                </p>
              </div>
              {deleteAccountError && (
                <p className="text-xs text-destructive">{deleteAccountError}</p>
              )}
              <form onSubmit={handleDeleteAccountSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Konfirmasi Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground/40"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteAccountOpen(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={deleteAccountLoading}
                    className="flex-1 bg-destructive text-white hover:bg-destructive/90"
                  >
                    {deleteAccountLoading ? "Menghapus..." : "Hapus Akun"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
