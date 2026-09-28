import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface Props {
  checked: boolean;
  onToggle: () => void;
  emphasized?: boolean;
  size?: number;
}

/** Shared completion control: short, quiet "I advanced" feedback (no confetti). */
export const CheckButton: React.FC<Props> = ({ checked, onToggle, emphasized, size = 24 }) => (
  <motion.button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    whileTap={{ scale: 0.86 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 500, damping: 26 }}
    style={{ width: size, height: size }}
    className={`relative shrink-0 rounded-lg flex items-center justify-center cursor-pointer border-2 transition-colors duration-200 ${
      checked
        ? 'bg-[#141410] border-[#141410] text-[#EDE8D0]'
        : emphasized
        ? 'border-[#141410] bg-[#C4C0AB]/40 hover:bg-[#C4C0AB]/70'
        : 'border-[#9D9988] hover:border-[#141410]'
    }`}
    aria-pressed={checked}
    aria-label={checked ? 'Reabrir atividade' : 'Concluir atividade'}
  >
    <AnimatePresence initial={false}>
      {checked && (
        <motion.svg
          key="check"
          viewBox="0 0 24 24"
          className="w-[70%] h-[70%]"
          fill="none"
          stroke="currentColor"
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.18 }}
        >
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
          />
        </motion.svg>
      )}
    </AnimatePresence>
  </motion.button>
);
