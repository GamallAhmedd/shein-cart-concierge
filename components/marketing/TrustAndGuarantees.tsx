'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, CheckCircle2, Lock, Truck, CreditCard } from 'lucide-react';
import { useThemeLang } from '@/lib/theme-lang-context';

export function TrustAndGuarantees() {
  const { dir } = useThemeLang();
  const isRtl = dir === 'rtl';

  const guarantees = [
    {
      icon: CreditCard,
      title: isRtl ? 'دفع محلي بالجنيه المصري' : 'Local Payment in EGP',
      desc: isRtl
        ? 'ادفعي بسهولة عبر إنستاباي أو فودافون كاش بدون كروت دولية أو عمولات تدبير عملة.'
        : 'Pay in Egyptian Pounds via InstaPay or Vodafone Cash with no foreign transaction fees.',
      color: 'text-[#7C3AED] bg-violet-50 border-violet-200',
    },
    {
      icon: CheckCircle2,
      title: isRtl ? 'فحص المقاسات والمخزون' : 'Size & Stock Verification',
      desc: isRtl
        ? 'المشرف يتأكد من توافر المقاسات وتطبيق أعلى كود خصم متاح على سلتك قبل اعتماد الشراء.'
        : 'Our team verifies your selected sizes and applies maximum coupons before purchasing.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      icon: Truck,
      title: isRtl ? 'شحن آمن وتوصيل لباب بيتك' : 'Doorstep Delivery Across Egypt',
      desc: isRtl
        ? 'توصيل موثوق لكافة محافظات مصر مع تتبع حي ومباشر لحالة شحنتك خطوة بخطوة.'
        : 'Reliable doorstep shipping to all Egyptian governorates with live shipment tracking.',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      icon: RefreshCw,
      title: isRtl ? 'ضمان استرداد فوري ١٠٠٪' : '100% Instant Refund',
      desc: isRtl
        ? 'لو أي قطعة غير متاحة في شي إن، يتم رد المبلغ فوراً لحسابك عبر InstaPay بدون أي تأخير.'
        : 'If any item runs out of stock, funds are refunded immediately via InstaPay.',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="space-y-4 pt-2">
      <div className="text-center sm:text-start space-y-1 px-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-[#7C3AED] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isRtl ? 'ضمانات وتسهيلات SHEIN Concierge' : 'Guarantees & Benefits'}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {isRtl ? 'تسوقي من شي إن بأمان وراحة بال' : 'Shop with Complete Peace of Mind'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500">
          {isRtl
            ? 'خدمة متكاملة تضمن لكِ أفضل سعر بالجنيه، مراجعة دقيقة لكل قطعة، وتوصيل سريع لباب بيتك.'
            : 'End-to-end concierge ensuring best EGP pricing, size checks, and fast delivery.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {guarantees.map((g, idx) => {
          const Icon = g.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2 text-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${g.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {g.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {g.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isRtl ? 'مشمول بالخدمة' : 'Included'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
