const LINE = "Custom tees • Jerseys • Mugs • Trinidad";

export function Marquee() {
  return (
    <div className="overflow-hidden bg-brand text-[#F3EFE7]" aria-hidden="true">
      <div className="marquee-track py-2.5 font-display text-sm tracking-[0.22em] uppercase sm:text-base">
        {[0, 1].map((copy) => (
          <span key={copy} className="flex shrink-0">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} className="px-5">
                {LINE}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
