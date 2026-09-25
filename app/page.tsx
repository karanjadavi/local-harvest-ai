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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  // Calculator State
  const [landArea, setLandArea] = useState<number>(1);
  const [cropType, setCropType] = useState<'tomato' | 'maize' | 'beans'>('tomato');

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

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 border-b border-slate-800 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-400">Local Harvest AI</h1>
            <p className="text-slate-400 text-sm">Precision Crop Diagnostics & Actionable Agricultural Insights</p>
          </div>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-3 py-1 rounded-full font-mono">
            HackTrent 2026
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mt-6 print:hidden">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'diagnostics' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            AI Crop Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'calculator' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
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
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 print:hidden">
              <h2 className="text-xl font-semibold mb-4 text-emerald-300">1. Upload Leaf or Crop Image</h2>
              
              <div className="mb-4">
                <label className="block w-full border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-cover" />
                  ) : (
                    <p className="text-slate-400">Click to select or drag leaf photo here</p>
                  )}
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-slate-300">Additional Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Lower leaf wilting, planted in Kakamega region..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
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
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                <h2 className="text-xl font-semibold text-emerald-300">2. Diagnostic Report</h2>
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
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-md transition-colors"
                    >
                      ?? Export PDF
                    </button>
                  </div>
                )}
              </div>

              {report ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-3 rounded-lg">
                      <p className="text-xs text-slate-400">Crop Identified</p>
                      <p className="font-semibold text-slate-200">{report.cropName}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg">
                      <p className="text-xs text-slate-400">Health Status</p>
                      <p className="font-semibold text-amber-400">{report.healthStatus}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-semibold text-emerald-400">{report.issueTitle}</p>
                      <span className="text-xs text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        {report.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Confidence: {report.confidence}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-2">Observed Symptoms</h3>
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                      {report.symptoms.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-emerald-400 mb-2">Recommended Actions</h3>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {report.recommendedActions.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                  Upload an image and run diagnostics to generate the report.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Calculator Section */
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-emerald-300">Yield & Seed Input Calculator</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Select Crop Type</label>
                <select
                  value={cropType}
                  onChange={(e: any) => setCropType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="tomato">Tomato (Hybrid F1)</option>
                  <option value="maize">Maize (Hybrid)</option>
                  <option value="beans">Dry Beans</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Land Area (Acres)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={landArea}
                  onChange={(e) => setLandArea(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-900 p-6 rounded-lg border border-slate-700">
              <div>
                <p className="text-xs text-slate-400">Required Seed / Plants</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {calc.seedRequirement.toLocaleString()} {cropType === 'tomato' ? 'Grams' : 'Kg'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Estimated Harvest Yield</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
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
