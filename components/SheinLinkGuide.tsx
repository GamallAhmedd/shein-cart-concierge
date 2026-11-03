'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Share2,
  Copy,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { useThemeLang } from '@/lib/theme-lang-context';

export function SheinLinkGuide() {
  const { dir } = useThemeLang();
  const isRtl = dir === 'rtl';
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      num: 1,
      title: isRtl ? 'افتحي سلة شي إن (Cart)' : 'Open SHEIN Cart',
      desc: isRtl
        ? 'ادخلي على تطبيق SHEIN في موبايلك، وافتحي صفحة السلة 🛒 اللي فيها كل المنتجات اللي عاجباكي.'
        : 'Open the SHEIN app on your phone, and go to your Shopping Cart 🛒 containing your items.',
      badge: isRtl ? 'الخطوة الأولى' : 'Step 1',
      icon: ShoppingBag,
      color: 'from-[#7C3AED] to-[#5C1D53]',
      tag: '🛒 Cart',
    },
    {
      num: 2,
      title: isRtl ? 'اضغطي على أيقونة المشاركة (Share)' : 'Tap the Share Icon',
      desc: isRtl
        ? 'في أعلى الشاشة (فوق جمب زرار البحث)، هتلاقي علامة المشاركة ↗️ أو زرار "مشاركة السلة". اضغطي عليه.'
        : 'At the top of your screen (near search), look for the Share icon ↗️ or "Share Cart" button. Tap it.',
      badge: isRtl ? 'الخطوة الثانية' : 'Step 2',
      icon: Share2,
      color: 'from-[#7C3AED] to-[#5C1D53]',
      tag: '↗️ Share',
    },
    {
      num: 3,
      title: isRtl ? 'اختاري "نسخ الرابط" (Copy Link)' : 'Tap "Copy Link"',
      desc: isRtl
        ? 'من القائمة اللي هتظهر، اضغطي على "نسخ الرابط" (أو شاركيه على الواتساب وانسخي اللينك). بعدين ارجعي هنا!'
        : 'From the popup menu, tap "Copy Link" (or share to WhatsApp and copy the link). Then come back here!',
      badge: isRtl ? 'الخطوة الثالثة' : 'Step 3',
      icon: Copy,
      color: 'from-[#7C3AED] to-[#5C1D53]',
      tag: '📋 Copy Link',
    },
  ];

  return (
    <div className="rounded-3xl border border-[#EDE9FE] dark:border-[#7C3AED]/60 bg-white/80 dark:bg-[#1A0919]/80 backdrop-blur-md shadow-xs overflow-hidden transition-all">
      {/* Header bar that toggles the guide */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-start hover:bg-[#EBF0F4]/50 dark:hover:bg-[#240E23]/40 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#7C3AED]/25 group-hover:scale-105 transition-transform border border-[#EDE9FE]/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-neutral-950 dark:text-white">
                {isRtl
                  ? 'مش عارفة تجيبي الرابط من تطبيق SHEIN إزاي؟'
                  : 'Not sure how to get the link from the SHEIN app?'}
              </h3>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EBF0F4] dark:bg-[#240E23] text-[#7C3AED] dark:text-[#EDE9FE] border border-[#EDE9FE]">
                {isRtl ? 'شرح بالخطوات 📸' : 'Visual Guide 📸'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-[#9BAAB6] mt-0.5">
              {isRtl
                ? 'اضغطي هنا لمعرفة خطوات نسخ رابط السلة في ١٥ ثانية فقط'
                : 'Tap here to see how to copy your cart link in 15 seconds'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-[#7C3AED] dark:text-[#EDE9FE] hidden md:inline">
            {isOpen ? (isRtl ? 'إخفاء الشرح' : 'Hide Guide') : (isRtl ? 'شوفي الخطوات' : 'View Steps')}
          </span>
          <div className="w-8 h-8 rounded-full bg-white dark:bg-[#240E23] border border-[#EDE9FE] dark:border-[#7C3AED] flex items-center justify-center text-[#7C3AED] dark:text-[#EDE9FE]">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-[#EDE9FE] dark:border-[#7C3AED]/60"
          >
            <div className="p-5 sm:p-6 space-y-6">
              {/* Step cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {steps.map((s) => {
                  const Icon = s.icon;
                  const isActive = activeStep === s.num;
                  return (
                    <div
                      key={s.num}
                      onClick={() => setActiveStep(s.num)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                        isActive
                          ? 'bg-white dark:bg-[#1E0C1D] border-[#7C3AED] dark:border-[#EDE9FE] shadow-md ring-2 ring-[#7C3AED]/20'
                          : 'bg-white/60 dark:bg-[#160A16] border-[#EDE9FE] dark:border-[#7C3AED]/40 hover:border-[#7C3AED]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-black text-xs shadow-xs border border-[#EDE9FE]/30">
                          {s.num}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF0F4] dark:bg-[#251024] text-[#7C3AED] dark:text-[#EDE9FE] border border-[#EDE9FE] dark:border-[#7C3AED]">
                          {s.tag}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
                          <Icon className="w-4 h-4 text-[#7C3AED] dark:text-[#EDE9FE] shrink-0" />
                          <span>{s.title}</span>
                        </h4>
                        <p className="text-[11px] text-neutral-500 dark:text-[#9BAAB6] leading-relaxed">
                          {s.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#EDE9FE] dark:border-[#7C3AED]/40 flex items-center justify-between text-[10px] text-[#7C3AED] dark:text-[#EDE9FE] font-bold">
                        <span>{s.badge}</span>
                        {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Visual Simulated Mockup of the SHEIN App UI */}
              <div className="rounded-2xl bg-[#130712] p-4 sm:p-5 text-white relative overflow-hidden border border-[#EDE9FE]/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/25 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-start">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7C3AED]/40 text-[#EDE9FE] text-[10px] font-black border border-[#EDE9FE]/30">
                      <Sparkles className="w-3 h-3 text-[#EDE9FE]" />
                      {isRtl ? 'محاكاة شكل تطبيق SHEIN' : 'SHEIN App Preview'}
                    </div>
                    <h5 className="text-xs sm:text-sm font-black text-white">
                      {isRtl
                        ? 'علامة المشاركة بتكون أعلى يمين أو يسار شاشة السلة'
                        : 'The share icon is at the top corner of the Cart screen'}
                    </h5>
                    <p className="text-[11px] text-neutral-400 max-w-xl">
                      {isRtl
                        ? 'أول ما تضغطي عليها وتختاري "نسخ الرابط"، ارجعي هنا واضغطي زرار "لصق من الحافظة" الكبير بالأسفل.'
                        : 'Once you tap Share and Copy Link, come back and tap the big "Paste" button below.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extra Tip Banner */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
                <span className="text-base shrink-0">💡</span>
                <p className="text-[11px] leading-relaxed">
                  {isRtl ? (
                    <>
                      <strong>معلومة مهمة:</strong> تقدري كمان تلصقي رابط أي فستان أو قطعة منفردة من شي إن،
                      أو تلصقي رسالة الواتساب كاملة بدون ما تمسحي أي كلام، والموقع هيستخرج الرابط أوتوماتيكياً!
                    </>
                  ) : (
                    <>
                      <strong>Note:</strong> You can also paste any single dress or item link from SHEIN, or
                      even paste the entire WhatsApp text message, and our system will extract it automatically!
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
