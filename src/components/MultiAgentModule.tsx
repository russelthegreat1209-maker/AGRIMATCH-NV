import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateSupplierRecommendationScore, haversineDistanceKm, formatDistance } from '../utils/agriMath';
import {
  Cpu,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  Zap,
  Layers,
  ArrowLeftRight,
  Radio,
  FileText,
} from 'lucide-react';

export const MultiAgentModule: React.FC = () => {
  const {
    currentUser,
    commodities,
    accounts,
    agentPackets,
    triggerAgentPacket,
    setActiveOrderModalItem,
    addNotification,
  } = useApp();

  // Sub-tabs: 'decision-support' | 'coordination-hub' | 'role-agent'
  const [activeSubTab, setActiveSubTab] = useState<'decision-support' | 'coordination-hub' | 'role-agent'>('decision-support');

  // Decision support 5 modules sub-tab
  const [dsModule, setDsModule] = useState<'recommendations' | 'matching' | 'inventory' | 'scheduling' | 'policy'>('recommendations');

  // Intelligent recommendations search
  const [selectedCropQuery, setSelectedCropQuery] = useState('Highland Cabbage');
  const [targetVolumeKg, setTargetVolumeKg] = useState(500);

  // Compute composite weighted supplier ranking scores
  const scoredSuppliers = commodities
    .filter((c) => c.name.toLowerCase().includes(selectedCropQuery.toLowerCase()) || selectedCropQuery === 'ALL')
    .map((crop) => {
      const userLat = currentUser?.lat || 16.3861;
      const userLng = currentUser?.lng || 121.1065;
      const dist = haversineDistanceKm(userLat, userLng, crop.lat, crop.lng);

      const score = calculateSupplierRecommendationScore({
        itemPrice: crop.pricePerKg,
        benchmarkPrice: 35, // average benchmark
        distanceKm: dist,
        maxDistanceThresholdKm: 80,
        isVerified: crop.verificationStatus === 'VERIFIED',
        aiAuthenticityScore: crop.aiAuthenticityScore,
        availableKg: crop.availableKg,
        targetKg: targetVolumeKg,
      });

      return {
        crop,
        dist,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Simulated Buyer Requests for 2-Way Matching Board
  const openBuyerRequests = [
    {
      id: 'req-1',
      buyerName: 'Metro Balintawak Bulk Buyers Corp.',
      commodity: 'Highland Cabbage',
      targetKg: 3000,
      maxPrice: 35,
      location: 'Bambang / Bayombong Pickup',
    },
    {
      id: 'req-2',
      buyerName: 'Isabela-Vizcaya Supermarket Chain',
      commodity: 'Satsuma Mandarin Citrus',
      targetKg: 1500,
      maxPrice: 75,
      location: 'Solano Depot Delivery',
    },
    {
      id: 'req-3',
      buyerName: 'Solano Farm-to-Table Restaurant Group',
      commodity: 'Broccoli',
      targetKg: 400,
      maxPrice: 85,
      location: 'Solano Central Branch',
    },
  ];

  const handleSimulateAgentPing = () => {
    triggerAgentPacket({
      fromAgent: 'Farmer Agent',
      toAgent: 'Market Agent',
      intent: 'LIVE_HARVEST_DISPATCH_PING',
      payload: {
        timestamp: new Date().toISOString(),
        farmerId: currentUser?.id || 'farmer_01',
        commodity: 'Highland Cabbage',
        volumeKg: 1000,
        municipality: currentUser?.municipality || 'Kayapa',
      },
    });
    addNotification('Multi-Agent JSON message broadcasted across coordination mesh!', 'success');
  };

  return (
    <div className="space-y-6 pb-16 text-left animate-fade-in">
      {/* Top Banner */}
      <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5 text-[#C3E956]" />
            5-Domain Interconnected Multi-Agent System
          </div>
          <h2 className="text-2xl font-black text-[#1F4B2C] tracking-tight">
            Multi-Agent AI Framework & Decision Support Layer
          </h2>
          <p className="text-xs text-neutral-600 font-medium">
            Autonomous coordination between Farmer, Buyer, Supplier, Market, and Admin AI Agents
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex bg-neutral-100 p-1 rounded-full border border-neutral-200 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('decision-support')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeSubTab === 'decision-support'
                ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Decision Support (5 Modules)
          </button>
          <button
            onClick={() => setActiveSubTab('coordination-hub')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeSubTab === 'coordination-hub'
                ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Knowledge Sharing Hub (Live JSON)
          </button>
          <button
            onClick={() => setActiveSubTab('role-agent')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeSubTab === 'role-agent'
                ? 'bg-[#1F4B2C] text-[#F4FFFC] shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            My Role AI Console
          </button>
        </div>
      </div>

      {/* Mandatory Governance Notice from Module 9 */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="font-medium leading-relaxed">
          <span className="font-bold">Decision-Support Governance:</span> The Multi-Agent Framework operates as an intelligent software coordination mechanism. All recommendations and outputs are generated from available platform data and system rules and remain subject to stakeholder validation.
        </p>
      </div>

      {/* SUB-TAB 1: AGRICULTURAL SUPPLY CHAIN DECISION SUPPORT LAYER (5 ACTIONABLE MODULES) */}
      {activeSubTab === 'decision-support' && (
        <div className="space-y-4">
          {/* Module Selector Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'recommendations', label: '(a) Intelligent Supplier Recommendations' },
              { id: 'matching', label: '(b) Buyer-Supplier Matching Engine' },
              { id: 'inventory', label: '(c) Agricultural Inventory & Heatmap' },
              { id: 'scheduling', label: '(d) Delivery & Hauling Coordination' },
              { id: 'policy', label: '(e) Policy & Market Intelligence Brief' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setDsModule(m.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                  dsModule === m.id
                    ? 'btn-sprout shadow-xs ring-1 ring-[#1F4B2C]'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Module (a): Intelligent Supplier Recommendations */}
          {dsModule === 'recommendations' && (
            <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                <div>
                  <h3 className="text-base font-black text-[#1F4B2C]">
                    Intelligent Supplier Recommendations (Composite Weighted Score)
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    Weighted scoring: Price (35%) • Distance (30%) • Crop Quality (20%) • Availability (15%)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCropQuery}
                    onChange={(e) => setSelectedCropQuery(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-[#1F4B2C]"
                  >
                    <option value="Highland Cabbage">Highland Cabbage</option>
                    <option value="Red Creole Onion">Red Creole Onion</option>
                    <option value="Citrus">Satsuma Citrus</option>
                    <option value="Tomato">Satsuki Tomato</option>
                    <option value="ALL">All Commodities</option>
                  </select>
                </div>
              </div>

              {/* Scored List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scoredSuppliers.slice(0, 6).map(({ crop, dist, score }) => (
                  <div
                    key={crop.id}
                    className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-black uppercase">
                          {crop.category}
                        </span>
                        {/* Composite Match Score Badge */}
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{score}% Match</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-black text-[#1F4B2C] mt-2 leading-snug">
                        {crop.name}
                      </h4>
                      <p className="text-xs text-neutral-600 font-medium">
                        By {crop.supplierName} • {crop.municipality} ({formatDistance(dist)} away)
                      </p>

                      <div className="mt-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Price:</span>
                          <span className="font-black text-[#1F4B2C]">₱{crop.pricePerKg}/kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Available:</span>
                          <span className="font-bold text-neutral-700">{crop.availableKg.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Authenticity:</span>
                          <span className="font-bold text-emerald-700">{crop.aiAuthenticityScore}% Farm Capture</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveOrderModalItem(crop)}
                      className="w-full py-2 rounded-xl btn-sprout text-xs font-black shadow-xs"
                    >
                      Initiate Order with Ranked Supplier
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module (b): Buyer-Supplier Matching Engine */}
          {dsModule === 'matching' && (
            <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
              <div className="pb-3 border-b border-neutral-200">
                <h3 className="text-base font-black text-[#1F4B2C]">
                  Automated Two-Way Matching Board (Demand vs Supply)
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Direct pairing of open buyer purchase requirements against verified farm yields
                </p>
              </div>

              <div className="space-y-3">
                {openBuyerRequests.map((req) => {
                  const matchingCrop = commodities.find((c) =>
                    c.name.toLowerCase().includes(req.commodity.toLowerCase())
                  );

                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold uppercase">
                            Demand Request
                          </span>
                          <span className="text-xs font-black text-[#1F4B2C]">{req.commodity}</span>
                        </div>
                        <h4 className="text-xs font-bold text-neutral-700">{req.buyerName}</h4>
                        <p className="text-[11px] text-neutral-500">
                          Target Volume: <span className="font-bold text-neutral-800">{req.targetKg.toLocaleString()} kg</span> • Ceiling Budget: <span className="font-bold text-neutral-800">₱{req.maxPrice}/kg</span> • {req.location}
                        </p>
                      </div>

                      {matchingCrop ? (
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-left text-xs">
                            <span className="text-[10px] text-emerald-800 font-bold block">✓ Matched Harvest Lot:</span>
                            <span className="font-bold text-[#1F4B2C]">{matchingCrop.supplierName}</span>
                            <span className="text-neutral-500 block text-[11px]">₱{matchingCrop.pricePerKg}/kg ({matchingCrop.availableKg} kg)</span>
                          </div>
                          <button
                            onClick={() => {
                              setActiveOrderModalItem(matchingCrop);
                              addNotification(`Matched trade initiated for ${req.commodity}!`, 'success');
                            }}
                            className="px-4 py-2.5 rounded-full btn-forest text-xs font-black whitespace-nowrap shadow-xs"
                          >
                            Initiate Matched Trade
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400 font-medium">Scanning for new crop posts...</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Module (c): Agricultural Inventory & Availability Coordination */}
          {dsModule === 'inventory' && (
            <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
              <div className="pb-3 border-b border-neutral-200">
                <h3 className="text-base font-black text-[#1F4B2C]">
                  Municipal Agricultural Heatmap & 30–60 Day Harvest Calendar
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Regional stock volumes across Nueva Vizcaya municipal hubs
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { town: 'Bambang (NVAT)', volume: '5.7 MT', status: 'Optimal Storage', badge: 'bg-emerald-100 text-emerald-800' },
                  { town: 'Kayapa', volume: '1.6 MT', status: 'Peak Harvest', badge: 'bg-emerald-100 text-emerald-800' },
                  { town: 'Kasibu', volume: '2.1 MT', status: 'Citrus Inflow', badge: 'bg-amber-100 text-amber-800' },
                  { town: 'Bayombong', volume: '2.4 MT', status: 'Cold Storage Full', badge: 'bg-blue-100 text-blue-800' },
                  { town: 'Solano', volume: '1.8 MT', status: 'Grains Consolidation', badge: 'bg-purple-100 text-purple-800' },
                  { town: 'Dupax del Sur', volume: '1.1 MT', status: 'Root Crop Stage', badge: 'bg-emerald-100 text-emerald-800' },
                  { town: 'Aritao', volume: '1.2 MT', status: 'Gateway Transit', badge: 'bg-amber-100 text-amber-800' },
                  { town: 'Bagabag', volume: '950 kg', status: 'Boundary Trade', badge: 'bg-neutral-100 text-neutral-700' },
                  { town: 'Santa Fe', volume: '800 kg', status: 'Mountain Pass Bay', badge: 'bg-neutral-100 text-neutral-700' },
                  { town: 'Villaverde', volume: '600 kg', status: 'Vegetable Plots', badge: 'bg-neutral-100 text-neutral-700' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white border border-[#91EAAF]/60 shadow-xs text-left">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.badge}`}>
                      {item.status}
                    </span>
                    <h5 className="text-xs font-bold text-[#1F4B2C] mt-1.5">{item.town}</h5>
                    <p className="text-sm font-black text-[#4D7111] font-mono mt-0.5">{item.volume}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module (d): Delivery & Hauling Coordination */}
          {dsModule === 'scheduling' && (
            <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-3">
              <h3 className="text-base font-black text-[#1F4B2C]">
                Transaction & Delivery Scheduling Support
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                Optimized route coordination across Maharlika Highway (AH26) and Dalton Pass
              </p>
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 text-xs text-neutral-700 space-y-2">
                <div className="flex items-center gap-2 text-[#4D7111] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Fleet Availability: 8 Cooperative Hauling Trucks Staged at Bambang NVAT</span>
                </div>
                <p>
                  Batch dispatching scheduled for 04:00 AM, 11:00 AM, and 06:00 PM to bypass heavy mountain fog in Santa Fe and ensure crisp vegetable delivery to NCR terminals.
                </p>
              </div>
            </div>
          )}

          {/* Module (e): Policy & Market Intelligence Brief */}
          {dsModule === 'policy' && (
            <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-3">
              <h3 className="text-base font-black text-[#1F4B2C]">
                PAO-NV Provincial Food Security & Price Stability Index
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                Comprehensive macro telemetry compiled by the Market Agent
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Price Stability Index</span>
                  <div className="text-2xl font-black text-[#1F4B2C] mt-1">92.4 / 100</div>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">✓ Highland Cabbage supply steady</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Cold Storage Capacity</span>
                  <div className="text-2xl font-black text-[#1F4B2C] mt-1">78% Utilized</div>
                  <p className="text-[10px] text-amber-700 font-bold mt-1">Bayombong + Bambang Lockers</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Average Hauler Transit</span>
                  <div className="text-2xl font-black text-[#1F4B2C] mt-1">42 Minutes</div>
                  <p className="text-[10px] text-neutral-500 font-semibold mt-1">Farm gate to NVAT Bay</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: KNOWLEDGE SHARING HUB (LIVE JSON MESSAGE PACKETS FLOWING) */}
      {activeSubTab === 'coordination-hub' && (
        <div className="glass-light p-6 rounded-3xl border-2 border-[#91EAAF] shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
            <div>
              <h3 className="text-lg font-black text-[#1F4B2C]">
                Multi-Agent Coordination & Knowledge Sharing Mesh
              </h3>
              <p className="text-xs text-neutral-600 font-medium">
                Real-time JSON message packets flowing between Farmer ↔ Buyer ↔ Supplier ↔ Market ↔ Admin Agents
              </p>
            </div>
            <button
              onClick={handleSimulateAgentPing}
              className="px-4 py-2 rounded-full btn-forest text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-[#C3E956]" />
              Trigger Live Coordination Ping
            </button>
          </div>

          {/* JSON Packet Stream */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {agentPackets.map((pkt) => (
              <div
                key={pkt.id}
                className="p-4 rounded-2xl bg-[#1F4B2C] text-[#F4FFFC] border border-[#C3E956]/40 shadow-sm space-y-2 font-mono text-xs"
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#C3E956] text-[#1F4B2C] text-[10px] font-black uppercase">
                      {pkt.fromAgent}
                    </span>
                    <ArrowLeftRight className="w-3 h-3 text-[#91EAAF]" />
                    <span className="px-2 py-0.5 rounded-md bg-[#91EAAF] text-[#1F4B2C] text-[10px] font-black uppercase">
                      {pkt.toAgent}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(pkt.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#C3E956] font-bold text-[11px]">
                  <span>Intent:</span>
                  <span>{pkt.intent}</span>
                </div>

                <pre className="p-2.5 rounded-xl bg-black/40 text-[#91EAAF] overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify(pkt.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ROLE-SPECIFIC AGENT EMBEDDED CONSOLE */}
      {activeSubTab === 'role-agent' && (
        <div className="glass-light p-6 rounded-3xl border border-[#91EAAF] shadow-md space-y-4">
          <div className="pb-3 border-b border-neutral-200">
            <h3 className="text-lg font-black text-[#1F4B2C]">
              {currentUser?.role === 'Farmer'
                ? 'Farmer AI Agent Console'
                : currentUser?.role === 'Buyer'
                ? 'Buyer AI Agent Console'
                : currentUser?.role === 'Supplier'
                ? 'Supplier AI Agent Console'
                : currentUser?.role === 'MASTER_ADMIN'
                ? 'Admin AI Agent Console'
                : 'Market & Cooperative AI Agent Console'}
            </h3>
            <p className="text-xs text-neutral-600 font-medium">
              Autonomous agent tailored to your role ({currentUser?.role || 'Guest'})
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#91EAAF] space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/Cute_Farm_B_Character_Set_20261106_121834_0000_85d9f953.webp"
                alt="Agent Avatar"
                className="w-14 h-14 object-contain"
              />
              <div>
                <h4 className="text-sm font-bold text-[#1F4B2C]">
                  {currentUser?.role} Autonomous Companion
                </h4>
                <p className="text-xs text-neutral-500">
                  Real-time synchronization with Nueva Vizcaya Agricultural Terminal and PAGASA feeds
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F4FFFC] border border-[#91EAAF]/60 text-xs text-neutral-700 space-y-1">
              <span className="font-bold text-[#1F4B2C]">Active Directive:</span>
              <p>
                Continuously auditing farm harvest dates against predicted rainfall spikes in Kayapa & Kasibu. Auto-optimizing crop listings to match wholesale buyer inquiries from Metro Balintawak and Divisoria.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
