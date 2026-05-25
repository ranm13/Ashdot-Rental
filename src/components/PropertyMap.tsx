import React, { useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext';
import { Plus, X } from 'lucide-react';

// Fix missing marker icons in leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map click listener component
const MapClickHandler: React.FC<{ onClick: (e: L.LeafletMouseEvent) => void }> = ({ onClick }) => {
  useMapEvents({
    click: onClick,
  });
  return null;
};

const PropertyMap: React.FC = () => {
  const { role, residents, students, buildings, addBuilding } = useAppContext();
  const [clickCoords, setClickCoords] = useState<{ x: number; y: number } | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [customHouse, setCustomHouse] = useState<string>('');

  const isEditor = role === 'Admin';

  // The original image was 1200x859
  const iw = 1200;
  const ih = 859;
  const bounds: L.LatLngBoundsExpression = [[0, 0], [ih, iw]];

  // Find info for a building
  const getBuildingInfo = (h: number) => {
    const r = residents.filter(res => res.building_id === String(h) && res.is_active);
    const s = students.filter(stu => stu.building_id === String(h) && stu.is_active);
    return { resCount: r.length, stuCount: s.length };
  };

  // Get all unique building/house numbers from the current apartments
  const allApartmentHouseNumbers = Array.from(new Set([
    ...residents.filter(r => r.is_active).map(r => Number(r.building_id)),
    ...students.filter(s => s.is_active).map(s => Number(s.building_id))
  ])).filter(h => !isNaN(h) && h > 0);

  // Filter those that do not have coordinates on the map yet (or are at 0, 0)
  const unplacedHouseNumbers = allApartmentHouseNumbers.filter(hNum => {
    const b = buildings.find(bld => Number(bld.house_number) === hNum);
    return !b || (b.map_x === 0 && b.map_y === 0);
  }).sort((a, b) => a - b);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!isEditor) return;
    const clickX = Math.round(e.latlng.lng);
    const clickY = Math.round(ih - e.latlng.lat);
    setClickCoords({ x: clickX, y: clickY });
    
    // Default to the first unplaced house number if available
    if (unplacedHouseNumbers.length > 0) {
      setSelectedHouse(String(unplacedHouseNumbers[0]));
    } else {
      setSelectedHouse('custom');
    }
  };

  const handleSaveBuilding = async () => {
    if (!clickCoords) return;
    const finalHouse = selectedHouse === 'custom' ? customHouse : selectedHouse;
    const houseNum = Number(finalHouse);

    if (isNaN(houseNum) || houseNum <= 0) {
      alert('אנא הזן מספר בית תקין');
      return;
    }

    try {
      await addBuilding({
        house_number: houseNum,
        map_x: clickCoords.x,
        map_y: clickCoords.y
      });
      setClickCoords(null);
      setCustomHouse('');
    } catch (err) {
      console.error(err);
      alert('שגיאה בשמירת נקודת המפה');
    }
  };

  return (
    <div style={{ flex: 1, position: 'relative', background: '#0a0f1e', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Editor Tip Banner */}
      {isEditor && (
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '10px 20px',
          color: '#93c5fd',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'right',
          direction: 'rtl'
        }}>
          💡 **מצב עריכה פעיל**: לחץ במיקום כלשהו במפה כדי למקם נקודת ציון לבית.
        </div>
      )}

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer 
          crs={L.CRS.Simple} 
          bounds={bounds} 
          maxZoom={2} 
          style={{ height: '100%', width: '100%', background: '#0a0f1e' }}
        >
          <ImageOverlay url="/map.jpg" bounds={bounds} />
          
          {/* Map click handler listener */}
          {isEditor && <MapClickHandler onClick={handleMapClick} />}

          {/* Temporary/Placing Marker */}
          {clickCoords && (
            <Marker 
              position={[ih - clickCoords.y, clickCoords.x]} 
              icon={L.divIcon({
                className: 'temp-marker',
                html: `<div style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background-color: #ef4444;
                  color: #ffffff;
                  font-weight: 800;
                  font-size: 11px;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  border: 2px solid #ffffff;
                  box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
                ">+</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            />
          )}
          
          {buildings.map((b: any) => {
            const x = b.map_x;
            const y = b.map_y;
            
            // Only render valid, non-zero positions on the map
            if (x === undefined || y === undefined || (x === 0 && y === 0)) return null;
            
            const lat = ih - y;
            const lng = x;
            const info = getBuildingInfo(Number(b.house_number));

            const isRes = info.resCount > 0;
            const isStu = info.stuCount > 0;
            let bgColor = '#64748b'; // Gray
            let glowColor = 'rgba(100, 116, 139, 0.6)';
            
            if (isRes && isStu) {
              bgColor = '#ec4899'; // Pink
              glowColor = 'rgba(236, 72, 153, 0.8)';
            } else if (isRes) {
              bgColor = '#a78bfa'; // Purple
              glowColor = 'rgba(167, 139, 250, 0.8)';
            } else if (isStu) {
              bgColor = '#3b82f6'; // Blue
              glowColor = 'rgba(59, 130, 246, 0.8)';
            }

            const markerIcon = L.divIcon({
              className: 'custom-leaflet-marker',
              html: `<div style="
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: ${bgColor};
                color: #ffffff;
                font-family: inherit;
                font-weight: 800;
                font-size: 12px;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                border: 2px solid #ffffff;
                box-shadow: 0 0 10px ${glowColor};
                text-align: center;
                cursor: pointer;
              ">${b.house_number}</div>`,
              iconSize: [26, 26],
              iconAnchor: [13, 13]
            });

            return (
              <Marker key={b.id} position={[lat, lng]} icon={markerIcon}>
                <Popup>
                  <div style={{ direction: 'rtl', textAlign: 'right', fontFamily: 'inherit' }}>
                    <strong>בית מס' {b.house_number}</strong>
                    <br />
                    דירות תושבים: {info.resCount}
                    <br />
                    דירות סטודנטים: {info.stuCount}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Point Creation Side Modal */}
      {clickCoords && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '20px',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '20px',
          zIndex: 1000,
          width: '320px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          color: '#f8fafc',
          direction: 'rtl'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>📍 מיקום נקודת ציון</h3>
            <button onClick={() => setClickCoords(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '15px' }}>
            מיקום שנבחר במפה: X: {clickCoords.x}, Y: {clickCoords.y}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>בחר מספר בית משוייך:</label>
            <select
              value={selectedHouse}
              onChange={e => setSelectedHouse(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#fff',
                marginBottom: '10px'
              }}
            >
              {unplacedHouseNumbers.map(hNum => (
                <option key={hNum} value={hNum}>בית {hNum} (דירות קיימות ללא מיקום)</option>
              ))}
              <option value="custom">מספר בית אחר / חדש...</option>
            </select>

            {selectedHouse === 'custom' && (
              <input
                type="number"
                placeholder="הזן מספר בית"
                value={customHouse}
                onChange={e => setCustomHouse(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#fff'
                }}
              />
            )}
          </div>

          <button
            onClick={handleSaveBuilding}
            style={{
              width: '100%',
              background: '#22c55e',
              border: 'none',
              padding: '10px',
              borderRadius: '6px',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} />
            שמור נקודה במפה
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
