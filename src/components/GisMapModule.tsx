import React, { useState, useMemo, useEffect } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { useApp } from '../context/AppContext';
import { UserAccount } from '../types';
import {
  haversineDistanceKm,
  formatDistance,
  calculateDrivingTimeMinutes,
  buildMunicipalGeoPolygon,
} from '../utils/agriMath';
import {
  MapPin,
  Compass,
  Navigation,
  CheckCircle2,
  MessageSquare,
  X,
  Building2,
  Phone,
} from 'lucide-react';
import { NUEVA_VIZCAYA_MUNICIPALITIES, MunicipalBoundary } from '../data/nvMunicipalBoundaries';
import { UserAvatar } from './UserAvatar';

interface GoogleMapOverlaysProps {
  showBoundaries: boolean;
  selectedMunicipality: MunicipalBoundary | null;
  onSelectMunicipality: (m: MunicipalBoundary | null) => void;
  userLocation: { lat: number; lng: number; name: string };
  selectedRadiusKm: number | 'ALL';
  selectedRoute: {
    from: { lat: number; lng: number; name: string };
    to: { lat: number; lng: number; name: string };
    distanceKm: number;
    drivingMinutes: number;
    pathDescription: string;
  } | null;
}

const GoogleMapOverlays: React.FC<GoogleMapOverlaysProps> = ({
  showBoundaries,
  selectedMunicipality,
  onSelectMunicipality,
  userLocation,
  selectedRadiusKm,
  selectedRoute,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;
    const polygons: google.maps.Polygon[] = [];

    if (showBoundaries) {
      NUEVA_VIZCAYA_MUNICIPALITIES.forEach((m, idx) => {
        const isSelected = selectedMunicipality?.id === m.id;
        const paths = buildMunicipalGeoPolygon(m.centroid, m.areaKm2, idx);
        const poly = new google.maps.Polygon({
          paths,
          strokeColor: isSelected ? '#1F4B2C' : '#2E6B3E',
          strokeOpacity: isSelected ? 0.95 : 0.65,
          strokeWeight: isSelected ? 2.5 : 1.3,
          fillColor: isSelected ? '#4D7111' : '#91EAAF',
          fillOpacity: isSelected ? 0.38 : 0.16,
          map,
          clickable: true,
        });
        poly.addListener('click', () => {
          onSelectMunicipality(isSelected ? null : m);
        });
        polygons.push(poly);
      });
    }

    return () => {
      polygons.forEach((p) => p.setMap(null));
    };
  }, [map, showBoundaries, selectedMunicipality, onSelectMunicipality]);

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps || selectedRadiusKm === 'ALL') return;
    const radiusMeters = Math.max(100, Number(selectedRadiusKm) * 1000);
    const circle = new google.maps.Circle({
      center: { lat: userLocation.lat, lng: userLocation.lng },
      radius: radiusMeters,
      strokeColor: '#1F4B2C',
      strokeOpacity: 0.85,
      strokeWeight: 2,
      fillColor: '#91EAAF',
      fillOpacity: 0.18,
      map,
      clickable: false,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, userLocation, selectedRadiusKm]);

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps || !selectedRoute) return;
    const midLat = (selectedRoute.from.lat + selectedRoute.to.lat) / 2 + 0.015;
    const midLng = (selectedRoute.from.lng + selectedRoute.to.lng) / 2;
    const line = new google.maps.Polyline({
      path: [
        { lat: selectedRoute.from.lat, lng: selectedRoute.from.lng },
        { lat: midLat, lng: midLng },
        { lat: selectedRoute.to.lat, lng: selectedRoute.to.lng },
      ],
      strokeColor: '#1F4B2C',
      strokeOpacity: 0.95,
      strokeWeight: 4,
      map,
    });

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: selectedRoute.from.lat, lng: selectedRoute.from.lng });
    bounds.extend({ lat: selectedRoute.to.lat, lng: selectedRoute.to.lng });
    map.fitBounds(bounds, 72);

    return () => {
      line.setMap(null);
    };
  }, [map, selectedRoute]);

  return null;
};

export const GisMapModule: React.FC = () => {
  const {
    currentUser,
    accounts,
    commodities,
    setActiveOrderModalItem,
    setActiveChatThreadId,
    setActiveTab,
    selectedRoute,
    setSelectedRoute,
  } = useApp();

  // Map layer toggle: 'glass-street' | 'satellite' | 'terrain'
  const [mapLayer, setMapLayer] = useState<'glass-street' | 'satellite' | 'terrain'>('glass-street');

  // Municipal boundary overlay toggle & selection
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalBoundary | null>(null);

  // Proximity radius filter
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number | 'ALL'>('ALL');
  const [customRadiusInput, setCustomRadiusInput] = useState<string>('');

  // User current location in Nueva Vizcaya
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: currentUser?.lat || 16.3861,
    lng: currentUser?.lng || 121.1065,
    name: currentUser ? `${currentUser.name} (${currentUser.municipality})` : 'Bambang Market Hub',
  });

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';
  const hasValidMapsKey = Boolean(mapsApiKey && mapsApiKey !== 'MY_GOOGLE_MAPS_API_KEY');
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);
  const [mapEngine, setMapEngine] = useState<'google' | 'vector'>(
    hasValidMapsKey ? 'google' : 'vector'
  );

  useEffect(() => {
    const onQuota = () => {
      setMapsQuotaExceeded(true);
      setMapEngine('vector');
    };
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  const useGoogleMapsEngine = hasValidMapsKey && !mapsQuotaExceeded && mapEngine === 'google';

  // 2-Tap State Machine:
  // selectedPreviewPin: 1st tap (preview state)
  // fullProfileModalUser: 2nd tap (full profile & storefront state)
  const [selectedPreviewPin, setSelectedPreviewPin] = useState<UserAccount | null>(null);
  const [fullProfileUser, setFullProfileUser] = useState<UserAccount | null>(null);

  // Map bounding box for Nueva Vizcaya coordinate projection
  // Lat: ~16.10 to 16.70 (Span ~0.60 deg)
  // Lng: ~120.80 to 121.40 (Span ~0.60 deg)
  const mapBounds = {
    minLat: 16.10,
    maxLat: 16.70,
    minLng: 120.75,
    maxLng: 121.40,
  };

  // Convert GPS (lat, lng) to SVG percentage (x, y)
  const projectGpsToSvg = (lat: number, lng: number) => {
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    // Invert lat because higher lat is further north (top)
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  };

  // Filter stakeholders within selected radius
  const filteredStakeholders = useMemo(() => {
    return accounts.map((acc) => {
      const distance = haversineDistanceKm(
        userLocation.lat,
        userLocation.lng,
        acc.lat,
        acc.lng
      );
      const isWithin =
        selectedRadiusKm === 'ALL'
          ? true
          : selectedRadiusKm === 0.01 // 10m
          ? distance <= 0.05
          : distance <= selectedRadiusKm;

      const userCommodities = commodities.filter((c) => c.supplierId === acc.id);

      return {
        ...acc,
        distanceKm: distance,
        isWithin,
        userCommodities,
      };
    });
  }, [accounts, commodities, userLocation, selectedRadiusKm]);

  const visiblePins = filteredStakeholders.filter((s) => s.isWithin);

  // Handle Pin Click (2-Tap state machine)
  const handlePinClick = (stakeholder: UserAccount) => {
    if (selectedPreviewPin && selectedPreviewPin.id === stakeholder.id) {
      // 2nd Tap -> Open Full Profile & Storefront State
      setFullProfileUser(stakeholder);
      setSelectedPreviewPin(null);
    } else {
      // 1st Tap -> Open Preview Popover
      setSelectedPreviewPin(stakeholder);
    }
  };

  // Route calculation
  const handleShowRoute = (stakeholder: UserAccount) => {
    const dist = haversineDistanceKm(userLocation.lat, userLocation.lng, stakeholder.lat, stakeholder.lng);
    const mins = calculateDrivingTimeMinutes(dist, 40);

    setSelectedRoute({
      from: { lat: userLocation.lat, lng: userLocation.lng, name: userLocation.name },
      to: { lat: stakeholder.lat, lng: stakeholder.lng, name: `${stakeholder.name} (${stakeholder.municipality})` },
      distanceKm: dist,
      drivingMinutes: mins,
      pathDescription: `${userLocation.name.split('(')[0].trim()} ➔ Maharlika Highway (AH26) ➔ ${stakeholder.municipality} Trading Hub`,
    });
  };

  const userSvgPos = projectGpsToSvg(userLocation.lat, userLocation.lng);

  return (
    <div className="space-y-4 pb-16 text-left animate-fade-in">
      {/* GIS Header & Radius Filter Bar */}
      <div className="glass-light p-4 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4D7111]/15 text-[#1F4B2C] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Compass className="w-3 h-3 text-[#4D7111]" />
            Nueva Vizcaya Spatial GIS Engine
          </div>
          <h2 className="text-xl font-black text-[#1F4B2C] tracking-tight">
            Interactive Crop Hubs & Proximity Router
          </h2>
          <p className="text-xs text-neutral-600 font-medium">
            2-Tap pin inspection, geodesic proximity circles, and live agricultural road routing
          </p>
        </div>

        {/* Proximity Radius Parameter Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-[#1F4B2C] mr-1">Radius:</span>
          {[
            { label: '10m', val: 0.01 },
            { label: '10km', val: 10 },
            { label: '50km', val: 50 },
            { label: '100km', val: 100 },
            { label: 'All NV', val: 'ALL' },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => {
                setSelectedRadiusKm(btn.val as number | 'ALL');
                setCustomRadiusInput('');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedRadiusKm === btn.val
                  ? 'btn-sprout shadow-xs ring-1 ring-[#1F4B2C]'
                  : 'bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {btn.label}
            </button>
          ))}

          {/* Custom Radius Input */}
          <div className="flex items-center gap-1 ml-1">
            <input
              type="number"
              placeholder="Custom km"
              value={customRadiusInput}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCustomRadiusInput(e.target.value);
                if (!isNaN(val) && val > 0) {
                  setSelectedRadiusKm(val);
                }
              }}
              className="w-20 px-2 py-1 text-xs rounded-xl border border-neutral-300 bg-white"
            />
          </div>
        </div>

        {/* Map Layer Toggles */}
        <div className="flex items-center bg-white/80 p-1 rounded-full border border-neutral-200 shadow-xs shrink-0">
          <button
            onClick={() => setMapLayer('glass-street')}
            className={`px-3 py-1 text-[11px] font-bold rounded-full whitespace-nowrap transition-all ${
              mapLayer === 'glass-street' ? 'bg-[#1F4B2C] text-[#F4FFFC]' : 'text-neutral-600'
            }`}
          >
            Green Glass
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-3 py-1 text-[11px] font-bold rounded-full whitespace-nowrap transition-all ${
              mapLayer === 'satellite' ? 'bg-[#1F4B2C] text-[#F4FFFC]' : 'text-neutral-600'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapLayer('terrain')}
            className={`px-3 py-1 text-[11px] font-bold rounded-full whitespace-nowrap transition-all ${
              mapLayer === 'terrain' ? 'bg-[#1F4B2C] text-[#F4FFFC]' : 'text-neutral-600'
            }`}
          >
            Terrain Topo
          </button>
        </div>

        {/* 15 Municipal Boundaries Overlay Toggle */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowBoundaries(!showBoundaries)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full border whitespace-nowrap transition-all flex items-center gap-1.5 shadow-xs ${
              showBoundaries
                ? 'bg-[#1F4B2C] text-[#C3E956] border-[#4D7111]'
                : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>15 Municipal Boundaries ({showBoundaries ? 'Active' : 'Off'})</span>
          </button>

          {hasValidMapsKey && !mapsQuotaExceeded && (
            <button
              onClick={() => setMapEngine(mapEngine === 'google' ? 'vector' : 'google')}
              className="px-3 py-1.5 text-[11px] font-bold rounded-full border border-[#91EAAF] bg-white text-[#1F4B2C] hover:bg-[#F4FFFC] whitespace-nowrap transition-colors"
            >
              {mapEngine === 'google' ? 'Google Maps Live' : 'Vector GIS View'}
            </button>
          )}
        </div>
      </div>

      {/* Live Route Telemetry Banner (if route active) */}
      {selectedRoute && (
        <div className="glass-dark p-4 rounded-3xl border border-[#C3E956] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#C3E956] text-[#1F4B2C] shadow-sm">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#C3E956]">Active Route Guidance</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white">
                  Mountain Logistics Corridor
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">{selectedRoute.pathDescription}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] text-neutral-300 uppercase font-semibold">Total Distance</span>
              <p className="text-lg font-black text-[#C3E956]">{selectedRoute.distanceKm.toFixed(1)} km</p>
            </div>
            <div>
              <span className="text-[10px] text-neutral-300 uppercase font-semibold">Est. Driving Time</span>
              <p className="text-lg font-black text-white">{selectedRoute.drivingMinutes} mins</p>
            </div>
            <button
              onClick={() => setSelectedRoute(null)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300"
              aria-label="Clear active route"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Map Canvas & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Interactive GIS Spatial Map Canvas */}
        <div className="lg:col-span-3 relative h-[560px] rounded-3xl overflow-hidden border-2 border-[#91EAAF] shadow-xl select-none">
          {useGoogleMapsEngine ? (
            <APIProvider apiKey={mapsApiKey} libraries={['marker']}>
              <GoogleMap
                mapId="DEMO_MAP_ID"
                defaultCenter={{ lat: 16.3861, lng: 121.1065 }}
                defaultZoom={10}
                mapTypeId={
                  mapLayer === 'satellite'
                    ? 'hybrid'
                    : mapLayer === 'terrain'
                    ? 'terrain'
                    : 'roadmap'
                }
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                <GoogleMapOverlays
                  showBoundaries={showBoundaries}
                  selectedMunicipality={selectedMunicipality}
                  onSelectMunicipality={setSelectedMunicipality}
                  userLocation={userLocation}
                  selectedRadiusKm={selectedRadiusKm}
                  selectedRoute={selectedRoute}
                />

                <AdvancedMarker
                  position={{ lat: userLocation.lat, lng: userLocation.lng }}
                  title={`My Hub: ${userLocation.name}`}
                >
                  <div className="px-2.5 py-1 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-black border-2 border-[#C3E956] shadow-lg flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>My Hub</span>
                  </div>
                </AdvancedMarker>

                {visiblePins.map((stakeholder) => {
                  const isSelected = selectedPreviewPin?.id === stakeholder.id;
                  const topCrop = stakeholder.userCommodities[0];
                  return (
                    <AdvancedMarker
                      key={stakeholder.id}
                      position={{ lat: stakeholder.lat, lng: stakeholder.lng }}
                      title={`${stakeholder.name} (${stakeholder.municipality})`}
                      onClick={() => handlePinClick(stakeholder)}
                    >
                      <div className="flex flex-col items-center cursor-pointer">
                        <div
                          className={`px-2 py-1 rounded-full text-[10px] font-black shadow-md flex items-center gap-1 border transition-all ${
                            isSelected
                              ? 'bg-[#1F4B2C] text-[#C3E956] border-[#C3E956] ring-2 ring-[#C3E956] scale-110'
                              : stakeholder.role === 'Farmer'
                              ? 'bg-white text-[#1F4B2C] border-[#4D7111]'
                              : stakeholder.role === 'Supplier'
                              ? 'bg-amber-50 text-amber-900 border-amber-400'
                              : stakeholder.role === 'Buyer'
                              ? 'bg-blue-50 text-blue-900 border-blue-400'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-400'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-[#C3E956]" />
                          <span>{stakeholder.name.split(' ')[0]}</span>
                          {topCrop && (
                            <span className="font-mono text-[9px] text-[#4D7111]">
                              ₱{topCrop.pricePerKg}
                            </span>
                          )}
                        </div>
                        <div className="w-2.5 h-2.5 bg-[#1F4B2C] rotate-45 -mt-1 border border-white" />
                      </div>
                    </AdvancedMarker>
                  );
                })}
              </GoogleMap>
            </APIProvider>
          ) : (
            <>
              {/* Layer Backgrounds */}
              {mapLayer === 'glass-street' && (
                <div className="absolute inset-0 bg-[#EBF7F2] bg-[radial-gradient(#91EAAF_1px,transparent_1px)] [background-size:24px_24px]">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      d="M 30,100 C 45,70 50,45 65,0"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20,95 Q 40,60 55,40 T 70,5"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.8"
                      strokeDasharray="2,2"
                    />
                  </svg>
                </div>
              )}

              {mapLayer === 'satellite' && (
                <div className="absolute inset-0 bg-[#162a1b] bg-[radial-gradient(#275e37_1px,transparent_1px)] [background-size:20px_20px]">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1d13] via-transparent to-[#162a1b]/60" />
                </div>
              )}

              {mapLayer === 'terrain' && (
                <div className="absolute inset-0 bg-[#d8eedf] bg-[radial-gradient(#4D7111_1px,transparent_1px)] [background-size:32px_32px]">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-700 via-emerald-800 to-transparent" />
                </div>
              )}

              {/* Interactive SVG Projection Overlay for Municipal Boundaries, Pins, Geodesic Rings, and Polylines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {showBoundaries && (
                  <g id="municipal-boundaries" className="transition-opacity duration-300">
                    {NUEVA_VIZCAYA_MUNICIPALITIES.map((m) => {
                      const isSelected = selectedMunicipality?.id === m.id;
                      const centroid = projectGpsToSvg(m.centroid.lat, m.centroid.lng);

                      return (
                        <g key={m.id} className="group">
                          <path
                            d={m.svgPolygon}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMunicipality(isSelected ? null : m);
                            }}
                            fill={isSelected ? 'rgba(77, 113, 17, 0.42)' : 'rgba(145, 234, 175, 0.16)'}
                            stroke={isSelected ? '#1F4B2C' : 'rgba(31, 75, 44, 0.45)'}
                            strokeWidth={isSelected ? '1.2' : '0.5'}
                            strokeLinejoin="round"
                            className="cursor-pointer hover:fill-[#91EAAF]/40 hover:stroke-[#1F4B2C] transition-all"
                          />
                          <text
                            x={centroid.x}
                            y={centroid.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="text-[2.6px] font-black fill-[#1F4B2C] pointer-events-none select-none drop-shadow-xs"
                          >
                            {m.name}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}

                {selectedRadiusKm !== 'ALL' && (
                  <circle
                    cx={userSvgPos.x}
                    cy={userSvgPos.y}
                    r={Math.min(48, Math.max(6, (selectedRadiusKm as number) * 0.75))}
                    fill="rgba(145, 234, 175, 0.22)"
                    stroke="#C3E956"
                    strokeWidth="0.8"
                    strokeDasharray="2,2"
                    className="animate-pulse"
                  />
                )}

                {selectedRoute && (
                  <polyline
                    points={`
                      ${userSvgPos.x},${userSvgPos.y}
                      ${(userSvgPos.x + projectGpsToSvg(selectedRoute.to.lat, selectedRoute.to.lng).x) / 2},${(userSvgPos.y + projectGpsToSvg(selectedRoute.to.lat, selectedRoute.to.lng).y) / 2}
                      ${projectGpsToSvg(selectedRoute.to.lat, selectedRoute.to.lng).x},${projectGpsToSvg(selectedRoute.to.lat, selectedRoute.to.lng).y}
                    `}
                    fill="none"
                    stroke="#C3E956"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeDasharray="2,2"
                    className="animate-pulse"
                  />
                )}
              </svg>
            </>
          )}

          {/* Municipal GIS Intelligence & Logistics Card (Floating on Map) */}
          {selectedMunicipality && (
            <div className="absolute top-4 left-4 z-30 w-80 p-4 rounded-3xl glass-dark text-white border-2 border-[#C3E956] shadow-2xl animate-fade-in text-left">
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/20">
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#C3E956]">
                    <Building2 className="w-3 h-3" />
                    LGU Municipal Boundary GIS
                  </div>
                  <h4 className="text-base font-black text-white">{selectedMunicipality.name}</h4>
                  <p className="text-[10px] text-neutral-300 font-medium">
                    {selectedMunicipality.class} • {selectedMunicipality.elevationMeters}m Elev. • {selectedMunicipality.areaKm2} km²
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMunicipality(null)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-2.5 space-y-2 text-xs">
                <p className="text-[11px] text-[#91EAAF] font-medium leading-snug">
                  {selectedMunicipality.specialty}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-neutral-400 font-semibold block">Registered Farmers</span>
                    <span className="text-xs font-bold text-white tabular-nums">{selectedMunicipality.farmerCount.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-neutral-400 font-semibold block">Active Cooperatives</span>
                    <span className="text-xs font-bold text-white tabular-nums">{selectedMunicipality.coopCount} Coops</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-neutral-400 font-semibold block">Est. Annual Yield</span>
                    <span className="text-xs font-bold text-[#C3E956] tabular-nums">{selectedMunicipality.avgYieldTonsYear.toLocaleString()} Tons</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-neutral-400 font-semibold block">Travel to NVAT Bambang</span>
                    <span className="text-xs font-bold text-white tabular-nums">{selectedMunicipality.travelTimeToNvatMins} mins</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-300 font-semibold block mb-1">Key Commodities:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedMunicipality.primaryCrops.map((crop, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C3E956] text-[#1F4B2C]">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/20 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedRoute({
                      from: { lat: userLocation.lat, lng: userLocation.lng, name: userLocation.name },
                      to: { lat: selectedMunicipality.centroid.lat, lng: selectedMunicipality.centroid.lng, name: `${selectedMunicipality.name} Municipal Center` },
                      distanceKm: haversineDistanceKm(userLocation.lat, userLocation.lng, selectedMunicipality.centroid.lat, selectedMunicipality.centroid.lng),
                      drivingMinutes: selectedMunicipality.travelTimeToNvatMins || 25,
                      pathDescription: `Arterial route from ${userLocation.name} to ${selectedMunicipality.name} agricultural corridor`,
                    });
                  }}
                  className="flex-1 py-1.5 rounded-xl btn-sprout text-[11px] font-black text-center shadow-xs"
                >
                  Calculate Route
                </button>
              </div>
            </div>
          )}

          {/* Vector Fallback GPS Pins (shown only when Vector GIS fallback is active) */}
          {!useGoogleMapsEngine && (
            <>
              <div
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing group"
                style={{ left: `${userSvgPos.x}%`, top: `${userSvgPos.y}%` }}
                title={`Your Location: ${userLocation.name}`}
              >
                <div className="relative">
                  <span className="absolute -inset-2 rounded-full bg-[#1F4B2C] opacity-30 animate-ping" />
                  <div className="relative w-9 h-9 rounded-full bg-[#1F4B2C] border-2 border-[#C3E956] shadow-lg flex items-center justify-center text-[#C3E956]">
                    <Navigation className="w-5 h-5 fill-current" />
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956] text-[10px] font-black shadow-md border border-[#91EAAF]">
                    My Hub: {userLocation.name.split('(')[0].trim()}
                  </div>
                </div>
              </div>

              {visiblePins.map((stakeholder) => {
                const pos = projectGpsToSvg(stakeholder.lat, stakeholder.lng);
                const isSelected = selectedPreviewPin?.id === stakeholder.id;
                const topCrop = stakeholder.userCommodities[0];

                return (
                  <div
                    key={stakeholder.id}
                    onClick={() => handlePinClick(stakeholder)}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`px-2 py-1 rounded-full text-[10px] font-black shadow-md flex items-center gap-1 border transition-all ${
                          isSelected
                            ? 'bg-[#1F4B2C] text-[#C3E956] border-[#C3E956] ring-2 ring-[#C3E956] scale-110'
                            : stakeholder.role === 'Farmer'
                            ? 'bg-white text-[#1F4B2C] border-[#4D7111]'
                            : stakeholder.role === 'Supplier'
                            ? 'bg-amber-50 text-amber-900 border-amber-400'
                            : stakeholder.role === 'Buyer'
                            ? 'bg-blue-50 text-blue-900 border-blue-400'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-400'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#C3E956]" />
                        <span>{stakeholder.name.split(' ')[0]}</span>
                        {topCrop && <span className="font-mono text-[9px] text-[#4D7111]">₱{topCrop.pricePerKg}</span>}
                      </div>

                      <div className="w-3 h-3 bg-[#1F4B2C] rotate-45 -mt-1 rounded-xs border border-white" />
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* 1st TAP PREVIEW POPOVER (Anchored on Map) */}
          {selectedPreviewPin && (
            <div
              className="absolute z-30 w-80 glass-light rounded-3xl p-4 shadow-2xl border-2 border-[#91EAAF] animate-fade-in"
              style={{
                left: `${Math.min(75, Math.max(10, projectGpsToSvg(selectedPreviewPin.lat, selectedPreviewPin.lng).x))}%`,
                top: `${Math.min(70, Math.max(10, projectGpsToSvg(selectedPreviewPin.lat, selectedPreviewPin.lng).y + 6))}%`,
              }}
            >
              <div className="flex items-start justify-between pb-2 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    name={selectedPreviewPin.name}
                    avatar={selectedPreviewPin.avatar}
                    role={selectedPreviewPin.role}
                    sizeClass="w-9 h-9"
                    textSizeClass="text-xs"
                    className="border border-[#91EAAF]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#1F4B2C] truncate max-w-[150px]">
                      {selectedPreviewPin.name}
                    </h4>
                    <span className="text-[10px] font-black uppercase text-[#4D7111]">
                      {selectedPreviewPin.role} • {formatDistance(haversineDistanceKm(userLocation.lat, userLocation.lng, selectedPreviewPin.lat, selectedPreviewPin.lng))} away
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPreviewPin(null);
                  }}
                  className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Commodities Summary */}
              <div className="mt-2 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-neutral-500">
                  Active Harvest & Inventory:
                </span>
                {commodities
                  .filter((c) => c.supplierId === selectedPreviewPin.id)
                  .slice(0, 2)
                  .map((c) => (
                    <div key={c.id} className="p-1.5 rounded-xl bg-white/80 border border-neutral-200 text-xs flex justify-between items-center">
                      <span className="font-semibold text-[#1F4B2C] text-[11px] truncate max-w-[140px]">
                        {c.name}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#4D7111]">
                        ₱{c.pricePerKg}/kg ({c.availableKg} kg)
                      </span>
                    </div>
                  ))}
              </div>

              {/* 2-Tap Hint Prompt */}
              <div className="mt-3 p-2 rounded-xl bg-[#C3E956]/20 border border-[#91EAAF] text-center">
                <p className="text-[11px] font-bold text-[#1F4B2C] italic">
                  💡 Tap pin again (or button below) to open full profile & storefront!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setFullProfileUser(selectedPreviewPin);
                    setSelectedPreviewPin(null);
                  }}
                  className="py-1.5 rounded-full btn-forest text-[11px] font-bold text-center"
                >
                  Full Storefront
                </button>
                <button
                  onClick={() => handleShowRoute(selectedPreviewPin)}
                  className="py-1.5 rounded-full btn-sprout text-[11px] font-bold text-center flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  Show Route
                </button>
              </div>
            </div>
          )}

          {/* Map Overlay Controls (Watermark & Coordinates) */}
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full glass-light text-[10px] font-semibold text-[#1F4B2C] border border-[#91EAAF] shadow-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C3E956] animate-pulse" />
            <span>Nueva Vizcaya Hub: 16.4830° N, 121.1500° E</span>
          </div>
        </div>

        {/* Sidebar: Visible Stakeholders List within Radius */}
        <div className="glass-light p-4 rounded-3xl border border-[#91EAAF] shadow-md flex flex-col h-[560px]">
          <div className="pb-3 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#1F4B2C]">
                Nearby Hubs ({visiblePins.length})
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C3E956]/30 text-[#1F4B2C]">
                {selectedRadiusKm === 'ALL' ? 'All NV' : `Within ${selectedRadiusKm}km`}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
              Ranked by proximity to your current GPS
            </p>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
            {visiblePins
              .sort((a, b) => a.distanceKm - b.distanceKm)
              .map((s) => (
                <div
                  key={s.id}
                  onClick={() => handlePinClick(s)}
                  className="p-3 rounded-2xl bg-white/80 border border-neutral-200 hover:border-[#91EAAF] hover:shadow-xs transition-all cursor-pointer text-left"
                >
                  <div className="flex items-start gap-2.5">
                    <UserAvatar
                      name={s.name}
                      avatar={s.avatar}
                      role={s.role}
                      sizeClass="w-8 h-8"
                      textSizeClass="text-[10px]"
                      className="border border-[#91EAAF] mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#1F4B2C] truncate">{s.name}</h4>
                        <span className="font-mono text-[10px] font-bold text-[#4D7111] shrink-0">
                          {formatDistance(s.distanceKm)}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500">{s.municipality} • {s.role}</p>

                      {s.userCommodities.length > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-600 font-medium">
                          <span className="px-1.5 py-0.2 rounded-sm bg-neutral-100 font-bold">
                            {s.userCommodities[0].name.split(' ')[0]}
                          </span>
                          <span>₱{s.userCommodities[0].pricePerKg}/kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 2nd TAP FULL PROFILE & STOREFRONT MODAL */}
      {fullProfileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl glass-light rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#91EAAF] my-8 max-h-[90vh] overflow-y-auto text-left">
            <button
              onClick={() => setFullProfileUser(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-500"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-neutral-200">
              <UserAvatar
                name={fullProfileUser.name}
                avatar={fullProfileUser.avatar}
                role={fullProfileUser.role}
                sizeClass="w-20 h-20"
                textSizeClass="text-xl"
                className="border-4 border-[#91EAAF] shadow-md"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-[#1F4B2C] text-[#C3E956]">
                    {fullProfileUser.role}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Stakeholder
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[#1F4B2C] tracking-tight">
                  {fullProfileUser.name}
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  {fullProfileUser.organization || fullProfileUser.farmOrWarehouseName || 'Nueva Vizcaya Agricultural Producer'}
                </p>
                <div className="flex items-center gap-3 text-xs text-neutral-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#4D7111]" />
                    {fullProfileUser.municipality}, {fullProfileUser.barangay}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#4D7111]" />
                    {fullProfileUser.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="py-4 border-b border-neutral-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Agronomic Bio & Farm Profile
              </h4>
              <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                {fullProfileUser.bio}
              </p>
            </div>

            {/* Full Catalog of Posted Commodities */}
            <div className="py-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F4B2C]">
                Active Commodity Catalog ({commodities.filter((c) => c.supplierId === fullProfileUser.id).length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {commodities
                  .filter((c) => c.supplierId === fullProfileUser.id)
                  .map((crop) => (
                    <div
                      key={crop.id}
                      className="p-3.5 rounded-2xl bg-white border border-[#91EAAF]/60 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1F4B2C] text-[#C3E956]">
                            {crop.category}
                          </span>
                          <span className="font-mono text-sm font-black text-[#1F4B2C]">
                            ₱{crop.pricePerKg}/kg
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-[#1F4B2C] mt-2 leading-snug">
                          {crop.name}
                        </h5>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Available: <span className="font-bold text-neutral-700">{crop.availableKg.toLocaleString()} kg</span>
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          Harvest Date: {crop.harvestDate}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-100 flex gap-2">
                        <button
                          onClick={() => {
                            setFullProfileUser(null);
                            setActiveOrderModalItem(crop);
                          }}
                          className="flex-1 py-1.5 rounded-xl btn-sprout text-xs font-black"
                        >
                          Order / Buy Now
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Storefront Actions */}
            <div className="pt-4 border-t border-neutral-200 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  handleShowRoute(fullProfileUser);
                  setFullProfileUser(null);
                }}
                className="py-2.5 px-4 rounded-full btn-sprout text-xs font-bold flex items-center gap-1.5"
              >
                <Navigation className="w-4 h-4 text-[#1F4B2C]" />
                Show Route to Farm / Facility
              </button>

              <button
                onClick={() => {
                  setFullProfileUser(null);
                  setActiveTab('messages');
                }}
                className="py-2.5 px-4 rounded-full btn-forest text-xs font-bold flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-[#C3E956]" />
                Chat Privately with Stakeholder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
