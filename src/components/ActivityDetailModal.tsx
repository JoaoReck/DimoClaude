import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Edit3, RotateCcw, Trash2, X } from 'lucide-react';
import { Activity } from '../types';
import { describeDate } from '../lib/dates';
import { RpgIcon } from './RpgIcon';

interface Props {
  activity: Activity | null;
  today: string;
  onClose: () => void;
  onToggle: (id: string) => void;
  onEdit: (a: Activity) => void;
  onDelete: (id: string) => void;
}

export const ActivityDetailModal: React.FC<Props> = ({ activity, today, onClose, onToggle, onEdit, onDelete }) => {
  const [confirming, setConfirming] = useState(false);
  useEffect(() => setConfirming(false), [activity?.id]);
  useEffect(() => {
    if (!activity) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activity, onClose]);

  return (
    <AnimatePresence>
      {activity && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#141410]/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#FAF8F0] border border-[#C4C0AB] p-5 space-y-5"
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 shrink-0 rounded-full border-2 border-[#141410] bg-[#EDE8D0] flex items-center justify-center">
                <RpgIcon icon={activity.icon} size={32} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h2 className={`text-lg font-bold leading-snug break-words ${activity.completed ? 'line-through text-[#777567]' : 'text-[#141410]'}`}>
                  {activity.title}
                </h2>
                <p className="text-xs font-mono text-[#777567] mt-1">
                  {describeDate(activity.date, today).secondary} · {activity.time}
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Fechar" className="press p-2 -mr-2 -mt-1 rounded-lg text-[#777567] hover:text-[#141410] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onToggle(activity.id)}
              className={`press w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold cursor-pointer ${
                activity.completed ? 'border border-[#C4C0AB] text-[#545248]' : 'bg-[#141410] text-[#EDE8D0]'
              }`}
            >
              {activity.completed ? <RotateCcw className="w-4 h-4" /> : <Check className="w-4 h-4 stroke-[3]" />}
              {activity.completed ? 'Reabrir' : 'Concluir'}
            </button>

            <div className="flex gap-2.5">
              <button type="button" onClick={() => onEdit(activity)} className="press flex-1 h-11 rounded-xl border border-[#C4C0AB] text-sm font-semibold text-[#33312B] flex items-center justify-center gap-2 cursor-pointer">
                <Edit3 className="w-4 h-4" /> Editar
              </button>
              <button
                type="button"
                onClick={() => (confirming ? onDelete(activity.id) : setConfirming(true))}
                className={`press flex-1 h-11 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                  confirming ? 'bg-[#33312B] border-[#33312B] text-[#EDE8D0]' : 'border-[#C4C0AB] text-[#33312B]'
                }`}
              >
                <Trash2 className="w-4 h-4" /> {confirming ? 'Confirmar' : 'Excluir'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
