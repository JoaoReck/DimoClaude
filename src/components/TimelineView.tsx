import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Activity, DateKey } from '../types';
import { hourToTime, timeToHour } from '../lib/dates';
import { RpgIcon } from './RpgIcon';
import { CheckButton } from './CheckButton';

interface Props {
  activities: Activity[]; // activities of the selected date only
  date: DateKey;
  isToday: boolean;
  now: Date;
  selectedHour: number | null;
  nextId?: string;
  centerKey: number; // bump to re-center on the current time
  onSelectEmptyHour: (hour: number) => void;
  onOpenDetail: (id: string) => void;
  onToggle: (id: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);

export const TimelineView: React.FC<Props> = ({
  activities, date, isToday, now, selectedHour, nextId, centerKey,
  onSelectEmptyHour, onOpenDetail, onToggle,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentHour = now.getHours();

  const centerOnNow = useCallback((smooth: boolean) => {
    const box = scrollRef.current;
    const row = box?.querySelector<HTMLElement>('[data-hour="' + new Date().getHours() + '"]');
    if (!box || !row) return;
    const rowTop = row.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    const y = rowTop + row.offsetHeight * (new Date().getMinutes() / 60) - box.clientHeight / 2;
    box.scrollTo({ top: Math.max(0, y), behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // First open on Today: place "now" near the middle, inside this container only.
  const openedToday = useRef(false);
  useLayoutEffect(() => {
    if (isToday && !openedToday.current) centerOnNow(false);
    openedToday.current = true;
  }, [isToday, centerOnNow]);

  // Explicit "Hoje" tap. Never triggered by plain day navigation.
  const firstKey = useRef(centerKey);
  useEffect(() => {
    if (centerKey !== firstKey.current && isToday) centerOnNow(true);
  }, [centerKey, isToday, centerOnNow]);

  const byHour = (h: number) => activities.filter((a) => timeToHour(a.time) === h);

  return (
    <div
      ref={scrollRef}
      className="w-full flex-1 min-h-0 overflow-y-auto overscroll-contain select-none pt-1 pb-6"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <ol className="w-full max-w-lg mx-auto px-3 sm:px-4 py-2" aria-label={'Jornada de ' + date}>
        {HOURS.map((hour) => {
          const items = byHour(hour);
          const empty = items.length === 0;
          const isNow = isToday && hour === currentHour;
          const isPast = isToday && hour < currentHour;
          const isSelected = empty && selectedHour === hour;
          const timeLabel = hourToTime(hour);
          const primary = items.find((a) => !a.completed) ?? items[0];
          const allDone = !empty && items.every((a) => a.completed);
          const isNextHere = items.some((a) => a.id === nextId);

          return (
            <li
              key={hour}
              data-hour={hour}
              className={`relative flex gap-2 sm:gap-3 rounded-2xl ${isNow ? 'bg-[#C4C0AB]/25' : ''}`}
            >
              {/* time */}
              <div
                className={`w-12 sm:w-14 shrink-0 pt-4 text-right font-mono text-[11px] sm:text-xs ${
                  isNow ? 'text-[#141410] font-bold' : isPast ? 'text-[#9D9988]' : 'text-[#777567]'
                }`}
              >
                {timeLabel}
                {isNow && <span className="block text-[9px] tracking-wider mt-0.5">AGORA</span>}
              </div>

              {/* spine + node */}
              <div className="relative w-14 sm:w-16 shrink-0 flex justify-center">
                <span
                  aria-hidden
                  className={`absolute left-1/2 -translate-x-1/2 w-[3px] bg-[#C4C0AB] ${
                    hour === 0 ? 'top-8 rounded-t-full' : 'top-0'
                  } ${hour === 23 ? 'h-8 rounded-b-full' : 'bottom-0'}`}
                />
                {isToday && hour <= currentHour && (
                  <span
                    aria-hidden
                    className={`absolute left-1/2 -translate-x-1/2 w-[3px] bg-[#141410] ${
                      hour === 0 ? 'top-8' : 'top-0'
                    } ${hour === currentHour ? 'h-8' : 'bottom-0'}`}
                  />
                )}

                <div className="relative z-10 h-16 flex items-center">
                  {empty ? (
                    <button
                      type="button"
                      onClick={() => onSelectEmptyHour(hour)}
                      aria-label={'Planejar ' + timeLabel}
                      className={`press rounded-full flex items-center justify-center cursor-pointer border ${
                        isSelected
                          ? 'w-14 h-14 bg-[#FAF8F0] border-2 border-[#141410] ring-2 ring-[#141410]/20 ring-offset-2 ring-offset-[#EDE8D0]'
                          : 'w-7 h-7 bg-[#EDE8D0] border-[#C4C0AB] hover:border-[#141410]'
                      }`}
                    >
                      {isSelected && (
                        <img
                          src="/icone2.png"
                          alt=""
                          width={32}
                          height={32}
                          className="w-8 h-8 object-contain pixel-crisp pointer-events-none"
                        />
                      )}
                    </button>
                  ) : (
                    <motion.button
                      type="button"
                      initial={false}
                      animate={{ scale: allDone ? [1, 1.13, 1] : 1 }}
                      transition={{ duration: 0.38, ease: 'easeOut' }}
                      onClick={() => onOpenDetail(primary.id)}
                      aria-label={items.length + ' atividade(s) às ' + timeLabel}
                      className={`press relative rounded-full flex items-center justify-center cursor-pointer border-2 ${
                        allDone
                          ? 'w-14 h-14 bg-[#141410] border-[#141410]'
                          : isNextHere || isNow
                          ? 'w-16 h-16 bg-[#FAF8F0] border-[#141410] ring-2 ring-[#141410]/20 ring-offset-2 ring-offset-[#EDE8D0]'
                          : 'w-14 h-14 bg-[#FAF8F0] border-[#C4C0AB] hover:border-[#141410]'
                      }`}
                    >
                      <RpgIcon
                        icon={primary.icon}
                        size={isNextHere || isNow ? 28 : 24}
                        variant={allDone ? 'inverted' : isPast ? 'muted' : 'default'}
                      />
                      {items.length > 1 && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#141410] text-[#EDE8D0] text-[9px] font-mono font-bold leading-none border border-[#FAF8F0]">
                          +{items.length - 1}
                        </span>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>

              {/* content */}
              <div className="flex-1 min-w-0 py-2 flex flex-col justify-center gap-2">
                {empty ? (
                  <button
                    type="button"
                    onClick={() => onSelectEmptyHour(hour)}
                    tabIndex={-1}
                    aria-hidden
                    className="w-full min-h-12 rounded-xl text-left px-2.5 text-[11px] font-mono text-[#777567] cursor-pointer hover:bg-[#C4C0AB]/25 transition-colors"
                  >
                    {isSelected ? 'Toque para planejar' : ''}
                  </button>
                ) : (
                  items.map((a) => {
                    const isNext = a.id === nextId;
                    return (
                      <motion.div
                        key={a.id}
                        layout="position"
                        role="button"
                        tabIndex={0}
                        onClick={() => onOpenDetail(a.id)}
                        onKeyDown={(e) => e.key === 'Enter' && onOpenDetail(a.id)}
                        className={`press flex items-center gap-2.5 min-h-12 px-3 py-2 rounded-2xl border cursor-pointer ${
                          a.completed
                            ? 'bg-[#FAF8F0]/70 border-[#C4C0AB] text-[#777567]'
                            : isNext
                            ? 'bg-[#FAF8F0] border-2 border-[#141410] text-[#141410]'
                            : 'bg-[#FAF8F0] border-[#C4C0AB] text-[#33312B] hover:border-[#141410]'
                        }`}
                      >
                        <CheckButton
                          checked={a.completed}
                          emphasized={isNext}
                          onToggle={() => onToggle(a.id)}
                        />
                        <span
                          className={`flex-1 min-w-0 truncate text-sm font-semibold ${
                            a.completed ? 'line-through' : ''
                          }`}
                        >
                          {a.title}
                        </span>
                        {isNext && (
                          <span className="shrink-0 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#141410] text-[#EDE8D0]">
                            PRÓXIMO
                          </span>
                        )}
                        <span className="shrink-0 text-[11px] font-mono text-[#545248]">{a.time}</span>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
