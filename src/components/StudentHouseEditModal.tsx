import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { X, Save } from 'lucide-react';
import type { StudentApartment } from '../types';

interface StudentHouseEditModalProps {
  buildingId: string;
  onClose: () => void;
}

const StudentHouseEditModal: React.FC<StudentHouseEditModalProps> = ({ buildingId, onClose }) => {
  const { students, batchUpdateStudents, role } = useAppContext();
  const [apartments, setApartments] = useState<StudentApartment[]>([]);
  const isEditor = role === 'Editor';

  useEffect(() => {
    // Get all active student apartments for this building
    const filtered = students.filter(s => s.building_id === buildingId);
    // Sort them by apartment number to keep order consistent
    const sorted = [...filtered].sort((a, b) => a.apartment_num - b.apartment_num);
    setApartments(sorted);
  }, [buildingId, students]);

  const handleChange = (id: string, field: keyof StudentApartment, value: any) => {
    setApartments(prev => prev.map(apt => {
      if (apt.id === id) {
        return { ...apt, [field]: value };
      }
      return apt;
    }));
  };

  const handleSave = async () => {
    if (!isEditor) return;
    await batchUpdateStudents(apartments);
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
        backgroundColor: '#0f172a', width: '90%', maxWidth: '1000px',
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
              🏠 בניין {buildingId} (סטודנטים)
            </h2>
            <button className="btn btn-primary" style={{
              background: '#a78bfa', border: 'none', borderRadius: '4px',
              color: '#fff', padding: '6px 12px', cursor: 'default', fontSize: '14px'
            }}>
              📋 דירות
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#94a3b8' }}>מספר דירות:</span>
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

          <div style={{ overflowX: 'auto' }}>
            <table className="at" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>דירה</th>
                  <th>שם דייר</th>
                  <th>שכ"ד</th>
                  <th>ארנונה</th>
                  <th>מים (מונה)</th>
                  <th>סיום חוזה</th>
                </tr>
              </thead>
              <tbody>
                {apartments.map((apt, index) => (
                  <tr key={apt.id}>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                    <td>
                      <input 
                        type="number" 
                        value={apt.apartment_num} 
                        onChange={e => handleChange(apt.id, 'apartment_num', Number(e.target.value))}
                        className="apt-in"
                        disabled={!isEditor}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={apt.tenant_name || ''} 
                        onChange={e => handleChange(apt.id, 'tenant_name', e.target.value)}
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
                      <input 
                        type="text" 
                        value={apt.arnona_id || ''} 
                        onChange={e => handleChange(apt.id, 'arnona_id', e.target.value)}
                        className="apt-in"
                        disabled={!isEditor}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={apt.water_id || ''} 
                        onChange={e => handleChange(apt.id, 'water_id', e.target.value)}
                        className="apt-in"
                        disabled={!isEditor}
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
                background: '#8b5cf6', border: 'none', padding: '10px 40px',
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

export default StudentHouseEditModal;
