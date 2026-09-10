import React, { ReactNode, useState } from 'react';
import {
  BookOpen,
  Calculator,
  ChevronDown,
  Copy,
  Droplets,
  FileText,
  Flame,
  Home,
  Menu,
  Palette,
  Plus,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { BeerRecipe } from '../types/brewing';
import { DemocrataLogo } from './DemocrataLogo';

export type AppTab = 'home' | 'architect' | 'water' | 'cockpit' | 'diagnostic' | 'labels' | 'sheet';

interface AppShellProps {
  children: ReactNode;
  currentRecipe: BeerRecipe;
  allRecipes: BeerRecipe[];
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onSelectRecipe: (id: string) => void;
  onNewRecipe: () => void;
  onCloneRecipe: () => void;
  onOpenAIForge: () => void;
  onOpenCalculators: () => void;
  onBatchSizeScale: (newSize: number) => void;
}

const PRIMARY_NAV: Array<{
  id: AppTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Bancada', shortLabel: 'Início', icon: Home },
  { id: 'architect', label: 'Receita', shortLabel: 'Receita', icon: BookOpen },
  { id: 'cockpit', label: 'Brassagem', shortLabel: 'Brassar', icon: Flame },
  { id: 'water', label: 'Água', shortLabel: 'Água', icon: Droplets },
];

const SECONDARY_NAV: Array<{
  id: AppTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'diagnostic', label: 'Problemas', description: 'Consultar defeitos da cerveja', icon: Wrench },
  { id: 'labels', label: 'Rótulo', description: 'Abrir o estúdio de rótulos', icon: Palette },
  { id: 'sheet', label: 'Ficha da receita', description: 'Visualizar e imprimir', icon: FileText },
];

export const AppShell: React.FC<AppShellProps> = ({
  children,
  currentRecipe,
  allRecipes,
  activeTab,
  onSelectTab,
  onSelectRecipe,
  onNewRecipe,
  onCloneRecipe,
  onOpenAIForge,
  onOpenCalculators,
  onBatchSizeScale,
}) => {
  const [toolsOpen, setToolsOpen] = useState(false);

  const goTo = (tab: AppTab) => {
    setToolsOpen(false);
    onSelectTab(tab);
  };

  const isSecondaryActive = SECONDARY_NAV.some((item) => item.id === activeTab);

  return (
    <div className="v4-shell">
      <header className="v4-masthead">
        <div className="v4-masthead__bar">
          <button type="button" className="v4-brand" onClick={() => goTo('home')} aria-label="Ir para a Bancada">
            <DemocrataLogo size="custom" customSizePx={44} variant="circular" />
            <span className="v4-brand__wordmark">
              <strong>Democrata</strong>
              <small>Bier · receitas & brassagens</small>
            </span>
          </button>

          <nav className="v4-primary-nav" aria-label="Áreas principais">
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const selected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="v4-primary-nav__item"
                  data-active={selected || undefined}
                  onClick={() => goTo(item.id)}
                >
                  <Icon className="v4-primary-nav__icon" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="v4-masthead__tools">
            <button type="button" className="v4-tool-button" onClick={onOpenCalculators}>
              <Calculator className="v4-tool-button__icon" />
              <span>Calculadoras</span>
            </button>
            <button
              type="button"
              className="v4-tool-button"
              data-active={isSecondaryActive || undefined}
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen((open) => !open)}
            >
              <Menu className="v4-tool-button__icon" />
              <span>Mais</span>
              <ChevronDown className="v4-tool-button__chevron" />
            </button>
          </div>

          {toolsOpen && (
            <div className="v4-tools-menu">
              <div className="v4-tools-menu__heading">
                <span>Ferramentas da casa</span>
                <button type="button" onClick={() => setToolsOpen(false)} aria-label="Fechar menu">
                  <X />
                </button>
              </div>
              {SECONDARY_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} type="button" onClick={() => goTo(item.id)}>
                    <Icon />
                    <span><strong>{item.label}</strong><small>{item.description}</small></span>
                  </button>
                );
              })}
              <div className="v4-tools-menu__rule" />
              <button type="button" onClick={() => { setToolsOpen(false); onOpenAIForge(); }}>
                <Sparkles />
                <span><strong>Assistente opcional</strong><small>Sugestões sem alterar o motor da receita</small></span>
              </button>
            </div>
          )}
        </div>

        <div className="v4-recipe-context">
          <div className="v4-recipe-context__inner">
            <div className="v4-recipe-context__label">
              <span>Receita aberta</span>
              <i />
            </div>
            <label className="v4-recipe-picker">
              <span className="sr-only">Selecionar receita</span>
              <select value={currentRecipe.id} onChange={(event) => onSelectRecipe(event.target.value)}>
                {allRecipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                ))}
              </select>
              <ChevronDown />
            </label>
            <span className="v4-recipe-style">{currentRecipe.style.code} · {currentRecipe.style.name}</span>
            <span className="v4-context-divider" />
            <label className="v4-batch-size">
              <span>Lote</span>
              <input
                type="number"
                min="1"
                step="1"
                value={currentRecipe.batchSizeLiters}
                onChange={(event) => onBatchSizeScale(Math.max(1, Number(event.target.value) || 1))}
              />
              <b>L</b>
            </label>
            <div className="v4-context-actions">
              <button type="button" onClick={onCloneRecipe}><Copy /> <span>Fazer novamente</span></button>
              <button type="button" className="v4-context-actions__new" onClick={onNewRecipe}><Plus /> <span>Criar receita</span></button>
            </div>
          </div>
        </div>
      </header>

      <main className="v4-main">{children}</main>

      <nav className="v4-mobile-nav" aria-label="Navegação principal no celular">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              data-active={activeTab === item.id || undefined}
              onClick={() => goTo(item.id)}
            >
              <Icon />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
        <button type="button" data-active={isSecondaryActive || undefined} onClick={() => setToolsOpen((open) => !open)}>
          <Menu />
          <span>Mais</span>
        </button>
      </nav>
    </div>
  );
};
