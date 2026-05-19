import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Edit2, Trash2, Plus, X, Check } from 'lucide-react';

export default function Paychecks() {
  const { employees, role, addEmployee, updateEmployee, softDeleteEmployee } = useAppContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState<any>({
    name: '',
    role: '',
    department: 'אחזקה',
    salary: 0,
    notes: ''
  });

  const isEditor = role === 'Editor';
  const totalEmployees = employees.length;
  const totalSalaries = employees.reduce((acc, emp) => acc + (emp.salary || 0), 0);

  const openAddModal = () => {
    if (!isEditor) return;
    setEditingId(null);
    setFormState({
      name: '',
      role: '',
      department: 'אחזקה',
      salary: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (emp: any) => {
    if (!isEditor) return;
    setEditingId(emp.id);
    setFormState({
      name: emp.name || '',
      role: emp.role || '',
      department: emp.department || 'אחזקה',
      salary: emp.salary || 0,
      notes: emp.notes || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditor) return;

    const payload = {
      ...formState,
      salary: Number(formState.salary)
    };

    if (editingId) {
      await updateEmployee(editingId, payload);
    } else {
      await addEmployee(payload);
    }
    closeModal();
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
      backgroundColor: '#070a13', color: '#f8fafc', overflowY: 'auto',
      padding: '24px', direction: 'rtl'
    }}>
      
      {/* Title & Action Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', margin: 0 }}>
          💰 משכורות עובדים
        </h2>
        {isEditor && (
          <button 
            onClick={openAddModal}
            style={{
              padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: '6px',
              color: '#fff', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Plus size={14} />
            <span>עובד חדש</span>
          </button>
        )}
      </div>

      {/* Premium Data Table */}
      <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
        <table className="at" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'right', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>שם</th>
              <th style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>תפקיד</th>
              <th style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>מחלקה</th>
              <th style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>משכורת (₪)</th>
              <th style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>הערות</th>
              {isEditor && <th style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>פעולות</th>}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '12px', fontSize: '14px', color: '#fff', fontWeight: '500' }}>{emp.name}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#94a3b8' }}>{emp.role}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#a78bfa', fontWeight: '500' }}>{emp.department}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#fbbf24', fontWeight: 'bold' }}>₪{emp.salary?.toLocaleString()}</td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>{emp.notes}</td>
                {isEditor && (
                  <td style={{ padding: '12px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => openEditModal(emp)} 
                      style={{
                        background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer',
                        padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s'
                      }}
                      title="ערוך עובד"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button 
                      onClick={() => softDeleteEmployee(emp.id)} 
                      style={{
                        background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer',
                        padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s'
                      }}
                      title="מחק עובד"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={isEditor ? 6 : 5} style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '14px' }}>
                  לא קיימים עובדים במערכת
                </td>
              </tr>
            )}
          </tbody>
          {employees.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: '2px solid #334155' }}>
                <td colSpan={3} style={{ padding: '16px 12px', fontWeight: 'bold', color: '#a78bfa', fontSize: '14px' }}>
                  סה"כ עובדים: {totalEmployees}
                </td>
                <td style={{ padding: '16px 12px', fontWeight: 'bold', color: '#fbbf24', fontSize: '15px' }}>
                  ₪{totalSalaries.toLocaleString()}
                </td>
                <td colSpan={isEditor ? 2 : 1}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Centered Modal Overlay (same as mockup) */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, direction: 'rtl', padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#151f32', border: '1px solid #1e293b', borderRadius: '12px',
            padding: '24px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                {editingId ? 'עדכון עובד' : 'עובד חדש'}
              </h3>
              <button 
                onClick={closeModal} 
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Row 1: Name and Role */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>שם</label>
                  <input 
                    type="text" 
                    required
                    value={formState.name} 
                    onChange={e => setFormState({ ...formState, name: e.target.value })} 
                    style={{
                      backgroundColor: '#0b0f19', border: '1px solid #1e293b', borderRadius: '6px',
                      padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>תפקיד</label>
                  <input 
                    type="text" 
                    required
                    value={formState.role} 
                    onChange={e => setFormState({ ...formState, role: e.target.value })} 
                    style={{
                      backgroundColor: '#0b0f19', border: '1px solid #1e293b', borderRadius: '6px',
                      padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Department (Select) and Salary */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>מחלקה</label>
                  <select 
                    value={formState.department} 
                    onChange={e => setFormState({ ...formState, department: e.target.value })} 
                    style={{
                      backgroundColor: '#0b0f19', border: '1px solid #1e293b', borderRadius: '6px',
                      padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="סטודנטים">סטודנטים</option>
                    <option value="אחזקה">אחזקה</option>
                    <option value="חינוך">חינוך</option>
                    <option value="מינהלה">מינהלה</option>
                    <option value="קהילה">קהילה</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>משכורת (₪)</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    value={formState.salary || ''} 
                    onChange={e => setFormState({ ...formState, salary: e.target.value })} 
                    style={{
                      backgroundColor: '#0b0f19', border: '1px solid #1e293b', borderRadius: '6px',
                      padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Notes (textarea) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>הערות</label>
                <textarea 
                  rows={4}
                  value={formState.notes} 
                  onChange={e => setFormState({ ...formState, notes: e.target.value })} 
                  style={{
                    backgroundColor: '#0b0f19', border: '1px solid #1e293b', borderRadius: '6px',
                    padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Button: ✓ שמור (Full Width) */}
              <button 
                type="submit"
                style={{
                  backgroundColor: '#2563eb', border: 'none', borderRadius: '6px', padding: '12px',
                  color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px',
                  transition: 'background-color 0.2s'
                }}
              >
                <Check size={16} />
                <span>שמור</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
