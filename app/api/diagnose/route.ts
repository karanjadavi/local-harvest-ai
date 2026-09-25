import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const mockReport = {
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
    'Mulch soil around plant bases to reduce fungal spore splashback',
  ],
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const notes = (formData.get('notes') as string) || '';

    if (!image) {
      return NextResponse.json(
        { error: 'No image file uploaded.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.includes('YOUR_REAL_KEY') || apiKey.trim() === '') {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return NextResponse.json(mockReport);
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const imageBuffer = Buffer.from(await image.arrayBuffer());
      const base64Data = imageBuffer.toString('base64');

      const prompt = `
You are an expert plant pathologist and AI agricultural diagnostic assistant.
Analyze the attached crop image and additional grower notes.

Grower Notes: "${notes || 'None provided'}"

Provide a precise crop diagnostic report matching this exact JSON structure:
- cropName: Identified plant or crop variety
- healthStatus: Overall condition (e.g. "Action Required", "Healthy", "Critical")
- issueTitle: Specific disease, pest, or deficiency identified
- confidence: Estimated diagnosis accuracy percentage (e.g., "92%")
- severity: Level of disease severity (e.g., "Low", "Moderate", "High")
- symptoms: String array of key visual symptoms observed on leaves or plant parts
- recommendedActions: String array of immediate steps or treatments required
- preventativeMeasures: String array of long-term practices to stop future outbreaks
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: image.type || 'image/jpeg',
              data: base64Data,
            },
          },
          prompt,
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cropName: { type: Type.STRING },
              healthStatus: { type: Type.STRING },
              issueTitle: { type: Type.STRING },
              confidence: { type: Type.STRING },
              severity: { type: Type.STRING },
              symptoms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              preventativeMeasures: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'cropName',
              'healthStatus',
              'issueTitle',
              'confidence',
              'severity',
              'symptoms',
              'recommendedActions',
              'preventativeMeasures',
            ],
          },
        },
      });

      const reportText = response.text;
      if (!reportText) throw new Error('Empty response from AI vision engine.');

      const parsedData = JSON.parse(reportText);
      return NextResponse.json({ ...parsedData, isLive: true });
    } catch (apiError: any) {
      console.error('Gemini API Error, using mock fallback:', apiError.message);
      return NextResponse.json(mockReport);
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process request.' },
      { status: 500 }
    );
  }
}
