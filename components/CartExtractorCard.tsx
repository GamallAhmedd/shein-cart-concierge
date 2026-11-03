'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  RotateCcw,
  Shirt,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

interface CartExtractorCardProps {
  onExtracted: (result: ExtractedCartResult) => void;
  currentDynamicFeePercent: number;
}

export function CartExtractorCard({ onExtracted, currentDynamicFeePercent }: CartExtractorCardProps) {
  const { t, dir } = useThemeLang();
  const isRtl = dir === 'rtl';
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
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
      console.warn('Clipboard read error or permission denied:', err);
    }

    if (textareaRef.current) {
      textareaRef.current.focus();
      setError(
        isRtl
          ? 'المربع جاهز للكتابة أو اللصق! اضغطي داخل المربع واختاري لصق (Paste).'
          : 'Input is focused! Paste your link directly inside the box.'
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
          ? 'من فضلكِ الصقي رابط سلتكِ أو رسالة المشاركة من شي إن أولاً.'
          : 'Please paste your SHEIN cart link or share message first.'
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
              ? 'تعذر قراءة محتويات السلة من الرابط. يرجى التأكد من صلاحية الرابط والمحاولة مجدداً.'
              : 'Failed to extract items from SHEIN link.')
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
    <div
      id="cart-extractor-card"
      className="relative rounded-3xl p-6 sm:p-8 bg-[#FFFFFF] border border-slate-200 shadow-sm space-y-6 transition-colors text-start"
    >
      <form onSubmit={handleExtract} className="space-y-4">
        {/* Input Bar Header: Clear, accessible label + Paste & Clear buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label
            htmlFor="shein-cart-input"
            className="text-sm font-semibold text-slate-900 flex items-center gap-2"
          >
            <Link2 className="w-4 h-4 text-[#7C3AED]" />
            <span>{isRtl ? 'الصقي رابط سلتكِ أو رسالة المشاركة من SHEIN' : 'Paste your SHEIN link or share message'}</span>
          </label>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteClipboard}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                pasteSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-50/50 hover:bg-[#DDE3E8]/60 text-slate-900 border border-slate-200'
              }`}
              title={isRtl ? 'لصق سريع من الحافظة' : 'Quick Paste'}
            >
              {pasteSuccess ? (
                <>
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تم اللصق بنجاح!' : 'Pasted!'}</span>
                </>
              ) : (
                <>
                  <ClipboardPaste className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>{isRtl ? 'لصق سريع من الحافظة' : 'Quick Paste'}</span>
                </>
              )}
            </button>

            {inputText.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 transition-colors cursor-pointer border border-slate-200"
                title={isRtl ? 'مسح النص' : 'Clear'}
                aria-label={isRtl ? 'مسح الرابط' : 'Clear input'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Input Box Container (16px minimum font size to avoid mobile Safari zoom) */}
        <div className="relative rounded-2xl border border-slate-300 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 transition-all bg-slate-50/50 overflow-hidden shadow-xs">
          <textarea
            id="shein-cart-input"
            name="shein_cart_link"
            ref={textareaRef}
            rows={3}
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={
              isRtl
                ? 'الصقي هنا رابط السلة (onelink.shein.com/...) أو رسالة المشاركة كاملة كما تم نسخها من تطبيق SHEIN...'
                : 'Paste your SHEIN cart link (https://onelink.shein.com/...) or share text here...'
            }
            aria-describedby={error ? 'shein-cart-error' : undefined}
            className="w-full px-4 py-3 text-[16px] sm:text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-500/60 font-sans resize-y leading-relaxed"
          />

          {/* Sub-bar inside input with char count and helper */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Shirt className="w-3 h-3 text-[#7C3AED]" />
              <span>{isRtl ? 'يقبل رابط السلة كاملة أو رابط قطعة مفردة' : 'Accepts full cart link or single item'}</span>
            </div>
            {inputText.length > 0 && (
              <span className="font-mono text-[11px] tabular-nums">
                {inputText.length} {t.chars}
              </span>
            )}
          </div>
        </div>

        {/* Subtle Link Guide Accordion Trigger */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="inline-flex items-center gap-1.5 text-xs text-[#7C3AED] hover:text-slate-900 font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isRtl ? 'مش عارفة تجيبي الرابط من تطبيق SHEIN؟ شوفي الخطوات' : 'How to copy the cart link from SHEIN app'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3"
              >
                <SheinLinkGuide />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Real-time Link Detection Banner */}
        <AnimatePresence>
          {detectedUrl && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div className="overflow-hidden">
                  <span className="font-semibold block text-xs">
                    {isRtl ? 'تم التعرف على رابط سلة SHEIN بنجاح' : 'Valid SHEIN link detected'}
                  </span>
                  <span className="truncate font-mono text-[11px] text-neutral-600 block max-w-sm sm:max-w-md">
                    {detectedUrl}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Feedback */}
        <AnimatePresence>
          {error && (
            <motion.div
              id="shein-cart-error"
              role="alert"
              aria-live="polite"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2 shadow-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Row: Payment logos once & Primary submit button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-slate-200/60">
          {/* Compact payment logos displayed once */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {isRtl ? 'الدفع بالجنيه عبر:' : 'Payment via:'}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="h-6 px-2 py-0.5 rounded-lg bg-slate-50/50 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                <img src="/images/instapay.png" alt="InstaPay" className="h-3.5 object-contain" />
                <span className="text-[10px] font-semibold text-slate-900">InstaPay</span>
              </div>
              <div className="h-6 px-2 py-0.5 rounded-lg bg-slate-50/50 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                <img src="/images/vodafone-cash.png" alt="Vodafone Cash" className="h-3.5 object-contain" />
                <span className="text-[10px] font-semibold text-slate-900">Vodafone</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] shadow-md shadow-[#7C3AED]/25 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>{isRtl ? 'جاري فحص السلة وحساب الإجمالي...' : t.extracting}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>{isRtl ? 'اعرفي الإجمالي بالجنيه' : 'Calculate Total in EGP'}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
