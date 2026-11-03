'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useThemeLang } from '@/lib/theme-lang-context';
import { SupportModal } from './SupportModal';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileAccountSheet } from './MobileAccountSheet';
import { UserProfileModal } from './UserProfileModal';
import {
  ShoppingBag,
  ShieldCheck,
  LogOut,
  LogIn,
  Plus,
  Headphones,
  Sun,
  Moon,
  Globe,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export function Navbar({ onOpenAuth }: { onOpenAuth?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t, lang, toggleLang, theme, toggleTheme } = useThemeLang();
  const [supportOpen, setSupportOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isStaging, setIsStaging] = useState(false);

  React.useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('staging') ||
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview')
    ) {
      setIsStaging(true);
    }
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#130712]/90 backdrop-blur-xl border-b border-[#DDE3E8]/70 dark:border-[#3A0F34]/50 transition-colors"
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Brand Logo: Links to /admin for Admins, / for Customers */}
          <Link href={user?.role === 'admin' ? '/admin' : '/'} className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#3A0F34] text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md shadow-[#3A0F34]/30 border border-[#DDE3E8]/40 shrink-0"
            >
              S
            </motion.div>
            <div>
              <div className="font-extrabold text-neutral-900 dark:text-white tracking-tight text-sm sm:text-base flex items-center gap-1.5 leading-none">
                SHEIN <span className="text-[#3A0F34] dark:text-[#DDE3E8] font-bold">Concierge</span>
                {isStaging && (
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#EBF0F4] dark:bg-[#2A1028] border border-[#DDE3E8] text-[8px] sm:text-[9px] font-black text-[#3A0F34] dark:text-[#DDE3E8] tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3A0F34] dark:bg-[#DDE3E8] animate-pulse" />
                    STAGING
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-[#9BAAB6] font-medium tracking-tight mt-0.5">
                {user?.role === 'admin'
                  ? (lang === 'ar' ? 'لوحة تحكم وإدارة المشرف' : 'Admin Operations Control')
                  : (lang === 'ar' ? 'بوابتكِ لشراء كل ما تحبين من شي إن بالجنيه المصري ✨' : t.brandSubtitle)}
              </p>
            </div>
          </Link>

          {/* Center Pill Nav for Desktop */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-white/80 dark:bg-[#1E0C1D] rounded-full border border-[#DDE3E8] dark:border-[#3A0F34]/60 shadow-xs">
            {user?.role === 'admin' ? (
              <>
                <Link
                  href="/admin"
                  className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    pathname === '/admin'
                      ? 'text-white'
                      : 'text-[#3A0F34]/80 dark:text-[#DDE3E8] hover:text-[#3A0F34] dark:hover:text-white'
                  }`}
                >
                  {pathname === '/admin' && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-[#3A0F34] rounded-full shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'إدارة الطلبات' : 'Customer Orders'}</span>
                  </span>
                </Link>

                <Link
                  href="/admin/analytics"
                  className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith('/admin/analytics')
                      ? 'text-white'
                      : 'text-[#3A0F34]/80 dark:text-[#DDE3E8] hover:text-[#3A0F34] dark:hover:text-white'
                  }`}
                >
                  {pathname.startsWith('/admin/analytics') && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-[#3A0F34] rounded-full shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'الإحصائيات والتحليلات' : 'Analytics & Revenue'}</span>
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    pathname === '/'
                      ? 'text-white'
                      : 'text-[#3A0F34]/80 dark:text-[#DDE3E8] hover:text-[#3A0F34] dark:hover:text-white'
                  }`}
                >
                  {pathname === '/' && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-[#3A0F34] rounded-full shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{t.extractCart}</span>
                </Link>

                <Link
                  href="/orders"
                  className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    pathname.startsWith('/orders')
                      ? 'text-white'
                      : 'text-[#3A0F34]/80 dark:text-[#DDE3E8] hover:text-[#3A0F34] dark:hover:text-white'
                  }`}
                >
                  {pathname.startsWith('/orders') && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-[#3A0F34] rounded-full shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{t.myOrders}</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Language Switcher (Ar / En) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLang}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-extrabold bg-[#EBF0F4] dark:bg-[#1E0C1D] hover:bg-[#DDE3E8] dark:hover:bg-[#2A1028] text-[#3A0F34] dark:text-[#DDE3E8] transition-colors cursor-pointer border border-[#DDE3E8] dark:border-[#3A0F34]/50"
              title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="w-3.5 h-3.5 text-[#3A0F34] dark:text-[#DDE3E8]" />
              <span className="text-[11px] sm:text-xs">{lang === 'ar' ? 'English' : 'عربي'}</span>
            </motion.button>

{/* Dark mode toggle temporarily hidden */}

            {/* New Order Button (Hidden for Admins, visible on md+) */}
            {user?.role !== 'admin' && (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hidden md:block">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#EBF0F4] hover:bg-[#DDE3E8] dark:bg-[#240E23] dark:hover:bg-[#321330] text-[#3A0F34] dark:text-[#DDE3E8] border border-[#DDE3E8] dark:border-[#DDE3E8]/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.newOrder}</span>
                </Link>
              </motion.div>
            )}

            {/* Support Contact Button (Desktop) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSupportOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#1A0919] hover:bg-[#EBF0F4] dark:hover:bg-[#240E23] text-neutral-700 dark:text-[#DDE3E8] border border-[#DDE3E8] dark:border-[#3A0F34]/50 transition-colors cursor-pointer"
              title={t.support}
            >
              <Headphones className="w-3.5 h-3.5 text-[#3A0F34] dark:text-[#DDE3E8]" />
              <span className="hidden lg:inline">{t.support}</span>
            </motion.button>

            {/* User Session Profile Chip */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-white dark:bg-[#1A0919] hover:bg-[#EBF0F4] dark:hover:bg-[#240E23] rounded-full border border-[#DDE3E8] dark:border-[#3A0F34]/50 transition-colors cursor-pointer group"
                  title={user.name}
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-1 ring-[#DDE3E8]"
                  />
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 max-w-[70px] sm:max-w-[110px] truncate inline-block">
                    {user.name.split(' ')[0]}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white bg-[#3A0F34] px-1.5 py-0.2 rounded-full border border-[#DDE3E8]/40">
                      Admin
                    </span>
                  )}
                </motion.button>

                {/* Quick Logout for Desktop */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={logout}
                  className="hidden md:flex w-8 h-8 rounded-full border border-[#DDE3E8] dark:border-[#3A0F34]/50 items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-[#EBF0F4] dark:hover:bg-[#240E23] transition-colors cursor-pointer"
                  title={t.signOut}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 8px 20px -4px rgba(58, 15, 52, 0.35)' }}
                whileTap={{ scale: 0.96 }}
                onClick={onOpenAuth}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold bg-[#3A0F34] hover:bg-[#4E1646] text-[#DDE3E8] transition-all shadow-sm shadow-[#3A0F34]/20 cursor-pointer flex items-center gap-1.5 border border-[#DDE3E8]/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.signIn}</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenSupport={() => setSupportOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenAuth={onOpenAuth}
      />

      {/* Mobile User Profile & Settings Drawer / Sheet */}
      <MobileAccountSheet
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenAuth={() => {
          setAccountOpen(false);
          onOpenAuth?.();
        }}
      />

      {/* Customer Profile & Address Management Modal (Desktop & Mobile) */}
      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onOpenSupport={() => setSupportOpen(true)}
      />

      {/* Support Contact Modal */}
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}
