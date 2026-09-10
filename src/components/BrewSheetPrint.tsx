import React from 'react';
import { BeerRecipe, RecipeCalculations } from '../types/brewing';
import { Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import { DemocrataLogo } from './DemocrataLogo';

interface BrewSheetPrintProps {
  recipe: BeerRecipe;
  calculations: RecipeCalculations;
}

export const BrewSheetPrint: React.FC<BrewSheetPrintProps> = ({ recipe, calculations }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(recipe, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${recipe.name.toLowerCase().replace(/\s+/g, '_')}_democrata_recipe.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportBeerXML = () => {
    // Generate valid BeerXML v1.0 standard representation
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>${recipe.name}</NAME>
    <VERSION>1</VERSION>
    <TYPE>All Grain</TYPE>
    <BREWER>${recipe.brewer || 'Cervejaria Democrata'}</BREWER>
    <BATCH_SIZE>${recipe.batchSizeLiters}</BATCH_SIZE>
    <BOIL_SIZE>${calculations.preBoilVolumeLiters}</BOIL_SIZE>
    <BOIL_TIME>${recipe.boilTimeMinutes}</BOIL_TIME>
    <EFFICIENCY>${recipe.efficiencyPercent}</EFFICIENCY>
    <STYLE>
      <NAME>${recipe.style.name}</NAME>
      <CATEGORY>${recipe.style.category}</CATEGORY>
      <CATEGORY_NUMBER>${recipe.style.code}</CATEGORY_NUMBER>
      <STYLE_LETTER>A</STYLE_LETTER>
      <STYLE_GUIDE>BJCP 2021</STYLE_GUIDE>
      <TYPE>Ale</TYPE>
      <OG_MIN>${recipe.style.ogMin}</OG_MIN>
      <OG_MAX>${recipe.style.ogMax}</OG_MAX>
      <FG_MIN>${recipe.style.fgMin}</FG_MIN>
      <FG_MAX>${recipe.style.fgMax}</FG_MAX>
      <IBU_MIN>${recipe.style.ibuMin}</IBU_MIN>
      <IBU_MAX>${recipe.style.ibuMax}</IBU_MAX>
      <COLOR_MIN>${recipe.style.srmMin}</COLOR_MIN>
      <COLOR_MAX>${recipe.style.srmMax}</COLOR_MAX>
    </STYLE>
    <FERMENTABLES>
      ${recipe.grains
        .map(
          (g) => `
      <FERMENTABLE>
        <NAME>${g.name}</NAME>
        <VERSION>1</VERSION>
        <AMOUNT>${g.amountKg}</AMOUNT>
        <TYPE>Grain</TYPE>
        <YIELD>78.0</YIELD>
        <COLOR>${g.ebc / 1.97}</COLOR>
      </FERMENTABLE>`
        )
        .join('')}
    </FERMENTABLES>
    <HOPS>
      ${recipe.hops
        .map(
          (h) => `
      <HOP>
        <NAME>${h.name}</NAME>
        <VERSION>1</VERSION>
        <ALPHA>${h.alphaAcids}</ALPHA>
        <AMOUNT>${h.amountGrams / 1000}</AMOUNT>
        <USE>${h.use === 'Dry Hop' ? 'Dry Hop' : 'Boil'}</USE>
        <TIME>${h.timeMinutes}</TIME>
        <FORM>${h.form}</FORM>
      </HOP>`
        )
        .join('')}
    </HOPS>
    <YEASTS>
      <YEAST>
        <NAME>${recipe.yeast.name}</NAME>
        <VERSION>1</VERSION>
        <TYPE>${recipe.yeast.type}</TYPE>
        <FORM>Dry</FORM>
        <AMOUNT>0.011</AMOUNT>
        <LABORATORY>${recipe.yeast.brand}</LABORATORY>
        <PRODUCT_ID>${recipe.yeast.strain}</PRODUCT_ID>
        <ATTENUATION>${recipe.yeast.attenuationAvg}</ATTENUATION>
      </YEAST>
    </YEASTS>
  </RECIPE>
</RECIPES>`;

    const dataStr = 'data:text/xml;charset=utf-8,' + encodeURIComponent(xml);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${recipe.name.toLowerCase().replace(/\s+/g, '_')}.xml`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900/80 p-5 rounded-2xl border border-stone-800">
        <div className="flex items-center gap-3">
          <DemocrataLogo size="sm" variant="circular" />
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-500 font-bold">
              Ficha de Produção da Fábrica
            </div>
            <h2 className="text-xl font-black text-white">
              Ficha Técnica de Brassagem (Brew Sheet)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportBeerXML}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-stone-700 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Exportar BeerXML
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-stone-700 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Exportar JSON
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Imprimir Ficha
          </button>
        </div>
      </div>

      {/* Clean Printable Sheet Wrapper with mobile scroll container */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
        <div
          id="printable-brew-sheet"
          className="bg-white text-stone-900 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-300 font-sans space-y-5 sm:space-y-6 max-w-4xl mx-auto min-w-[320px] sm:min-w-full relative overflow-hidden"
        >
          {/* Subtle Watermark Stamp */}
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6 opacity-10 pointer-events-none">
            <DemocrataLogo size="custom" customSizePx={100} variant="badge" />
          </div>

          {/* Header */}
          <div className="border-b-2 border-stone-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <DemocrataLogo size="custom" customSizePx={46} variant="circular" />
              <div>
                <h1 className="text-xl sm:text-3xl font-serif font-black tracking-wider text-stone-950 uppercase">
                  DEMOCRATA BIER
                </h1>
                <p className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-stone-600">
                  FICHA TÉCNICA OFICIAL DE BRASSAGEM & PRODUÇÃO
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right text-xs">
              <div className="font-mono text-xs sm:text-sm font-bold">Lote: #{recipe.id.slice(-6)}</div>
              <div className="text-stone-600">Data: {recipe.createdAt}</div>
              <div className="text-stone-600 font-semibold">Mestre: {recipe.brewer || 'Democrata'}</div>
            </div>
          </div>

          {/* Recipe Title & Core Telemetry Grid */}
          <div>
            <h2 className="text-lg sm:text-2xl font-black uppercase text-stone-900">
              {recipe.name}
            </h2>
            <p className="text-xs sm:text-sm italic font-medium text-stone-700">
              {recipe.style.name} ({recipe.style.code}) • "{recipe.tagline}"
            </p>
          </div>

          {/* Target Metrics */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-stone-100 p-3 sm:p-4 rounded-xl border border-stone-300 text-center font-mono">
            <div>
              <span className="text-[9px] sm:text-[10px] text-stone-500 uppercase block">Volume</span>
              <span className="font-black text-sm sm:text-base">{recipe.batchSizeLiters} L</span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-stone-500 uppercase block">OG Esperada</span>
              <span className="font-black text-sm sm:text-base">{calculations.og}</span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-stone-500 uppercase block">FG Esperada</span>
              <span className="font-black text-sm sm:text-base">{calculations.fg}</span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-stone-500 uppercase block">ABV</span>
              <span className="font-black text-sm sm:text-base text-amber-700">{calculations.abv}%</span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-stone-500 uppercase block">IBU</span>
              <span className="font-black text-sm sm:text-base text-emerald-800">{calculations.ibu}</span>
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] text-stone-500 uppercase block">Cor (EBC)</span>
              <span className="font-black text-sm sm:text-base">{calculations.ebc} EBC</span>
            </div>
          </div>

          {/* Water & Volumes Section */}
          <div className="border border-stone-300 rounded-xl p-3 sm:p-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-stone-800 mb-2">
              Volumes de Água & Sais de Brassagem
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mb-2">
              <div>Água Mostura: <strong>{calculations.strikeWaterVolumeLiters} L</strong></div>
              <div>Temp. da água de mostura: <strong>{calculations.strikeWaterTempCelsius} °C</strong></div>
              <div>Água Lavagem: <strong>{calculations.spargeWaterVolumeLiters} L</strong></div>
              <div>Pré-Fervura: <strong>{calculations.preBoilVolumeLiters} L</strong></div>
            </div>
            <div className="text-[11px] sm:text-xs text-stone-600">
              <strong>Sais:</strong> Gipsita: {recipe.waterSalts?.gypsumGrams || 0}g • Cloreto de Cálcio: {recipe.waterSalts?.calciumChlorideGrams || 0}g • Epsom: {recipe.waterSalts?.epsomSaltGrams || 0}g • Ácido Lático: {recipe.waterSalts?.lacticAcid88Ml || 0}mL
            </div>
          </div>

          {/* Grain Bill Table */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-wider text-stone-800 mb-2">
              Maltes & Grãos ({calculations.totalGrainKg} kg Total)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[340px] text-xs text-left border border-stone-300">
                <thead className="bg-stone-200 font-bold uppercase text-[9px] sm:text-[10px]">
                  <tr>
                    <th className="p-2">Malte</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2 text-right">Qtd</th>
                    <th className="p-2 text-right">% Grist</th>
                    <th className="p-2 text-right">EBC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono text-[11px] sm:text-xs">
                  {(recipe.grains || []).map((g) => {
                    const pct = calculations.totalGrainKg > 0 ? ((g.amountKg / calculations.totalGrainKg) * 100).toFixed(1) : '0';
                    return (
                      <tr key={g.id}>
                        <td className="p-2 font-sans font-semibold">{g.name}</td>
                        <td className="p-2">{g.type}</td>
                        <td className="p-2 text-right font-bold">{g.amountKg} kg</td>
                        <td className="p-2 text-right">{pct}%</td>
                        <td className="p-2 text-right">{g.ebc}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hop Schedule Table */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-wider text-stone-800 mb-2">
              Cronograma de Lúpulos ({calculations.totalHopsGrams} g Total)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px] text-xs text-left border border-stone-300">
                <thead className="bg-stone-200 font-bold uppercase text-[9px] sm:text-[10px]">
                  <tr>
                    <th className="p-2">Lúpulo</th>
                    <th className="p-2">Uso</th>
                    <th className="p-2">Formato</th>
                    <th className="p-2 text-right">Qtd</th>
                    <th className="p-2 text-right">Alfa</th>
                    <th className="p-2 text-right">Tempo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono text-[11px] sm:text-xs">
                  {(recipe.hops || []).map((h) => (
                    <tr key={h.id}>
                      <td className="p-2 font-sans font-semibold">{h.name}</td>
                      <td className="p-2">{h.use}</td>
                      <td className="p-2">{h.form}</td>
                      <td className="p-2 text-right font-bold">{h.amountGrams} g</td>
                      <td className="p-2 text-right">{h.alphaAcids}%</td>
                      <td className="p-2 text-right font-bold">
                        {h.timeMinutes} {h.use === 'Dry Hop' ? 'dias' : 'min'}
                        {h.tempCelsius ? ` @ ${h.tempCelsius}°C` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Water Chemistry & Salt Additions */}
          <div className="border border-stone-300 rounded-xl p-3 sm:p-4 bg-stone-50 text-xs">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-black uppercase tracking-wider text-stone-800">
                Química da Água & Sais de Brassagem ({calculations.totalWaterNeededLiters} L Total)
              </h3>
              <span className="font-mono text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-bold">
                Base: {recipe.baseWaterSource?.name || 'Curitiba - Sanepar Médio'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono mb-3">
              <div className="bg-white p-2 rounded border border-stone-200">
                <span className="text-stone-500 block text-[9px]">Gipsita (CaSO₄):</span>
                <span className="font-bold text-stone-900">{recipe.waterSalts?.gypsumGrams || 0} g</span>
              </div>
              <div className="bg-white p-2 rounded border border-stone-200">
                <span className="text-stone-500 block text-[9px]">Cloreto Cálcio (CaCl₂):</span>
                <span className="font-bold text-stone-900">{recipe.waterSalts?.calciumChlorideGrams || 0} g</span>
              </div>
              <div className="bg-white p-2 rounded border border-stone-200">
                <span className="text-stone-500 block text-[9px]">Sal Epsom (MgSO₄):</span>
                <span className="font-bold text-stone-900">{recipe.waterSalts?.epsomSaltGrams || 0} g</span>
              </div>
              <div className="bg-white p-2 rounded border border-stone-200">
                <span className="text-stone-500 block text-[9px]">Ácido Lático 88%:</span>
                <span className="font-bold text-stone-900">{recipe.waterSalts?.lacticAcid88Ml || 0} mL</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 border-t border-stone-200 gap-2">
              <span className="text-stone-700">
                <strong>Descloração Sanepar:</strong> {calculations.campdenDosage?.tabletFraction || '1/3 pastilha'} ({calculations.campdenDosage?.gramsNeeded || 0.18}g Campden)
              </span>
              <span className="font-mono text-stone-700">
                pH Mostura Previsto: <strong>{calculations.estimatedMashPh?.estimatedPh || 5.3}</strong> | Rel. SO₄:Cl: <strong>{calculations.sulfateToChlorideRatio}:1</strong>
              </span>
            </div>
          </div>

          {/* Yeast & Fermentation */}
          <div className="border border-stone-300 rounded-xl p-3 sm:p-4 bg-stone-50 text-xs">
            <h3 className="font-black uppercase tracking-wider text-stone-800 mb-1">
              Levedura & Fermentação
            </h3>
            <p className="font-semibold text-stone-900">
              {recipe.yeast?.brand || 'Fermentis'} - {recipe.yeast?.name || 'SafAle US-05'} ({recipe.yeast?.strain || 'American Ale'}) • {recipe.yeast?.type || 'Ale'}
            </p>
            <div className="mt-2 space-y-1">
              {(recipe.fermentationStages || []).map((s, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between border-b border-stone-200 py-1 text-[11px] sm:text-xs">
                  <span>{s.name}:</span>
                  <span className="font-mono font-bold">
                    {s.tempCelsius}°C por {s.durationDays} dias ({s.description})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Notes */}
          {recipe.notes && (
            <div className="text-[11px] sm:text-xs text-stone-700 italic border-t pt-3">
              <strong>Instruções do Mestre:</strong> {recipe.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
