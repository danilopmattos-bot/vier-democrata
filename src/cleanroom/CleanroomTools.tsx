import React, { useEffect, useState } from 'react';
import { Calculator, ChevronUp, Droplets, FlaskConical, Gauge, Scale, X } from 'lucide-react';
import { ToolsCalculatorModal } from '../components/ToolsCalculatorModal';

type CalculatorTab = 'priming' | 'refractometer' | 'hydrometer' | 'dilution' | 'yeast';

const QUICK_TOOLS: Array<{ tab: CalculatorTab; label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = [
  { tab: 'priming', label: 'Priming', description: 'Açúcar para o envase', icon: Droplets },
  { tab: 'refractometer', label: 'Refratômetro', description: 'FG com álcool presente', icon: FlaskConical },
  { tab: 'hydrometer', label: 'Densímetro', description: 'Correção por temperatura', icon: Gauge },
  { tab: 'dilution', label: 'Diluição', description: 'Quanto de água adicionar', icon: Scale },
  { tab: 'yeast', label: 'Levedura', description: 'Pitch rate e slurry', icon: Calculator },
];

export const CleanroomTools: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<CalculatorTab>('priming');

  useEffect(() => {
    document.body.classList.add('bb-large-ui');
    return () => document.body.classList.remove('bb-large-ui');
  }, []);

  const openCalculator = (tab: CalculatorTab) => {
    setInitialTab(tab);
    setModalOpen(true);
    setMenuOpen(false);
  };

  return (
    <>
      <aside className="bb-global-tools" aria-label="Calculadoras cervejeiras">
        {menuOpen && (
          <div className="bb-global-tools__panel">
            <div className="bb-global-tools__head">
              <div>
                <span>FERRAMENTAS RÁPIDAS</span>
                <strong>Calculadoras</strong>
              </div>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fechar calculadoras">
                <X />
              </button>
            </div>
            <div className="bb-global-tools__list">
              {QUICK_TOOLS.map(({ tab, label, description, icon: Icon }) => (
                <button key={tab} type="button" onClick={() => openCalculator(tab)}>
                  <Icon />
                  <span><strong>{label}</strong><small>{description}</small></span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className="bb-global-tools__trigger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
        >
          <Calculator />
          <span>Calculadoras</span>
          <ChevronUp className={menuOpen ? 'is-open' : ''} />
        </button>
      </aside>

      <ToolsCalculatorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={initialTab}
      />
    </>
  );
};

export default CleanroomTools;
