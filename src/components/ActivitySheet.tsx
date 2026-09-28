import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { ActivityDraft, RpgIconId } from '../types';
import { isDateKey, isTime } from '../lib/dates';
import { RPG_ICON_OPTIONS, RpgIcon, inferRpgIcon } from './RpgIcon';

export interface SheetState {
  editingId?: string;
  initial: ActivityDraft;
}

interface Props {
  state: SheetState | null;
  onClose: () => void;
  onSave: (draft: ActivityDraft, editingId?: string) => void;
}

const field =
  'w-full h-11 px-3 rounded-xl bg-[#EDE8D0] border border-[#C4C0AB] text-[#141410] text-sm outline-none focus:border-[#141410] transition-colors';

export const ActivitySheet: React.FC<Props> = ({ state, onClose, onSave }) => (
  <AnimatePresence>{state && <SheetBody key={state.editingId ?? 'new'} state={state} onClose={onClose} onSave={onSave} />}</AnimatePresence>
);

const SheetBody: React.FC<{ state: SheetState } & Pick<Props, 'onClose' | 'onSave'>> = ({ state, onClose, onSave }) => {
  const { initial, editingId } = state;
  const [title, setTitle] = useState(initial.title);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [icon, setIcon] = useState<RpgIconId>(initial.icon);
  const [iconTouched, setIconTouched] = useState(Boolean(editingId));
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Dê um nome à atividade.');
    if (!isDateKey(date)) return setError('Escolha uma data válida.');
    if (!isTime(time)) return setError('Escolha um horário válido.');
    onSave({ title: title.trim(), date, time, icon }, editingId);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#141410]/55"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FAF8F0] border border-[#C4C0AB] p-5 space-y-4"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))' }}
        role="dialog"
        aria-modal="true"
        aria-label={editingId ? 'Editar atividade' : 'Nova atividade'}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-wider text-[#141410]">
            {editingId ? 'EDITAR ATIVIDADE' : 'NOVA ATIVIDADE'}
          </span>
          <button type="button" onClick={onClose} aria-label="Fechar" className="press p-2 -mr-2 rounded-lg text-[#777567] hover:text-[#141410] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <input
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
            if (!iconTouched) setIcon(inferRpgIcon(e.target.value, ''));
          }}
          placeholder="O que vem neste momento?"
          maxLength={80}
          className={field + ' text-base font-semibold'}
          aria-label="Título"
        />

        <div className="grid grid-cols-2 gap-3">
          <label className="text-[11px] font-mono text-[#777567] space-y-1 block">
            DATA
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field + ' font-mono'} />
          </label>
          <label className="text-[11px] font-mono text-[#777567] space-y-1 block">
            HORÁRIO
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={field + ' font-mono'} />
          </label>
        </div>

        <div className="grid grid-cols-5 gap-1.5 p-2 rounded-2xl bg-[#EDE8D0]/80 border border-[#C4C0AB]" role="radiogroup" aria-label="Ícone">
          {RPG_ICON_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={icon === o.id}
              title={o.label}
              onClick={() => {
                setIcon(o.id);
                setIconTouched(true);
              }}
              className={`press h-12 rounded-xl flex items-center justify-center cursor-pointer border-2 ${
                icon === o.id ? 'bg-[#FAF8F0] border-[#141410]' : 'border-transparent hover:bg-[#FAF8F0]'
              }`}
            >
              <RpgIcon icon={o.id} size={24} variant={icon === o.id ? 'default' : 'muted'} />
            </button>
          ))}
        </div>

        {error && <p className="text-xs font-mono text-[#33312B]" role="alert">{error}</p>}

        <div className="flex gap-2.5 pt-1">
          <button type="button" onClick={onClose} className="press flex-1 h-12 rounded-xl border border-[#C4C0AB] text-sm font-semibold text-[#545248] cursor-pointer">
            Cancelar
          </button>
          <button type="submit" className="press flex-[1.4] h-12 rounded-xl bg-[#141410] text-[#EDE8D0] text-sm font-bold cursor-pointer">
            Salvar
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};
