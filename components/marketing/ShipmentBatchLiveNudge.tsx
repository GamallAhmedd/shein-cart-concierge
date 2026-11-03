'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Calendar } from 'lucide-react';
import { useThemeLang } from '@/lib/theme-lang-context';

interface ActiveShipmentData {
  code: string;
  status: string;
  currentOrders: number;
  maxOrders?: number;
  remainingSlots?: number;
  percent?: number;
}

export function ShipmentBatchLiveNudge() {
  const { dir } = useThemeLang();
  const isRtl = dir === 'rtl';

  const [shipmentInfo, setShipmentInfo] = useState<ActiveShipmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/shipments')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Find an active batch currently accepting or preparing orders
          const active = data.data.find(
            (s: any) => s.status === 'PREPARING' || s.status === 'IN_TRANSIT'
          );

          if (active) {
            const currentOrders = Array.isArray(active.orderIds) ? active.orderIds.length : 0;
            const maxOrders = typeof active.maxOrders === 'number' && active.maxOrders > 0 ? active.maxOrders : undefined;
            const remainingSlots = maxOrders !== undefined ? Math.max(maxOrders - currentOrders, 0) : undefined;
            const percent = maxOrders !== undefined && maxOrders > 0
              ? Math.min(Math.round((currentOrders / maxOrders) * 100), 100)
              : undefined;

            setShipmentInfo({
              code: active.code || (isRtl ? 'دفعة الشحن الجوي الحالية' : 'Current Air Shipment'),
              status: active.status,
              currentOrders,
              maxOrders,
              remainingSlots,
              percent,
            });
          } else {
            setShipmentInfo(null);
          }
        } else {
          setShipmentInfo(null);
        }
      })
      .catch(() => {
        // Honest fallback: if network fails or no data, do not display fabricated urgency counts
        if (isMounted) setShipmentInfo(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isRtl]);

  // If no active shipment is registered in the database, don't show simulated scarcity
  if (loading || !shipmentInfo) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label={isRtl ? 'معلومات دفعة الشحن الحالية' : 'Current Shipment Batch Information'}
      className="rounded-2xl border border-[#E2E8F0] bg-[#F8F9FA] p-4 text-[#7C3AED] shadow-xs"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-[#EDE9FE] flex items-center justify-center shrink-0 border border-[#E2E8F0]/40">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#7C3AED]">
                {shipmentInfo.code}
              </span>
              {shipmentInfo.remainingSlots !== undefined && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EDE9FE] text-[#7C3AED] border border-[#E2E8F0]">
                  <Calendar className="w-3 h-3" />
                  {isRtl
                    ? `متاح ${shipmentInfo.remainingSlots} طلبات قبل اكتمال الشحنة`
                    : `${shipmentInfo.remainingSlots} orders remaining in this batch`}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {isRtl
                ? 'تجميع وشحن جوي مباشر لمطار القاهرة ثم تسليم منزلي لجميع المحافظات'
                : 'Direct air consolidation to Cairo airport with nationwide home delivery'}
            </p>
          </div>
        </div>

        {/* Real capacity meter if maxOrders is configured */}
        {shipmentInfo.percent !== undefined && (
          <div className="w-full sm:w-44 space-y-1 shrink-0">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#64748B]">
              <span>{isRtl ? 'امتلاء الدفعة:' : 'Capacity:'}</span>
              <span className="font-mono tabular-nums text-[#7C3AED] font-semibold">
                {shipmentInfo.percent}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#EDE9FE] overflow-hidden">
              <div
                style={{ width: `${shipmentInfo.percent}%` }}
                className="h-full bg-[#7C3AED] rounded-full transition-all duration-500"
              />
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
