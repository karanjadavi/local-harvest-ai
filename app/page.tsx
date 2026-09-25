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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  // Calculator State
  const [landArea, setLandArea] = useState<number>(1);
  const [cropType, setCropType] = useState<'tomato' | 'maize' | 'beans'>('tomato');

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
      alert('Please select or upload a crop image first.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('notes', notes);

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setReport(data);
      } else {
        alert(data.error || 'Failed to analyze image.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error analyzing image.');
    } finally {
      setLoading(false);
    }
  };

  // Yield Estimation Logic
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

  // Dynamic Tailwind Theme Classes
  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';
  const bgCard = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
  const bgInner = isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';
  const inputBg = isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800';

  return (
    <main className={`min-h-screen transition-colors duration-200 p-4 md:p-8 ${bgMain}`}>
      {/* Header */}
      <header className={`max-w-6xl mx-auto mb-8 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-500">Local Harvest AI</h1>
            <p className={`text-sm ${textMuted}`}>Precision Crop Diagnostics & Actionable Agricultural Insights</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button (Moon / Sun) */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
              title="Toggle Light / Dark Mode"
            >
              {isDark ? (
                /* Moon Icon for Dark Mode */
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                /* Sun Icon for Light Mode */
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-3 py-1.5 rounded-full font-mono">
              HackTrent 2026
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mt-6 print:hidden">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'diagnostics' 
                ? 'bg-emerald-600 text-white' 
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            AI Crop Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'calculator' 
                ? 'bg-emerald-600 text-white' 
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            Yield & Seed Input Calculator
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {activeTab === 'diagnostics' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className={`p-6 rounded-xl border print:hidden ${bgCard}`}>
              <h2 className="text-xl font-semibold mb-4 text-emerald-500">1. Upload Leaf or Crop Image</h2>
              
              <div className="mb-4">
                <label className={`block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDark ? 'border-slate-600 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500'}`}>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-cover" />
                  ) : (
                    <p className={textMuted}>Click to select or drag leaf photo here</p>
                  )}
                </label>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Lower leaf wilting, planted in Kakamega region..."
                  className={`w-full rounded-lg p-3 focus:outline-none focus:border-emerald-500 ${inputBg}`}
                  rows={3}
                />
              </div>

              <button
                onClick={handleRunDiagnostics}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Analyzing Plant Pathology...' : 'Run AI Crop Diagnostics'}
              </button>
            </div>

            {/* Diagnostic Report Output */}
            <div className={`p-6 rounded-xl border ${bgCard}`}>
              <div className={`flex items-center justify-between mb-4 border-b pb-3 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <h2 className="text-xl font-semibold text-emerald-500">2. Diagnostic Report</h2>
                {report && (
                  <div className="flex items-center gap-2 print:hidden">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border font-mono ${
                        report.isLive
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {report.isLive ? '? Live Gemini Vision AI' : '?? Offline Demo Fallback'}
                    </span>
                    <button
                      onClick={() => window.print()}
                      className={`text-xs px-3 py-1 rounded-md transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                    >
                      ?? Export PDF
                    </button>
                  </div>
                )}
              </div>

              {report ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border ${bgInner}`}>
                      <p className={`text-xs ${textMuted}`}>Crop Identified</p>
                      <p className="font-semibold">{report.cropName}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${bgInner}`}>
                      <p className={`text-xs ${textMuted}`}>Health Status</p>
                      <p className="font-semibold text-amber-500">{report.healthStatus}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${bgInner}`}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-semibold text-emerald-500">{report.issueTitle}</p>
                      <span className="text-xs text-amber-500 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        {report.severity} Severity
                      </span>
                    </div>
                    <p className={`text-xs ${textMuted}`}>Confidence: {report.confidence}</p>
                  </div>

                  <div>
                    <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Observed Symptoms</h3>
                    <ul className={`list-disc list-inside text-xs space-y-1 ${textMuted}`}>
                      {report.symptoms.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-emerald-500 mb-2">Recommended Actions</h3>
                    <ul className={`list-disc list-inside text-xs space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {report.recommendedActions.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className={`h-64 flex items-center justify-center text-sm ${textMuted}`}>
                  Upload an image and run diagnostics to generate the report.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Calculator Section */
          <div className={`p-6 rounded-xl border max-w-2xl mx-auto ${bgCard}`}>
            <h2 className="text-xl font-semibold mb-6 text-emerald-500">Yield & Seed Input Calculator</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Crop Type
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
                  Land Area (Acres)
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
                <p className={`text-xs ${textMuted}`}>Required Seed / Plants</p>
                <p className="text-2xl font-bold text-emerald-500 mt-1">
                  {calc.seedRequirement.toLocaleString()} {cropType === 'tomato' ? 'Grams' : 'Kg'}
                </p>
              </div>
              <div>
                <p className={`text-xs ${textMuted}`}>Estimated Harvest Yield</p>
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
