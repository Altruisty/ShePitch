'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Search, MapPin, Building2, RotateCcw, Sparkles } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface Venue {
  name: string;
  lat: number;
  lng: number;
  location: string;
  isVenue: boolean;
  description: string;
  date: string;
}

interface College {
  name: string;
  lat: number;
  lng: number;
  location: string;
  teams?: number;
  students?: number;
}

interface ChennaiCollegeMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChennaiCollegeMapModal({ isOpen, onClose }: ChennaiCollegeMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [venue, setVenue] = useState<Venue | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);

  // Fetch college coordinates and venue from API
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    fetch('/api/colleges/map')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && data.success) {
          setVenue(data.venue);
          setColleges(data.colleges || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load colleges for map:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen || loading || !mapContainerRef.current) return;

    let L: any;
    let isCancelled = false;

    import('leaflet').then((leafletModule) => {
      if (isCancelled || !mapContainerRef.current) return;
      L = leafletModule.default || leafletModule;

      // Clean up previous map if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }

      const defaultCenter: [number, number] = venue
        ? [venue.lat, venue.lng]
        : [12.8718, 80.2206]; // Jeppiaar University center

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 11,
        minZoom: 9,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Add CartoDB Voyager Tile Layer (clean, high performance)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Jeppiaar University Pin - RED
      if (venue) {
        const redVenueIcon = L.divIcon({
          className: 'custom-jeppiaar-marker',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
              <div style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background-color: rgba(239, 68, 68, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: rgba(220, 38, 38, 0.2); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
              <div style="position: relative; z-index: 10; width: 32px; height: 32px; border-radius: 9999px; background: linear-gradient(135deg, #ef4444, #b91c1c); border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 14px;">
                ★
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          popupAnchor: [0, -22],
        });

        const venuePopupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px 2px; min-width: 220px;">
            <div style="display: inline-block; padding: 3px 8px; border-radius: 9999px; background-color: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
              HOST VENUE &bull; GRAND FINALE
            </div>
            <div style="font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 3px; line-height: 1.2;">
              ${venue.name}
            </div>
            <div style="font-size: 11px; color: #4b5563; margin-bottom: 6px; line-height: 1.3;">
              ${venue.location}
            </div>
            <div style="border-top: 1px solid #f3f4f6; padding-top: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
              <span style="color: #6b7280; font-weight: 500;">Event Date:</span>
              <span style="font-weight: 700; color: #b91c1c;">19 Sept 2026, 9:00 AM</span>
            </div>
          </div>
        `;

        const venueMarker = L.marker([venue.lat, venue.lng], { icon: redVenueIcon })
          .addTo(map)
          .bindPopup(venuePopupContent);

        markersRef.current.push({ name: venue.name, marker: venueMarker });
      }

      // Surrounding Colleges - GREEN
      colleges.forEach((col) => {
        const greenCollegeIcon = L.divIcon({
          className: 'custom-college-marker',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;">
              <div style="position: absolute; width: 26px; height: 26px; border-radius: 9999px; background-color: rgba(16, 185, 129, 0.25);"></div>
              <div style="position: relative; z-index: 10; width: 22px; height: 22px; border-radius: 9999px; background: linear-gradient(135deg, #10b981, #059669); border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 10px;">
                ●
              </div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15],
        });

        const teamText = col.teams ? `${col.teams} Team${col.teams > 1 ? 's' : ''}` : 'Active Teams';

        const collegePopupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px 2px; min-width: 200px;">
            <div style="display: inline-block; padding: 2px 7px; border-radius: 9999px; background-color: #d1fae5; color: #047857; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px;">
              PARTICIPATING COLLEGE
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 2px; line-height: 1.2;">
              ${col.name}
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 6px;">
              ${col.location}
            </div>
            <div style="border-top: 1px solid #f3f4f6; padding-top: 5px; display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
              <span style="color: #6b7280;">Registrations:</span>
              <span style="font-weight: 700; color: #059669; background-color: #ecfdf5; padding: 1px 6px; border-radius: 6px;">${teamText}</span>
            </div>
          </div>
        `;

        const marker = L.marker([col.lat, col.lng], { icon: greenCollegeIcon })
          .addTo(map)
          .bindPopup(collegePopupContent);

        markersRef.current.push({ name: col.name, marker });
      });

      // Force size invalidation to render tiles properly
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, [isOpen, loading, venue, colleges]);

  // Center on Jeppiaar University
  const handleResetToJeppiaar = () => {
    if (mapInstanceRef.current && venue) {
      mapInstanceRef.current.flyTo([venue.lat, venue.lng], 12, { duration: 1.2 });
      const venueMarker = markersRef.current.find((m) => m.name === venue.name);
      if (venueMarker) {
        setTimeout(() => venueMarker.marker.openPopup(), 1300);
      }
    }
    setSelectedCollege(null);
  };

  // Fly to specific college
  const handleFocusCollege = (col: College) => {
    setSelectedCollege(col.name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([col.lat, col.lng], 14, { duration: 1.2 });
      const found = markersRef.current.find((m) => m.name === col.name);
      if (found) {
        setTimeout(() => found.marker.openPopup(), 1300);
      }
    }
  };

  // Filtered colleges list
  const filteredColleges = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-5xl w-full h-[92vh] max-h-[850px] flex flex-col overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white/95 backdrop-blur shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-100 text-[#6C3B8F]">
                <MapPin className="w-4 h-4 text-[#6C3B8F]" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                Chennai Colleges Map
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-[#6C3B8F] border border-purple-100">
                <Sparkles className="w-3 h-3 text-[#E83E8C]" /> Live Footprint
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Center venue at <strong className="text-red-600">Jeppiaar University</strong> with registered colleges across Chennai
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend & Search Subheader */}
        <div className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {/* Legend Items */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border border-white"></span>
              </span>
              <span className="font-semibold text-gray-800">Jeppiaar University</span>
              <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-full">
                Grand Finale Venue
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white shadow-sm"></span>
              <span className="font-semibold text-gray-800">Participating Colleges</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                {colleges.length} Campuses
              </span>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search college or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]/30 focus:border-[#6C3B8F]"
              />
            </div>
            <button
              onClick={handleResetToJeppiaar}
              title="Reset center to Jeppiaar University"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-500" />
              <span>Center Venue</span>
            </button>
          </div>
        </div>

        {/* Map View Area */}
        <div className="relative flex-1 w-full bg-slate-100 overflow-hidden min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="w-10 h-10 border-4 border-[#6C3B8F] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-gray-600 mt-3">Loading Chennai map & colleges...</p>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full z-10" />
        </div>

        {/* College Quick-Select Footer Tray */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#6C3B8F]" />
              Colleges List ({filteredColleges.length})
            </span>
            <span className="text-[11px] text-gray-500">
              Click any college to pan and view pin
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200">
            {/* Jeppiaar Quick Center Pill */}
            <button
              onClick={handleResetToJeppiaar}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all cursor-pointer shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              🏛️ Jeppiaar University (Host)
            </button>

            {/* Other Colleges Pills */}
            {filteredColleges.map((col) => {
              const isSelected = selectedCollege === col.name;
              return (
                <button
                  key={col.name}
                  onClick={() => handleFocusCollege(col)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-md'
                      : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 hover:border-emerald-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                  <span className="max-w-[160px] truncate">{col.name}</span>
                  {col.teams && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {col.teams}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
