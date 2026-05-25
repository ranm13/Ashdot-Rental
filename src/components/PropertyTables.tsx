import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Download, Edit2, Trash2, Check, X, Search, Filter, LayoutList, LayoutGrid, Wrench, Phone, Plus } from 'lucide-react';
import HouseEditModal from './HouseEditModal';
import MaintenanceModal from './MaintenanceModal';
import StudentHouseEditModal from './StudentHouseEditModal';
import BusinessEditModal from './BusinessEditModal';
import AddPropertyModal from './AddPropertyModal';

interface Props {
  type: 'Resident' | 'Student' | 'Business';
}

const PropertyTables: React.FC<Props> = ({ type }) => {
  const { 
    role, 
    residents, students, businesses, maintenanceIssues,
    updateStudent, updateBusiness,
    softDeleteResident, softDeleteStudent, softDeleteBusiness,
    softDeleteMaintenanceIssue
  } = useAppContext();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  // Modals state for whole house actions
  const [editBuildingId, setEditBuildingId] = useState<string | null>(null);
  const [studentEditBuildingId, setStudentEditBuildingId] = useState<string | null>(null);
  const [maintBuildingId, setMaintBuildingId] = useState<string | null>(null);
  const [editBusiness, setEditBusiness] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Sub-Tabs State
  const [activeSubTab, setActiveSubTab] = useState<'table' | 'maintenance' | 'maintenance_external' | 'maintenance_internal' | 'dashboard'>('table');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const isEditor = role === 'Admin';

  const getRawData = (): any[] => {
    switch (type) {
      case 'Resident': return residents.filter(r => r.is_active);
      case 'Student': return students.filter(s => s.is_active);
      case 'Business': return businesses.filter(b => b.is_active);
    }
  };

  const getFilteredData = (): any[] => {
    let data = getRawData();
    
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((item: any) => {
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(q)
        );
      });
    }

    // Status Filter (Demo Mockup)
    if (statusFilter !== 'all') {
      if (type === 'Business') {
        data = data.filter((item: any) => item.status === statusFilter);
      } else {
        if (statusFilter === 'פנוי') {
          data = data.filter((item: any) => !item.tenant_name || item.tenant_name.trim() === '');
        } else if (statusFilter === 'בפוטנציאל לשיוך / שיווק לנקלטים') {
          if (type === 'Resident') {
            data = data.filter((item: any) => 
              (!item.tenant_name || item.tenant_name.trim() === '') && 
              item.owner_name === 'הקיבוץ'
            );
          } else if (type === 'Student') {
            data = data.filter((item: any) => 
              (!item.tenant_name || item.tenant_name.trim() === '') && 
              item.payment_dest === 'קיבוץ'
            );
          }
        }
      }
    }

    return data;
  };

  const data = getFilteredData();

  const getGroupedBuildings = () => {
    const grouped: { [key: string]: any[] } = {};
    data.forEach((r: any) => {
      if (!grouped[r.building_id]) {
        grouped[r.building_id] = [];
      }
      grouped[r.building_id].push(r);
    });
    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map(key => ({
        building_id: key,
        apartments: grouped[key].sort((a, b) => {
          if (type === 'Student') {
            return (a.apartment_num || 0) - (b.apartment_num || 0);
          }
          return a.apartment_name.localeCompare(b.apartment_name);
        })
      }));
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את כל הדירות בבית ${buildingId}?`)) return;
    const toDelete = residents.filter(r => r.building_id === buildingId);
    await Promise.all(toDelete.map(r => softDeleteResident(r.id)));
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/export/${type}`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_Export.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Failed to export data');
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSave = () => {
    if (!editingId) return;
    const payload = { ...editForm };
    if (payload.rent) payload.rent = Number(payload.rent);
    if (payload.square_meters) payload.square_meters = Number(payload.square_meters);

    if (type === 'Student') updateStudent(editingId, payload);
    if (type === 'Business') updateBusiness(editingId, payload);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק רשומה זו?")) return;
    if (type === 'Resident') softDeleteResident(id);
    if (type === 'Student') softDeleteStudent(id);
    if (type === 'Business') softDeleteBusiness(id);
  };

  const renderHeaders = () => {
    if (type === 'Resident') return (
      <tr>
        <th>מס' בית</th>
        <th>דירה</th>
        <th>מאוכלס ע"י</th>
        <th>שכ"ד/ח</th>
        <th>תחזוקה</th>
        <th>סיום חוזה</th>
        <th>פעולות</th>
      </tr>
    );
    if (type === 'Student') return (
      <tr>
        <th>בניין</th><th>דירה</th><th>שם דייר</th><th>שכ"ד</th><th>סיום חוזה</th><th>פעולות</th>
      </tr>
    );
    if (type === 'Business') return (
      <tr>
        <th>שם עסק</th><th>בעלים</th><th>מיקום</th><th>שכ"ד</th><th>מ"ר</th><th>ארנונה</th><th>סיום חוזה</th><th>הסדרת שימושים</th><th>פעולות</th>
      </tr>
    );
  };

  const renderRow = (item: any) => {
    const isEditing = editingId === item.id;
    
    if (type === 'Resident') {
      const openCalls = maintenanceIssues.filter(m => m.building_id === item.building_id && m.status !== 'טופל').length;
      return (
        <tr key={item.id}>
          {/* Change color of data in building_id column to rgb(167, 139, 250) */}
          <td style={{ color: 'rgb(167, 139, 250)', fontWeight: 'bold' }}>{item.building_id}</td>
          <td>{item.apartment_name}</td>
          <td>
            {item.tenant_name && item.tenant_name.trim() !== '' ? (
              item.tenant_name
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f87171', fontStyle: 'italic', fontWeight: 'bold' }}>פנוי</span>
                {item.owner_name === 'הקיבוץ' && (
                  <span style={{ 
                    backgroundColor: '#1e3a8a', 
                    color: '#93c5fd', 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontWeight: 'bold' 
                  }}>
                    בפוטנציאל לשיוך / שיווק לנקלטים
                  </span>
                )}
              </div>
            )}
          </td>
          {/* Change color of rent to #22c55e */}
          <td style={{ color: '#22c55e', fontWeight: 'bold' }}>
            {item.rent ? `₪${item.rent.toLocaleString()}` : '-'}
          </td>
          <td style={{ color: openCalls > 0 ? '#f59e0b' : '#10b981' }}>
            {openCalls > 0 ? `⚠️ ${openCalls} קריאות פתוחות` : '✅ תקין'}
          </td>
          <td>{item.contract_end || '-'}</td>
          {renderActions(item, isEditing)}
        </tr>
      );
    }

    if (type === 'Student') return (
      <tr key={item.id}>
        <td style={{ color: '#a78bfa', fontWeight: 'bold' }}>{item.building_id}</td>
        <td>{item.apartment_num}</td>
        <td>
          {isEditing ? (
            <input className="apt-in" value={editForm.tenant_name || ''} onChange={e => setEditForm({...editForm, tenant_name: e.target.value})} />
          ) : (
            item.tenant_name && item.tenant_name.trim() !== '' ? (
              item.tenant_name
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f87171', fontStyle: 'italic', fontWeight: 'bold' }}>פנוי</span>
                {item.payment_dest === 'קיבוץ' && (
                  <span style={{ 
                    backgroundColor: '#581c87', 
                    color: '#e9d5ff', 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontWeight: 'bold' 
                  }}>
                    בפוטנציאל לשיוך / שיווק לנקלטים
                  </span>
                )}
              </div>
            )
          )}
        </td>
        <td style={{ color: '#22c55e', fontWeight: 'bold' }}>
          {isEditing ? <input className="apt-in" type="number" value={editForm.rent || ''} onChange={e => setEditForm({...editForm, rent: e.target.value})} /> : (item.rent ? `₪${item.rent.toLocaleString()}` : '-')}
        </td>
        <td>{isEditing ? <input className="apt-in" type="date" value={editForm.contract_end || ''} onChange={e => setEditForm({...editForm, contract_end: e.target.value})} /> : item.contract_end}</td>
        {renderActions(item, isEditing)}
      </tr>
    );

    if (type === 'Business') return (
      <tr key={item.id}>
        <td>{item.business_name}</td>
        <td>{item.owner_name}</td>
        <td>{item.location}</td>
        <td style={{ color: '#22c55e', fontWeight: 'bold' }}>
          {item.rent ? `₪${item.rent.toLocaleString()}` : '-'}
        </td>
        <td>{item.square_meters || '-'}</td>
        <td>{item.arnona_id || '-'}</td>
        <td>{item.contract_end || '-'}</td>
        <td>{item.status}</td>
        {renderActions(item, false)}
      </tr>
    );
  };

  const renderActions = (item: any, isEditing: boolean) => {
    if (!isEditor) return <td></td>;
    return (
      <td style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        {type === 'Resident' ? (
          <>
            {/* Opens whole-house edit modal */}
            <button className="eb" onClick={() => setEditBuildingId(item.building_id)} title="ערוך בית שלם"><Edit2 size={14} /></button>
            {/* Opens maintenance modal */}
            <button className="eb" onClick={() => setMaintBuildingId(item.building_id)} title="תחזוקה ביתית"><Wrench size={14} /></button>
            <button className="eb" onClick={() => handleDelete(item.id)} title="מחק"><Trash2 size={14} color="#ef4444" /></button>
          </>
        ) : isEditing ? (
          <>
            <button className="eb" onClick={handleSave} title="שמור"><Check size={14} /></button>
            <button className="eb" onClick={() => setEditingId(null)} title="בטל"><X size={14} /></button>
          </>
        ) : (
          <>
            {type === 'Business' ? (
              <>
                {item.phone && (
                  <a 
                    href={`tel:${item.phone}`} 
                    className="eb" 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid #1e293b',
                      borderRadius: '6px',
                      padding: '6px',
                      background: '#0f172a'
                    }} 
                    title="התקשר"
                  >
                    <Phone size={14} color="#22c55e" />
                  </a>
                )}
                <button 
                  className="eb" 
                  onClick={() => setEditBusiness(item)} 
                  style={{ 
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '6px',
                    background: '#0f172a'
                  }} 
                  title="ערוך"
                >
                  <Edit2 size={14} />
                </button>
              </>
            ) : (
              <>
                <button className="eb" onClick={() => handleEdit(item)} title="ערוך"><Edit2 size={14} /></button>
                {type === 'Student' ? (
                  <button className="eb" onClick={() => setMaintBuildingId(item.building_id)} title="תחזוקה"><Wrench size={14} /></button>
                ) : (
                  <button className="eb" onClick={() => handleDelete(item.id)} title="מחק"><Trash2 size={14} color="#ef4444" /></button>
                )}
              </>
            )}
          </>
        )}
      </td>
    );
  };

  const renderCard = (item: any) => {
    return (
      <div key={item.id} style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
        {type === 'Business' ? (
          <>
            <h4>{item.business_name}</h4>
            <p>בעלים: {item.owner_name}</p>
            <p style={{ color: '#22c55e', fontWeight: 'bold' }}>שכ"ד: ₪{item.rent?.toLocaleString()}</p>
          </>
        ) : (
          <>
            <h4>בית {item.building_id} - דירה {item.apartment_name || item.apartment_num}</h4>
            <p>דייר: {item.tenant_name}</p>
            <p style={{ color: '#22c55e', fontWeight: 'bold' }}>שכ"ד: ₪{item.rent?.toLocaleString()}</p>
          </>
        )}
        {isEditor && (
          <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
            {type === 'Business' ? (
              <>
                {item.phone && (
                  <a 
                    href={`tel:${item.phone}`} 
                    className="eb" 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid #1e293b',
                      borderRadius: '6px',
                      padding: '6px',
                      background: '#0f172a'
                    }} 
                    title="התקשר"
                  >
                    <Phone size={14} color="#22c55e" />
                  </a>
                )}
                <button className="eb" onClick={() => setEditBusiness(item)}><Edit2 size={14} /></button>
              </>
            ) : (
              <>
                <button className="eb" onClick={() => handleEdit(item)}><Edit2 size={14} /></button>
                <button className="eb" onClick={() => handleDelete(item.id)}><Trash2 size={14} color="#ef4444" /></button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render splitting list for external/internal maintenance
  const renderMaintenanceList = (category: 'external' | 'internal') => {
    const list = maintenanceIssues.filter(m => m.category === category);
    return (
      <div>
        <table className="at" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>בית / בניין</th>
              <th>סוג תחזוקה</th>
              <th>תיאור</th>
              <th>עלות (₪)</th>
              <th>תאריך</th>
              <th>קבלן / ספק</th>
              <th>סטטוס</th>
              {isEditor && <th>פעולות</th>}
            </tr>
          </thead>
          <tbody>
            {list.map(m => (
              <tr key={m.id}>
                <td style={{ color: 'rgb(167, 139, 250)', fontWeight: 'bold' }}>בית {m.building_id}</td>
                <td>{m.type}</td>
                <td>{m.description}</td>
                <td style={{ color: '#22c55e', fontWeight: 'bold' }}>₪{m.cost?.toLocaleString()}</td>
                <td>{m.date || '-'}</td>
                <td>{m.supplier || '-'}</td>
                <td>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: m.status === 'טופל' ? '#16a34a' : m.status === 'בטיפול' ? '#2563eb' : '#854d0e',
                    color: '#fff'
                  }}>
                    {m.status}
                  </span>
                </td>
                {isEditor && (
                  <td>
                    <button className="eb" onClick={() => softDeleteMaintenanceIssue(m.id)} title="מחק"><Trash2 size={14} color="#ef4444" /></button>
                  </td>
                )}
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>לא נמצאו קריאות תחזוקה בקטגוריה זו</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="pane" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ color: '#f1f5f9', margin: 0 }}>
          {type === 'Resident' ? 'דירות תושבים' : type === 'Student' ? 'דירות סטודנטים' : 'עסקים'}
        </h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
            <button 
              style={{ background: viewMode === 'list' ? '#3b82f6' : 'transparent', border: 'none', padding: '6px 10px', color: '#fff', cursor: 'pointer' }}
              onClick={() => setViewMode('list')}
              title="תצוגת רשימה"
            ><LayoutList size={16} /></button>
            <button 
              style={{ background: viewMode === 'card' ? '#3b82f6' : 'transparent', border: 'none', padding: '6px 10px', color: '#fff', cursor: 'pointer' }}
              onClick={() => setViewMode('card')}
              title="תצוגת כרטיסיות"
            ><LayoutGrid size={16} /></button>
          </div>
          <button className="msv" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> ייצא לאקסל
          </button>
          {isEditor && (
            <button 
              onClick={() => setShowAddModal(true)} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> הוסף {type === 'Resident' ? 'דירה' : type === 'Student' ? 'דירת סטודנט' : 'עסק'}
            </button>
          )}
        </div>
      </div>
 
      {/* Sub-Tabs (Split for Resident category) */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #334155', marginBottom: '15px' }}>
        <button 
          style={{ background: 'transparent', border: 'none', padding: '10px 0', color: activeSubTab === 'table' ? '#3b82f6' : '#94a3b8', borderBottom: activeSubTab === 'table' ? '2px solid #3b82f6' : 'none', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => { setActiveSubTab('table'); }}
        >📋 טבלה</button>
        
        {type === 'Resident' ? (
          <>
            <button 
              style={{ background: 'transparent', border: 'none', padding: '10px 0', color: activeSubTab === 'maintenance_external' ? '#3b82f6' : '#94a3b8', borderBottom: activeSubTab === 'maintenance_external' ? '2px solid #3b82f6' : 'none', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => setActiveSubTab('maintenance_external')}
            >🌳 תחזוקה חיצונית</button>
            <button 
              style={{ background: 'transparent', border: 'none', padding: '10px 0', color: activeSubTab === 'maintenance_internal' ? '#3b82f6' : '#94a3b8', borderBottom: activeSubTab === 'maintenance_internal' ? '2px solid #3b82f6' : 'none', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => setActiveSubTab('maintenance_internal')}
            >🏠 תחזוקה פנימית</button>
          </>
        ) : (
          <button 
            style={{ background: 'transparent', border: 'none', padding: '10px 0', color: activeSubTab === 'maintenance' ? '#3b82f6' : '#94a3b8', borderBottom: activeSubTab === 'maintenance' ? '2px solid #3b82f6' : 'none', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => setActiveSubTab('maintenance')}
          >🔧 תחזוקה</button>
        )}

        <button 
          style={{ background: 'transparent', border: 'none', padding: '10px 0', color: activeSubTab === 'dashboard' ? '#3b82f6' : '#94a3b8', borderBottom: activeSubTab === 'dashboard' ? '2px solid #3b82f6' : 'none', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => setActiveSubTab('dashboard')}
        >📊 דשבורד</button>
      </div>
      
      {/* Filters (only show in Table view) */}
      {activeSubTab === 'table' && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', right: '10px', top: '10px' }} />
            <input 
              type="text" 
              placeholder="חיפוש חופשי..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={16} color="#94a3b8" style={{ position: 'absolute', right: '10px', top: '10px' }} />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '8px 30px 8px 10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff', cursor: 'pointer' }}
            >
              <option value="all">כל הסטטוסים</option>
              {type === 'Business' ? (
                <>
                  <option value="הוסדר">הוסדר</option>
                  <option value="בטיפול">בטיפול</option>
                  <option value='לא התקבל דו"ח מרמ"י'>לא התקבל מרמ"י</option>
                </>
              ) : (
                <>
                  <option value="פנוי">פנוי</option>
                  <option value="בפוטנציאל לשיוך / שיווק לנקלטים">בפוטנציאל לשיוך / שיווק לנקלטים</option>
                </>
              )}
            </select>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="tbl-scroll" style={{ flex: 1 }}>
        {activeSubTab === 'table' ? (
          viewMode === 'list' ? (
            <table className="at">
              <thead>
                {renderHeaders()}
              </thead>
              <tbody>
                {data.map((item: any) => renderRow(item))}
                {data.length === 0 && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '20px' }}>לא נמצאו רשומות</td></tr>
                )}
              </tbody>
            </table>
          ) : type === 'Resident' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))',
              gap: '20px',
              direction: 'rtl'
            }}>
              {getGroupedBuildings().map(b => {
                const occupiedCount = b.apartments.filter(a => a.tenant_name && a.tenant_name.trim() !== '').length;
                const totalRent = b.apartments.reduce((acc, a) => acc + (a.rent || 0), 0);
                const openCalls = maintenanceIssues.filter(m => m.building_id === b.building_id && m.status !== 'טופל').length;

                return (
                  <div key={b.building_id} style={{
                    background: '#0b0f19',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                  }}>
                    {/* Top Row: Left Apartments count, Right Building ID */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                        {b.apartments.length} דירות
                      </span>
                      <span style={{ color: 'rgb(167, 139, 250)', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {b.building_id} 🏠
                      </span>
                    </div>

                    {/* Sub Row: occupied count and rent sum */}
                    <div style={{
                      color: '#22c55e',
                      fontSize: '14px',
                      borderBottom: '1px solid #1e293b',
                      paddingBottom: '8px',
                      display: 'flex',
                      justifyContent: 'flex-start',
                      gap: '8px',
                      fontWeight: 'bold'
                    }}>
                      <span>{occupiedCount} מאוכלסות | ₪{totalRent.toLocaleString()}</span>
                    </div>

                    {/* Apartments List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, marginTop: '5px' }}>
                      {b.apartments.map(a => (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                          <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{a.apartment_name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', direction: 'rtl' }}>
                            {a.tenant_name && a.tenant_name.trim() !== '' ? (
                              <>
                                <span style={{ color: '#94a3b8' }}>{a.tenant_name}</span>
                                {a.rent && <span style={{ color: '#22c55e', fontWeight: 'bold', marginRight: '4px' }}>₪{a.rent.toLocaleString()}</span>}
                              </>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#f87171', fontStyle: 'italic', fontWeight: 'bold' }}>פנוי</span>
                                {a.owner_name === 'הקיבוץ' && (
                                  <span style={{ 
                                    backgroundColor: '#1e3a8a', 
                                    color: '#93c5fd', 
                                    fontSize: '9px', 
                                    padding: '1px 4px', 
                                    borderRadius: '3px', 
                                    fontWeight: 'bold' 
                                  }}>
                                    פוטנציאל
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer buttons row */}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '12px', marginTop: '10px' }}>
                      {/* Delete button (Left) */}
                      <button 
                        onClick={() => handleDeleteBuilding(b.building_id)}
                        style={{
                          backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ef4444',
                          borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center'
                        }}
                        title="מחק בית שלם"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Maintenance Wrench Button (Middle) */}
                      <button 
                        onClick={() => setMaintBuildingId(b.building_id)}
                        style={{
                          backgroundColor: openCalls > 0 ? '#854d0e' : '#1e293b',
                          border: `1px solid ${openCalls > 0 ? '#a16207' : '#334155'}`,
                          color: openCalls > 0 ? '#fef08a' : '#94a3b8',
                          borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                        title="קריאות תחזוקה"
                      >
                        {openCalls > 0 && <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{openCalls}</span>}
                        <Wrench size={14} />
                      </button>

                      {/* Edit Button (Right) */}
                      <button 
                        onClick={() => setEditBuildingId(b.building_id)}
                        style={{
                          flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                          borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px',
                          fontWeight: 'bold'
                        }}
                      >
                        <span>עריכה</span>
                        <Edit2 size={13} style={{ opacity: 0.8 }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : type === 'Student' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))',
              gap: '20px',
              direction: 'rtl'
            }}>
              {getGroupedBuildings().map(b => {
                const occupiedCount = b.apartments.filter(a => a.tenant_name && a.tenant_name.trim() !== '').length;
                const totalRent = b.apartments.reduce((acc, a) => acc + (a.rent || 0), 0);
                const openCalls = maintenanceIssues.filter(m => m.building_id === b.building_id && m.status !== 'טופל').length;

                return (
                  <div key={b.building_id} style={{
                    background: '#0b0f19',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                  }}>
                    {/* Top Row: Left Apartments count, Right Building ID */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                        {b.apartments.length} דירות
                      </span>
                      <span style={{ color: '#a78bfa', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {b.building_id} 🏢
                      </span>
                    </div>

                    {/* Sub Row: occupied count and rent sum */}
                    <div style={{
                      color: '#22c55e',
                      fontSize: '14px',
                      borderBottom: '1px solid #1e293b',
                      paddingBottom: '8px',
                      display: 'flex',
                      justifyContent: 'flex-start',
                      gap: '8px',
                      fontWeight: 'bold'
                    }}>
                      <span>{occupiedCount} מאוכלסות | ₪{totalRent.toLocaleString()}</span>
                    </div>

                    {/* Apartments List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, marginTop: '5px' }}>
                      {b.apartments.map(a => (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                          <span style={{ color: '#e2e8f0', fontWeight: '500' }}>דירה {a.apartment_num}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', direction: 'rtl' }}>
                            {a.tenant_name && a.tenant_name.trim() !== '' ? (
                              <>
                                <span style={{ color: '#94a3b8' }}>{a.tenant_name}</span>
                                {a.rent && <span style={{ color: '#22c55e', fontWeight: 'bold', marginRight: '4px' }}>₪{a.rent.toLocaleString()}</span>}
                              </>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#f87171', fontStyle: 'italic', fontWeight: 'bold' }}>פנוי</span>
                                {a.payment_dest === 'קיבוץ' && (
                                  <span style={{ 
                                    backgroundColor: '#581c87', 
                                    color: '#e9d5ff', 
                                    fontSize: '9px', 
                                    padding: '1px 4px', 
                                    borderRadius: '3px', 
                                    fontWeight: 'bold' 
                                  }}>
                                    פוטנציאל
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer buttons row (No Delete Button) */}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #1e293b', paddingTop: '12px', marginTop: '10px' }}>
                      {/* Maintenance Wrench Button (Left) */}
                      <button 
                        onClick={() => setMaintBuildingId(b.building_id)}
                        style={{
                          backgroundColor: openCalls > 0 ? '#854d0e' : '#1e293b',
                          border: `1px solid ${openCalls > 0 ? '#a16207' : '#334155'}`,
                          color: openCalls > 0 ? '#fef08a' : '#94a3b8',
                          borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                        title="קריאות תחזוקה"
                      >
                        {openCalls > 0 && <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{openCalls}</span>}
                        <Wrench size={14} />
                      </button>

                      {/* Edit Button (Right) */}
                      <button 
                        onClick={() => setStudentEditBuildingId(b.building_id)}
                        style={{
                          flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                          borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px',
                          fontWeight: 'bold'
                        }}
                      >
                        <span>עריכה</span>
                        <Edit2 size={13} style={{ opacity: 0.8 }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {data.map((item: any) => renderCard(item))}
            </div>
          )
        ) : activeSubTab === 'maintenance_external' ? (
          renderMaintenanceList('external')
        ) : activeSubTab === 'maintenance_internal' ? (
          renderMaintenanceList('internal')
        ) : activeSubTab === 'maintenance' ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
            <h3>יומן תחזוקה</h3>
            <p>יוצג כאן יומן תחזוקה מפורט לכל נכס בנפרד (בפיתוח...)</p>
          </div>
        ) : (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
            <h3>דשבורד מחלקתי</h3>
            <p>יוצגו כאן נתונים סטטיסטיים ספציפיים למחלקה זו (בפיתוח...)</p>
          </div>
        )}
      </div>

      {/* Whole House Edit Modal */}
      {editBuildingId && (
        <HouseEditModal 
          buildingId={editBuildingId} 
          onClose={() => setEditBuildingId(null)} 
        />
      )}

      {/* Student House Edit Modal */}
      {studentEditBuildingId && (
        <StudentHouseEditModal 
          buildingId={studentEditBuildingId} 
          onClose={() => setStudentEditBuildingId(null)} 
        />
      )}

      {/* Building Maintenance Tracker Modal */}
      {maintBuildingId && (
        <MaintenanceModal 
          buildingId={maintBuildingId} 
          onClose={() => setMaintBuildingId(null)} 
        />
      )}

      {/* Business Edit Modal */}
      {editBusiness && (
        <BusinessEditModal 
          business={editBusiness} 
          onClose={() => setEditBusiness(null)} 
        />
      )}

      {/* Add New Property Modal */}
      {showAddModal && (
        <AddPropertyModal 
          type={type} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
    </div>
  );
};

export default PropertyTables;
