import type { EnquiryStatus, PaymentStatus } from "@prisma/client";
import { statusDot } from "../_lib/format";

/** A coloured dot plus the status word. Colour never carries the meaning alone. */
export function StatusLabel({ status, children, className = "" }: { status: EnquiryStatus | PaymentStatus; children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-stone-700 ${className}`}>
      <span aria-hidden className={`size-2 shrink-0 rounded-full ${statusDot[status]}`} />
      {children}
    </span>
  );
}
