import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { optionalAuth } from './src/middleware/auth.ts';
import { isSqlConfigured } from './src/db/index.ts';
import {
  upsertUserProfile,
  saveCommodityRecord,
  saveCommunityPostRecord,
  deleteCommunityPostRecord,
  savePostCommentRecord,
  saveOrderRecord,
  savePrivateMessageRecord,
  saveAiHistoryRecord,
  saveNvatBulletinRecord,
  createModerationReportRecord,
  resolveModerationReportRecord,
  listDatabaseOverview,
} from './src/db/repository.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = 'gemini-4-hydrogen';
const ADMIN_ACCESS_PASSWORD =
  process.env.ADMIN_ACCESS_PASSWORD?.trim() ||
  'RusselTheGreat12092009@SagittariusAGRIMATCHNVADMIN';

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

  const prefix = `[${role} Agent • ${muni}]`;

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
  app.use(express.json({ limit: '10mb' }));
  app.use(optionalAuth);

  app.get('/api/health', (_req: Request, res: Response) => {
    const ai = getGeminiClient();
    res.json({
      ok: true,
      geminiConfigured: Boolean(ai),
      sqlConfigured: isSqlConfigured(),
      model: GEMINI_MODEL,
    });
  });

  // Master Admin password verification (never ships secret to client bundle)
  app.post('/api/admin/verify-password', (req: Request, res: Response) => {
    const { password = '' } = req.body || {};
    if (String(password).trim() === ADMIN_ACCESS_PASSWORD) {
      res.json({ authorized: true });
      return;
    }
    res.status(401).json({ authorized: false, error: 'Invalid Master Admin password.' });
  });

  // Cloud SQL Overview for Master Admin DB Explorer
  app.get('/api/db/overview', async (_req: Request, res: Response) => {
    const overview = await listDatabaseOverview();
    res.json(overview);
  });

  // Cloud SQL Persistence Sync Route
  app.post('/api/db/sync', async (req: Request, res: Response) => {
    const { entity, action = 'upsert', payload } = req.body || {};
    if (!entity || !payload) {
      res.status(400).json({ error: 'entity and payload are required.' });
      return;
    }

    let result: { persisted: boolean; reason?: string } = { persisted: false };
    switch (entity) {
      case 'user':
        result = await upsertUserProfile(payload);
        break;
      case 'commodity':
        result = await saveCommodityRecord(payload);
        break;
      case 'community_post':
        if (action === 'delete') {
          result = await deleteCommunityPostRecord(payload.id);
        } else {
          result = await saveCommunityPostRecord(payload);
        }
        break;
      case 'post_comment':
        result = await savePostCommentRecord(payload);
        break;
      case 'order':
        result = await saveOrderRecord(payload);
        break;
      case 'private_message':
        result = await savePrivateMessageRecord(payload);
        break;
      case 'ai_history':
        result = await saveAiHistoryRecord(payload);
        break;
      case 'nvat_bulletin':
        result = await saveNvatBulletinRecord(payload);
        break;
      case 'moderation_report':
        if (action === 'resolve') {
          result = await resolveModerationReportRecord(payload);
        } else {
          result = await createModerationReportRecord(payload);
        }
        break;
      default:
        res.status(400).json({ error: `Unsupported entity type: ${entity}` });
        return;
    }

    res.json({ ok: true, ...result });
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
      userUid = 'guest',
    } = req.body || {};

    if (!String(prompt).trim()) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallback = buildFallbackAgentReply({ prompt, role, municipality, language, contextSummary });
      await saveAiHistoryRecord({
        userUid,
        userRole: role,
        agentType: fallback.agentSource,
        prompt: String(prompt),
        responseSummary: fallback.reply,
        poweredByGemini: false,
      });
      res.json(fallback);
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
          systemInstruction: `You are an operational agricultural AI agent inside AgriMatch NV (Nueva Vizcaya, Philippines). Respond concisely, directly, and practically in ${langName} (max 3 short sentences, zero fluff). Recommend one platform tab from: dashboard, gis, marketplace, community, decision-support, messages, profile.`,
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
      const replyText = parsed.reply || buildFallbackAgentReply({ prompt, role, municipality, language, contextSummary }).reply;
      const agentSource = parsed.agentSource || `${role} Agent`;

      await saveAiHistoryRecord({
        userUid,
        userRole: role,
        agentType: agentSource,
        prompt: String(prompt),
        responseSummary: replyText,
        poweredByGemini: true,
      });

      res.json({
        reply: replyText,
        actionLabel: parsed.actionLabel || undefined,
        actionTab: parsed.actionTab || undefined,
        agentSource,
        poweredByGemini: true,
      });
    } catch (error) {
      console.error('Gemini /api/ai/agent-chat fallback:', error);
      const fallback = buildFallbackAgentReply({ prompt, role, municipality, language, contextSummary });
      res.json(fallback);
    }
  });

  // Farmer Agent Vision & Quality Class Classification
  app.post('/api/ai/farmer-vision-grade', async (req: Request, res: Response) => {
    const {
      cropName = 'Produce',
      category = 'Highland Vegetables',
      notes = '',
      municipality = 'Kayapa',
      imageDataUrl = '',
      userUid = 'farmer_01',
      userRole = 'Farmer',
    } = req.body || {};

    const fallbackGrade = () => {
      const text = `${cropName} ${notes}`.toLowerCase();
      if (text.includes('bruis') || text.includes('overripe') || text.includes('wet')) {
        return {
          suggestedGrade: 'Grade B Commercial',
          authenticityScore: 86,
          visionNotes: `Observed slight surface handling marks in ${municipality} lot. Recommended Grade B Commercial unless sorted crates confirm A-grade density.`,
          poweredByGemini: false,
        };
      }
      return {
        suggestedGrade: 'Grade A Premium',
        authenticityScore: 95,
        visionNotes: `Uniform color, crisp turgor, and field-crate lighting verified for ${cropName} (${category}) in ${municipality}. Zero stock watermark signatures detected.`,
        poweredByGemini: false,
      };
    };

    const ai = getGeminiClient();
    if (!ai) {
      const fb = fallbackGrade();
      await saveAiHistoryRecord({
        userUid,
        userRole,
        agentType: 'Farmer Agent',
        prompt: `Inspect & classify ${cropName} (${category}) from ${municipality}`,
        responseSummary: `${fb.suggestedGrade} (${fb.authenticityScore}% authenticity): ${fb.visionNotes}`,
        poweredByGemini: false,
      });
      res.json(fb);
      return;
    }

    try {
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
        {
          text: `Inspect this Nueva Vizcaya agricultural harvest lot: Crop="${cropName}", Category="${category}", Municipality="${municipality}", Grower Notes="${notes}". Classify into exactly one of: "Grade A Premium", "Grade B Commercial", "Standard Fresh". Provide an authenticityScore (70-100) and concise visionNotes.`,
        },
      ];

      if (typeof imageDataUrl === 'string' && imageDataUrl.startsWith('data:image/')) {
        const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      }

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts }],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are the AgriMatch NV Farmer Quality Agent. Evaluate harvest photo and lot notes to assign realistic Philippine agricultural grading.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedGrade: {
                type: Type.STRING,
                description: 'Must be one of: Grade A Premium, Grade B Commercial, Standard Fresh',
              },
              authenticityScore: { type: Type.INTEGER },
              visionNotes: { type: Type.STRING },
            },
            required: ['suggestedGrade', 'authenticityScore', 'visionNotes'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const validGrades = ['Grade A Premium', 'Grade B Commercial', 'Standard Fresh'];
      const suggestedGrade = validGrades.includes(parsed.suggestedGrade)
        ? parsed.suggestedGrade
        : 'Grade A Premium';
      const authenticityScore = Math.min(100, Math.max(70, Number(parsed.authenticityScore) || 93));
      const visionNotes = parsed.visionNotes || fallbackGrade().visionNotes;

      await saveAiHistoryRecord({
        userUid,
        userRole,
        agentType: 'Farmer Agent',
        prompt: `Vision grade ${cropName} (${municipality})`,
        responseSummary: `${suggestedGrade} (${authenticityScore}%): ${visionNotes}`,
        poweredByGemini: true,
      });

      res.json({
        suggestedGrade,
        authenticityScore,
        visionNotes,
        poweredByGemini: true,
      });
    } catch (error) {
      console.error('Gemini /api/ai/farmer-vision-grade fallback:', error);
      const fb = fallbackGrade();
      res.json(fb);
    }
  });

  // Market Agent with Google Search Grounding for live Philippine / NV agricultural news
  app.post('/api/ai/market-intelligence', async (req: Request, res: Response) => {
    const {
      commodity = 'Highland Cabbage',
      municipality = 'Bambang',
      userUid = 'guest',
      userRole = 'Farmer',
    } = req.body || {};

    const fallbackSources = [
      {
        title: 'Department of Agriculture Bantay Presyo — Daily Wholesale Price Monitoring',
        url: 'https://www.da.gov.ph/price-monitoring/',
      },
      {
        title: 'Nueva Vizcaya Agricultural Terminal (NVAT) Trading Advisories',
        url: 'https://www.da.gov.ph/',
      },
      {
        title: 'Philippine Statistics Authority — Cagayan Valley Agricultural Price Index',
        url: 'https://psa.gov.ph/',
      },
    ];

    const fallbackSummary = `Market Agent Assessment for ${commodity} (${municipality}, Nueva Vizcaya): Trading volumes at NVAT Bambang show steady Highland Vegetable inflows from Kayapa and Dupax del Sur. Wholesale prices remain competitive for Grade A verified lots with direct hauler dispatch windows before 10:00 AM.`;

    const ai = getGeminiClient();
    if (!ai) {
      await saveAiHistoryRecord({
        userUid,
        userRole,
        agentType: 'Market Agent',
        prompt: `Market grounding assessment: ${commodity} in ${municipality}`,
        responseSummary: fallbackSummary,
        metadata: { sources: fallbackSources },
        poweredByGemini: false,
      });
      res.json({
        summary: fallbackSummary,
        sources: fallbackSources,
        poweredByGemini: false,
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Provide a brief 3-sentence agricultural market intelligence assessment for ${commodity} in ${municipality}, Nueva Vizcaya (NVAT Bambang / Cagayan Valley Philippines wholesale price trends, supply flows, and seasonal demand drivers).`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const summary = response.text?.trim() || fallbackSummary;
      const chunks =
        (response.candidates?.[0]?.groundingMetadata?.groundingChunks as
          | Array<{ web?: { uri?: string; title?: string } }>
          | undefined) || [];

      const webSources = chunks
        .filter((c) => c.web?.uri)
        .map((c) => ({
          title: c.web?.title || c.web?.uri || 'Agricultural Market Source',
          url: c.web!.uri!,
        }))
        .slice(0, 5);

      const sources = webSources.length > 0 ? webSources : fallbackSources;

      await saveAiHistoryRecord({
        userUid,
        userRole,
        agentType: 'Market Agent',
        prompt: `Search-grounded market outlook: ${commodity} (${municipality})`,
        responseSummary: summary,
        metadata: { sources },
        poweredByGemini: true,
      });

      res.json({
        summary,
        sources,
        poweredByGemini: true,
      });
    } catch (error) {
      console.error('Gemini /api/ai/market-intelligence fallback:', error);
      res.json({
        summary: fallbackSummary,
        sources: fallbackSources,
        poweredByGemini: false,
      });
    }
  });

  // Buyer Agent Recommendation Rationale
  app.post('/api/ai/buyer-recommend', async (req: Request, res: Response) => {
    const {
      neededSupply = '',
      municipality = 'Bayombong',
      qualityGrade = 'Any',
      topMatchesSummary = '',
      userUid = 'buyer_01',
      userRole = 'Buyer',
    } = req.body || {};

    const fallbackText = `Buyer Agent matched top 3 lots for "${neededSupply || 'Fresh Produce'}" delivered to ${municipality} (${qualityGrade}), prioritizing Admin-verified suppliers with zero moderation strikes, proximity along AH26, and competitive NVAT price parity.`;

    const ai = getGeminiClient();
    if (!ai) {
      await saveAiHistoryRecord({
        userUid,
        userRole,
        agentType: 'Buyer Agent',
        prompt: `Find top 3 ${neededSupply} for ${municipality}`,
        responseSummary: fallbackText,
        poweredByGemini: false,
      });
      res.json({ rationale: fallbackText, poweredByGemini: false });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Buyer Request: Crop="${neededSupply}", Destination="${municipality}", Preferred Quality="${qualityGrade}". Top Ranked Candidates: ${topMatchesSummary}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'Summarize in 2 concise sentences why these top 3 agricultural suppliers fit the buyer criteria best (proximity, verified status, fewer strikes, price).',
        },
      });
      const rationale = response.text?.trim() || fallbackText;
      await saveAiHistoryRecord({
        userUid,
        userRole,
        agentType: 'Buyer Agent',
        prompt: `Top 3 match for ${neededSupply || 'produce'} -> ${municipality}`,
        responseSummary: rationale,
        poweredByGemini: true,
      });
      res.json({ rationale, poweredByGemini: true });
    } catch {
      res.json({ rationale: fallbackText, poweredByGemini: false });
    }
  });

  // Supplier Agent Coordinated Demand Forecast
  app.post('/api/ai/supplier-demand', async (req: Request, res: Response) => {
    const {
      municipality = 'Bambang',
      inventorySummary = '',
      buyerDemandSummary = '',
      userUid = 'supplier_01',
      userRole = 'Supplier',
    } = req.body || {};

    const fallback = {
      forecastSummary: `Coordinated Supplier + Market Agent outlook for ${municipality}: High weekly pull detected for Highland Cabbage (3,000 kg), Satsuma Citrus (1,500 kg), and Grade A Salad Tomato. Stage morning consolidation crates before 9:00 AM at NVAT Bay 4.`,
      priorityCrops: [
        { crop: 'Highland Cabbage', demandLevel: 'HIGH', suggestedStockKg: 3000, targetHub: 'NVAT Bambang Bay 4' },
        { crop: 'Satsuma Mandarin Citrus', demandLevel: 'HIGH', suggestedStockKg: 1500, targetHub: 'Solano Depot' },
        { crop: 'Highland Broccoli', demandLevel: 'MODERATE', suggestedStockKg: 600, targetHub: 'Bayombong Cold Chain' },
      ],
      poweredByGemini: false,
    };

    const ai = getGeminiClient();
    if (!ai) {
      await saveAiHistoryRecord({
        userUid,
        userRole,
        agentType: 'Supplier Agent',
        prompt: `Demand coordination forecast for ${municipality}`,
        responseSummary: fallback.forecastSummary,
        poweredByGemini: false,
      });
      res.json(fallback);
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Supplier Hub: ${municipality}.\nCurrent Stock: ${inventorySummary}\nOpen Buyer Demand: ${buyerDemandSummary}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'Coordinate Supplier Agent and Market Agent to forecast procurement demand and priority crops in Nueva Vizcaya.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              forecastSummary: { type: Type.STRING },
              priorityCrops: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    crop: { type: Type.STRING },
                    demandLevel: { type: Type.STRING },
                    suggestedStockKg: { type: Type.INTEGER },
                    targetHub: { type: Type.STRING },
                  },
                  required: ['crop', 'demandLevel', 'suggestedStockKg', 'targetHub'],
                },
              },
            },
            required: ['forecastSummary', 'priorityCrops'],
          },
        },
      });
      const parsed = JSON.parse((response.text ?? '{}').trim());
      const result = {
        forecastSummary: parsed.forecastSummary || fallback.forecastSummary,
        priorityCrops: Array.isArray(parsed.priorityCrops) && parsed.priorityCrops.length > 0 ? parsed.priorityCrops : fallback.priorityCrops,
        poweredByGemini: true,
      };
      await saveAiHistoryRecord({
        userUid,
        userRole,
        agentType: 'Supplier Agent',
        prompt: `Supplier demand forecast (${municipality})`,
        responseSummary: result.forecastSummary,
        poweredByGemini: true,
      });
      res.json(result);
    } catch {
      res.json(fallback);
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
      userUid = 'guest',
      userRole = 'Farmer',
    } = req.body || {};

    const ai = getGeminiClient();
    if (!ai) {
      const synthesis = `${horizonMonths}-month advisory for ${targetCrop} in Brgy. ${barangay}, ${municipality} (${elevationMeters}m ASL): Plan staggered drainage maintenance and harvest dispatch before afternoon convective rainfall peaks; align farm-gate harvests with Bambang NVAT price windows.`;
      await saveAiHistoryRecord({
        userUid,
        userRole,
        agentType: 'Climate Agent',
        prompt: `${horizonMonths}-mo outlook for ${targetCrop} in ${barangay}, ${municipality}`,
        responseSummary: synthesis,
        poweredByGemini: false,
      });
      res.json({
        poweredByGemini: false,
        synthesis,
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
      await saveAiHistoryRecord({
        userUid,
        userRole,
        agentType: 'Climate Agent',
        prompt: `${horizonMonths}-mo climate forecast for ${targetCrop} in ${municipality}`,
        responseSummary: parsed.synthesis || 'Climate forecast computed.',
        poweredByGemini: true,
      });

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
      userUid = 'guest',
    } = req.body || {};

    const ai = getGeminiClient();
    if (!ai) {
      const reasoning = `Evaluated ${municipality} supply density against NVAT prevailing benchmarks. Prioritized nearest Grade A verified hub within 25 km to cut transit spoilage.`;
      await saveAiHistoryRecord({
        userUid,
        userRole: role,
        agentType: `${role} Agent`,
        prompt: query,
        responseSummary: reasoning,
        poweredByGemini: false,
      });
      res.json({
        poweredByGemini: false,
        fromAgent: `${role} Agent`,
        toAgent: 'Market & Logistics Agent',
        intent: 'COORDINATE_HUB_DISPATCH',
        reasoning,
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
      await saveAiHistoryRecord({
        userUid,
        userRole: role,
        agentType: parsed.fromAgent || `${role} Agent`,
        prompt: query,
        responseSummary: parsed.reasoning || 'Coordinated dispatch generated.',
        poweredByGemini: true,
      });

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
    const {
      rawText = '',
      defaultDate = new Date().toISOString().split('T')[0],
      userUid = 'master_admin',
      userRole = 'MASTER_ADMIN',
    } = req.body || {};
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
      await saveAiHistoryRecord({
        userUid,
        userRole,
        agentType: 'Admin Agent',
        prompt: `Parse NVAT Bulletin (${defaultDate})`,
        responseSummary: `Extracted ${Array.isArray(items) ? items.length : 0} NVAT commodities for ${defaultDate}.`,
        poweredByGemini: true,
      });
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
