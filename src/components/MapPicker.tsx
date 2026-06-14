import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface MapPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (val: { lat: number; lng: number }) => void;
}

// Google Maps rendering block
function GoogleMapPicker({ value, onChange }: MapPickerProps) {
  const initLat = value?.lat || -6.8915;
  const initLng = value?.lng || 107.6107;

  return (
    <div className="h-[250px] md:h-[300px] border-2 border-black relative" id="google-maps-container">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={{ lat: initLat, lng: initLng }}
          defaultZoom={13}
          mapId="BUYER_ADDRESS_CHOOSE"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          onClick={(e) => {
            if (e.detail?.latLng) {
              onChange({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
            }
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <AdvancedMarker 
            position={{ lat: initLat, lng: initLng }}
            draggable={true}
            onDragEnd={(e) => {
              if (e.latLng) {
                onChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
              }
            }}
          >
            <Pin background="#ea4335" glyphColor="#fff" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}

// Leaflet fallback block (loaded dynamically to avoid bundling issues)
function LeafletMapPicker({ value, onChange }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // Load Leaflet CSS
    const linkId = 'leaflet-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const scriptId = 'leaflet-js';
    let scriptPromise = Promise.resolve();
    if (!document.getElementById(scriptId)) {
      scriptPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    }

    scriptPromise.then(() => {
      if (!active) return;
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      const initLat = value?.lat || -6.8915;
      const initLng = value?.lng || 107.6107;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map instance
      const map = L.map(mapContainerRef.current).setView([initLat, initLng], 13);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Create primary draggable marker
      // Using generic fallback inline rendering or custom icon to bypass cross-origin icon missing in Leaflet CDM
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #ea4335; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([initLat, initLng], { 
        draggable: true,
        icon: customIcon
      }).addTo(map);
      markerRef.current = marker;

      // Update coordinates when marker is dragged
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange({ lat: pos.lat, lng: pos.lng });
      });

      // Update coordinates on map click
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onChange({ lat, lng });
      });
    }).catch(err => {
      if (active) {
        console.error("Leaflet load error", err);
        setLoadError("Gagal merender peta fallback.");
      }
    });

    return () => {
      active = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position if value prop shifts externally
  useEffect(() => {
    const L = (window as any).L;
    if (L && mapInstanceRef.current && markerRef.current && value) {
      const curLatLng = markerRef.current.getLatLng();
      if (curLatLng.lat !== value.lat || curLatLng.lng !== value.lng) {
        markerRef.current.setLatLng([value.lat, value.lng]);
        mapInstanceRef.current.panTo([value.lat, value.lng]);
      }
    }
  }, [value]);

  if (loadError) {
    return (
      <div className="h-[250px] md:h-[300px] border-2 border-black bg-gray-100 flex items-center justify-center p-4 text-center font-mono text-[11px] text-red-800">
        <div>
          <p className="font-bold">⚠️ {loadError}</p>
          <p className="mt-1 text-gray-500 text-[10px]">Silakan masukkan koordinat lat/lng secara manual di formulir bawah.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-black relative" id="leaflet-maps-box">
      <div 
        ref={mapContainerRef} 
        className="w-full h-[250px] md:h-[300px]"
        style={{ zIndex: 1 }}
      />
      <div className="absolute bottom-2 left-2 bg-black text-[#fdfcf7] px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase z-[1000] border border-black max-w-[280px]">
        📍 Peta Satelit Terbuka (Leaflet Fallback)
      </div>
    </div>
  );
}

export default function MapPicker({ value, onChange }: MapPickerProps) {
  return (
    <div className="space-y-2">
      {hasValidKey ? (
        <GoogleMapPicker value={value} onChange={onChange} />
      ) : (
        <div className="space-y-3">
          <LeafletMapPicker value={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
