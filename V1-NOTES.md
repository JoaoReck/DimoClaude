# Dimo — V1

## Rodando localmente
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera /dist para deploy (Firebase Hosting, Vercel, etc.)
```

## O que mudou em relação ao protótipo do AI Studio

**Uma única fonte de dados.** `Activity` agora é `{ id, title, date, time,
icon, completed, createdAt, updatedAt }` — `date` é uma chave real
`YYYY-MM-DD`, não mais um "offset de hoje" (`-1/0/1`). Isso elimina a
limitação de só existirem ontem/hoje/amanhã: qualquer data funciona, e
Timeline, Checklist e Calendário leem exatamente a mesma lista
(`src/hooks/useActivities.ts` + `src/lib/selectors.ts`). "Missões diárias
X/Y" é sempre derivado (`progress()`), nunca um contador separado.

**Arquitetura nova** (tudo isolado da UI, pronta para trocar localStorage por
um backend depois):
- `src/types.ts` — entidade `Activity`
- `src/lib/dates.ts` — todo o cálculo de datas (chave, navegação, swipe,
  formatação "Hoje/Amanhã/Ontem", grade do mês)
- `src/lib/activityRepository.ts` — persistência (localStorage hoje; migra
  automaticamente dados antigos do protótipo na primeira abertura)
- `src/lib/selectors.ts` — `forDate`, `progress`, `nextStep`
- `src/hooks/useActivities.ts`, `useNow.ts`, `useHorizontalSwipe.ts`

**Removido:** XP, níveis, HUD "JORNADA ATIVA/FINALIZADA", sons/efeitos
sonoros, dados de exemplo (mock), atalho de teclado "N"/Espaço que abria
criação sem contexto — nada disso estava no briefing da V1.

**Preservado como pediu:** a paleta Baunilha/Carvão, a espada oficial
(`/icone2.png`, `/icone4.png`) como identidade de horário vazio, o
`RpgIcon.tsx` pixel-art (intocado), a Toolbar de 3 abas sem título/logo, o
fluxo de instalação PWA (`InstallBanner`, `InstallGuideModal`,
`useMobilePWA`), o `manifest.webmanifest` e o Service Worker.

**Componentes reescritos** para uma única fonte de verdade e sem duplicar
lógica de data/gesto entre Timeline, Checklist e Calendário:
`TimelineView`, `ChecklistView`, `CalendarView` (agora com navegação real
por mês e pontos de status por dia), `DaySelector`, `FooterBar`,
`ActivityDetailModal`, e um novo `ActivitySheet` (substitui
`ActivityFormModal`) + `CheckButton` compartilhado com a microanimação de
conclusão (um traço se desenhando — sem confete).

## Fluxos cobertos (critério de "V1 pronta" do briefing)
- Timeline: 24h, horário atual, seleção de horário vazio → espada → criar;
  editar/excluir/concluir; auto-scroll centralizado só ao abrir Hoje ou
  tocar "Hoje" de novo (não pula ao trocar de dia).
- Datas: setas, swipe horizontal (mesmas funções, sem duplicação), atalhos
  de teclado no desktop (← →, 1/2/3).
- Checklist e Calendário: mesmos dados, mesmas ações.
- Persistência: localStorage, migra dados do formato antigo automaticamente.
- Responsivo: mobile/tablet/desktop, safe-area iOS preservada.

## O que ficou de fora de propósito (por enquanto)
Descrição/local/foto/notas/lembretes/recorrência — o schema em `types.ts`
foi desenhado para aceitar esses campos como opcionais sem migração
estrutural, mas nada disso foi implementado, como pedido.
