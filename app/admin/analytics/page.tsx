'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Order, SystemSettings, User } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { useThemeLang } from '@/lib/theme-lang-context';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import {
  TrendingUp,
  CreditCard,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileCheck,
  Users,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Package,
  Percent,
  CheckCheck,
  ChevronRight,
  Ban,
  ArrowUpRight,
} from 'lucide-react';

function formatLastSeen(dateString?: string, isRtl = true): { label: string; isOnline: boolean } {
  if (!dateString) return { label: isRtl ? 'لم يسجل دخول بعد' : 'Never logged in', isOnline: false };
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 15) {
    return { label: isRtl ? 'متصل الآن' : 'Online Now', isOnline: true };
  }
  if (diffMin < 60) {
    return { label: isRtl ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`, isOnline: false };
  }
  if (diffHours < 24) {
    return { label: isRtl ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`, isOnline: false };
  }
  if (diffDays === 1) {
    return { label: isRtl ? 'أمس' : 'Yesterday', isOnline: false };
  }
  if (diffDays < 7) {
    return { label: isRtl ? `منذ ${diffDays} أيام` : `${diffDays}d ago`, isOnline: false };
  }
  return { label: new Date(dateString).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US'), isOnline: false };
}

export default function AdminAnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { dir, lang } = useThemeLang();
  const isRtl = dir === 'rtl';

  const [orders, setOrders] = useState<Order[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, settingsRes, usersRes] = await Promise.all([
        fetch('/api/orders?admin=true'),
        fetch('/api/settings'),
        fetch('/api/users'),
      ]);

      const ordersJson = await ordersRes.json();
      const settingsJson = await settingsRes.json();
      const usersJson = await usersRes.json();

      if (ordersJson.success) setOrders(ordersJson.data);
      if (settingsJson.success) setSettings(settingsJson.data);
      if (usersJson.success) setRegisteredUsers(usersJson.data);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const now = Date.now();
    const days = timeRange === '30d' ? 30 : 7;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
  }, [orders, timeRange]);

  // Calculations
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;

    // Active pipeline orders: exclude both REJECTED and CANCELLED
    const activeOrders = filteredOrders.filter(
      (o) => o.status !== 'REJECTED' && o.status !== 'CANCELLED'
    );

    // Paid / fulfilled orders
    const paidOrDoneOrders = filteredOrders.filter((o) =>
      ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(o.status)
    );

    // Financials
    const totalPipelineGmv = activeOrders.reduce((sum, o) => sum + (o.totalCash || 0), 0);
    const totalEstimatedCommission = activeOrders.reduce((sum, o) => sum + (o.dynamicFeeAmount || 0), 0);
    const totalPaidGmv = paidOrDoneOrders.reduce((sum, o) => sum + (o.totalCash || 0), 0);
    const totalPaidCommission = paidOrDoneOrders.reduce((sum, o) => sum + (o.dynamicFeeAmount || 0), 0);
    const averageOrderValue = activeOrders.length > 0 ? Math.round(totalPipelineGmv / activeOrders.length) : 0;

    // Items
    const totalItems = activeOrders.reduce((sum, o) => sum + (o.itemsCount || o.items?.length || 0), 0);
    const avgItemsPerOrder = activeOrders.length > 0 ? (totalItems / activeOrders.length).toFixed(1) : '0';

    // Status breakdown (all 7 exhaustive cases with 0 leakage)
    const pendingReview = filteredOrders.filter((o) => o.status === 'PENDING_APPROVAL').length;
    const awaitingPayment = filteredOrders.filter((o) => o.status === 'APPROVED_PENDING_PAYMENT').length;
    const paymentReview = filteredOrders.filter((o) => o.status === 'PAYMENT_UNDER_REVIEW').length;
    const paidAndFulfillment = filteredOrders.filter((o) =>
      ['PAID', 'PROCESSING', 'SHIPPED'].includes(o.status)
    ).length;
    const completed = filteredOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
    const cancelled = filteredOrders.filter((o) => o.status === 'CANCELLED').length;
    const rejected = filteredOrders.filter((o) => o.status === 'REJECTED').length;

    // Payment methods (from paid / confirmed orders with payment info)
    const instapayOrders = paidOrDoneOrders.filter((o) => o.payment?.method === 'instapay');
    const vodafoneOrders = paidOrDoneOrders.filter((o) => o.payment?.method === 'vodafone_cash');
    const instapayVolume = instapayOrders.reduce((sum, o) => sum + (o.totalCash || 0), 0);
    const vodafoneVolume = vodafoneOrders.reduce((sum, o) => sum + (o.totalCash || 0), 0);

    // Customer aggregation for the current selected time period
    const customerMap = new Map<
      string,
      { name: string; email: string; phone: string; count: number; totalSpent: number; lastOrder: string }
    >();

    filteredOrders.forEach((o) => {
      const key = (o.userEmail || o.userPhone || o.userName || 'unknown').toLowerCase();
      const existing = customerMap.get(key) || {
        name: o.userName || 'Customer',
        email: o.userEmail || '-',
        phone: o.userPhone || '-',
        count: 0,
        totalSpent: 0,
        lastOrder: o.createdAt,
      };

      existing.count += 1;
      if (o.status !== 'REJECTED' && o.status !== 'CANCELLED') {
        existing.totalSpent += o.totalCash || 0;
      }
      if (new Date(o.createdAt).getTime() > new Date(existing.lastOrder).getTime()) {
        existing.lastOrder = o.createdAt;
      }

      customerMap.set(key, existing);
    });

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // Paid order ratio: percentage of total submitted orders that reached paid or completed status
    const paidRatio = totalOrders > 0 ? Math.round((paidOrDoneOrders.length / totalOrders) * 100) : 0;

    return {
      totalOrders,
      activeOrdersCount: activeOrders.length,
      totalPipelineGmv,
      totalEstimatedCommission,
      totalPaidGmv,
      totalPaidCommission,
      averageOrderValue,
      totalItems,
      avgItemsPerOrder,
      pendingReview,
      awaitingPayment,
      paymentReview,
      paidAndFulfillment,
      completed,
      cancelled,
      rejected,
      instapayOrders: instapayOrders.length,
      instapayVolume,
      vodafoneOrders: vodafoneOrders.length,
      vodafoneVolume,
      topCustomers,
      paidRatio,
      paidOrDoneCount: paidOrDoneOrders.length,
      uniqueCustomersCount: registeredUsers.length > 0 ? registeredUsers.length : customerMap.size,
    };
  }, [filteredOrders, registeredUsers]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#DDE3E8]/30 flex items-center justify-center">
        <div className="w-9 h-9 border-3 border-[#3A0F34] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#DDE3E8]/30 text-[#3A0F34]">
        <Navbar onOpenAuth={() => setAuthOpen(true)} />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 p-4">
          <div className="p-8 bg-[#FFFFFF] rounded-2xl border border-[#C7CCD2] shadow-sm text-center max-w-md space-y-4">
            <ShieldCheck className="w-12 h-12 text-[#3A0F34] mx-auto" />
            <h2 className="text-2xl font-bold">{isRtl ? 'صلاحيات المشرف مطلوبة' : 'Admin Access Required'}</h2>
            <p className="text-[#66596A] text-sm leading-relaxed">
              {isRtl
                ? 'يرجى تسجيل الدخول بحساب المشرف للاطلاع على بيانات المبيعات والتحصيل.'
                : 'Please sign in with your supervisor account to view sales and collection data.'}
            </p>
            <button
              onClick={() => setAuthOpen(true)}
              className="w-full py-3 bg-[#3A0F34] hover:bg-[#682E60] text-white font-semibold rounded-xl text-sm cursor-pointer shadow-sm transition-colors"
            >
              {isRtl ? 'تسجيل دخول المشرف' : 'Sign In as Admin'}
            </button>
          </div>
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultRole="admin" />
      </div>
    );
  }

  const needsActionCount = stats.pendingReview + stats.paymentReview;

  return (
    <div className="min-h-screen bg-[#DDE3E8]/25 text-[#3A0F34] pb-24 transition-colors">
      <Navbar onOpenAuth={() => setAuthOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
          <div className="space-y-1 text-start">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] text-[#3A0F34] text-xs font-semibold border border-[#C7CCD2]">
                <TrendingUp className="w-3.5 h-3.5 text-[#682E60]" />
                {isRtl ? 'المبيعات والتحصيل' : 'Sales & Collections'}
              </span>
              <span className="text-xs text-[#66596A] bg-[#FFFFFF] px-2.5 py-1 rounded-full border border-[#C7CCD2] flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#66596A]" />
                {lastRefreshedAt ? (
                  <span>
                    {isRtl ? 'آخر تحديث:' : 'Updated:'}{' '}
                    <span className="font-mono">{lastRefreshedAt.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </span>
                ) : (
                  <span>{isRtl ? 'جاري التحميل...' : 'Loading...'}</span>
                )}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3A0F34] tracking-tight">
              {isRtl ? 'مؤشرات الأداء المالي والتشغيلي' : 'Financial & Operational Intelligence'}
            </h1>
            <p className="text-xs sm:text-sm text-[#66596A] max-w-2xl">
              {isRtl
                ? 'رؤية دقيقة لحجم المبيعات الفعلي، رسوم الخدمة المحصلة، وحالات الطلبات دون بيانات تقريبية.'
                : 'Accurate metrics on confirmed revenue, collected service fees, and order status lifecycle.'}
            </p>
          </div>

          {/* Quick Actions & Range Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center p-1 bg-[#FFFFFF] rounded-xl border border-[#C7CCD2] shadow-xs text-xs font-medium">
              {[
                { key: 'all', label: isRtl ? 'الكل' : 'All Time' },
                { key: '30d', label: isRtl ? 'آخر 30 يوم' : '30 Days' },
                { key: '7d', label: isRtl ? 'آخر 7 أيام' : '7 Days' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTimeRange(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    timeRange === tab.key
                      ? 'bg-[#3A0F34] text-white font-semibold'
                      : 'text-[#66596A] hover:text-[#3A0F34]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              href="/admin"
              className="px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#3A0F34] border border-[#C7CCD2] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#682E60]" />
              <span>{isRtl ? 'لوحة إدارة الطلبات' : 'Orders Hub'}</span>
            </Link>

            <button
              onClick={fetchData}
              className="p-2 bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#3A0F34] border border-[#C7CCD2] rounded-xl transition-colors shadow-xs cursor-pointer"
              title={isRtl ? 'تحديث البيانات' : 'Refresh'}
              aria-label={isRtl ? 'تحديث البيانات الآن' : 'Refresh Data'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#682E60]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Action Required Row (يحتاج إجراء فوري) */}
        {needsActionCount > 0 && (
          <div className="bg-[#FFFFFF] border border-[#918797]/60 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#682E60]/10 text-[#682E60] flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#3A0F34] flex items-center gap-1.5">
                  <span>{isRtl ? 'يحتاج إجراء فوري' : 'Action Required'}</span>
                  <span className="px-2 py-0.2 rounded-full bg-[#682E60] text-white text-[11px] font-mono">
                    {needsActionCount}
                  </span>
                </h2>
                <p className="text-[11px] text-[#66596A]">
                  {isRtl
                    ? 'يوجد طلبات بانتظار مراجعة الأسعار أو التحقق من إيصالات التحويل البنكي.'
                    : 'Orders are waiting for price quotation or bank transfer receipt verification.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {stats.pendingReview > 0 && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F9FA] hover:bg-[#DDE3E8]/50 border border-[#C7CCD2] text-[#3A0F34] text-xs font-semibold transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{stats.pendingReview} {isRtl ? 'بانتظار التسعير' : 'Pending Price'}</span>
                  <ArrowUpRight className="w-3 h-3 text-[#66596A]" />
                </Link>
              )}
              {stats.paymentReview > 0 && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F9FA] hover:bg-[#DDE3E8]/50 border border-[#C7CCD2] text-[#3A0F34] text-xs font-semibold transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5 text-[#682E60]" />
                  <span>{stats.paymentReview} {isRtl ? 'فحص إيصال التحويل' : 'Verify Receipt'}</span>
                  <ArrowUpRight className="w-3 h-3 text-[#66596A]" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* 4 Equal-Height KPI Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* 1. Paid & Confirmed GMV */}
          <motion.div
            variants={itemVariants}
            className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#C7CCD2] shadow-xs text-start flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[#66596A] text-xs font-semibold mb-2">
                <span>{isRtl ? 'المبيعات المؤكدة (المسددة)' : 'Confirmed Paid GMV'}</span>
                <span className="text-[10px] bg-[#DDE3E8]/60 text-[#3A0F34] px-1.5 py-0.5 rounded font-mono font-medium">
                  EGP
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#3A0F34] tabular-nums">
                {stats.totalPaidGmv.toLocaleString()} <span className="text-xs font-medium text-[#66596A]">ج.م</span>
              </div>
            </div>
            <p className="text-[11px] text-[#66596A] mt-3 pt-2 border-t border-[#C7CCD2]/40">
              {isRtl
                ? `من إجمالي حجم سلال نشطة: ${stats.totalPipelineGmv.toLocaleString()} ج.م`
                : `From total active pipeline: ${stats.totalPipelineGmv.toLocaleString()} EGP`}
            </p>
          </motion.div>

          {/* 2. Collected Dynamic Service Fees */}
          <motion.div
            variants={itemVariants}
            className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#C7CCD2] shadow-xs text-start flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[#66596A] text-xs font-semibold mb-2">
                <span>{isRtl ? 'رسوم الخدمة المحصلة' : 'Collected Service Fees'}</span>
                <Percent className="w-4 h-4 text-[#682E60]" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700 tabular-nums">
                {stats.totalPaidCommission.toLocaleString()} <span className="text-xs font-medium text-[#66596A]">ج.م</span>
              </div>
            </div>
            <p className="text-[11px] text-[#66596A] mt-3 pt-2 border-t border-[#C7CCD2]/40">
              {isRtl
                ? `رسوم تقديرية لجميع السلال: ${stats.totalEstimatedCommission.toLocaleString()} ج.م`
                : `Estimated for all pipeline: ${stats.totalEstimatedCommission.toLocaleString()} EGP`}
            </p>
          </motion.div>

          {/* 3. Paid & Executed Orders */}
          <motion.div
            variants={itemVariants}
            className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#C7CCD2] shadow-xs text-start flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[#66596A] text-xs font-semibold mb-2">
                <span>{isRtl ? 'الطلبات المسددة والمنفذة' : 'Paid & Fulfilled Orders'}</span>
                <Package className="w-4 h-4 text-[#66596A]" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#3A0F34] tabular-nums">
                {stats.paidOrDoneCount}
              </div>
            </div>
            <p className="text-[11px] text-[#66596A] mt-3 pt-2 border-t border-[#C7CCD2]/40">
              {isRtl
                ? `من إجمالي ${stats.totalOrders} طلب مسجل بالمنظومة`
                : `Out of ${stats.totalOrders} total submitted orders`}
            </p>
          </motion.div>

          {/* 4. Paid Orders Ratio */}
          <motion.div
            variants={itemVariants}
            className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#C7CCD2] shadow-xs text-start flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[#66596A] text-xs font-semibold mb-2">
                <span>{isRtl ? 'نسبة الطلبات المدفوعة' : 'Paid Orders Ratio'}</span>
                <CheckCircle2 className="w-4 h-4 text-[#682E60]" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#3A0F34] tabular-nums">
                {stats.paidRatio}%
              </div>
            </div>
            <p className="text-[11px] text-[#66596A] mt-3 pt-2 border-t border-[#C7CCD2]/40">
              {isRtl
                ? `متوسط السلة: ${stats.averageOrderValue.toLocaleString()} ج.م (${stats.avgItemsPerOrder} قطع)`
                : `Avg cart: ${stats.averageOrderValue.toLocaleString()} EGP (${stats.avgItemsPerOrder} items)`}
            </p>
          </motion.div>
        </motion.div>

        {/* Status Breakdown & Payment Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status Distribution (توزيع حالات الطلبات) */}
          <div className="lg:col-span-2 bg-[#FFFFFF] p-6 rounded-2xl border border-[#C7CCD2] shadow-xs space-y-5 text-start">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#3A0F34]">
                  {isRtl ? 'توزيع حالات الطلبات (Order Status Distribution)' : 'Order Status Distribution'}
                </h3>
                <p className="text-xs text-[#66596A]">
                  {isRtl ? 'حصر شامل ودقيق لجميع السلال المسجلة في الفترة دون فقد أو تكرار' : 'Exact breakdown of all orders across system statuses'}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#66596A] bg-[#F8F9FA] px-2.5 py-1 rounded-full border border-[#C7CCD2]">
                {stats.totalOrders} {isRtl ? 'طلب كلي' : 'total'}
              </span>
            </div>

            {/* Status Visual Distribution Bar */}
            <div className="w-full h-3 rounded-full bg-[#DDE3E8]/40 overflow-hidden flex" title={isRtl ? 'شريط توزيع الحالات' : 'Status Bar'}>
              {stats.totalOrders > 0 && (
                <>
                  {stats.pendingReview > 0 && (
                    <div
                      style={{ width: `${(stats.pendingReview / stats.totalOrders) * 100}%` }}
                      className="bg-amber-400 h-full transition-all"
                      title={`${isRtl ? 'بانتظار التسعير' : 'Pending Review'}: ${stats.pendingReview}`}
                    />
                  )}
                  {stats.awaitingPayment > 0 && (
                    <div
                      style={{ width: `${(stats.awaitingPayment / stats.totalOrders) * 100}%` }}
                      className="bg-blue-500 h-full transition-all"
                      title={`${isRtl ? 'بانتظار سداد العميل' : 'Awaiting Payment'}: ${stats.awaitingPayment}`}
                    />
                  )}
                  {stats.paymentReview > 0 && (
                    <div
                      style={{ width: `${(stats.paymentReview / stats.totalOrders) * 100}%` }}
                      className="bg-[#682E60] h-full transition-all"
                      title={`${isRtl ? 'فحص الإيصال' : 'Receipt Review'}: ${stats.paymentReview}`}
                    />
                  )}
                  {stats.paidAndFulfillment > 0 && (
                    <div
                      style={{ width: `${(stats.paidAndFulfillment / stats.totalOrders) * 100}%` }}
                      className="bg-emerald-500 h-full transition-all"
                      title={`${isRtl ? 'مدفوع وجاري الشحن' : 'Paid & Processing'}: ${stats.paidAndFulfillment}`}
                    />
                  )}
                  {stats.completed > 0 && (
                    <div
                      style={{ width: `${(stats.completed / stats.totalOrders) * 100}%` }}
                      className="bg-[#3A0F34] h-full transition-all"
                      title={`${isRtl ? 'مكتمل ومسلّم' : 'Completed'}: ${stats.completed}`}
                    />
                  )}
                  {stats.cancelled > 0 && (
                    <div
                      style={{ width: `${(stats.cancelled / stats.totalOrders) * 100}%` }}
                      className="bg-neutral-400 h-full transition-all"
                      title={`${isRtl ? 'ملغي' : 'Cancelled'}: ${stats.cancelled}`}
                    />
                  )}
                  {stats.rejected > 0 && (
                    <div
                      style={{ width: `${(stats.rejected / stats.totalOrders) * 100}%` }}
                      className="bg-rose-500 h-full transition-all"
                      title={`${isRtl ? 'مرفوض' : 'Rejected'}: ${stats.rejected}`}
                    />
                  )}
                </>
              )}
            </div>

            {/* Status Breakdown Grid (7 buckets, sum = totalOrders) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isRtl ? 'قيد مراجعة المشرف' : 'Pending Review'}</span>
                </div>
                <div className="text-xl font-bold text-amber-950 mt-1 tabular-nums">
                  {stats.pendingReview}
                </div>
                <p className="text-[10px] text-amber-800 mt-0.5">{isRtl ? 'بانتظار تسعير المقاسات' : 'Awaiting quote'}</p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="flex items-center gap-1.5 text-blue-900 font-semibold text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                  <span>{isRtl ? 'بانتظار سداد العميل' : 'Awaiting Payment'}</span>
                </div>
                <div className="text-xl font-bold text-blue-950 mt-1 tabular-nums">
                  {stats.awaitingPayment}
                </div>
                <p className="text-[10px] text-blue-800 mt-0.5">{isRtl ? 'تم إرسال إجمالي الجنيه' : 'Quoted, unpaid'}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#682E60]/10 border border-[#682E60]/30">
                <div className="flex items-center gap-1.5 text-[#3A0F34] font-semibold text-xs">
                  <FileCheck className="w-3.5 h-3.5 text-[#682E60]" />
                  <span>{isRtl ? 'فحص إيصال التحويل' : 'Verify Receipt'}</span>
                </div>
                <div className="text-xl font-bold text-[#3A0F34] mt-1 tabular-nums">
                  {stats.paymentReview}
                </div>
                <p className="text-[10px] text-[#66596A] mt-0.5">{isRtl ? 'تم رفع صورة التحويل' : 'Receipt uploaded'}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isRtl ? 'مدفوع وجاري التنفيذ' : 'Paid & Processing'}</span>
                </div>
                <div className="text-xl font-bold text-emerald-950 mt-1 tabular-nums">
                  {stats.paidAndFulfillment}
                </div>
                <p className="text-[10px] text-emerald-800 mt-0.5">{isRtl ? 'تم تأكيد المبلغ بالبنك' : 'Confirmed & active'}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#DDE3E8]/40 border border-[#C7CCD2]">
                <div className="flex items-center gap-1.5 text-[#3A0F34] font-semibold text-xs">
                  <CheckCheck className="w-3.5 h-3.5 text-[#3A0F34]" />
                  <span>{isRtl ? 'مكتمل ومسلّم' : 'Completed'}</span>
                </div>
                <div className="text-xl font-bold text-[#3A0F34] mt-1 tabular-nums">
                  {stats.completed}
                </div>
                <p className="text-[10px] text-[#66596A] mt-0.5">{isRtl ? 'تم التوصيل للعميل' : 'Delivered'}</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-300">
                <div className="flex items-center gap-1.5 text-neutral-700 font-semibold text-xs">
                  <Ban className="w-3.5 h-3.5 text-neutral-600" />
                  <span>{isRtl ? 'ملغي' : 'Cancelled'}</span>
                </div>
                <div className="text-xl font-bold text-neutral-900 mt-1 tabular-nums">
                  {stats.cancelled}
                </div>
                <p className="text-[10px] text-neutral-500 mt-0.5">{isRtl ? 'إلغاء بطلب العميل' : 'Cancelled order'}</p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-rose-900 font-semibold text-xs">
                  <XCircle className="w-3.5 h-3.5 text-rose-700" />
                  <span>{isRtl ? 'مرفوض' : 'Rejected'}</span>
                </div>
                <div className="text-xl font-bold text-rose-950 mt-1 tabular-nums">
                  {stats.rejected}
                </div>
                <p className="text-[10px] text-rose-800 mt-0.5">{isRtl ? 'منتج غير متاح/ممنوع' : 'Rejected policy/stock'}</p>
              </div>
            </div>
          </div>

          {/* Payment Methods Distribution */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#C7CCD2] shadow-xs space-y-5 text-start flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[#3A0F34]">
                {isRtl ? 'توزيع بوابات الدفع المسددة' : 'Verified Payment Channels'}
              </h3>
              <p className="text-xs text-[#66596A]">
                {isRtl ? 'حجم المعاملات المؤكدة والمدفوعة فعلياً' : 'Volume collected via InstaPay vs Vodafone Cash'}
              </p>
            </div>

            <div className="space-y-3.5">
              {/* InstaPay */}
              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C7CCD2] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white p-1 border border-[#C7CCD2] flex items-center justify-center shrink-0">
                      <img src="/images/instapay.png" alt="InstaPay" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#3A0F34]">InstaPay (إنستاباي)</h4>
                      <span className="text-[10px] text-[#66596A]">{stats.instapayOrders} {isRtl ? 'طلب مسدد' : 'paid'}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-[#3A0F34] tabular-nums">
                    {stats.instapayVolume.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#DDE3E8] overflow-hidden">
                  <div
                    style={{
                      width: `${stats.totalPaidGmv > 0 ? (stats.instapayVolume / stats.totalPaidGmv) * 100 : 0}%`,
                    }}
                    className="h-full bg-[#3A0F34] rounded-full"
                  />
                </div>
              </div>

              {/* Vodafone Cash */}
              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#C7CCD2] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white p-0.5 border border-[#C7CCD2] flex items-center justify-center shrink-0">
                      <img src="/images/vodafone-cash.png" alt="Vodafone Cash" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#3A0F34]">فودافون كاش</h4>
                      <span className="text-[10px] text-[#66596A]">{stats.vodafoneOrders} {isRtl ? 'طلب مسدد' : 'paid'}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-[#3A0F34] tabular-nums">
                    {stats.vodafoneVolume.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#DDE3E8] overflow-hidden">
                  <div
                    style={{
                      width: `${stats.totalPaidGmv > 0 ? (stats.vodafoneVolume / stats.totalPaidGmv) * 100 : 0}%`,
                    }}
                    className="h-full bg-[#682E60] rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#C7CCD2] flex items-center justify-between text-xs">
              <span className="text-[#66596A]">{isRtl ? 'العملاء المسجلون بالنظام' : 'Registered Users'}</span>
              <span className="font-bold text-[#3A0F34] font-mono tabular-nums">{stats.uniqueCustomersCount}</span>
            </div>
          </div>
        </div>

        {/* Top Customers Leaderboard (إنفاق العميل في الفترة المحددة) */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#C7CCD2] shadow-xs overflow-hidden text-start">
          <div className="p-5 border-b border-[#C7CCD2]/60 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#3A0F34]">
                {isRtl ? 'قائمة العملاء الأكثر طلباً' : 'Top Customer Leaderboard'}
              </h3>
              <p className="text-xs text-[#66596A]">
                {isRtl
                  ? 'ترتيب العملاء بحسب حجم الإنفاق والطلبات في الفترة المحددة'
                  : 'Ranked by total expenditure and orders during the selected period'}
              </p>
            </div>
            <Users className="w-5 h-5 text-[#682E60]" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#C7CCD2] text-[11px] font-semibold uppercase tracking-wider text-[#66596A]">
                  <th className="py-3 px-5">{isRtl ? 'العميل' : 'Customer'}</th>
                  <th className="py-3 px-5">{isRtl ? 'الهاتف' : 'Phone'}</th>
                  <th className="py-3 px-5">{isRtl ? 'عدد الطلبات' : 'Orders Count'}</th>
                  <th className="py-3 px-5">{isRtl ? 'إنفاق العميل في الفترة المحددة (EGP)' : 'Period Spend (EGP)'}</th>
                  <th className="py-3 px-5">{isRtl ? 'آخر طلب' : 'Last Active'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C7CCD2]/40">
                {stats.topCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#66596A]">
                      {isRtl ? 'لا توجد بيانات عملاء كافية حتى الآن' : 'No customer records yet'}
                    </td>
                  </tr>
                ) : (
                  stats.topCustomers.map((c, i) => (
                    <tr key={i} className="hover:bg-[#F8F9FA]/70 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-[#3A0F34] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#DDE3E8]/60 text-[#3A0F34] flex items-center justify-center font-mono text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <div>{c.name}</div>
                          <div className="text-[10px] text-[#66596A] font-normal">{c.email}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[#66596A]" dir="ltr">
                        {c.phone}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-[#3A0F34] tabular-nums">
                        {c.count} {isRtl ? 'طلبات' : 'orders'}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-emerald-700 text-xs tabular-nums">
                        {c.totalSpent.toLocaleString()} ج.م
                      </td>
                      <td className="py-3.5 px-5 text-[#66596A] text-[11px]">
                        {new Date(c.lastOrder).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Directory & Last Login Activity */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#C7CCD2] shadow-xs overflow-hidden text-start">
          <div className="p-5 border-b border-[#C7CCD2]/60 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#3A0F34] flex items-center gap-2">
                <span>{isRtl ? 'سجل تواجد ونشاط العملاء' : 'Customer Activity & Last Seen'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-semibold">
                  {registeredUsers.length} {isRtl ? 'حساب مسجل' : 'Registered Users'}
                </span>
              </h3>
              <p className="text-xs text-[#66596A]">
                {isRtl ? 'تتبع لحظي لآخر توقيت دخول لكل عميل مسجل وتاريخ إنشائه' : 'Real-time tracking of customer login activity'}
              </p>
            </div>
            <Clock className="w-5 h-5 text-[#682E60]" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#C7CCD2] text-[11px] font-semibold uppercase tracking-wider text-[#66596A]">
                  <th className="py-3 px-5">{isRtl ? 'العميل' : 'Customer'}</th>
                  <th className="py-3 px-5">{isRtl ? 'الرتبة' : 'Role'}</th>
                  <th className="py-3 px-5">{isRtl ? 'رقم الهاتف' : 'Phone'}</th>
                  <th className="py-3 px-5">{isRtl ? 'تاريخ التسجيل' : 'Joined'}</th>
                  <th className="py-3 px-5">{isRtl ? 'آخر ظهور / تسجيل دخول' : 'Last Active / Login'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C7CCD2]/40">
                {registeredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#66596A]">
                      {isRtl ? 'جاري تحميل سجل المستخدمين...' : 'Loading registered users...'}
                    </td>
                  </tr>
                ) : (
                  registeredUsers.map((u) => {
                    const lastSeen = formatLastSeen(u.lastLoginAt, isRtl);
                    return (
                      <tr key={u.id} className="hover:bg-[#F8F9FA]/70 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-[#3A0F34] flex items-center gap-2.5">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full bg-neutral-100 object-cover border border-[#C7CCD2]" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#3A0F34] text-white flex items-center justify-center font-bold text-xs">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold">{u.name}</div>
                            <div className="text-[10px] text-[#66596A] font-normal">{u.email}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                            u.role === 'admin'
                              ? 'bg-[#682E60]/10 text-[#682E60] border border-[#682E60]/30'
                              : 'bg-neutral-100 text-[#66596A]'
                          }`}>
                            {u.role === 'admin' ? (isRtl ? 'مشرف' : 'Admin') : (isRtl ? 'عميل' : 'Customer')}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[#66596A]" dir="ltr">
                          {u.phone || '-'}
                        </td>
                        <td className="py-3.5 px-5 text-[#66596A] text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US') : '-'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                            lastSeen.isOnline
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-neutral-100 text-[#66596A]'
                          }`}>
                            {lastSeen.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                            {lastSeen.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultRole="admin" />
    </div>
  );
}
