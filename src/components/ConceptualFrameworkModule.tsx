import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Database,
  Cpu,
  TrendingUp,
  Activity,
  Bot,
  Compass,
  ArrowRight,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart3,
  Award,
  Globe2,
  Radio,
  FileSpreadsheet,
  Users,
} from 'lucide-react';

export const ConceptualFrameworkModule: React.FC = () => {
  const { environmentMode, counters, agentPackets } = useApp();
  const [activeLayer, setActiveLayer] = useState<string>('multi-agent');
  const [isSimulatingFlow, setIsSimulatingFlow] = useState<boolean>(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<'A' | 'B' | 'C' | 'D'>('C');

  const handleSimulateDataFlow = () => {
    setIsSimulatingFlow(true);
    setTimeout(() => {
      setIsSimulatingFlow(false);
    }, 2200);
  };

  return (
    <div className="space-y-6 pb-16 text-left animate-fade-in">
      {/* Header Banner */}
      <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] text-xs font-black uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            System Architecture & Academic Research Blueprint
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F4B2C] tracking-tight">
            Conceptual Framework (IPO & Feedback Loop)
          </h2>
          <p className="text-xs text-neutral-600 font-medium max-w-2xl mt-1">
            End-to-end Input-Process-Output-Feedback model for Adaptive Geospatial & Resilient Multi-Agent Intelligence across Nueva Vizcaya crop hubs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateDataFlow}
            disabled={isSimulatingFlow}
            className="px-5 py-2.5 rounded-full btn-forest text-xs font-black flex items-center gap-2 shadow-sm hover:scale-105 transition-transform"
          >
            <Zap className={`w-4 h-4 text-[#C3E956] ${isSimulatingFlow ? 'animate-bounce' : ''}`} />
            <span>{isSimulatingFlow ? 'Streaming Data Flow...' : 'Simulate Live IPO Stream'}</span>
          </button>
        </div>
      </div>

      {/* Main IPO Diagram Grid */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border-2 border-neutral-300 shadow-xl overflow-x-auto space-y-6">
        <div className="min-w-[960px] space-y-6">
          {/* Framework Title Block */}
          <div className="text-center py-2 px-6 rounded-2xl bg-[#1F4B2C] text-white">
            <h3 className="text-xl font-black tracking-widest uppercase">CONCEPTUAL FRAMEWORK</h3>
            <p className="text-[11px] text-[#91EAAF] font-medium">
              Adaptive Geospatial and Resilient Intelligence for Multi-Agent Tracking in Crop Hubs Across Nueva Vizcaya (AGRIMATCH NV)
            </p>
          </div>

          {/* 3 Main Columns: INPUTS | PROCESSES | OUTPUTS */}
          <div className="grid grid-cols-12 gap-4">
            {/* COLUMN 1: INPUTS (3 cols) */}
            <div className="col-span-3 flex flex-col justify-between p-4 rounded-2xl border-2 border-neutral-800 bg-neutral-50/70 space-y-4">
              <div className="text-center pb-2 border-b-2 border-neutral-800">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#1F4B2C]">INPUTS</h4>
              </div>

              {/* Block 1: Geo-Spatial Data */}
              <div className="p-3 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-1.5 text-xs">
                <p className="font-black text-[#1F4B2C] border-b border-neutral-200 pb-1">
                  1. GEO-SPATIAL DATA
                </p>
                <ul className="space-y-1 text-[11px] text-neutral-700">
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">1</span>
                    <span>Farmer locations (GPS)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">2</span>
                    <span>Cooperatives & Agristores</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">3</span>
                    <span>Agricultural Suppliers</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">4</span>
                    <span>Trading centers / NVAT terminal</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">5</span>
                    <span>15 Municipal boundaries</span>
                  </li>
                </ul>
              </div>

              {/* Block 2: Agricultural Production Data */}
              <div className="p-3 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-1.5 text-xs">
                <p className="font-black text-[#1F4B2C] border-b border-neutral-200 pb-1">
                  2. AGRICULTURAL PRODUCTION DATA
                </p>
                <ul className="space-y-1 text-[11px] text-neutral-700">
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">1</span>
                    <span>Inventory & stock levels (kg)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">2</span>
                    <span>Crop varieties & categories</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">3</span>
                    <span>Farm profiles & terroir</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">4</span>
                    <span>Expected harvest schedules</span>
                  </li>
                </ul>
              </div>

              {/* Block 3: Market Information */}
              <div className="p-3 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-1.5 text-xs">
                <p className="font-black text-[#1F4B2C] border-b border-neutral-200 pb-1">
                  3. MARKET INFORMATION
                </p>
                <ul className="space-y-1 text-[11px] text-neutral-700">
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">1</span>
                    <span>Buyer inquiries & bid requests</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">2</span>
                    <span>Transaction records & escrow</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-800 text-[10px] font-bold flex items-center justify-center">3</span>
                    <span>Supplier verification profiles</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* COLUMN 2: PROCESSES / CORE INTELLIGENCE SYSTEM (6 cols) */}
            <div className="col-span-6 flex flex-col justify-between p-4 rounded-2xl border-2 border-neutral-800 bg-white space-y-3">
              <div className="text-center pb-2 border-b-2 border-neutral-800">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#1F4B2C]">
                  PROCESSES / CORE INTELLIGENCE SYSTEM
                </h4>
              </div>

              {/* Layer A: Data Integration & Management Layer */}
              <div className="p-3 rounded-xl bg-[#F4FFFC] border border-[#91EAAF] text-xs space-y-2">
                <p className="font-bold text-[#1F4B2C] text-center">
                  A. DATA INTEGRATION & MANAGEMENT LAYER
                </p>
                <div className="grid grid-cols-5 gap-1 text-[10px] font-bold text-center">
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">1. Data Collection</div>
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">2. Data Cleaning</div>
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">3. Integration</div>
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">4. Data Storage</div>
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">5. Data Security</div>
                </div>
              </div>

              {/* Layer B: Intelligence & Analytics Layer */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-300 text-xs space-y-2">
                <p className="font-bold text-[#1F4B2C] text-center">
                  B. INTELLIGENCE & ANALYTICS LAYER
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-white rounded-lg border border-neutral-200 space-y-1">
                    <p className="font-black text-[#1F4B2C] text-[11px]">1. GIS ENGINE</p>
                    <ul className="text-[10px] text-neutral-600 space-y-0.5">
                      <li>• Spatial mapping</li>
                      <li>• Accessibility analysis</li>
                      <li>• Network analysis</li>
                      <li>• Community mapping</li>
                    </ul>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-neutral-200 space-y-1">
                    <p className="font-black text-[#1F4B2C] text-[11px]">2. PREDICTIVE ENGINE</p>
                    <ul className="text-[10px] text-neutral-600 space-y-0.5">
                      <li>• Crop production forecast</li>
                      <li>• Demand forecasting</li>
                      <li>• Harvest prediction</li>
                      <li>• PAGASA climate agent</li>
                    </ul>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-neutral-200 space-y-1">
                    <p className="font-black text-[#1F4B2C] text-[11px]">3. OPTIMIZATION</p>
                    <ul className="text-[10px] text-neutral-600 space-y-0.5">
                      <li>• Supplier recommendation</li>
                      <li>• Delivery scheduling</li>
                      <li>• Resource allocation</li>
                      <li>• Haversine route scoring</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Layer C: Multi-Agent AI Framework */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#1F4B2C] to-[#2E6B3E] text-white space-y-2 shadow-sm">
                <p className="font-bold text-center text-xs tracking-wide text-[#C3E956]">
                  C. MULTI-AGENT ARTIFICIAL INTELLIGENCE FRAMEWORK
                </p>
                <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                  <div className="flex-1 p-2 rounded-lg bg-white/10 text-center border border-white/20">
                    Farmer Agent
                  </div>
                  <span className="text-[#C3E956]">⇄</span>
                  <div className="flex-1 p-2 rounded-lg bg-white/10 text-center border border-white/20">
                    Buyer Agent
                  </div>
                  <span className="text-[#C3E956]">⇄</span>
                  <div className="flex-1 p-2 rounded-lg bg-white/10 text-center border border-white/20">
                    Supplier Agent
                  </div>
                  <span className="text-[#C3E956]">⇄</span>
                  <div className="flex-1 p-2 rounded-lg bg-white/10 text-center border border-white/20">
                    Admin Agent
                  </div>
                </div>
                <p className="text-[10px] text-center text-[#91EAAF] italic">
                  Agent Communication & Knowledge Sharing (Information Exchange Protocol)
                </p>
              </div>

              {/* Layer D: Decision Support & Recommendation Layer */}
              <div className="p-3 rounded-xl bg-[#F4FFFC] border border-[#91EAAF] text-xs space-y-2">
                <p className="font-bold text-[#1F4B2C] text-center">
                  D. DECISION SUPPORT & RECOMMENDATION LAYER
                </p>
                <div className="grid grid-cols-5 gap-1 text-[10px] font-bold text-center">
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">1. Smart Recs</div>
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">2. Climate Adaptive</div>
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">3. Market Matching</div>
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">4. Alerts / Notifs</div>
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">5. GIS Dashboards</div>
                </div>
              </div>

              {/* Layer E: Digital Platform Layer */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-300 text-xs space-y-2">
                <p className="font-bold text-[#1F4B2C] text-center">
                  E. DIGITAL PLATFORM LAYER (PROTOTYPE / WEB-BASED)
                </p>
                <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold text-center">
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">1. Web Portal</div>
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">2. Transactions & Orders</div>
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">3. Messaging & Collab</div>
                  <div className="p-1.5 bg-white rounded-lg border border-neutral-200">4. Reports & Analytics</div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: OUTPUTS / OUTCOMES (3 cols) */}
            <div className="col-span-3 flex flex-col justify-between p-4 rounded-2xl border-2 border-neutral-800 bg-neutral-50/70 space-y-4">
              <div className="text-center pb-2 border-b-2 border-neutral-800">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#1F4B2C]">
                  OUTPUTS / OUTCOMES
                </h4>
              </div>

              {/* 1. Intelligent Agricultural Decisions */}
              <div className="p-3 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-1.5 text-xs">
                <p className="font-black text-[#1F4B2C] border-b border-neutral-200 pb-1">
                  1. INTELLIGENT DECISIONS
                </p>
                <ul className="space-y-1 text-[11px] text-neutral-700">
                  <li>1. Supplier Recommendations</li>
                  <li>2. Buyer Matching</li>
                  <li>3. Demand Forecasts</li>
                  <li>4. Delivery Scheduling</li>
                  <li>5. Market Intelligence</li>
                </ul>
              </div>

              {/* 2. Agricultural Services Delivered */}
              <div className="p-3 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-1.5 text-xs">
                <p className="font-black text-[#1F4B2C] border-b border-neutral-200 pb-1">
                  2. SERVICES DELIVERED
                </p>
                <ul className="space-y-1 text-[11px] text-neutral-700">
                  <li>1. Digital Transactions & Orders</li>
                  <li>2. Communication & Collaboration</li>
                  <li>3. GIS Visualization & Dashboards</li>
                  <li>4. Monitoring & Analytics</li>
                  <li>5. Alerts & Notifications</li>
                </ul>
              </div>

              {/* 3. System Impact */}
              <div className="p-3 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-1.5 text-xs">
                <p className="font-black text-[#1F4B2C] border-b border-neutral-200 pb-1">
                  3. SYSTEM IMPACT
                </p>
                <ul className="space-y-1 text-[11px] text-neutral-700">
                  <li>1. Improved Market Accessibility</li>
                  <li>2. Increased Transaction Efficiency</li>
                  <li>3. Enhanced Agricultural Resilience</li>
                  <li>4. Local Food Availability</li>
                </ul>
              </div>

              {/* 4. Stakeholder Benefits */}
              <div className="p-3 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-1.5 text-xs">
                <p className="font-black text-[#1F4B2C] border-b border-neutral-200 pb-1">
                  4. STAKEHOLDER BENEFITS
                </p>
                <ul className="space-y-1 text-[11px] text-neutral-700">
                  <li>1. Potential for Improved Farmer Income</li>
                  <li>2. Better Communication Among Stakeholders</li>
                </ul>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: FEEDBACK LOOP */}
          <div className="p-4 rounded-2xl border-2 border-neutral-800 bg-white space-y-3">
            <div className="text-center pb-2 border-b-2 border-neutral-800">
              <h4 className="text-sm font-black uppercase tracking-wider text-[#1F4B2C]">
                FEEDBACK LOOP
              </h4>
              <p className="text-[11px] text-neutral-600 font-medium">
                Continuous Improvement through User Feedback and Real-Time Data
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              {/* Box A */}
              <div
                onClick={() => setSelectedEvaluation('A')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedEvaluation === 'A'
                    ? 'border-[#1F4B2C] bg-[#F4FFFC] shadow-sm'
                    : 'border-neutral-200 bg-white hover:border-neutral-400'
                }`}
              >
                <p className="font-bold text-[#1F4B2C] text-[11px] border-b border-neutral-200 pb-1">
                  A. AI AGENT EVALUATION
                </p>
                <ul className="text-[10px] text-neutral-700 space-y-1 mt-1.5">
                  <li>1. Response Relevance & Accuracy</li>
                  <li>2. Task Completion / Intent Rate</li>
                  <li>3. Qualitative Prompt Quality</li>
                  <li>4. Human in-the-Loop Rating</li>
                </ul>
              </div>

              {/* Box B */}
              <div
                onClick={() => setSelectedEvaluation('B')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedEvaluation === 'B'
                    ? 'border-[#1F4B2C] bg-[#F4FFFC] shadow-sm'
                    : 'border-neutral-200 bg-white hover:border-neutral-400'
                }`}
              >
                <p className="font-bold text-[#1F4B2C] text-[11px] border-b border-neutral-200 pb-1">
                  B. SYSTEM EFFECTIVENESS
                </p>
                <ul className="text-[10px] text-neutral-700 space-y-1 mt-1.5">
                  <li>1. Market Accessibility</li>
                  <li>2. Supplier Efficiency</li>
                  <li>3. Transaction Efficiency</li>
                  <li>4. Price Transparency</li>
                  <li>5. Decision-Making Support</li>
                </ul>
              </div>

              {/* Box C */}
              <div
                onClick={() => setSelectedEvaluation('C')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedEvaluation === 'C'
                    ? 'border-[#1F4B2C] bg-[#F4FFFC] shadow-sm'
                    : 'border-neutral-200 bg-white hover:border-neutral-400'
                }`}
              >
                <p className="font-bold text-[#1F4B2C] text-[11px] border-b border-neutral-200 pb-1">
                  C. ISO/IEC 25010 QUALITY
                </p>
                <div className="grid grid-cols-2 gap-x-2 text-[10px] text-neutral-700 mt-1.5">
                  <span>1. Functional</span>
                  <span>5. Reliability</span>
                  <span>2. Performance</span>
                  <span>6. Security</span>
                  <span>3. Compatibility</span>
                  <span>7. Maintainability</span>
                  <span>4. Usability</span>
                  <span>8. Portability</span>
                </div>
              </div>

              {/* Box D */}
              <div
                onClick={() => setSelectedEvaluation('D')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedEvaluation === 'D'
                    ? 'border-[#1F4B2C] bg-[#F4FFFC] shadow-sm'
                    : 'border-neutral-200 bg-white hover:border-neutral-400'
                }`}
              >
                <p className="font-bold text-[#1F4B2C] text-[11px] border-b border-neutral-200 pb-1">
                  D. RESULTS & INSIGHTS
                </p>
                <ul className="text-[10px] text-neutral-700 space-y-1 mt-1.5">
                  <li>1. System Improvement</li>
                  <li>2. Model Refinement</li>
                  <li>3. Operational Knowledge</li>
                  <li>4. Better Decision Support</li>
                </ul>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-100 text-center text-[10px] font-bold text-neutral-600">
              Continuous Feedback improves Data Quality Algorithms, Agents, Behaviors and Overall System Performance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
