import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Activity } from '../types';
import { RpgIcon } from './RpgIcon';
import { CheckButton } from './CheckButton';

interface Props {
  activities: Activity[];
  nextId?: string;
  onToggle: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onGoTimeline: () => void;
}

export const ChecklistView: React.FC<Props> = ({ activities, nextId, onToggle, onOpenDetail, onGoTimeline }) => {
  if (activities.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl border border-dashed border-[#C4C0AB] bg-[#FAF8F0] font-mono">
          <p className="text-sm font-semibold text-[#33312B] mb-1">Nenhuma missão neste dia.</p>
          <p className="text-xs text-[#777567] mb-4">Planeje tocando em um horário da Timeline.</p>
          <button
            type="button"
            onClick={onGoTimeline}
            className="press px-4 py-2.5 rounded-xl bg-[#141410] text-[#EDE8D0] text-xs font-bold tracking-wider cursor-pointer"
          >
            IR PARA A TIMELINE
          </button>
        </div>
      </div>
    );
  }

  return (
    <ul className="w-full max-w-lg mx-auto px-3 sm:px-4 pt-2 space-y-2.5">
      {activities.map((a) => {
        const isNext = a.id === nextId;
        return (
          <li
            key={a.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpenDetail(a.id)}
            onKeyDown={(e) => e.key === 'Enter' && onOpenDetail(a.id)}
            className={`press flex items-center gap-3 min-h-14 px-3.5 py-2.5 rounded-xl border cursor-pointer ${
              a.completed
                ? 'bg-[#FAF8F0]/70 border-[#C4C0AB]'
                : isNext
                ? 'bg-[#FAF8F0] border-2 border-[#141410]'
                : 'bg-[#FAF8F0] border-[#C4C0AB] hover:border-[#9D9988]'
            }`}
          >
            <CheckButton checked={a.completed} emphasized={isNext} size={26} onToggle={() => onToggle(a.id)} />
            <RpgIcon icon={a.icon} size={20} variant={a.completed ? 'muted' : 'default'} />
            <span className="font-mono text-xs font-semibold text-[#545248] shrink-0">{a.time}</span>
            <span
              className={`flex-1 min-w-0 truncate text-sm font-medium ${
                a.completed ? 'line-through text-[#777567]' : 'text-[#141410]'
              }`}
            >
              {a.title}
            </span>
            {isNext && (
              <span className="shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#141410] text-[#EDE8D0]">
                PRÓXIMO
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-[#777567] shrink-0" />
          </li>
        );
      })}
    </ul>
  );
};
