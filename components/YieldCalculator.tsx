'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, Sprout, Wheat } from 'lucide-react';

interface CropProfile {
  name: string;
  seedRatePerAcreKg: number;
  avgYieldPerAcreKg: number;
  avgMarketPricePerKg: number;
  avgEstCostPerAcre: number;
}

const CROP_PRESETS: Record<string, CropProfile> = {
  tomatoes: {
    name: 'Tomatoes (Hybrid F1)',
    seedRatePerAcreKg: 0.1,
    avgYieldPerAcreKg: 18000,
    avgMarketPricePerKg: 0.60,
    avgEstCostPerAcre: 1200,
  },
  maize: {
    name: 'Maize (Highland Hybrid)',
    seedRatePerAcreKg: 10,
    avgYieldPerAcreKg: 2500,
    avgMarketPricePerKg: 0.35,
    avgEstCostPerAcre: 350,
  },
  beans: {
    name: 'Bush Beans',
    seedRatePerAcreKg: 25,
    avgYieldPerAcreKg: 800,
    avgMarketPricePerKg: 0.90,
    avgEstCostPerAcre: 280,
  },
};

export default function YieldCalculator() {
  const [selectedCrop, setSelectedCrop] = useState<string>('tomatoes');
  const [landAreaAcres, setLandAreaAcres] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);

  const profile = CROP_PRESETS[selectedCrop];
  const marketPrice = customPrice !== null ? customPrice : profile.avgMarketPricePerKg;

  const totalSeedsNeededKg = (profile.seedRatePerAcreKg * landAreaAcres).toFixed(2);
  const totalYieldKg = Math.round(profile.avgYieldPerAcreKg * landAreaAcres);
  const estimatedGrossRevenue = Math.round(totalYieldKg * marketPrice);
  const estimatedProductionCost = Math.round(profile.avgEstCostPerAcre * landAreaAcres);
  const estimatedNetProfit = estimatedGrossRevenue - estimatedProductionCost;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600" />
            Crop Yield & Seed Input Estimator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculate required seed rates, projected harvest volume, and estimated profit margins.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Select Crop Variety</label>
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setCustomPrice(null);
              }}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="tomatoes">Tomatoes (Hybrid F1)</option>
              <option value="maize">Maize (Highland Hybrid)</option>
              <option value="beans">Bush Beans</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Field Size (Acres): <span className="font-bold text-emerald-700">{landAreaAcres} Acre(s)</span>
            </label>
            <input
              type="range"
              min="0.25"
              max="20"
              step="0.25"
              value={landAreaAcres}
              onChange={(e) => setLandAreaAcres(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0.25 Acre</span>
              <span>10 Acres</span>
              <span>20 Acres</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Estimated Market Selling Price ($ / kg)
            </label>
            <input
              type="number"
              step="0.05"
              value={marketPrice}
              onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Projected Outcomes</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                Seeds Needed
              </span>
              <p className="text-lg font-bold text-slate-800 mt-1">{totalSeedsNeededKg} <span className="text-xs font-normal text-slate-500">kg</span></p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Wheat className="w-3.5 h-3.5 text-amber-600" />
                Est. Harvest
              </span>
              <p className="text-lg font-bold text-slate-800 mt-1">{totalYieldKg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span></p>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Est. Production Input Cost:</span>
              <span className="font-medium">${estimatedProductionCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Est. Gross Revenue:</span>
              <span className="font-medium">${estimatedGrossRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-base">
              <span className="flex items-center gap-1 text-emerald-700">
                <TrendingUp className="w-4 h-4" />
                Est. Net Revenue:
              </span>
              <span className={estimatedNetProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                ${estimatedNetProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
