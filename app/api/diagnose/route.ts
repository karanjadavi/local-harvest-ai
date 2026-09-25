import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;
    const notes = (formData.get('notes') as string) || '';
    const language = (formData.get('language') as string) || 'en';

    const apiKey = process.env.GEMINI_API_KEY;

    // Language Mapping for System Prompts & Fallbacks
    const languageNames: Record<string, string> = {
      en: 'English',
      sw: 'Swahili (Kiswahili)',
      fr: 'French (Français)',
    };
    const targetLang = languageNames[language] || 'English';

    // Fallback translations if API Key is not configured or fails
    const fallbackReports: Record<string, any> = {
      en: {
        isLive: false,
        cropName: 'Tomato (Hybrid F1)',
        healthStatus: 'Action Required',
        issueTitle: 'Early Blight (Alternaria solani)',
        confidence: '94%',
        severity: 'Moderate',
        symptoms: [
          'Concentric dark spots ("target-like" rings) on lower foliage',
          'Yellowing halo around primary lesion sites',
          'Minor leaf curling at tips due to stress',
        ],
        recommendedActions: [
          'Prune affected lower leaves to improve air circulation',
          'Apply a copper-based fungicide spray early in the morning',
          'Avoid overhead irrigation to keep leaves dry',
        ],
        preventativeMeasures: [
          'Rotate crops with non-solanaceous plants next season',
          'Mulch around plant bases to prevent soil splash',
        ],
      },
      sw: {
        isLive: false,
        cropName: 'Nyanya (Hybrid F1)',
        healthStatus: 'Hatua Inahitajika',
        issueTitle: 'Ugonjwa wa Madoa ya Majani (Early Blight)',
        confidence: '94%',
        severity: 'Wastani',
        symptoms: [
          'Madoa meusi yenye duara kwenye majani ya chini',
          'Rangi ya manjano kuzunguka madoa makuu',
          'Majani kujikunja kidogo mwishoni kutokana na msongo',
        ],
        recommendedActions: [
          'Pogoa majani ya chini yaliyoathirika ili kuongeza mzunguko wa hewa',
          'Piga dawa ya kuua kuvu yenye shaba asubuhi na mapema',
          'Epuka kumwagilia maji juu ya majani ili kuyatunza yakavu',
        ],
        preventativeMeasures: [
          'Badilisha mazao msimu ujao usipande familia moja ya nyanya',
          'Weka tandaza (mulch) chini ya mmea kuzuia mchanga kurukia majani',
        ],
      },
      fr: {
        isLive: false,
        cropName: 'Tomate (Hybride F1)',
        healthStatus: 'Action Requise',
        issueTitle: 'Alternariose (Alternaria solani)',
        confidence: '94%',
        severity: 'Modérée',
        symptoms: [
          'Taches sombres concentriques sur le feuillage inférieur',
          'Halo jaunissant autour des lésions principales',
          'Léger enroulement de la pointe des feuilles dû au stress',
        ],
        recommendedActions: [
          'Tailler les feuilles inférieures touchées pour améliorer la circulation de l\'air',
          'Appliquer un fongicide à base de cuivre tôt le matin',
          'Éviter l\'arrosage par aspersion pour garder les feuilles sèches',
        ],
        preventativeMeasures: [
          'Effectuer une rotation des cultures la saison prochaine',
          'Pailler le sol au pied des plants pour éviter les éclaboussures',
        ],
      },
    };

    if (!apiKey) {
      return NextResponse.json(fallbackReports[language] || fallbackReports.en);
    }

    // Call Gemini 2.5 Flash REST API
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const promptText = `
Analyze this agricultural crop image and provide a diagnostic report in JSON format.
CRITICAL: Translate all fields and responses into ${targetLang}.

User Context Notes: "${notes}"

Return EXCLUSIVELY a JSON object matching this structure:
{
  "cropName": "Name of crop in ${targetLang}",
  "healthStatus": "Healthy or Action Required in ${targetLang}",
  "issueTitle": "Name of disease/pest or Healthy in ${targetLang}",
  "confidence": "e.g. 92%",
  "severity": "Low, Moderate, or High in ${targetLang}",
  "symptoms": ["Symptom 1 in ${targetLang}", "Symptom 2 in ${targetLang}"],
  "recommendedActions": ["Action 1 in ${targetLang}", "Action 2 in ${targetLang}"],
  "preventativeMeasures": ["Measure 1 in ${targetLang}", "Measure 2 in ${targetLang}"]
}
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inline_data: {
                    mime_type: image.type || 'image/jpeg',
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      console.warn('Gemini API call failed, using localized fallback.');
      return NextResponse.json(fallbackReports[language] || fallbackReports.en);
    }

    const geminiData = await geminiRes.json();
    const rawJson = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawJson) {
      return NextResponse.json(fallbackReports[language] || fallbackReports.en);
    }

    const parsedReport = JSON.parse(rawJson);
    return NextResponse.json({
      isLive: true,
      ...parsedReport,
    });
  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json(
      {
        isLive: false,
        cropName: 'Tomato',
        healthStatus: 'Action Required',
        issueTitle: 'Early Blight',
        confidence: '90%',
        severity: 'Moderate',
        symptoms: ['Leaf spots observed'],
        recommendedActions: ['Apply appropriate fungicide'],
        preventativeMeasures: ['Ensure crop rotation'],
      },
      { status: 200 }
    );
  }
}
