import React from 'react';

interface Props {
  done: number;
  total: number;
}

export const FooterBar: React.FC<Props> = ({ done, total }) => (
  <footer
    className="shrink-0 w-full border-t border-[#C4C0AB] bg-[#EDE8D0] pt-2.5 z-30 select-none"
    style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0px))' }}
  >
    <div className="w-full max-w-lg mx-auto px-4 flex items-center gap-2 text-xs font-mono" aria-live="polite">
      <span
        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
          total > 0 && done === total ? 'bg-[#141410]' : done > 0 ? 'bg-[#545248]' : 'bg-[#C4C0AB]'
        }`}
      />
      <span className="text-[#777567]">Missões diárias</span>
      <span className="text-[#141410] font-bold tracking-wider">
        {done}/{total}
      </span>
    </div>
  </footer>
);
