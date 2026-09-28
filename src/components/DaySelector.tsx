import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateKey } from '../types';
import { describeDate } from '../lib/dates';

interface Props {
  date: DateKey;
  today: DateKey;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const arrow =
  'press w-12 h-11 shrink-0 rounded-xl flex items-center justify-center text-[#545248] hover:text-[#141410] hover:bg-[#C4C0AB]/50 cursor-pointer';

/**   ‹      Hoje      ›   — one real date; arrows only change it. */
export const DaySelector: React.FC<Props> = ({ date, today, onPrev, onNext, onToday }) => {
  const { primary, secondary, isToday } = describeDate(date, today);
  return (
    <div className="w-full max-w-lg mx-auto px-3 sm:px-4 py-1.5 select-none">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onPrev} className={arrow} aria-label="Dia anterior">
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <button
          type="button"
          onClick={onToday}
          className="press flex-1 min-w-0 h-11 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#C4C0AB]/30"
          aria-label={isToday ? 'Centralizar no horário atual' : 'Voltar para hoje'}
        >
          <span className="text-[15px] font-bold leading-tight text-[#141410]">{primary}</span>
          <span className="text-[11px] font-mono leading-tight text-[#777567] truncate max-w-full">
            {isToday ? secondary : `${secondary} · voltar a hoje`}
          </span>
        </button>
        <button type="button" onClick={onNext} className={arrow} aria-label="Próximo dia">
          <ChevronRight className="w-6 h-6 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
};
