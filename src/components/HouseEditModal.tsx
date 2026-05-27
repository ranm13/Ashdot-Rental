import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { X, Save } from 'lucide-react';
import type { ResidentApartment } from '../types';

interface HouseEditModalProps {
  buildingId: string;
  onClose: () => void;
}

const HouseEditModal: React.FC<HouseEditModalProps> = ({ buildingId, onClose }) => {
  const { residents, batchUpdateResidents, role, buildings, updateBuilding } = useAppContext();
  const [apartments, setApartments] = useState<ResidentApartment[]>([]);
  const isEditor = role === 'Admin';
  
  const buildingObj = buildings.find(b => b.id === buildingId);
  const [physicalUnits, setPhysicalUnits] = useState(buildingObj?.units_per_building || 4);

  useEffect(() => {
    // Get all active apartments for this building
    const filtered = residents.filter(r => r.building_id === buildingId);
    // Sort them by apartment name or id to keep order consistent
    const sorted = [...filtered].sort((a, b) => a.apartment_name.localeCompare(b.apartment_name));
    setApartments(sorted);
  }, [buildingId, residents]);

  useEffect(() => {
    if (buildingObj) {
      setPhysicalUnits(buildingObj.units_per_building);
    }
  }, [buildingObj]);

  const handleChange = (id: string, field: keyof ResidentApartment, value: any) => {
    setApartments(prev => prev.map(apt => {
      if (apt.id === id) {
        return { ...apt, [field]: value };
      }
      return apt;
    }));
  };

  const handleSave = async () => {
    if (!isEditor) return;
    await batchUpdateResidents(apartments);
    if (buildingObj && Number(physicalUnits) !== buildingObj.units_per_building) {
      await updateBuilding(buildingId, Number(physicalUnits));
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#0f172a', width: '90%', maxWidth: '1200px',
        maxHeight: '90vh', borderRadius: '12px', border: '1px solid #334155',
        display: 'flex', flexDirection: 'column', color: '#f8fafc',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px', borderBottom: '1px solid #1e293b'
        }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            cursor: 'pointer', padding: '4px'
          }}>
            <X size={24} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏠 בית {buildingId}
            </h2>
            <button className="btn btn-primary" style={{
              background: '#3b82f6', border: 'none', borderRadius: '4px',
              color: '#fff', padding: '6px 12px', cursor: 'default', fontSize: '14px'
            }}>
              📋 דירות
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, direction: 'rtl' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#94a3b8' }}>דירות רשומות במערכת:</span>
              <input 
                type="text" 
                readOnly 
                value={apartments.length} 
                style={{
                  width: '60px', backgroundColor: '#1e293b', border: '1px solid #334155',
                  color: '#a78bfa', borderRadius: '4px', textAlign: 'center', padding: '4px'
                }} 
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#94a3b8' }}>דירות בבניין (פיזית) *:</span>
              <input 
                type="number" 
                value={physicalUnits} 
                onChange={e => setPhysicalUnits(Number(e.target.value))}
                disabled={!isEditor}
                style={{
                  width: '60px', backgroundColor: '#1e293b', border: '1px solid #334155',
                  color: '#3b82f6', borderRadius: '4px', textAlign: 'center', padding: '4px',
                  fontWeight: 'bold'
                }} 
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="at" style={{ width: '100%', minWidth: '1400px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>דירה</th>
                  <th>קומה</th>
                  <th style={{ width: '250px' }}>פרטי דייר (שם, טלפון, מייל)</th>
                  <th>בעלי הדירה</th>
                  <th>סוג בעלות</th>
                  <th>סטטוס שיוך</th>
                  <th>מ"ר</th>
                  <th>שכ"ד</th>
                  <th>למי משלמים</th>
                  <th>מונים (W/E)</th>
                  <th>ארנונה</th>
                  <th>סיום חוזה</th>
                </tr>
              </thead>
              <tbody>
                {apartments.map((apt, index) => (
                  <tr key={apt.id}>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                    <td>
                      <input 
                        type="text" 
                        value={apt.apartment_name} 
                        onChange={e => handleChange(apt.id, 'apartment_name', e.target.value)}
                        className="apt-in"
                        disabled={!isEditor}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={apt.floor || ''} 
                        onChange={e => handleChange(apt.id, 'floor', e.target.value)}
                        className="apt-in"
                        disabled={!isEditor}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input 
                          type="text" 
                          value={apt.tenant_name || ''} 
                          placeholder="שם דייר"
                          onChange={e => handleChange(apt.id, 'tenant_name', e.target.value)}
                          className="apt-in"
                          disabled={!isEditor}
                          style={{ width: '100%', fontSize: '13px' }}
                        />
                        <input 
                          type="text" 
                          value={apt.phone || ''} 
                          placeholder="טלפון"
                          onChange={e => handleChange(apt.id, 'phone', e.target.value)}
                          className="apt-in"
                          disabled={!isEditor}
                          style={{ width: '100%', fontSize: '12px', padding: '2px 6px' }}
                        />
                        <input 
                          type="email" 
                          value={apt.email || ''} 
                          placeholder="אימייל"
                          onChange={e => handleChange(apt.id, 'email', e.target.value)}
                          className="apt-in"
                          disabled={!isEditor}
                          style={{ width: '100%', fontSize: '12px', padding: '2px 6px' }}
                        />
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={apt.owner_name || ''} 
                        onChange={e => handleChange(apt.id, 'owner_name', e.target.value)}
                        className="apt-in"
                        disabled={!isEditor}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <select
                        value={apt.owner_type || 'קיבוץ'}
                        onChange={e => handleChange(apt.id, 'owner_type', e.target.value)}
                        disabled={!isEditor}
                        className="apt-in"
                        style={{ width: '100%', padding: '6px', background: '#0f172a' }}
                      >
                        <option value="קיבוץ">קיבוץ</option>
                        <option value="חבר משק">חבר משק</option>
                        <option value="יורשים">יורשים</option>
                        <option value="בעלות מעורבת">בעלות מעורבת</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={apt.allocation_status || 'לא משויך'}
                        onChange={e => handleChange(apt.id, 'allocation_status', e.target.value)}
                        disabled={!isEditor}
                        className="apt-in"
                        style={{ width: '100%', padding: '6px', background: '#0f172a' }}
                      >
                        <option value="לא משויך">לא משויך</option>
                        <option value="משויך">משויך</option>
                        <option value="בפוטנציאל לשיוך / שיווק לנקלטים">בפוטנציאל לשיוך</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={apt.square_meters ?? ''} 
                        onChange={e => handleChange(apt.id, 'square_meters', e.target.value ? Number(e.target.value) : null)}
                        placeholder='מ"ר'
                        className="apt-in"
                        disabled={!isEditor}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={apt.rent ?? ''} 
                        onChange={e => handleChange(apt.id, 'rent', e.target.value ? Number(e.target.value) : null)}
                        placeholder='שכ"ד'
                        className="apt-in"
                        disabled={!isEditor}
                        style={{ width: '100%', color: '#22c55e', fontWeight: 'bold' }}
                      />
                    </td>
                    <td>
                      <select
                        value={apt.payment_dest || 'קיבוץ'}
                        onChange={e => handleChange(apt.id, 'payment_dest', e.target.value)}
                        disabled={!isEditor}
                        className="apt-in"
                        style={{ width: '100%', padding: '6px', background: '#0f172a' }}
                      >
                        <option value="קיבוץ">קיבוץ</option>
                        <option value="יורשים בניהול הקיבוץ">יורשים בניהול</option>
                        <option value="ישירות ליורשים">ישירות ליורשים</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#3b82f6', fontSize: '11px', width: '15px' }}>W</span>
                          <input 
                            type="text" 
                            value={apt.water_id || ''} 
                            placeholder="מים"
                            onChange={e => handleChange(apt.id, 'water_id', e.target.value)}
                            className="apt-in"
                            disabled={!isEditor}
                            style={{ width: '80px', fontSize: '11px', padding: '2px 4px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#f59e0b', fontSize: '11px', width: '15px' }}>E</span>
                          <input 
                            type="text" 
                            value={apt.electricity_id || ''} 
                            placeholder="חשמל"
                            onChange={e => handleChange(apt.id, 'electricity_id', e.target.value)}
                            className="apt-in"
                            disabled={!isEditor}
                            style={{ width: '80px', fontSize: '11px', padding: '2px 4px' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={apt.arnona_id || ''} 
                        onChange={e => handleChange(apt.id, 'arnona_id', e.target.value)}
                        className="apt-in"
                        disabled={!isEditor}
                        placeholder="ארנונה"
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={apt.contract_end || ''} 
                        onChange={e => handleChange(apt.id, 'contract_end', e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="apt-in"
                        disabled={!isEditor}
                        style={{ width: '100%' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        {isEditor && (
          <div style={{
            padding: '15px 20px', borderTop: '1px solid #1e293b',
            display: 'flex', justifyContent: 'center'
          }}>
            <button 
              onClick={handleSave} 
              className="btn btn-primary"
              style={{
                background: '#2563eb', border: 'none', padding: '10px 40px',
                borderRadius: '6px', color: '#fff', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '16px', display: 'flex',
                alignItems: 'center', gap: '8px', width: '100%'
              }}
            >
              <Save size={18} />
              שמור כל השינויים 💾
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseEditModal;
