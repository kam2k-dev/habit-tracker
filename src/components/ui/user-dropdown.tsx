"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  UserCircle, 
  Sun, 
  LogOut,
  Moon
} from "lucide-react";

interface UserDropdownProps {
  user?: {
    name: string;
    email?: string;
    username?: string;
    avatar?: string | null;
    initials?: string;
    status?: string;
  };
  onLogout?: () => void;
  onDeleteAll?: () => void;
  onThemeToggle?: () => void;
  onProfileClick?: () => void;
  theme?: 'light' | 'dark';
}

export function UserDropdown({ 
  user = {
    name: "User",
    email: "",
    username: "",
    avatar: null,
    initials: "U",
    status: "online"
  },
  onLogout,
  onDeleteAll,
  onThemeToggle,
  onProfileClick,
  theme = 'light'
}: UserDropdownProps) {
  const displayName = user.name || user.email?.split('@')[0] || "User";
  const initials = user.initials || displayName.slice(0, 2).toUpperCase();
  const username = user.username || user.email || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer size-[42px] border border-white dark:border-gray-700 hover:ring-2 hover:ring-primary/20 transition-all overflow-hidden">
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={displayName} referrerPolicy="no-referrer" className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-muted text-muted-foreground text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-[280px] rounded-2xl bg-gray-50 dark:bg-black/90 p-0" 
        align="end"
        sideOffset={8}
      >
        <section className="bg-white dark:bg-gray-100/10 backdrop-blur-lg rounded-2xl p-1 shadow border border-gray-200 dark:border-gray-700/20">
          {/* User Header */}
          <div className="flex items-center p-3">
            <div className="flex-1 flex items-center gap-3">
              <Avatar className="cursor-pointer size-[42px] border border-white dark:border-gray-700 overflow-hidden">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={displayName} referrerPolicy="no-referrer" className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {displayName}
                </h3>
                <p className="text-muted-foreground text-xs truncate">
                  {username}
                </p>
              </div>
            </div>
          </div>

          {/* Profile */}
          <DropdownMenuGroup>
            <DropdownMenuItem 
              className="cursor-pointer p-2.5 rounded-lg hover:bg-accent"
              onClick={onProfileClick}
            >
              <span className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-400 text-sm">
                <UserCircle className="size-4 text-gray-500 dark:text-gray-400" />
                Profil
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          {/* Theme Toggle - Only for mobile */}
          {onThemeToggle && (
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="cursor-pointer p-2.5 rounded-lg hover:bg-accent"
                onClick={onThemeToggle}
              >
                <span className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-400 text-sm">
                  {theme === 'light' ? (
                    <Sun className="size-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Moon className="size-4 text-gray-500 dark:text-gray-400" />
                  )}
                  Mode {theme === 'light' ? 'Terang' : 'Gelap'}
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          )}

          {/* Account Actions */}
          <DropdownMenuGroup>
            {onDeleteAll && (
              <DropdownMenuItem 
                className="cursor-pointer p-2.5 rounded-lg hover:bg-rose-50 text-rose-600"
                onClick={onDeleteAll}
              >
                <span className="flex items-center gap-2 font-medium text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-gray-500 dark:text-gray-400">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                  Hapus Semua Kebiasaan
                </span>
              </DropdownMenuItem>
            )}
            
            {onLogout && (
              <DropdownMenuItem 
                className="cursor-pointer p-2.5 rounded-lg hover:bg-accent"
                onClick={onLogout}
              >
                <span className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-400 text-sm">
                  <LogOut className="size-4 text-gray-500 dark:text-gray-400" />
                  Keluar
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </section>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserDropdown;
