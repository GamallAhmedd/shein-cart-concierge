'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExtractedCartResult, GoodItem } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { useThemeLang } from '@/lib/theme-lang-context';
import { SafeImage } from '@/components/SafeImage';
import { saveClientOrder } from '@/lib/order-storage';
import {
  Trash2,
  Plus,
  Minus,
  ExternalLink,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Percent,
  Receipt,
  User,
  Phone,
  MapPin,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  X,
  AlertCircle,
  Heart,
  Crown,
  Shirt,
  FileText,
} from 'lucide-react';

interface ExtractedGoodsViewProps {
  data: ExtractedCartResult;
  onOrderCreated: (orderId: string) => void;
  onReset?: () => void;
  onBack?: () => void;
  onOpenAuth: () => void;
}

export function ExtractedGoodsView({
  data,
  onOrderCreated,
  onReset,
  onBack,
  onOpenAuth,
}: ExtractedGoodsViewProps) {
  const { user } = useAuth();
  const { dir, lang } = useThemeLang();
  const isRtl = dir === 'rtl';

  const handleBack = onBack || onReset || (() => {});
  const [items, setItems] = useState<GoodItem[]>(data.items);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Customer contact info
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculations
  const itemsSubtotal = items.reduce((sum, it) => sum + it.subtotal, 0);
  const dynamicFeeAmount =
    data.dynamicFeePercent && data.dynamicFeePercent > 0
      ? Math.round(itemsSubtotal * (data.dynamicFeePercent / 100))
      : 0;
  const totalCash = itemsSubtotal + dynamicFeeAmount;

  // Genuine total savings from discounts across all items
  const totalSavings = items.reduce((sum, it) => {
    if (it.originalPriceBeforeDiscount && it.originalPriceBeforeDiscount > it.originalPrice) {
      return sum + (it.originalPriceBeforeDiscount - it.originalPrice) * it.quantity;
    }
    return sum;
  }, 0);

  const handleQuantityChange = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const newQty = Math.max(1, it.quantity + delta);
          return {
            ...it,
            quantity: newQty,
            subtotal: newQty * it.originalPrice,
          };
        }
        return it;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert(isRtl ? 'يجب أن تحتوي السلة على منتج واحد على الأقل.' : 'Your cart must contain at least one item.');
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!customerName.trim()) {
      setError(isRtl ? 'يرجى إدخال اسم العميل (إجباري لإتمام الطلب).' : 'Please enter customer name (Mandatory).');
      return;
    }

    if (!customerPhone.trim()) {
      setError(
        isRtl
          ? 'يرجى إدخال رقم هاتفك للتواصل وتأكيد الدفع (فودافون كاش أو انستاباي).'
          : 'Please provide your phone number for InstaPay / Vodafone Cash contact.'
      );
      return;
    }

    if (!shippingAddress.trim()) {
      setError(
        isRtl
          ? 'يرجى إدخال عنوان التوصيل بالتفصيل في مصر (إجباري لشحن الطلب).'
          : 'Please enter your delivery address in Egypt (Mandatory).'
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        userId: user.id,
        userName: customerName.trim() || user.name,
        userEmail: user.email,
        userPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        customerNotes: customerNotes.trim(),
        rawInput: data.rawInput,
        extractedLink: data.extractedLink,
        cartShareCode: data.shareCode,
        cartGroupId: data.groupId,
        cartCoverImage: data.coverImage,
        items,
        dynamicFeePercent:
          data.dynamicFeePercent && data.dynamicFeePercent > 0 ? data.dynamicFeePercent : 0,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'Failed to submit order');
      }

      // Save order in client-side storage for persistence
      saveClientOrder(resJson.data);

      onOrderCreated(resJson.data.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemCardVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top Banner: Haute Fashion Lookbook Style */}
      <div className="relative rounded-[36px] p-6 sm:p-9 bg-gradient-to-br from-rose-50/90 via-pink-50/60 to-amber-50/50 dark:from-[#201526] dark:via-[#191120] dark:to-[#221727] border border-rose-200/80 dark:border-rose-950/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        {/* Soft Ambient Light Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-rose-400/10 dark:bg-rose-600/10 blur-3xl pointer-events-none -z-10" />

        <div className="space-y-2 text-center md:text-start relative z-10">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#281c30] text-rose-700 dark:text-rose-300 text-[11px] font-black uppercase tracking-wider shadow-xs border border-rose-200/60 dark:border-rose-900/60">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-sparkle-twinkle" />
              <span>{isRtl ? 'سلة مشتريات شي إن الجاهزة 🛍️' : 'SHEIN Extracted Cart'}</span>
            </span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-md bg-white/70 dark:bg-[#201827]">
              Code: {data.shareCode}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight leading-tight">
            {data.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-xl font-medium leading-relaxed">
            {data.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 relative z-10">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleBack}
            className="px-4 py-2.5 bg-white dark:bg-[#22172a] hover:bg-rose-50 dark:hover:bg-[#2c1d37] text-neutral-800 dark:text-neutral-200 font-extrabold text-xs rounded-2xl border border-rose-200/80 dark:border-rose-950 shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{isRtl ? 'استخراج سلة ثانية' : 'Another Cart'}</span>
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            href={data.landingUrl || data.extractedLink}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-2xl shadow-sm shadow-rose-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isRtl ? 'مشاهدة في SHEIN' : 'SHEIN Link'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
        </div>
      </div>

      {/* Main Grid: Goods List (left) + Cost Summary (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Goods Items (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-neutral-950 dark:text-white text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              <span>{isRtl ? `منتجات السلة (${items.length} قطع)` : `Items in Cart (${items.length})`}</span>
            </h3>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isRtl ? 'تم التحقق من الأسعار والمقاسات' : 'Verified with SHEIN'}</span>
            </span>
          </div>

          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3.5"
          >
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemCardVariants}
                  exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                  whileHover={{ y: -2, scale: 1.005 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/95 dark:bg-[#16111D]/95 backdrop-blur-md rounded-[28px] p-5 border border-rose-100/90 dark:border-rose-950/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 hover:border-rose-300 dark:hover:border-rose-800 transition-all group"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Lookbook Product Image with subtle zoom */}
                    <div className="w-20 h-24 sm:w-22 sm:h-28 rounded-2xl overflow-hidden bg-rose-50/50 dark:bg-[#1f1728] shrink-0 border border-rose-100 dark:border-rose-950 relative">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h4 className="font-black text-neutral-950 dark:text-white text-sm line-clamp-2 leading-snug">
                        {item.name}
                      </h4>

                      {/* Fashion Tag Chips (Color, Size, SKU) */}
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        {item.color && (
                          <span className="bg-rose-50/80 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 px-2.5 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-900/40 font-bold">
                            {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span className="bg-rose-50/80 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 px-2.5 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-900/40 font-bold">
                            {isRtl ? `المقاس: ${item.size}` : `Size: ${item.size}`}
                          </span>
                        )}
                        {item.sku && (
                          <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 self-center">
                            {item.sku}
                          </span>
                        )}
                      </div>

                      <div className="pt-1.5 flex flex-wrap items-center gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Current Price in EGP */}
                          <span className="text-sm sm:text-base font-black text-rose-700 dark:text-rose-300 font-mono">
                            {item.originalPrice.toLocaleString()} EGP
                          </span>

                          {/* Strikethrough Price before discount */}
                          {item.originalPriceBeforeDiscount && item.originalPriceBeforeDiscount > item.originalPrice && (
                            <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through font-mono">
                              {item.originalPriceBeforeDiscount.toLocaleString()} EGP
                            </span>
                          )}

                          {/* Discount Badge */}
                          {Boolean(item.discountPercent && item.discountPercent > 0) && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 text-[10px] font-black border border-amber-300 dark:border-amber-800">
                              <Percent className="w-2.5 h-2.5 text-amber-600" />
                              <span>{isRtl ? `خصم ${item.discountPercent}%` : `-${item.discountPercent}%`}</span>
                            </span>
                          )}
                        </div>

                        {item.originalUrl && (
                          <a
                            href={item.originalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-0.5 transition-colors ms-auto sm:ms-0"
                          >
                            <span>{isRtl ? 'عرض القطعة في شي إن' : 'View on SHEIN'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-rose-950/50">
                    <div className="flex items-center border border-rose-200/80 dark:border-rose-950 rounded-xl bg-neutral-50 dark:bg-[#1a1424] p-0.5 shadow-2xs">
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        type="button"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-[#251e33] rounded-lg transition-colors cursor-pointer"
                        title={isRtl ? 'تقليل الكمية' : 'Decrease'}
                      >
                        <Minus className="w-3 h-3" />
                      </motion.button>
                      <span className="w-8 text-center text-xs font-black text-neutral-950 dark:text-white font-mono tabular-nums">
                        {item.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        type="button"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-[#251e33] rounded-lg transition-colors cursor-pointer"
                        title={isRtl ? 'زيادة الكمية' : 'Increase'}
                      >
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    </div>

                    <div className="text-start sm:text-end min-w-[95px] space-y-0.5">
                      {item.originalPriceBeforeDiscount && item.originalPriceBeforeDiscount > item.originalPrice && (
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through font-mono block">
                          {(item.quantity * item.originalPriceBeforeDiscount).toLocaleString()} EGP
                        </span>
                      )}
                      <span className="font-black text-base sm:text-lg text-neutral-950 dark:text-white font-mono block">
                        {item.subtotal.toLocaleString()} EGP
                      </span>
                      {Boolean(item.discountPercent && item.discountPercent > 0) && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                          {isRtl
                            ? `وفرتِ ${((item.originalPriceBeforeDiscount! - item.originalPrice) * item.quantity).toLocaleString()} ج.م 🎉`
                            : `Saved ${((item.originalPriceBeforeDiscount! - item.originalPrice) * item.quantity).toLocaleString()} EGP`}
                        </span>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-neutral-300 dark:text-neutral-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title={isRtl ? 'حذف هذا المنتج' : 'Remove item'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right: Boutique Cost Summary Card */}
        <div className="space-y-4">
          <div className="bg-white/95 dark:bg-[#16111D]/95 backdrop-blur-md rounded-[32px] p-6 border border-rose-200/80 dark:border-rose-950/80 shadow-[0_15px_40px_-15px_rgba(225,29,72,0.08)] space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-950/60">
              <h3 className="font-black text-neutral-950 dark:text-white text-lg flex items-center gap-2">
                <Receipt className="w-4.5 h-4.5 text-rose-500" />
                <span>{isRtl ? 'ملخص الشنطة والدفع' : 'Payment Summary'}</span>
              </h3>
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2.5 py-0.5 rounded-full">
                {items.length} {isRtl ? 'قطع' : 'items'}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                <span>{isRtl ? `مجموع سعر القطع:` : `Items Subtotal:`}</span>
                <span className="font-black text-neutral-950 dark:text-white font-mono text-sm">
                  {itemsSubtotal.toLocaleString()} EGP
                </span>
              </div>

              {/* Total Savings Golden Highlight Banner */}
              {totalSavings > 0 && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between shadow-2xs">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{isRtl ? 'وفرتي من عروض شي إن:' : 'Total Discount Savings:'}</span>
                  </span>
                  <span className="font-black font-mono text-amber-800 dark:text-amber-300 text-sm">
                    -{totalSavings.toLocaleString()} EGP
                  </span>
                </div>
              )}

              {(data.dynamicFeePercent || 0) > 0 && dynamicFeeAmount > 0 && (
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="flex flex-col text-start">
                      <span className="font-bold">{isRtl ? `رسوم الخدمة والتوصيل (${data.dynamicFeePercent}%)` : `Service & Delivery Fee (${data.dynamicFeePercent}%)`}</span>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-normal">
                        {isRtl ? `شامل الفحص والمراجعة والشحن لباب بيتك` : `Includes inspection & delivery`}
                      </span>
                    </span>
                  </span>
                  <span className="font-black text-rose-600 dark:text-rose-400 font-mono">
                    +{dynamicFeeAmount.toLocaleString()} EGP
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-rose-100 dark:border-rose-950/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 block font-bold">
                    {isRtl ? 'المبلغ الإجمالي بالجنيه المصري:' : 'Total Cash Required:'}
                  </span>
                  <span className="text-2xl font-black text-rose-700 dark:text-rose-400">
                    {totalCash > 0 ? (
                      <>
                        {totalCash.toLocaleString()}{' '}
                        <span className="text-xs font-bold text-neutral-500">EGP</span>
                      </>
                    ) : (
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {isRtl ? 'يحدده المشرف بعد فحص الرابط' : 'Set by admin upon review'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods Available with Official Logos */}
            <div className="p-3.5 bg-neutral-50 dark:bg-[#1a1424] rounded-2xl border border-rose-100 dark:border-rose-950/60 space-y-2">
              <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                {isRtl ? 'طرق الدفع بالجنيه المصري فور تأكيد الطلب:' : 'Supported EGP Payment Methods:'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-white dark:bg-[#20182a] border border-purple-200 dark:border-purple-800/80 flex items-center gap-2 shadow-2xs">
                  <div className="w-6 h-6 rounded-md bg-white p-0.5 border border-purple-200 shrink-0">
                    <img src="/images/instapay.png" alt="InstaPay" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-black text-[11px] text-neutral-900 dark:text-white leading-tight truncate">InstaPay</h5>
                    <p className="text-[9px] text-purple-600 dark:text-purple-400 truncate">{isRtl ? 'تحويل فوري' : 'Instant EBC'}</p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-[#20182a] border border-rose-200 dark:border-rose-800/80 flex items-center gap-2 shadow-2xs">
                  <div className="w-6 h-6 rounded-md bg-white p-0.5 border border-rose-200 shrink-0">
                    <img src="/images/vodafone-cash.png" alt="Vodafone Cash" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-black text-[11px] text-neutral-900 dark:text-white leading-tight truncate">VF Cash</h5>
                    <p className="text-[9px] text-rose-600 dark:text-rose-400 truncate">{isRtl ? 'محفظة كاش' : 'Mobile Wallet'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow steps badge */}
            <div className="p-3.5 bg-neutral-50 dark:bg-[#1a1424] rounded-2xl border border-rose-100 dark:border-rose-950/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-black text-neutral-800 dark:text-neutral-200">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{isRtl ? 'الخطوة التالية: مراجعة سريعة للمقاسات' : 'Next: Size & Availability Check'}</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                {isRtl
                  ? 'بمجرد إرسال طلبك، يتأكد المشرف من توفر المقاسات ويفتح لكِ رابط الدفع عبر فودافون كاش أو انستاباي ثم نبدأ الشحن فوراً.'
                  : 'Once submitted, the admin verifies item availability and unlocks payment via InstaPay or Vodafone Cash.'}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  setShowCheckoutModal(true);
                }
              }}
              className="w-full py-4 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isRtl ? 'تأكيد الطلب وبدء الشراء لمصر 🛍️' : 'Submit Order for Admin Review'}</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Checkout Contact Drawer / Modal with AnimatePresence */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white dark:bg-[#16111D] rounded-3xl shadow-2xl border border-rose-200/80 dark:border-rose-950 overflow-hidden"
            >
              <div className="p-6 bg-rose-50/70 dark:bg-[#1f1728] border-b border-rose-100 dark:border-rose-950 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-neutral-950 dark:text-white text-lg">
                    {isRtl ? 'بيانات التوصيل والاستلام' : 'Delivery Details'}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {isRtl
                      ? 'أدخلي اسمكِ الثلاثي ورقم الموبايل وعنوان التوصيل في مصر.'
                      : 'Confirm name, phone, and delivery address in Egypt.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitOrder} className="p-6 space-y-4 text-xs">
                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {user && (customerPhone || shippingAddress) && (
                  <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 flex items-center justify-between text-xs text-rose-900 dark:text-rose-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      {isRtl ? 'تم ملء بياناتك تلقائياً من حسابك' : 'Auto-filled from your profile'}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      {isRtl ? '(يمكنكِ تعديلها)' : '(editable)'}
                    </span>
                  </div>
                )}

                <div className="text-start">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black text-neutral-700 dark:text-neutral-300">
                      {isRtl ? 'الاسم بالكامل (ثنائي أو ثلاثي)' : 'Full Recipient Name'}
                    </label>
                    <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200/50 dark:border-rose-900/50">
                      {isRtl ? '* إجباري للبوليصة' : '* Required for shipping'}
                    </span>
                  </div>
                  <div className="relative">
                    <User className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-neutral-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={isRtl ? 'مثال: سارة أحمد محمود' : 'Full Name'}
                      className={`w-full py-2.5 bg-neutral-50 dark:bg-[#1a1424] border border-rose-200/80 dark:border-rose-950 rounded-xl focus:bg-white dark:focus:bg-[#20182a] focus:outline-none focus:ring-2 focus:ring-rose-500 text-neutral-900 dark:text-white ${
                        isRtl ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'
                      }`}
                    />
                  </div>
                </div>

                <div className="text-start">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black text-neutral-700 dark:text-neutral-300">
                      {isRtl
                        ? 'رقم الموبايل في مصر (InstaPay أو Vodafone Cash)'
                        : 'Egyptian Mobile (InstaPay / Vodafone Cash)'}
                    </label>
                    <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200/50 dark:border-rose-900/50">
                      {isRtl ? '* إجباري' : '* Required'}
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-neutral-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className={`w-full py-2.5 bg-neutral-50 dark:bg-[#1a1424] border border-rose-200/80 dark:border-rose-950 rounded-xl focus:bg-white dark:focus:bg-[#20182a] focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-neutral-900 dark:text-white ${
                        isRtl ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'
                      }`}
                    />
                  </div>
                </div>

                <div className="text-start">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black text-neutral-700 dark:text-neutral-300">
                      {isRtl ? 'عنوان التوصيل بالتفصيل في مصر' : 'Delivery Address in Egypt'}
                    </label>
                    <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200/50 dark:border-rose-900/50">
                      {isRtl ? '* إجباري للتوصيل' : '* Required'}
                    </span>
                  </div>
                  <div className="relative">
                    <MapPin className={`w-4 h-4 absolute top-3 text-neutral-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                    <textarea
                      rows={2}
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder={isRtl ? 'مثال: عمارة 12، شارع النصر، المعادي، القاهرة' : 'e.g. Building 12, Nasr Street, Maadi, Cairo'}
                      className={`w-full py-2.5 bg-neutral-50 dark:bg-[#1a1424] border border-rose-200/80 dark:border-rose-950 rounded-xl focus:bg-white dark:focus:bg-[#20182a] focus:outline-none focus:ring-2 focus:ring-rose-500 text-neutral-900 dark:text-white ${
                        isRtl ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'
                      }`}
                    />
                  </div>
                </div>

                <div className="text-start">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black text-neutral-700 dark:text-neutral-300">
                      {isRtl ? 'ملاحظات إضافية على الطلب' : 'Additional Order Notes'}
                    </label>
                    <span className="text-[10px] text-neutral-400 font-bold bg-neutral-100 dark:bg-[#1f192b] px-2 py-0.5 rounded-md border border-neutral-200/60 dark:border-[#2b243b]">
                      {isRtl ? 'اختياري' : 'Optional'}
                    </span>
                  </div>
                  <div className="relative">
                    <FileText className={`w-4 h-4 absolute top-3 text-neutral-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                    <textarea
                      rows={2}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder={
                        isRtl
                          ? 'أي تعليمات أو مقاسات بديلة أو أوقات تسليم مفضلة...'
                          : 'Any instructions, sizing notes, or preferred delivery timing...'
                      }
                      className={`w-full py-2.5 bg-neutral-50 dark:bg-[#1a1424] border border-rose-200/80 dark:border-rose-950 rounded-xl focus:bg-white dark:focus:bg-[#20182a] focus:outline-none focus:ring-2 focus:ring-rose-500 text-neutral-900 dark:text-white text-xs ${
                        isRtl ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-rose-100 dark:border-rose-950/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 block">
                      {isRtl ? 'المجموع المستحق' : 'Total Due'}
                    </span>
                    <span className="font-black text-lg text-rose-700 dark:text-rose-400 font-mono">
                      {totalCash.toLocaleString()} EGP
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={submitting}
                    className="px-7 py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{isRtl ? 'جاري الإرسال...' : 'Submitting...'}</span>
                      </>
                    ) : (
                      <span>{isRtl ? 'تأكيد وإرسال الطلب الآن ✨' : 'Confirm Order'}</span>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
