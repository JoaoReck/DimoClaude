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

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    /* 
      Ajuste Perfeito para o iPhone 16:
      - pt-[calc(env(safe-area-inset-top,0px)+1.85rem)]: Aumentamos o recuo superior para ~30px além do notch. 
        Isso joga os botões exatamente abaixo da faixa de desfoque que você descobriu no print preto.
      - bg-[#EDE8D0]: Voltamos com o seu bege original padrão.
      - pb-3.5: Ajustamos a base do cabeçalho para manter a proporção visual bem equilibrada.
    */
    <div className="w-full border-b border-[#C4C0AB]/70 select-none bg-[#EDE8D0] pt-[calc(env(safe-area-inset-top,0px)+1.85rem)] pb-3.5">
      <div className="w-full max-w-lg mx-auto px-3 sm:px-4 isolate will-change-transform">
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
                  className={`crisp-nav-icon w-6 h-6 transition-colors ${
                    active ? 'stroke-[2.3] text-[#141410]' : 'stroke- text-[#9D9988]'
                  }`}
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