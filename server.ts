import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildFallbackAgentReply(params: {
  prompt: string;
  role?: string;
  municipality?: string;
  language?: string;
  contextSummary?: string;
}) {
  const lower = (params.prompt || '').toLowerCase();
  const muni = params.municipality || 'Bambang';
  const role = params.role || 'Farmer';
  const lang = params.language || 'en';

  const prefix =
    lang === 'tl'
      ? `[${role} Agent • ${muni}]`
      : lang === 'ilo'
      ? `[${role} Agent • ${muni}]`
      : `[${role} Agent • ${muni}]`;

  if (lower.includes('price') || lower.includes('nvat') || lower.includes('presyo') || lower.includes('sagud')) {
    return {
      reply: `${prefix} NVAT Bambang market benchmark shows Highland Cabbage at PHP 32/kg, Satsuki Tomato at PHP 55/kg (+31% trend), and Red Creole Onion stable at PHP 102/kg. Verified buyers within 25 km of ${muni} are actively matching morning dispatches.`,
      actionLabel: 'Open Market & Prices',
      actionTab: 'marketplace',
      agentSource: 'Market Agent',
      poweredByGemini: false,
    };
  }

  if (
    lower.includes('weather') ||
    lower.includes('climate') ||
    lower.includes('rain') ||
    lower.includes('ulan') ||
    lower.includes('panahon') ||
    lower.includes('pagasa')
  ) {
    return {
      reply: `${prefix} Climate horizon for ${muni}: expect warm lowland corridors (29–32 C) and highland convective showers across Kayapa/Santa Fe ridge. Check PAGASA Regional Telemetry and run the 1–2 Month Barangay Climate Agent for planting window alerts.`,
      actionLabel: 'Check PAGASA & Climate AI',
      actionTab: 'dashboard',
      agentSource: 'Climate Agent',
      poweredByGemini: false,
    };
  }

  if (lower.includes('map') || lower.includes('route') || lower.includes('gis') || lower.includes('nearest') || lower.includes('distance')) {
    return {
      reply: `${prefix} Spatial GIS links ${muni} directly to the Bambang NVAT exchange and municipal buyer corridors. Select any municipality boundary or hub marker on the GIS Map to compute live highway travel distance and ETA.`,
      actionLabel: 'Open GIS Route Map',
      actionTab: 'gis',
      agentSource: 'GIS Spatial Agent',
      poweredByGemini: false,
    };
  }

  if (
    lower.includes('dispatch') ||
    lower.includes('harvest') ||
    lower.includes('cabbage') ||
    lower.includes('tomato') ||
    lower.includes('onion') ||
    lower.includes('citrus') ||
    lower.includes('buyer') ||
    lower.includes('match') ||
    lower.includes('supply')
  ) {
    return {
      reply: `${prefix} Optimal dispatch window for ${muni}: schedule cutting between 5:30 AM and 8:30 AM to beat midday thermal stress and arrive at NVAT Bambang ahead of 10:00 AM wholesale bidding. Current verified buyer demand shows strong pull for Grade A highland vegetables and citrus.`,
      actionLabel: 'Open Multi-Agent Hub',
      actionTab: 'decision-support',
      agentSource: `${role} Agent`,
      poweredByGemini: false,
    };
  }

  return {
    reply: `${prefix} Multi-agent coordination active for ${muni}. ${params.contextSummary || 'Verified listings, PAGASA weather horizons, and direct stakeholder matching are ready.'} Ask about NVAT crop prices, 1–2 month barangay weather, or buyer/supplier matching.`,
    actionLabel: 'Open AI Coordination Hub',
    actionTab: 'decision-support',
    agentSource: `${role} Agent`,
    poweredByGemini: false,
  };
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const ai = getGeminiClient();
    res.json({ ok: true, geminiConfigured: Boolean(ai), model: GEMINI_MODEL });
  });

  app.post('/api/ai/agent-chat', async (req: Request, res: Response) => {
    const {
      prompt = '',
      role = 'Farmer',
      municipality = 'Bambang',
      barangay = 'Aliaga',
      language = 'en',
      history = [],
      contextSummary = '',
    } = req.body || {};

    if (!String(prompt).trim()) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json(buildFallbackAgentReply({ prompt, role, municipality, language, contextSummary }));
      return;
    }

    const langName =
      language === 'tl' ? 'Tagalog/Filipino' : language === 'ilo' ? 'Ilocano' : language === 'gad' ? 'Gaddang / English mix' : 'English';

    const historyText = Array.isArray(history)
      ? history
          .slice(-6)
          .map((m: { sender?: string; text?: string }) => `${m.sender || 'user'}: ${m.text || ''}`)
          .join('\n')
      : '';

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Active Stakeholder Role: ${role}\nLocation: Barangay ${barangay}, ${municipality}, Nueva Vizcaya\nLive Platform Context: ${contextSummary}\nRecent Turns:\n${historyText}\n\nUser Question: ${prompt}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            `You are an operational agricultural AI agent inside AgriMatch NV (Nueva Vizcaya, Philippines). Respond concisely, directly, and practically in ${langName} (max 3 short sentences, zero fluff). Recommend one platform tab from: dashboard, gis, marketplace, community, decision-support, messages, profile.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: 'Concise practical answer for the stakeholder.' },
              actionLabel: { type: Type.STRING, description: 'Short button label like Open Marketplace.' },
              actionTab: { type: Type.STRING, description: 'One of: dashboard, gis, marketplace, community, decision-support, messages, profile' },
              agentSource: { type: Type.STRING, description: 'e.g. Market Agent, Climate Agent, Logistics Agent' },
            },
            required: ['reply', 'actionTab', 'agentSource'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        reply: parsed.reply || buildFallbackAgentReply({ prompt, role, municipality, language, contextSummary }).reply,
        actionLabel: parsed.actionLabel || undefined,
        actionTab: parsed.actionTab || undefined,
        agentSource: parsed.agentSource || `${role} Agent`,
        poweredByGemini: true,
      });
    } catch (error) {
      console.error('Gemini /api/ai/agent-chat fallback:', error);
      res.json(buildFallbackAgentReply({ prompt, role, municipality, language, contextSummary }));
    }
  });

  app.post('/api/ai/climate-forecast', async (req: Request, res: Response) => {
    const {
      municipality = 'Bambang',
      barangay = 'Aliaga',
      elevationMeters = 320,
      targetCrop = 'Highland Cabbage',
      horizonMonths = 1,
      baselineOutlook = {},
    } = req.body || {};

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        poweredByGemini: false,
        synthesis: `${horizonMonths}-month advisory for ${targetCrop} in Brgy. ${barangay}, ${municipality} (${elevationMeters}m ASL): Plan staggered drainage maintenance and harvest dispatch before afternoon convective rainfall peaks; align farm-gate harvests with Bambang NVAT price windows.`,
        keyActions: [
          'Inspect hillside furrows and mulching ahead of convective shower windows.',
          `Coordinate ${targetCrop} transport buffers along Maharlika/Nueva Vizcaya feeder roads.`,
          'Monitor PAGASA Cagayan Valley daily rainfall bulletins prior to chemical/foliar sprays.',
        ],
        agronomicRiskRating: elevationMeters > 900 ? 'Moderate-High Ridge Moisture' : 'Manageable Valley Regime',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Target Area: Brgy. ${barangay}, ${municipality}, Nueva Vizcaya (${elevationMeters}m elevation).\nCrop: ${targetCrop}.\nHorizon: ${horizonMonths} month(s) ahead.\nBaseline Telemetry & Seasonal Model: ${JSON.stringify(baselineOutlook)}.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are the Nueva Vizcaya Agricultural Climate Agent grounded on PAGASA Cagayan Valley climatology. Give concise, practical agronomic guidance (no filler).',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              synthesis: { type: Type.STRING, description: 'Two-sentence agronomic & climate synthesis for the barangay.' },
              keyActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 concise actionable field/logistics steps.',
              },
              agronomicRiskRating: { type: Type.STRING, description: 'Short 2-4 word risk label.' },
            },
            required: ['synthesis', 'keyActions', 'agronomicRiskRating'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        poweredByGemini: true,
        synthesis: parsed.synthesis,
        keyActions: Array.isArray(parsed.keyActions) ? parsed.keyActions.slice(0, 3) : [],
        agronomicRiskRating: parsed.agronomicRiskRating || 'Normal Seasonal Regime',
      });
    } catch (error) {
      console.error('Gemini /api/ai/climate-forecast fallback:', error);
      res.json({
        poweredByGemini: false,
        synthesis: `${horizonMonths}-month outlook for ${targetCrop} in Brgy. ${barangay}, ${municipality}: Track PAGASA rainfall advisories, schedule harvest pickup slots early morning, and protect slope drainage.`,
        keyActions: [
          'Schedule morning harvest cutting during dry thermal windows.',
          'Reinforce ridge drainage ditches before monsoon transition.',
          'Reserve buyer logistics 48 hours prior to peak cutting.',
        ],
        agronomicRiskRating: 'Moderate Seasonal Watch',
      });
    }
  });

  app.post('/api/ai/multi-agent-coordinate', async (req: Request, res: Response) => {
    const {
      role = 'Farmer',
      municipality = 'Bambang',
      query = 'Optimize next dispatch and supplier allocation',
      marketSnapshot = '',
    } = req.body || {};

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        poweredByGemini: false,
        fromAgent: `${role} Agent`,
        toAgent: 'Market & Logistics Agent',
        intent: 'COORDINATE_HUB_DISPATCH',
        reasoning: `Evaluated ${municipality} supply density against NVAT prevailing benchmarks. Prioritized nearest Grade A verified hub within 25 km to cut transit spoilage.`,
        payload: {
          municipality,
          priorityDispatch: 'NVAT Bambang Terminal',
          recommendedPriceFloorPhp: 32,
          confidenceScore: 94,
        },
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Role: ${role}, Municipality: ${municipality}, Directive: ${query}\nMarket Data: ${marketSnapshot}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'Coordinate multi-agent agricultural logistics in Nueva Vizcaya. Return concise inter-agent packet JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fromAgent: { type: Type.STRING },
              toAgent: { type: Type.STRING },
              intent: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              priorityHub: { type: Type.STRING },
              confidenceScore: { type: Type.INTEGER },
            },
            required: ['fromAgent', 'toAgent', 'intent', 'reasoning', 'priorityHub', 'confidenceScore'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        poweredByGemini: true,
        fromAgent: parsed.fromAgent || `${role} Agent`,
        toAgent: parsed.toAgent || 'Market & Logistics Agent',
        intent: parsed.intent || 'AI_COORDINATED_DISPATCH',
        reasoning: parsed.reasoning,
        payload: {
          municipality,
          priorityHub: parsed.priorityHub || 'NVAT Bambang Terminal',
          confidenceScore: parsed.confidenceScore || 95,
        },
      });
    } catch (error) {
      console.error('Gemini /api/ai/multi-agent-coordinate fallback:', error);
      res.json({
        poweredByGemini: false,
        fromAgent: `${role} Agent`,
        toAgent: 'Market & Logistics Agent',
        intent: 'FALLBACK_COORDINATION_PACKET',
        reasoning: `Synchronized ${municipality} supply metrics with NVAT price floor and highway pass clearance.`,
        payload: {
          municipality,
          priorityHub: 'NVAT Bambang Terminal',
          confidenceScore: 91,
        },
      });
    }
  });

  app.post('/api/ai/nvat-parse', async (req: Request, res: Response) => {
    const { rawText = '', defaultDate = new Date().toISOString().split('T')[0] } = req.body || {};
    if (!String(rawText).trim()) {
      res.status(400).json({ error: 'rawText is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({ poweredByGemini: false, items: null });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Extract structured Nueva Vizcaya Agricultural Terminal (NVAT) commodity prices from this bulletin text for date ${defaultDate}:\n\n${rawText}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'Extract exact commodity prices without inventing missing items. Categorize each as one of: Highland Vegetables, Lowland Vegetables, Citrus & Fruits, Spices & Herbs, Grains & Cereals, Root Crops.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                commodityName: { type: Type.STRING },
                category: { type: Type.STRING },
                minPricePhp: { type: Type.NUMBER },
                maxPricePhp: { type: Type.NUMBER },
                prevailingPricePhp: { type: Type.NUMBER },
                previousPricePhp: { type: Type.NUMBER },
                estimatedVolumeTradedTons: { type: Type.NUMBER },
              },
              required: ['commodityName', 'category', 'minPricePhp', 'maxPricePhp', 'prevailingPricePhp'],
            },
          },
        },
      });

      const items = JSON.parse((response.text ?? '[]').trim());
      res.json({ poweredByGemini: true, items: Array.isArray(items) && items.length > 0 ? items : null });
    } catch (error) {
      console.error('Gemini /api/ai/nvat-parse fallback:', error);
      res.json({ poweredByGemini: false, items: null });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgriMatch NV server listening on http://localhost:${PORT}`);
  });
}

createApp();
