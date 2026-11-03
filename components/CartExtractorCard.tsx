'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractSheinUrl } from '@/lib/shein-extractor';
import { ExtractedCartResult } from '@/lib/types';
import { useThemeLang } from '@/lib/theme-lang-context';
import { SheinLinkGuide } from './SheinLinkGuide';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Link2,
  ClipboardPaste,
  ClipboardCheck,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Shirt,
  Heart,
  Crown,
} from 'lucide-react';

interface CartExtractorCardProps {
  onExtracted: (result: ExtractedCartResult) => void;
  currentDynamicFeePercent: number;
}

const FASHION_CATEGORIES = [
  { label: 'فساتين وسواريه 👗', tag: 'Dresses' },
  { label: 'شنط وإكسسوارات 👜', tag: 'Bags & Accessories' },
  { label: 'ميك أب وعناية 💄', tag: 'Beauty & Skincare' },
  { label: 'شوزات وكعوب 👠', tag: 'Shoes' },
  { label: 'سلة مشتريات كاملة 🛒', tag: 'Full Cart' },
];

export function CartExtractorCard({ onExtracted, currentDynamicFeePercent }: CartExtractorCardProps) {
  const { t, dir } = useThemeLang();
  const isRtl = dir === 'rtl';
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [selectedTag, setSelectedTag] = useState<number>(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action') === 'new' || window.location.hash === '#cart-extractor-card') {
        const el = document.getElementById('cart-extractor-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (textareaRef.current) {
          setTimeout(() => textareaRef.current?.focus(), 450);
        }
      }
    }
  }, []);

  const handleTextChange = (val: string) => {
    setInputText(val);
    setError(null);
    const link = extractSheinUrl(val);
    setDetectedUrl(link);
  };

  // One-click clipboard paste handler
  const handlePasteClipboard = async () => {
    setError(null);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          handleTextChange(clipText.trim());
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2500);
          return;
        }
      }
    } catch (err) {
      console.warn('Clipboard read error or not permitted:', err);
    }

    if (textareaRef.current) {
      textareaRef.current.focus();
      setError(
        isRtl
          ? 'المربع جاهز للكتابة أو اللصق! اضغطي ضغطة مطولة داخل المربع واختاري لصق (Paste).'
          : 'Input is focused! Long press inside the box and choose Paste.'
      );
    }
  };

  const handleClear = () => {
    setInputText('');
    setDetectedUrl(null);
    setError(null);
  };

  const handleExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) {
      setError(
        isRtl
          ? 'من فضلكِ الصقي رابط السلة أو المنتج أولاً في المربع المخصص بالأسفل.'
          : 'Please paste your SHEIN cart share text or URL first.'
      );
      if (textareaRef.current) textareaRef.current.focus();
      return;
    }

    const cleanUrl = extractSheinUrl(inputText);
    if (!cleanUrl) {
      setError(
        isRtl
          ? 'لم نتمكن من العثور على رابط شي إن صالح. تأكدي أن النص يحتوي على رابط مثل onelink.shein.com أو shein.com'
          : 'No valid SHEIN URL detected. Make sure your message contains a SHEIN link.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          dynamicFeePercent: currentDynamicFeePercent > 0 ? currentDynamicFeePercent : 0,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          json.error ||
            (isRtl
              ? 'تعذر استخراج المنتجات من رابط شي إن. يرجى التأكد من صلاحية الرابط.'
              : 'Failed to extract goods from SHEIN link.')
        );
      }

      onExtracted(json.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to SHEIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      id="cart-extractor-card"
      className="relative rounded-[36px] p-6 sm:p-10 bg-white/95 dark:bg-[#16111D]/95 border border-rose-200/80 dark:border-rose-950/60 shadow-[0_20px_60px_-15px_rgba(225,29,72,0.08)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] space-y-7 transition-colors overflow-hidden"
    >
      {/* Delicate Atmospheric Ambient Vignette */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-bl from-rose-200/35 via-pink-200/20 to-transparent dark:from-rose-950/30 dark:via-purple-950/20 pointer-events-none blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-100/30 via-pink-100/15 to-transparent dark:from-amber-950/20 pointer-events-none blur-3xl -z-10" />

      {/* Top Graphic Header: Haute Fashion & Female Shopper Focus */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 pb-1">
        <div className="space-y-2.5 text-center sm:text-start">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-[11px] font-black uppercase tracking-wider border border-rose-200/80 dark:border-rose-800/60 shadow-xs">
              <Crown className="w-3.5 h-3.5 text-rose-500 animate-sparkle-twinkle" />
              <span>{isRtl ? 'المستخرج الذكي لسلات شي إن للبنات' : 'SHEIN Smart Cart Extractor'}</span>
            </span>
            {currentDynamicFeePercent > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200/80 dark:border-amber-800">
                +{currentDynamicFeePercent}% {t.feeLabel}
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-950 dark:text-white tracking-tight text-balance leading-snug">
            {isRtl ? 'معاكي سلة أو دريس عاجبك من شي إن؟ 🛍️✨' : t.extractorTitle}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed font-medium text-balance">
            {isRtl
              ? 'الصقي الرابط في الصندوق السحري بالأسفل، وسنقوم بحساب الإجمالي بالجنيه المصري فوراً ومراجعة مقاساتك والشراء والتوصيل لباب بيتكِ في أي محافظة بمصر!'
              : t.extractorDesc}
          </p>
        </div>

        {/* Fashion Cart Visual Emblem */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
          transition={{ duration: 0.3 }}
          className="relative shrink-0 flex items-center justify-center cursor-default"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-rose-50 via-white to-pink-50 dark:from-[#201827] dark:via-[#1a1322] dark:to-[#22162a] border border-rose-200/70 dark:border-rose-900/50 flex flex-col items-center justify-center gap-1.5 shadow-sm shadow-rose-500/10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
              <ShoppingBag className="w-6 h-6 animate-fashion-float" />
            </div>
            <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 tracking-wider">SHEIN EGYPT</span>
          </div>
        </motion.div>
      </div>

      {/* Interactive Fashion Category Pills (Chic & Delightful) */}
      <div className="relative z-10 pt-1">
        <div className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>{isRtl ? 'مشترياتكِ المفضلة اليوم من شي إن:' : 'Popular SHEIN Categories:'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FASHION_CATEGORIES.map((cat, idx) => (
            <motion.button
              key={idx}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setSelectedTag(idx);
                if (textareaRef.current) textareaRef.current.focus();
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedTag === idx
                  ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30 border border-rose-600'
                  : 'bg-neutral-100/80 dark:bg-[#201827] text-neutral-700 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-[#2a1e34] border border-neutral-200/70 dark:border-rose-950/80'
              }`}
            >
              <span>{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 1. Visual Guide / Walkthrough on How to get the SHEIN Link */}
      <div className="relative z-10">
        <SheinLinkGuide />
      </div>

      {/* 2. THE MAIN HERO DROPZONE */}
      <form onSubmit={handleExtract} className="relative z-10 space-y-4 pt-1">
        {/* Visual Callout Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <label
            htmlFor="shein-cart-input"
            className="text-xs sm:text-sm font-black text-neutral-950 dark:text-white flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>{isRtl ? 'الصقي رابط سلتكِ أو منتجكِ هنا:' : 'Paste your SHEIN link here:'}</span>
          </label>

          {/* Quick Action Buttons (Paste & Clear) */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handlePasteClipboard}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                pasteSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60'
              }`}
              title={isRtl ? 'لصق الرابط من الحافظة مباشرة' : 'Paste from clipboard'}
            >
              {pasteSuccess ? (
                <>
                  <ClipboardCheck className="w-3.5 h-3.5 text-white" />
                  <span>{isRtl ? 'تم اللصق بنجاح!' : 'Pasted!'}</span>
                </>
              ) : (
                <>
                  <ClipboardPaste className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>{isRtl ? 'لصق سريع من الحافظة' : 'Quick Paste'}</span>
                </>
              )}
            </motion.button>

            {inputText.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title={isRtl ? 'مسح الرابط' : 'Clear'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Input Box Container with Delicate Rose Shimmer Glow */}
        <div className="relative rounded-2xl border border-rose-200/90 dark:border-rose-950 focus-within:border-rose-500 dark:focus-within:border-rose-500 focus-within:ring-3 focus-within:ring-rose-500/15 transition-all bg-neutral-50/80 dark:bg-[#1a1424] overflow-hidden shadow-xs">
          {/* Header indicator inside the box */}
          <div className="flex items-center justify-between px-4 sm:px-5 pt-3 pb-2 border-b border-rose-100 dark:border-rose-950/60 bg-white/70 dark:bg-[#1e172a]">
            <div className="flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span className="text-xs font-black text-neutral-900 dark:text-neutral-200">
                {isRtl ? 'سلة أو منتجات شي إن (SHEIN)' : 'SHEIN Cart Extractor Input'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
              <Shirt className="w-3 h-3 text-rose-500" />
              <span>{isRtl ? 'يقبل السلة بالكامل أو رابط فستان/قطعة واحدة' : 'Cart or single item'}</span>
            </div>
          </div>

          <textarea
            id="shein-cart-input"
            ref={textareaRef}
            rows={4}
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={
              isRtl
                ? 'الصقي هنا رابط السلة (مثال: onelink.shein.com/...) أو رابط أي فستان/منتج عاجبك، أو رسالة المشاركة كاملة كما نسختيها من تطبيق شي إن...'
                : 'Paste your SHEIN cart link (https://onelink.shein.com/...) or single item link here...'
            }
            className="w-full px-4 sm:px-5 py-3.5 text-xs sm:text-sm text-neutral-900 dark:text-white bg-transparent focus:outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-sans resize-y leading-relaxed font-medium"
          />

          {/* Bottom Bar inside the box */}
          <div className="px-4 sm:px-5 py-2.5 bg-neutral-100/70 dark:bg-[#150f1e] border-t border-rose-100 dark:border-rose-950/60 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isRtl ? 'الصندوق جاهز للاستخراج الفوري' : 'Ready'}</span>
            </span>
            <span className="font-mono tabular-nums text-[11px]">
              {inputText.length} {t.chars}
            </span>
          </div>
        </div>

        {/* Real-time Link Detection Celebration Banner */}
        <AnimatePresence>
          {detectedUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:via-[#17221e] dark:to-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-neutral-900 dark:text-white text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <span className="font-black text-emerald-900 dark:text-emerald-200 block text-xs flex items-center gap-1.5">
                    <span>{isRtl ? 'تم التعرف على سلة شي إن بنجاح! 🎉' : 'Valid SHEIN Link Detected!'}</span>
                  </span>
                  <span className="truncate font-mono text-[11px] text-neutral-600 dark:text-neutral-400 block mt-0.5 max-w-sm sm:max-w-md">
                    {detectedUrl}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-[#1a2520] px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                  {isRtl ? 'جاهز للحساب بالجنيه ⬇️' : 'Ready to calculate'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Feedback */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 shadow-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 Step Chic Flow Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-[#1a1424] border border-neutral-200/60 dark:border-rose-950/50 text-[11px] text-neutral-600 dark:text-neutral-300">
            <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-[10px] flex items-center justify-center shrink-0">1</span>
            <span className="truncate">{isRtl ? 'انسخي الرابط من تطبيق SHEIN' : 'Copy link from SHEIN'}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-[#1a1424] border border-neutral-200/60 dark:border-rose-950/50 text-[11px] text-neutral-600 dark:text-neutral-300">
            <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-[10px] flex items-center justify-center shrink-0">2</span>
            <span className="truncate">{isRtl ? 'اضغطي استخراج وشوفي السعر' : 'Extract & see EGP total'}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 dark:bg-[#1a1424] border border-neutral-200/60 dark:border-rose-950/50 text-[11px] text-neutral-600 dark:text-neutral-300">
            <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-[10px] flex items-center justify-center shrink-0">3</span>
            <span className="truncate">{isRtl ? 'ادفعي بالمصري واستلمي بالبيت' : 'Pay in EGP & receive at home'}</span>
          </div>
        </div>

        {/* Submit Button & Payment Trust Logos */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-rose-100 dark:border-rose-950/60">
          {/* Payment Logos Badge */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
              {isRtl ? 'دفع آمن بالجنيه عبر:' : 'Payment via:'}
            </span>
            <div className="flex items-center gap-2">
              <div className="h-7 px-2.5 py-0.5 rounded-lg bg-white dark:bg-[#1b1726] border border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5 shadow-2xs">
                <img src="/images/instapay.png" alt="InstaPay" className="h-4 object-contain" />
                <span className="text-[10px] font-black text-purple-700 dark:text-purple-300">InstaPay</span>
              </div>
              <div className="h-7 px-2.5 py-0.5 rounded-lg bg-white dark:bg-[#1b1726] border border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5 shadow-2xs">
                <img src="/images/vodafone-cash.png" alt="Vodafone Cash" className="h-4 object-contain" />
                <span className="text-[10px] font-black text-rose-700 dark:text-rose-300">Vodafone Cash</span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer select-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isRtl ? 'جاري فحص سلتكِ من شي إن وحساب الأسعار...' : t.extracting}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{isRtl ? 'احسبي السلة واستخرجي المنتجات بالجنيه 🛍️' : t.extractBtn}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
