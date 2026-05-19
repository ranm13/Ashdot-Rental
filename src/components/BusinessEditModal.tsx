import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { X } from 'lucide-react';
import type { Business } from '../types';

interface BusinessEditModalProps {
  business: Business;
  onClose: () => void;
}

const BusinessEditModal: React.FC<BusinessEditModalProps> = ({ business, onClose }) => {
  const { updateBusiness, role } = useAppContext();
  const [form, setForm] = useState<Partial<Business>>({});
  const isEditor = role === 'Editor';

  useEffect(() => {
    setForm({ ...business });
  }, [business]);

  const handleChange = (field: keyof Business, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditor) return;
    
    // Explicit type conversions
    const payload = {
      ...form,
      rent: form.rent === null || form.rent === undefined ? null : Number(form.rent),
      square_meters: form.square_meters === null || form.square_meters === undefined ? undefined : Number(form.square_meters),
      parcel_id: form.parcel_id === null || form.parcel_id === undefined ? 0 : Number(form.parcel_id)
    };

    await updateBusiness(business.id, payload);
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
        backgroundColor: '#111827', width: '90%', maxWidth: '750px',
        borderRadius: '12px', border: '1px solid #1e293b',
        display: 'flex', flexDirection: 'column', color: '#f8fafc',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        direction: 'rtl'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px', borderBottom: '1px solid #1e293b'
        }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#f8fafc' }}>
            {form.business_name || 'עריכת עסק'}
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center'
          }}>
            <X size={24} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Form Fields Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: '24px',
            rowGap: '16px'
          }}>
            {/* Row 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>שם עסק</label>
              <input
                type="text"
                value={form.business_name || ''}
                onChange={e => handleChange('business_name', e.target.value)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>בעלים</label>
              <input
                type="text"
                value={form.owner_name || ''}
                onChange={e => handleChange('owner_name', e.target.value)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Row 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>מיקום</label>
              <input
                type="text"
                value={form.location || ''}
                onChange={e => handleChange('location', e.target.value)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>שכ"ד</label>
              <input
                type="number"
                value={form.rent ?? ''}
                onChange={e => handleChange('rent', e.target.value ? Number(e.target.value) : null)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#22c55e', fontWeight: 'bold', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Row 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>מ"ר בנוי</label>
              <input
                type="number"
                step="any"
                value={form.square_meters ?? ''}
                onChange={e => handleChange('square_meters', e.target.value ? Number(e.target.value) : null)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>סככה</label>
              <input
                type="number"
                value={form.parcel_id ?? ''}
                onChange={e => handleChange('parcel_id', e.target.value ? Number(e.target.value) : 0)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Row 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>טלפון</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={e => handleChange('phone', e.target.value)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>מייל</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={e => handleChange('email', e.target.value)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Row 5 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>ארנונה</label>
              <input
                type="text"
                value={form.arnona_id || ''}
                onChange={e => handleChange('arnona_id', e.target.value)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>מ. מיים</label>
              <input
                type="text"
                value={form.water_id || ''}
                onChange={e => handleChange('water_id', e.target.value)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Row 6 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>מ. חשמל</label>
              <input
                type="text"
                value={form.maintenance_log || ''}
                onChange={e => handleChange('maintenance_log', e.target.value)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>סטאטוס</label>
              <select
                value={form.status || ''}
                onChange={e => handleChange('status', e.target.value)}
                disabled={!isEditor}
                style={{
                  backgroundColor: '#0f172a', border: '1px solid #1e293b',
                  color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                  outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="הוסדר">הוסדר</option>
                <option value="בטיפול">בטיפול</option>
                <option value='לא התקבל דו"ח מרמ"י'>לא התקבל דו"ח מרמ"י</option>
              </select>
            </div>
          </div>

          {/* Row 7: Contract End (Full Width) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>סיום חוזה</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={form.contract_end || ''}
              onChange={e => handleChange('contract_end', e.target.value)}
              disabled={!isEditor}
              style={{
                backgroundColor: '#0f172a', border: '1px solid #1e293b',
                color: '#fff', borderRadius: '6px', padding: '10px 14px', fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Submit Button */}
          {isEditor && (
            <button
              type="submit"
              style={{
                backgroundColor: '#2563eb', border: 'none', color: '#fff',
                borderRadius: '8px', padding: '12px', fontSize: '16px', fontWeight: 'bold',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', marginTop: '8px', transition: 'background-color 0.2s'
              }}
            >
              שמור ✔
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default BusinessEditModal;
