import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Activity, DateKey } from '../types';
import { hourToTime, monthGrid, monthTitle, parseDateKey, timeToHour } from '../lib/dates';
import { RpgIcon } from './RpgIcon';
import { CheckButton } from './CheckButton';

interface Props {
  all: Activity[]; // every activity (for month dots)
  day: Activity[]; // selected date
  date: DateKey;
  today: DateKey;
  nextId?: string;
  onSelectDate: (d: DateKey) => void;
  onToggle: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onCreateAt: (hour: number) => void;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const nav = 'press w-10 h-10 rounded-xl flex items-center justify-center text-[#545248] hover:bg-[#C4C0AB]/50 cursor-pointer';

export const CalendarView: React.FC<Props> = ({
  all, day, date, today, nextId, onSelectDate, onToggle, onOpenDetail, onCreateAt,
}) => {
  const sel = parseDateKey(date);
  const [cursor, setCursor] = useState({ y: sel.getFullYear(), m: sel.getMonth() });

  // Follow the shared date when it changes elsewhere (arrows, swipe, "Hoje").
  useEffect(() => setCursor({ y: sel.getFullYear(), m: sel.getMonth() }), [date]); // eslint-disable-line

  const status = useMemo(() => {
    const map = new Map<DateKey, { total: number; done: number }>();
    for (const a of all) {
      const s = map.get(a.date) ?? { total: 0, done: 0 };
      s.total++;
      if (a.completed) s.done++;
      map.set(a.date, s);
    }
    return map;
  }, [all]);

  const shiftMonth = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <div className="w-full max-w-lg mx-auto px-3 sm:px-4 pt-2 space-y-4">
      {/* month */}
      <section className="p-3 rounded-2xl bg-[#FAF8F0] border border-[#C4C0AB]">
        <div className="flex items-center justify-between mb-1">
          <button type="button" className={nav} onClick={() => shiftMonth(-1)} aria-label="Mês anterior">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-[#141410]">{monthTitle(cursor.y, cursor.m)}</span>
          <button type="button" className={nav} onClick={() => shiftMonth(1)} aria-label="Próximo mês">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-[10px] font-mono text-[#9D9988] mb-1">
          {WEEKDAYS.map((w, i) => <span key={i}>{w}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {monthGrid(cursor.y, cursor.m).map(({ key, inMonth }) => {
            const s = status.get(key);
            const isSel = key === date;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectDate(key)}
                aria-label={key}
                aria-pressed={isSel}
                className={`press h-11 mx-auto w-11 rounded-xl flex flex-col items-center justify-center cursor-pointer text-[13px] font-mono ${
                  isSel
                    ? 'bg-[#141410] text-[#EDE8D0]'
                    : key === today
                    ? 'border-2 border-[#141410] text-[#141410] font-bold'
                    : inMonth
                    ? 'text-[#33312B] hover:bg-[#C4C0AB]/40'
                    : 'text-[#C4C0AB]'
                }`}
              >
                {parseDateKey(key).getDate()}
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                    !s ? 'opacity-0' : s.done === s.total
                      ? isSel ? 'bg-[#EDE8D0]' : 'bg-[#141410]'
                      : isSel ? 'bg-[#EDE8D0]/50' : 'bg-[#9D9988]'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* hours of the selected day */}
      <section className="rounded-2xl bg-[#FAF8F0] border border-[#C4C0AB] divide-y divide-[#C4C0AB]/50">
        {HOURS.map((h) => {
          const items = day.filter((a) => timeToHour(a.time) === h);
          return (
            <div key={h} className="flex items-start gap-3 px-3 py-1.5">
              <button
                type="button"
                onClick={() => onCreateAt(h)}
                className="press w-12 shrink-0 h-9 text-left font-mono text-xs text-[#777567] hover:text-[#141410] cursor-pointer"
                aria-label={'Criar atividade às ' + hourToTime(h)}
              >
                {hourToTime(h)}
              </button>
              <div className="flex-1 min-w-0 space-y-1.5">
                {items.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onCreateAt(h)}
                    aria-label={'Criar atividade às ' + hourToTime(h)}
                    className="w-full h-9 cursor-pointer"
                  />
                ) : (
                  items.map((a) => (
                    <div
                      key={a.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenDetail(a.id)}
                      onKeyDown={(e) => e.key === 'Enter' && onOpenDetail(a.id)}
                      className={`press flex items-center gap-2.5 min-h-10 px-2.5 py-1.5 rounded-xl border cursor-pointer ${
                        a.completed
                          ? 'border-[#C4C0AB] bg-[#FAF8F0] opacity-75'
                          : a.id === nextId
                          ? 'border-2 border-[#141410]'
                          : 'border-[#C4C0AB] hover:border-[#9D9988]'
                      }`}
                    >
                      <CheckButton checked={a.completed} emphasized={a.id === nextId} size={22} onToggle={() => onToggle(a.id)} />
                      <RpgIcon icon={a.icon} size={18} variant={a.completed ? 'muted' : 'default'} />
                      <span className="font-mono text-xs font-semibold text-[#545248] shrink-0">{a.time}</span>
                      <span className={`flex-1 min-w-0 truncate text-sm ${a.completed ? 'line-through text-[#777567]' : 'text-[#141410] font-medium'}`}>
                        {a.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
