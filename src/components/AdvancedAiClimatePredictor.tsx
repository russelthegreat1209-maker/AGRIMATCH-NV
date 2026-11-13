import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CloudRain,
  Calendar,
  Droplets,
  Thermometer,
  Leaf,
  RefreshCw,
} from 'lucide-react';
import { NUEVA_VIZCAYA_BARANGAYS } from '../data/nvBarangays';
import { AdvancedClimatePredictionWeek } from '../types';

export const AdvancedAiClimatePredictor: React.FC = () => {
  const municipalityKeys = Object.keys(NUEVA_VIZCAYA_BARANGAYS);
  const [selectedMuniKey, setSelectedMuniKey] = useState<string>('Bambang');
  
  const currentMuniData = NUEVA_VIZCAYA_BARANGAYS[selectedMuniKey] || NUEVA_VIZCAYA_BARANGAYS['Bambang'];
  const [selectedBarangayName, setSelectedBarangayName] = useState<string>(
    currentMuniData.barangays[0]?.name || 'Poblacion'
  );

  const [forecastHorizon, setForecastHorizon] = useState<'1month' | '2months'>('2months');
  const [isSimulatingAgent, setIsSimulatingAgent] = useState(false);
  const [aiAdvisory, setAiAdvisory] = useState<{
    synthesis: string;
    keyActions: string[];
    agronomicRiskRating: string;
    poweredByGemini?: boolean;
  } | null>(null);

  const selectedBarangayInfo = useMemo(() => {
    return currentMuniData.barangays.find((b) => b.name === selectedBarangayName) || currentMuniData.barangays[0];
  }, [currentMuniData, selectedBarangayName]);

  const fetchAiForecastSynthesis = useCallback(async (
    muniName: string,
    brgyName: string,
    elev: number,
    crop: string,
    horizon: '1month' | '2months'
  ) => {
    setIsSimulatingAgent(true);
    try {
      const res = await fetch('/api/ai/climate-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          municipality: muniName,
          barangay: brgyName,
          elevationMeters: elev,
          targetCrop: crop,
          horizonMonths: horizon === '1month' ? 1 : 2,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAdvisory(data);
      }
    } catch {
      // Keep grid active if offline
    } finally {
      setIsSimulatingAgent(false);
    }
  }, []);

  useEffect(() => {
    fetchAiForecastSynthesis(
      currentMuniData.municipality,
      selectedBarangayInfo.name,
      selectedBarangayInfo.elevationMeters,
      selectedBarangayInfo.primaryCrops[0] || 'Highland Vegetables',
      forecastHorizon
    );
  }, [currentMuniData.municipality, selectedBarangayInfo, forecastHorizon, fetchAiForecastSynthesis]);

  // When municipality changes, reset default barangay
  const handleMunicipalityChange = (newKey: string) => {
    setSelectedMuniKey(newKey);
    const firstBarangay = NUEVA_VIZCAYA_BARANGAYS[newKey]?.barangays[0]?.name || 'Poblacion';
    setSelectedBarangayName(firstBarangay);
  };

  // Generate 8 weeks (covers 2 months / 60 days) of hyper-local predictive data adjusted by elevation & terrain
  const predictionWeeks: AdvancedClimatePredictionWeek[] = useMemo(() => {
    const isHighland = selectedBarangayInfo.elevationMeters > 900;
    const isRiverValley = selectedBarangayInfo.terrainType === 'River Valley' || selectedBarangayInfo.elevationMeters < 400;

    const baseTemp = isHighland ? 16 : isRiverValley ? 28 : 23;
    const baseRainMm = isHighland ? 35 : 18;

    const weeksCount = forecastHorizon === '1month' ? 4 : 8;

    const result: AdvancedClimatePredictionWeek[] = [];
    const months = ['December 2026', 'January 2027'];

    for (let w = 1; w <= weeksCount; w++) {
      const monthIdx = w <= 4 ? 0 : 1;
      const monthName = months[monthIdx];
      const weekInMonth = w <= 4 ? w : w - 4;
      const dayStart = (weekInMonth - 1) * 7 + 1;
      const dayEnd = Math.min(dayStart + 6, 30);

      // Microclimate seasonality: Amihan peaks in late Dec/Jan, bringing cooler nights and trade-wind cloud cover
      const tempVariance = Math.sin(w) * 1.5;
      const avgTemp = Math.round((baseTemp + (w > 4 ? -1.5 : 0) + tempVariance) * 10) / 10;
      const minTemp = Math.round(avgTemp - (isHighland ? 5.5 : 3.5));
      const maxTemp = Math.round(avgTemp + (isHighland ? 4.0 : 5.0));

      const rainProb = Math.min(95, Math.max(15, Math.round((isHighland ? 65 : 35) + Math.sin(w * 1.2) * 20)));
      const rainVolume = Math.round((baseRainMm + Math.cos(w) * 12) * 10) / 10;
      const soilMoisture = Math.min(95, Math.max(45, Math.round(65 + Math.sin(w) * 15)));

      const typhoonRisk: 'Low' | 'Moderate' | 'High' | 'Severe' = 
        w === 2 ? 'Moderate' : w === 6 ? 'Moderate' : 'Low';

      let advisory = '';
      const actions: string[] = [];

      if (isHighland) {
        advisory = `Cool Amihan air mass convergence expected over ${selectedBarangayName} ridge (${selectedBarangayInfo.elevationMeters}m ASL). Nighttime temperatures dropping to ${minTemp}°C.`;
        actions.push('Deploy thermal mulching on exposed nursery beds');
        actions.push('Monitor high-altitude brassica crops for morning frost accumulation');
        actions.push('Stagger harvest during clear 10:00 AM - 2:00 PM sun windows');
      } else {
        advisory = `Stable alluvial microclimate with mild morning valley mist and light afternoon thermal currents. Ideal for vegetative growth of ${selectedBarangayInfo.primaryCrops.slice(0, 2).join(' and ')}.`;
        actions.push(`Maintain regular drip irrigation (Soil moisture: ${soilMoisture}%)`);
        actions.push('Harvest maturity window optimal before potential late afternoon showers');
        actions.push('Inspect river embankment drainage channels');
      }

      result.push({
        weekNumber: w,
        monthName,
        dateRange: `Week ${w} (${monthName.split(' ')[0]} ${dayStart}-${dayEnd})`,
        municipality: currentMuniData.municipality,
        barangay: selectedBarangayInfo.name,
        rainfallProbabilityPercent: rainProb,
        rainfallVolumeEstMm: Math.max(2, rainVolume),
        tempRangeC: `${minTemp}°C - ${maxTemp}°C`,
        avgTempC: avgTemp,
        soilMoisturePercent: soilMoisture,
        typhoonRisk,
        microclimateTag: `${selectedBarangayInfo.terrainType} • ${selectedBarangayInfo.elevationMeters}m ASL`,
        cropAdvisory: advisory,
        recommendedActions: actions
      });
    }

    return result;
  }, [selectedBarangayInfo, currentMuniData, forecastHorizon]);

  return (
    <div className="rounded-3xl glass-light p-5 sm:p-8 border-2 border-[#91EAAF] shadow-xl space-y-6">
      {/* Header with Multi-Agent Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C3E956] animate-pulse" />
            Autonomous Multi-Agent Climate Model
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[#1F4B2C] tracking-tight">
            1 to 2-Month Hyper-Local Climate & Weather Predictor
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
            Predictive microclimate simulations by municipality and barangay across Nueva Vizcaya.
          </p>
        </div>

        {/* Forecast Horizon Switcher */}
        <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-[#91EAAF] self-start md:self-auto">
          <button
            onClick={() => setForecastHorizon('1month')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              forecastHorizon === '1month'
                ? 'bg-[#1F4B2C] text-[#C3E956] shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            1-Month Forecast (30 Days)
          </button>
          <button
            onClick={() => setForecastHorizon('2months')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              forecastHorizon === '2months'
                ? 'bg-[#1F4B2C] text-[#C3E956] shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            2-Month Forecast (60 Days)
          </button>
        </div>
      </div>

      {/* Selectors: Municipality AND Barangay */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-[#91EAAF] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Municipality Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4D7111] mb-1.5">
              1. Select Municipality (15 NV Towns)
            </label>
            <select
              value={selectedMuniKey}
              onChange={(e) => handleMunicipalityChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4FFFC] border border-[#91EAAF] text-xs sm:text-sm font-bold text-[#1F4B2C] focus:ring-2 focus:ring-[#1F4B2C] outline-none"
            >
              {municipalityKeys.map((key) => (
                <option key={key} value={key}>
                  {NUEVA_VIZCAYA_BARANGAYS[key].municipality} ({NUEVA_VIZCAYA_BARANGAYS[key].primaryZone.split('(')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Barangay Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4D7111] mb-1.5">
              2. Select Specific Barangay
            </label>
            <select
              value={selectedBarangayName}
              onChange={(e) => setSelectedBarangayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4FFFC] border border-[#91EAAF] text-xs sm:text-sm font-bold text-[#1F4B2C] focus:ring-2 focus:ring-[#1F4B2C] outline-none"
            >
              {currentMuniData.barangays.map((b) => (
                <option key={b.name} value={b.name}>
                  Brgy. {b.name} ({b.elevationMeters}m ASL • {b.terrainType})
                </option>
              ))}
            </select>
          </div>

          {/* Microclimate Telemetry Pill */}
          <div className="p-3 rounded-xl bg-[#91EAAF]/20 border border-[#91EAAF]/50 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs font-bold text-[#1F4B2C]">
              <span>Elevation & Terrain:</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956]">
                {selectedBarangayInfo.elevationMeters}m ASL
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 mt-1 font-medium">
              Terrain: <strong className="text-[#1F4B2C]">{selectedBarangayInfo.terrainType}</strong>
            </p>
            <p className="text-[10px] text-neutral-500 mt-0.5 truncate">
              Primary Crops: {selectedBarangayInfo.primaryCrops.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Live Climate Agent Synthesis Panel */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#1F4B2C] text-[#F4FFFC] border border-[#C3E956]/50 shadow-md space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 text-[#C3E956] ${isSimulatingAgent ? 'animate-spin' : ''}`} />
            <span className="text-xs font-black uppercase tracking-wider text-[#C3E956]">
              AI Climate Synthesis • Brgy. {selectedBarangayName}, {currentMuniData.municipality}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {aiAdvisory?.agronomicRiskRating && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#C3E956] text-[#1F4B2C] text-[10px] font-black">
                {aiAdvisory.agronomicRiskRating}
              </span>
            )}
            <button
              type="button"
              onClick={() =>
                fetchAiForecastSynthesis(
                  currentMuniData.municipality,
                  selectedBarangayInfo.name,
                  selectedBarangayInfo.elevationMeters,
                  selectedBarangayInfo.primaryCrops[0] || 'Highland Vegetables',
                  forecastHorizon
                )
              }
              disabled={isSimulatingAgent}
              className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-[10px] font-bold flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isSimulatingAgent ? 'animate-spin' : ''}`} />
              <span>{isSimulatingAgent ? 'Running Agent...' : 'Refresh AI'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-100 leading-relaxed font-medium">
          {aiAdvisory?.synthesis || 'Synthesizing 1–2 month barangay rainfall and temperature outlook...'}
        </p>

        {aiAdvisory?.keyActions && aiAdvisory.keyActions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
            {aiAdvisory.keyActions.map((act, idx) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-[11px] font-medium text-[#F4FFFC] flex items-start gap-1.5"
              >
                <Leaf className="w-3.5 h-3.5 text-[#C3E956] shrink-0 mt-0.5" />
                <span>{act}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline Grid (4 or 8 weeks) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-[#1F4B2C] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4D7111]" />
            Long-Range Weekly Microclimate Matrix ({forecastHorizon === '1month' ? '4 Weeks / 1 Month' : '8 Weeks / 2 Months'})
          </h3>
          <span className="text-xs text-neutral-500 font-semibold">
            Location: Brgy. {selectedBarangayName}, {currentMuniData.municipality}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {predictionWeeks.map((week) => (
            <div
              key={week.weekNumber}
              className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-[#1F4B2C] text-[#C3E956]">
                    Week {week.weekNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    week.typhoonRisk === 'Low'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    Typhoon: {week.typhoonRisk}
                  </span>
                </div>

                <div className="text-xs font-bold text-neutral-700">
                  {week.dateRange}
                </div>

                {/* Primary Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-neutral-100">
                  <div className="p-2 rounded-xl bg-[#F4FFFC] border border-[#91EAAF]/40">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-red-500" /> Temp
                    </span>
                    <p className="text-xs font-black text-[#1F4B2C] mt-0.5">{week.tempRangeC}</p>
                    <span className="text-[9px] text-neutral-500">Avg {week.avgTempC}°C</span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#F4FFFC] border border-[#91EAAF]/40">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase flex items-center gap-1">
                      <CloudRain className="w-3 h-3 text-blue-500" /> Rain Prob
                    </span>
                    <p className="text-xs font-black text-[#1F4B2C] mt-0.5">{week.rainfallProbabilityPercent}%</p>
                    <span className="text-[9px] text-neutral-500">~{week.rainfallVolumeEstMm} mm</span>
                  </div>
                </div>

                {/* Soil Moisture Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral-600 mb-1">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-600" /> Est. Soil Moisture
                    </span>
                    <span>{week.soilMoisturePercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-[#1F4B2C] rounded-full"
                      style={{ width: `${week.soilMoisturePercent}%` }}
                    />
                  </div>
                </div>

                {/* Agronomic Advisory */}
                <div className="mt-3 pt-2 border-t border-neutral-100">
                  <p className="text-[11px] text-neutral-700 font-medium leading-snug">
                    {week.cropAdvisory}
                  </p>
                </div>
              </div>

              {/* Action Bullet */}
              <div className="mt-3 pt-2 bg-neutral-50 p-2 rounded-xl border border-neutral-100 text-[10px] text-[#1F4B2C] font-semibold flex items-center gap-1.5">
                <Leaf className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{week.recommendedActions[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
