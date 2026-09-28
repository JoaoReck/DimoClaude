import React from 'react';
import { ViewMode } from '../types';
import { GitCommitVertical, CheckSquare, CalendarDays } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  showInstallOption?: boolean;
  onInstallClick?: () => void;
}

const TABS: { id: ViewMode; label: string; Icon: typeof GitCommitVertical }[] = [
  { id: 'timeline', label: 'Timeline / Jornada do Dia', Icon: GitCommitVertical },
  { id: 'checklist', label: 'Checklist de Atividades', Icon: CheckSquare },
  { id: 'calendar', label: 'Grade Diária', Icon: CalendarDays },
];

/**
 * Icon-only nav (no big filled/rounded button background). Kept as a
 * diagnostic + simplification: removing the large painted button surface
 * (bg/border/shadow layer) around each icon so the toolbar has as little
 * composited surface as possible, in case that surface was contributing to
 * the iOS PWA icon blur. Tap targets stay ~44px via padding, not visual bulk.
 */
export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="w-full border-b border-[#C4C0AB]/70 select-none bg-[#EDE8D0]">
      <div className="w-full max-w-lg mx-auto px-3 sm:px-4 py-1.5">
        <nav className="w-full grid grid-cols-3 items-center" aria-label="Navegação Principal">
          {TABS.map(({ id, label, Icon }) => {
            const active = currentView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onViewChange(id)}
                title={label}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className="press h-11 flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <Icon
                  className={`crisp-nav-icon w-6 h-6 ${active ? 'stroke-[2.3] text-[#141410]' : 'stroke-[2] text-[#9D9988]'}`}
                />
                <span className={`w-1 h-1 rounded-full transition-colors ${active ? 'bg-[#141410]' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
