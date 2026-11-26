import { notFound } from "next/navigation";
import { getPayableEnquiry } from "@/lib/payments";
import { site, whatsappLink } from "@/lib/site";
import PaymentFlow from "./PaymentFlow";

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ confirm?: string }>;
}) {
  const { reference } = await params;
  const { confirm } = await searchParams;
  const data = await getPayableEnquiry(reference);
  if (!data) notFound();

  const returningFromStripe = confirm === "stripe";
  const alreadyPaid = data.latestPayment?.status === "PAID";
  const initialMethod = returningFromStripe ? "stripe" : data.defaultMethod;
  const resumePaymentId =
    returningFromStripe && data.latestPayment?.provider === "STRIPE" && data.latestPayment.status === "PENDING"
      ? data.latestPayment.id
      : null;

  const whatsappHref =
    data.enquiryType === "CONSULTATION"
      ? whatsappLink(`Hi Faith, I've just paid for my travel consultation with ${site.name}. My reference is ${data.reference}.`)
      : "";
  const mailtoHref =
    data.enquiryType === "CONSULTATION"
      ? `mailto:${site.email}?subject=${encodeURIComponent(`Consultation ${data.reference}`)}&body=${encodeURIComponent(
          `Hi Faith,\n\nI've just paid for my travel consultation. My reference is ${data.reference}.\n\n${data.name}`,
        )}`
      : "";

  return (
    <main className="mx-auto max-w-lg p-8">
      <p className="text-sm text-gray-500">Reference {data.reference}</p>
      <h1 className="mt-2 text-2xl font-bold">{data.label}</h1>
      <PaymentFlow
        reference={data.reference}
        enquiryType={data.enquiryType}
        label={data.label}
        phone={data.phone}
        mpesaDisplay={data.options.mpesa.display}
        stripeDisplay={data.options.stripe.display}
        initialMethod={initialMethod}
        resumePaymentId={resumePaymentId}
        alreadyPaid={alreadyPaid}
        whatsappHref={whatsappHref}
        mailtoHref={mailtoHref}
      />
    </main>
  );
}
