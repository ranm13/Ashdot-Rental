import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { X, Wrench } from 'lucide-react';

interface MaintenanceModalProps {
  buildingId: string;
  onClose: () => void;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ buildingId, onClose }) => {
  const { maintenanceIssues, addMaintenanceIssue, softDeleteMaintenanceIssue, role } = useAppContext();
  const isEditor = role === 'Editor';

  const [type, setType] = useState('מדרגות');
  const [status, setStatus] = useState('לטפל');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(0);
  const [date, setDate] = useState('');
  const [supplier, setSupplier] = useState('');
  const [category, setCategory] = useState<'external' | 'internal'>('external');

  // Filter issues for this building
  const issues = maintenanceIssues.filter(m => m.building_id === buildingId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditor) return;

    await addMaintenanceIssue({
      building_id: buildingId,
      type,
      status,
      description,
      cost: Number(cost),
      date,
      supplier,
      category
    });

    // Reset form
    setDescription('');
    setCost(0);
    setDate('');
    setSupplier('');
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'טופל': return { bg: '#16a34a', text: '#fff' };
      case 'בטיפול': return { bg: '#2563eb', text: '#fff' };
      case 'מושהה': return { bg: '#475569', text: '#fff' };
      case 'לטפל':
      default:
        return { bg: '#854d0e', text: '#fef08a' }; // Amber/Brownish
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#0f172a', width: '90%', maxWidth: '650px',
        maxHeight: '90vh', borderRadius: '12px', border: '1px solid #334155',
        display: 'flex', flexDirection: 'column', color: '#f8fafc',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '15px 20px', borderBottom: '1px solid #1e293b'
        }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            cursor: 'pointer', padding: '4px'
          }}>
            <X size={20} />
          </button>
          
          <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔧 תחזוקה — בית {buildingId}
          </h2>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Subtext */}
          <div style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'right' }}>
            כל קריאות התחזוקה עבור בית {buildingId}
          </div>

          {/* List of Calls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {issues.map(issue => {
              const statusStyle = getStatusColor(issue.status);
              return (
                <div key={issue.id} style={{
                  backgroundColor: '#1e293b', border: '1px solid #334155',
                  borderRadius: '8px', padding: '12px 15px', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}>
                  {isEditor ? (
                    <button 
                      onClick={() => softDeleteMaintenanceIssue(issue.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                        color: '#ef4444', padding: '6px', borderRadius: '6px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center'
                      }}
                    >
                      <X size={16} />
                    </button>
                  ) : <div />}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      backgroundColor: statusStyle.bg, color: statusStyle.text,
                      padding: '2px 8px', borderRadius: '4px', fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {issue.status}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '15px' }}>{issue.type} ({issue.category === 'internal' ? 'פנימית' : 'חיצונית'})</h4>
                      <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>{issue.description}</p>
                      {issue.supplier && <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '11px' }}>ספק: {issue.supplier}</p>}
                    </div>
                  </div>

                  <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '15px', direction: 'rtl' }}>
                    ₪{issue.cost?.toLocaleString()}
                  </div>
                </div>
              );
            })}
            {issues.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', border: '1px dashed #334155', borderRadius: '8px' }}>
                אין קריאות תחזוקה עבור בית זה.
              </div>
            )}
          </div>

          {/* Add Call Form */}
          {isEditor && (
            <form onSubmit={handleSubmit} style={{
              borderTop: '1px solid #1e293b', paddingTop: '20px',
              display: 'flex', flexDirection: 'column', gap: '15px'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc', textAlign: 'right' }}>+ הוסף קריאה</h3>
              
              {/* Type and Status */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>סטטוס</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="bc-status-sel"
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="לטפל">לטפל</option>
                    <option value="בטיפול">בטיפול</option>
                    <option value="טופל">טופל</option>
                    <option value="מושהה">מושהה</option>
                  </select>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>סוג תחזוקה</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                    className="bc-status-sel"
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="מדרגות">מדרגות</option>
                    <option value="ביוב">ביוב</option>
                    <option value="גג">גג</option>
                    <option value="חשמל">חשמל</option>
                    <option value="צבע / טיח">צבע / טיח</option>
                    <option value="אינסטלציה">אינסטלציה</option>
                    <option value="אחר">אחר</option>
                  </select>
                </div>
              </div>

              {/* Category split */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>מיקום תחזוקה</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value as 'external' | 'internal')}
                    className="bc-status-sel"
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="external">תחזוקה חיצונית 🌳</option>
                    <option value="internal">תחזוקה פנימית 🏠</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>תיאור</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="תיאור העבודה..."
                  className="apt-in"
                  required
                />
              </div>

              {/* Cost and Date */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>תאריך</label>
                  <input 
                    type="text" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="apt-in"
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>עלות (₪)</label>
                  <input 
                    type="number" 
                    value={cost}
                    onChange={e => setCost(Number(e.target.value))}
                    className="apt-in"
                    min="0"
                  />
                </div>
              </div>

              {/* Contractor / Supplier */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>קבלן / ספק</label>
                <input 
                  type="text" 
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  placeholder="שם קבלן"
                  className="apt-in"
                />
              </div>

              {/* Add Button */}
              <button type="submit" className="btn btn-primary" style={{
                background: '#2563eb', border: 'none', padding: '10px',
                borderRadius: '6px', color: '#fff', cursor: 'pointer',
                fontWeight: 'bold', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', marginTop: '10px'
              }}>
                <Wrench size={16} />
                הוסף קריאה 🔧
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;
