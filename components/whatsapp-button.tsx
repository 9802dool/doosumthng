import { site, whatsappHref } from "@/lib/site";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappHref("Hi DooSumThng!")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${site.name} on WhatsApp`}
      className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_rgba(22,20,18,0.22)]"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
