import React from 'react';
import { MapContainer, ImageOverlay, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppContext } from '../context/AppContext';

// Fix missing marker icons in leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PropertyMap: React.FC = () => {
  const { residents, students, buildings } = useAppContext();

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

  return (
    <div style={{ flex: 1, position: 'relative', background: '#0a0f1e' }}>
      <MapContainer 
        crs={L.CRS.Simple} 
        bounds={bounds} 
        maxZoom={2} 
        style={{ height: '100%', width: '100%', background: '#0a0f1e' }}
      >
        <ImageOverlay url="/map.jpg" bounds={bounds} />
        
        {buildings.map((b: any) => {
          const x = b.map_x;
          const y = b.map_y;
          
          if (x === undefined || y === undefined) return null;
          
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
                <div style={{ direction: 'rtl', textAlign: 'right' }}>
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
  );
};

export default PropertyMap;
