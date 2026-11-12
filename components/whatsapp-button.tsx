import { whatsappHref } from "@/lib/site";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappHref("Hi DooSumThng!")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat to order on WhatsApp"
      className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex min-h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
    >
      <WhatsAppIcon className="h-6 w-6" />
      Chat to order
    </a>
  );
}
