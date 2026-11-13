import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  RefreshCw,
  CloudLightning,
  CloudRain,
  Wind,
  Thermometer,
  Compass,
  AlertTriangle,
  Radio,
  CheckCircle2,
  MapPin,
  Waves
} from 'lucide-react';
import { MunicipalWeather } from '../types';

interface PagasaWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMunicipalWeather?: MunicipalWeather;
  selectedMunicipality?: string;
}

export const PagasaWeatherModal: React.FC<PagasaWeatherModalProps> = ({
  isOpen,
  onClose,
  currentMunicipalWeather,
  selectedMunicipality = 'Bambang',
}) => {
  const [activeTab, setActiveTab] = useState<'synoptic' | 'radar' | 'typhoon' | 'agromet'>('synoptic');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('06:00 AM PHT (Updated 14 mins ago)');

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdatedTime(`Just now (${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} PHT)`);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#F4FFFC] border-2 border-[#91EAAF] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pagasa-modal-title"
      >
        {/* Header with DOST-PAGASA Official Styling */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1F4B2C] via-[#2d683f] to-[#1F4B2C] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-[#C3E956]/40 flex items-center justify-center shadow-inner">
              <Radio className="w-5 h-5 text-[#C3E956] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C3E956] text-[#1F4B2C]">
                  DOST-PAGASA LIVE
                </span>
                <span className="text-xs text-[#91EAAF] font-medium hidden sm:inline">
                  Region II (Cagayan Valley) Telemetry
                </span>
              </div>
              <h2 id="pagasa-modal-title" className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Official PAGASA Synoptic Weather & Radar Feed
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh PAGASA Telemetry"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#C3E956] transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close PAGASA Weather Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader / Status Bar */}
        <div className="px-6 py-2.5 bg-[#91EAAF]/20 border-b border-[#91EAAF]/40 flex flex-wrap items-center justify-between text-xs text-[#1F4B2C]">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#4D7111]" />
            <span className="font-bold">Station:</span>
            <span>DOST-PAGASA Bayombong/Bambang Agromet Network</span>
            <span className="text-neutral-400">|</span>
            <span className="font-semibold text-neutral-600">Focus: {selectedMunicipality}, Nueva Vizcaya</span>
          </div>
          <div className="flex items-center gap-2 mt-1 sm:mt-0 font-medium text-neutral-600">
            <span>Last Sync: {lastUpdatedTime}</span>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex border-b border-[#91EAAF]/30 px-6 pt-3 bg-white/50 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('synoptic')}
            className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'synoptic'
                ? 'border-[#1F4B2C] text-[#1F4B2C]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            Synoptic Readings
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'radar'
                ? 'border-[#1F4B2C] text-[#1F4B2C]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            Doppler Radar Imagery
          </button>
          <button
            onClick={() => setActiveTab('typhoon')}
            className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'typhoon'
                ? 'border-[#1F4B2C] text-[#1F4B2C]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Severe Weather & Cyclone Bulletins
          </button>
          <button
            onClick={() => setActiveTab('agromet')}
            className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'agromet'
                ? 'border-[#1F4B2C] text-[#1F4B2C]'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            Agro-Meteorological Advisory
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'synoptic' && (
            <div className="space-y-6">
              {/* Primary Observation Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-[#91EAAF]/15 border border-[#91EAAF] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D7111]">
                      Official Synoptic Surface Observation
                    </span>
                    <h3 className="text-2xl font-black text-[#1F4B2C]">
                      {selectedMunicipality} Synoptic Station
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1">
                      Elevation: 320m ASL • Barometric Pressure: 1012.4 hPa (Normal) • Station Index: #98328
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-4xl font-black text-[#1F4B2C]">
                        {currentMunicipalWeather?.temperatureC ?? 26}°C
                      </div>
                      <div className="text-xs font-medium text-neutral-500">
                        Feels like {currentMunicipalWeather?.feelsLikeC ?? 27}°C
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#91EAAF]/30 border border-[#91EAAF] flex items-center justify-center">
                      <CloudRain className="w-8 h-8 text-[#1F4B2C]" />
                    </div>
                  </div>
                </div>

                {/* Metric Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#91EAAF]/30">
                  <div className="p-3 rounded-xl bg-white/70 border border-[#91EAAF]/40">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                      <Wind className="w-3 h-3 text-[#4D7111]" /> Surface Wind
                    </span>
                    <p className="text-sm font-black text-[#1F4B2C] mt-0.5">
                      {currentMunicipalWeather?.windSpeedKmh ?? 12} km/h ENE
                    </p>
                    <span className="text-[10px] text-neutral-500 font-semibold">Amihan Breeze</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/70 border border-[#91EAAF]/40">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                      <CloudRain className="w-3 h-3 text-sky-600" /> Relative Humidity
                    </span>
                    <p className="text-sm font-black text-[#1F4B2C] mt-0.5">
                      {currentMunicipalWeather?.humidityPercent ?? 78}%
                    </p>
                    <span className="text-[10px] text-neutral-500 font-semibold">Dew Point 22°C</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/70 border border-[#91EAAF]/40">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                      <Compass className="w-3 h-3 text-emerald-600" /> Rain Accumulation
                    </span>
                    <p className="text-sm font-black text-[#1F4B2C] mt-0.5">
                      {currentMunicipalWeather?.rainfallMm ?? 2.8} mm (24h)
                    </p>
                    <span className="text-[10px] text-emerald-700 font-semibold">Light Showers</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/70 border border-[#91EAAF]/40">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-600" /> Solar UV Index
                    </span>
                    <p className="text-sm font-black text-[#1F4B2C] mt-0.5">
                      {currentMunicipalWeather?.uvIndex ?? 6} (Moderate)
                    </p>
                    <span className="text-[10px] text-neutral-500 font-semibold">Safe Field Working</span>
                  </div>
                </div>
              </div>

              {/* Station Network Across Nueva Vizcaya */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1F4B2C] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4D7111]" />
                  Verified DOST-PAGASA Automated Weather Stations (AWS) in NV
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-[#91EAAF] shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1F4B2C]">Bayombong Synoptic</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">ONLINE</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1">Temp: 27.2°C • Rain: 1.2mm • Wind: 14 km/h</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Coordinates: 16.48°N, 121.15°E</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#91EAAF] shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1F4B2C]">Bambang Agromet</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">ONLINE</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1">Temp: 26.5°C • Rain: 2.8mm • Wind: 11 km/h</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Coordinates: 16.39°N, 121.11°E</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#91EAAF] shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1F4B2C]">Dalton Pass Mountain AWS</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">ONLINE</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1">Temp: 21.0°C • Rain: 8.4mm • Wind: 24 km/h</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Elevation: 910m (Santa Fe)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900 text-white relative overflow-hidden shadow-lg border border-neutral-700">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-[#C3E956]">Aparri / Baguio Doppler Radar Composite Feed</span>
                  </div>
                  <span className="text-neutral-400 text-[11px]">Sweep Interval: 10 mins (Live Reflected dBZ)</span>
                </div>

                {/* Simulated Doppler Radar Screen with Nueva Vizcaya Valley Crosshairs */}
                <div className="relative h-64 sm:h-80 w-full rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                  {/* Radar Circles */}
                  <div className="absolute w-56 h-56 rounded-full border border-emerald-500/20" />
                  <div className="absolute w-40 h-40 rounded-full border border-emerald-500/30" />
                  <div className="absolute w-24 h-24 rounded-full border border-emerald-500/40" />
                  <div className="absolute w-full h-[1px] bg-emerald-500/20" />
                  <div className="absolute h-full w-[1px] bg-emerald-500/20" />

                  {/* Sweep line */}
                  <div className="absolute w-44 h-44 origin-bottom-right top-0 left-0 bg-gradient-to-br from-emerald-500/20 to-transparent pointer-events-none animate-spin" style={{ animationDuration: '6s' }} />

                  {/* Rain Echo Clusters over Caraballo & Cordillera Ridges */}
                  <div className="absolute top-16 left-28 w-20 h-16 rounded-full bg-emerald-500/30 blur-md" />
                  <div className="absolute top-24 left-36 w-12 h-10 rounded-full bg-yellow-500/40 blur-sm" />
                  <div className="absolute bottom-20 right-32 w-16 h-14 rounded-full bg-cyan-500/30 blur-md" />

                  {/* Municipal Pinpoints */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                    <div className="w-3 h-3 rounded-full bg-[#C3E956] border-2 border-slate-900 shadow-md animate-pulse" />
                    <span className="text-[10px] font-black text-white bg-slate-900/80 px-2 py-0.5 rounded-md mt-1 border border-slate-700">
                      NV Central Valley (Bambang-Bayombong)
                    </span>
                  </div>

                  <div className="absolute top-16 left-20 text-[9px] text-neutral-400 bg-slate-900/70 px-1.5 py-0.5 rounded">
                    Kayapa Ridge (1250m) - Light Mist
                  </div>
                  <div className="absolute bottom-16 right-20 text-[9px] text-neutral-400 bg-slate-900/70 px-1.5 py-0.5 rounded">
                    Kasibu Valley (Citrus Hub)
                  </div>
                </div>

                {/* Radar dBZ Legend */}
                <div className="mt-3 flex flex-wrap items-center justify-between text-[10px] text-neutral-300 gap-2">
                  <span>Reflectivity Scale (dBZ):</span>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-2.5 rounded bg-blue-500 inline-block" /> Light Rain (&lt;20)
                    <span className="w-4 h-2.5 rounded bg-emerald-500 inline-block ml-2" /> Moderate (25-35)
                    <span className="w-4 h-2.5 rounded bg-yellow-500 inline-block ml-2" /> Heavy (40-45)
                    <span className="w-4 h-2.5 rounded bg-red-600 inline-block ml-2" /> Intense (&gt;50)
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typhoon' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    Current Tropical Cyclone Status in PAR
                  </h4>
                  <p className="text-xs mt-1 text-emerald-800 leading-relaxed font-medium">
                    As of today, <strong className="font-bold">NO TROPICAL CYCLONE WARNING SIGNAL</strong> is hoisted over the Province of Nueva Vizcaya. General weather is dominated by the Northeast Monsoon (Amihan) and localized afternoon orographic convective cloud clusters over the Caraballo mountain range.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1F4B2C]">PAGASA Heavy Rainfall Warning System (NV)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    NORMAL (WHITE ALERT)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="font-bold text-amber-600">Yellow Advisory:</span>
                    <p className="text-[11px] text-neutral-600 mt-0.5">Heavy Rain (7.5-15mm/h) - Flooding possible in low-lying river areas.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="font-bold text-orange-600">Orange Warning:</span>
                    <p className="text-[11px] text-neutral-600 mt-0.5">Intense Rain (15-30mm/h) - Threat of flooding and landslides along Dalton Pass.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="font-bold text-red-600">Red Alert:</span>
                    <p className="text-[11px] text-neutral-600 mt-0.5">Torrential (&gt;30mm/h) - Evacuation recommended in hazard zones.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agromet' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-[#91EAAF] shadow-xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1F4B2C]">
                  DOST-PAGASA 10-Day Farm Weather Outlook for Nueva Vizcaya
                </h4>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  Suitable field operations window for vegetable harvesting in Kayapa and Bambang: Mornings until 1:00 PM before typical mountain convective cloud build-up. Spraying for citrus pest prevention in Kasibu recommended during low wind velocity (&lt;10 km/h) hours between 6:00 AM - 9:00 AM.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <div className="p-3 rounded-xl bg-[#91EAAF]/15 border border-[#91EAAF]/30">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase">Field Spraying</span>
                    <p className="text-xs font-black text-emerald-700 mt-1">Favorable (AM)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#91EAAF]/15 border border-[#91EAAF]/30">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase">Crop Harvesting</span>
                    <p className="text-xs font-black text-emerald-700 mt-1">Optimal</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#91EAAF]/15 border border-[#91EAAF]/30">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase">Solar Grain Curing</span>
                    <p className="text-xs font-black text-amber-700 mt-1">Moderate (Watch PM clouds)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#91EAAF]/15 border border-[#91EAAF]/30">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase">Soil Moisture</span>
                    <p className="text-xs font-black text-blue-700 mt-1">Adequate (72%)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with External Link Button to Official PAGASA Portal */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#91EAAF]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Radio className="w-4 h-4 text-[#4D7111]" />
            <span>Official Government Portal: Department of Science and Technology (DOST-PAGASA)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="https://bagong.pagasa.dost.gov.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#1F4B2C] hover:bg-[#2d683f] text-[#C3E956] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Open Official PAGASA Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#C3E956]" />
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
