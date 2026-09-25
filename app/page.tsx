'use client';

import React, { useState } from 'react';

interface DiagnosticReport {
  isLive?: boolean;
  cropName: string;
  healthStatus: string;
  issueTitle: string;
  confidence: string;
  severity: string;
  symptoms: string[];
  recommendedActions: string[];
  preventativeMeasures: string[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'calculator'>('diagnostics');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<'en' | 'sw' | 'fr'>('en');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  // Calculator State
  const [landArea, setLandArea] = useState<number>(1);
  const [cropType, setCropType] = useState<'tomato' | 'maize' | 'beans'>('tomato');

  // Multi-Language Dictionary
  const uiTexts: Record<'en' | 'sw' | 'fr', Record<string, string>> = {
    en: {
      subtitle: 'Precision Crop Diagnostics & Actionable Agricultural Insights',
      tabDiag: 'AI Crop Diagnostics',
      tabCalc: 'Yield & Seed Input Calculator',
      step1Title: '1. Upload Leaf or Crop Image',
      uploadPlaceholder: 'Click to select or drag leaf photo here',
      notesLabel: 'Additional Notes (Optional)',
      notesPlaceholder: 'e.g., Lower leaf wilting, planted in Kakamega region...',
      btnRun: 'Run AI Crop Diagnostics',
      btnRunning: 'Analyzing Plant Pathology...',
      step2Title: '2. Diagnostic Report',
      cropIdentified: 'Crop Identified',
      healthStatus: 'Health Status',
      symptomsHeader: 'Observed Symptoms',
      actionsHeader: 'Recommended Actions',
      emptyPrompt: 'Upload an image and run diagnostics to generate the report.',
      exportPdf: 'Export PDF',
      calcTitle: 'Yield & Seed Input Calculator',
      selectCrop: 'Select Crop Type',
      landArea: 'Land Area (Acres)',
      reqSeed: 'Required Seed / Plants',
      estYield: 'Estimated Harvest Yield',
    },
    sw: {
      subtitle: 'Uchunguzi Sahihi wa Mazao na Ushauri wa Kilimo',
      tabDiag: 'Uchunguzi wa Mazao wa AI',
      tabCalc: 'Kikokotoo cha Mbegu na Mavuno',
      step1Title: '1. Pakia Picha ya Jani au Zao',
      uploadPlaceholder: 'Bofya hapa au buruta picha ya jani',
      notesLabel: 'Maelezo Zaidi (Sio Lazima)',
      notesPlaceholder: 'm.f., Majani ya chini yananyauka, imepandwa eneo la Kakamega...',
      btnRun: 'Anzisha Uchunguzi wa AI',
      btnRunning: 'Inachunguza Afya ya Mmea...',
      step2Title: '2. Ripoti ya Uchunguzi',
      cropIdentified: 'Zao Lililotambuliwa',
      healthStatus: 'Hali ya Afya',
      symptomsHeader: 'Dalili Zilizoonekana',
      actionsHeader: 'Hatua Zinazopendekezwa',
      emptyPrompt: 'Pakia picha kisha anzisha uchunguzi ili kupata ripoti.',
      exportPdf: 'Pakua PDF',
      calcTitle: 'Kikokotoo cha Mbegu na Mavuno',
      selectCrop: 'Chagua Aina ya Zao',
      landArea: 'Eneo la Shamba (Ekari)',
      reqSeed: 'Mbegu Zinazohitajika',
      estYield: 'Mavuno Yanayokadiriwa',
    },
    fr: {
      subtitle: 'Diagnostics de Precision et Conseils Agricoles',
      tabDiag: 'Diagnostic IA des Cultures',
      tabCalc: 'Calculateur de Semences et Rendement',
      step1Title: '1. Telecharger une Image de Feuille',
      uploadPlaceholder: 'Cliquez pour selectionner ou glissez la photo ici',
      notesLabel: 'Notes Supplementaires (Optionnel)',
      notesPlaceholder: 'ex: Fletrissement des feuilles inferieures a Kakamega...',
      btnRun: 'Lancer le Diagnostic IA',
      btnRunning: 'Analyse Pathologique en Cours...',
      step2Title: '2. Rapport de Diagnostic',
      cropIdentified: 'Culture Identifiee',
      healthStatus: 'Etat de Sante',
      symptomsHeader: 'Symptomes Observes',
      actionsHeader: 'Actions Recommandees',
      emptyPrompt: 'Telechargez une image et lancez le diagnostic pour afficher le rapport.',
      exportPdf: 'Exporter PDF',
      calcTitle: 'Calculateur de Semences et Rendement',
      selectCrop: 'Selectionner le Type de Culture',
      landArea: 'Superficie du Terrain (Acres)',
      reqSeed: 'Semences Requises',
      estYield: 'Rendement Estime',
    },
  };

  const t = uiTexts[language] || uiTexts.en;

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRunDiagnostics = async () => {
    if (!imageFile) {
      alert(language === 'sw' ? 'Tafadhali chagua picha ya mmea kwanza.' : language === 'fr' ? 'Veuillez selectionner une image d abord.' : 'Please select or upload a crop image first.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('notes', notes);
      formData.append('language', language);

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setReport(data);
      } else {
        alert('Failed to analyze image.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error analyzing image.');
    } finally {
      setLoading(false);
    }
  };

  const getCalculations = () => {
    switch (cropType) {
      case 'tomato':
        return { seedRequirement: landArea * 150, estimatedYield: landArea * 25, unit: 'Tons' };
      case 'maize':
        return { seedRequirement: landArea * 25, estimatedYield: landArea * 3.5, unit: 'Tons' };
      case 'beans':
        return { seedRequirement: landArea * 60, estimatedYield: landArea * 1.8, unit: 'Tons' };
    }
  };

  const calc = getCalculations();

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';
  const bgCard = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const bgInner = isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';
  const inputBg = isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800';

  return (
    <main className={`min-h-screen transition-colors duration-200 p-4 md:p-8 ${bgMain}`}>
      <header className={`max-w-6xl mx-auto mb-8 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-500">Local Harvest AI</h1>
            <p className={`text-sm ${textMuted}`}>{t.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'sw' | 'fr')}
              className={`p-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${inputBg}`}
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
              <option value="fr">French</option>
            </select>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isDark ? '??' : '??'}
            </button>

            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-3 py-1.5 rounded-full font-mono">
              HackTrent 2026
            </span>
          </div>
        </div>

        <div className="flex gap-4 mt-6 print:hidden">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'diagnostics' 
                ? 'bg-emerald-600 text-white' 
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            {t.tabDiag}
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'calculator' 
                ? 'bg-emerald-600 text-white' 
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            {t.tabCalc}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {activeTab === 'diagnostics' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-6 rounded-xl border print:hidden ${bgCard}`}>
              <h2 className="text-xl font-semibold mb-4 text-emerald-500">{t.step1Title}</h2>
              
              <div className="mb-4">
                <label className={`block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDark ? 'border-slate-600 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500'}`}>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-cover" />
                  ) : (
                    <p className={textMuted}>{t.uploadPlaceholder}</p>
                  )}
                </label>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t.notesLabel}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className={`w-full rounded-lg p-3 focus:outline-none focus:border-emerald-500 ${inputBg}`}
                  rows={3}
                />
              </div>

              <button
                onClick={handleRunDiagnostics}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? t.btnRunning : t.btnRun}
              </button>
            </div>

            <div className={`p-6 rounded-xl border ${bgCard}`}>
              <div className={`flex items-center justify-between mb-4 border-b pb-3 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <h2 className="text-xl font-semibold text-emerald-500">{t.step2Title}</h2>
                {report && (
                  <div className="flex items-center gap-2 print:hidden">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border font-mono ${
                        report.isLive
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {report.isLive ? 'Live Gemini AI' : 'Offline Fallback'}
                    </span>
                    <button
                      onClick={() => window.print()}
                      className={`text-xs px-3 py-1 rounded-md transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                    >
                      {t.exportPdf}
                    </button>
                  </div>
                )}
              </div>

              {report ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border ${bgInner}`}>
                      <p className={`text-xs ${textMuted}`}>{t.cropIdentified}</p>
                      <p className="font-semibold">{report.cropName}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${bgInner}`}>
                      <p className={`text-xs ${textMuted}`}>{t.healthStatus}</p>
                      <p className="font-semibold text-amber-500">{report.healthStatus}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${bgInner}`}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-semibold text-emerald-500">{report.issueTitle}</p>
                      <span className="text-xs text-amber-500 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        {report.severity}
                      </span>
                    </div>
                    <p className={`text-xs ${textMuted}`}>Confidence: {report.confidence}</p>
                  </div>

                  <div>
                    <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.symptomsHeader}</h3>
                    <ul className={`list-disc list-inside text-xs space-y-1 ${textMuted}`}>
                      {report.symptoms.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-emerald-500 mb-2">{t.actionsHeader}</h3>
                    <ul className={`list-disc list-inside text-xs space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {report.recommendedActions.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className={`h-64 flex items-center justify-center text-sm ${textMuted}`}>
                  {t.emptyPrompt}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-xl border max-w-2xl mx-auto ${bgCard}`}>
            <h2 className="text-xl font-semibold mb-6 text-emerald-500">{t.calcTitle}</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t.selectCrop}
                </label>
                <select
                  value={cropType}
                  onChange={(e: any) => setCropType(e.target.value)}
                  className={`w-full rounded-lg p-3 focus:outline-none focus:border-emerald-500 ${inputBg}`}
                >
                  <option value="tomato">Tomato (Hybrid F1)</option>
                  <option value="maize">Maize (Hybrid)</option>
                  <option value="beans">Dry Beans</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t.landArea}
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={landArea}
                  onChange={(e) => setLandArea(Number(e.target.value))}
                  className={`w-full rounded-lg p-3 focus:outline-none focus:border-emerald-500 ${inputBg}`}
                />
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-4 p-6 rounded-lg border ${bgInner}`}>
              <div>
                <p className={`text-xs ${textMuted}`}>{t.reqSeed}</p>
                <p className="text-2xl font-bold text-emerald-500 mt-1">
                  {calc.seedRequirement.toLocaleString()} {cropType === 'tomato' ? 'Grams' : 'Kg'}
                </p>
              </div>
              <div>
                <p className={`text-xs ${textMuted}`}>{t.estYield}</p>
                <p className="text-2xl font-bold text-emerald-500 mt-1">
                  {calc.estimatedYield.toLocaleString()} {calc.unit}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
