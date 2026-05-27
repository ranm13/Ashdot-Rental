import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { X, Save, Plus } from 'lucide-react';

interface AddPropertyModalProps {
  type: 'Resident' | 'Student' | 'Business';
  onClose: () => void;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ type, onClose }) => {
  const { addResident, addStudent, addBusiness } = useAppContext();
  
  // Shared fields + type-specific fields initialization
  const [formData, setFormData] = useState<any>({
    // Resident specific
    apartment_name: '',
    floor: '',
    owner_name: 'הקיבוץ',
    owner_type: 'קיבוץ',
    allocation_status: 'לא משויך',
    electricity_id: '',
    
    // Student specific
    apartment_num: '',
    
    // Business specific
    business_name: '',
    location: '',
    parcel_id: '',
    status: 'הוסדר',
    
    // Shared
    building_number: '',
    units_per_building: '4', // Shared building has 4 by default
    tenant_name: '',
    rent: '',
    square_meters: '',
    arnona_id: '',
    water_id: '',
    contract_end: '',
    phone: '',
    email: '',
    payment_dest: 'קיבוץ',
    maintenance_log: ''
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    
    if (type === 'Resident') {
      if (!formData.building_number) newErrors.building_number = 'חובה להזין מס׳ בית';
      if (!formData.apartment_name) newErrors.apartment_name = 'חובה להזין שם דירה';
      if (!formData.arnona_id) newErrors.arnona_id = 'חובה להזין מספר ארנונה';
    } else if (type === 'Student') {
      if (!formData.building_number) newErrors.building_number = 'חובה להזין מס׳ בית/בניין';
      if (!formData.apartment_num) newErrors.apartment_num = 'חובה להזין מספר דירה';
      if (!formData.arnona_id) newErrors.arnona_id = 'חובה להזין מספר ארנונה';
      if (!formData.water_id) newErrors.water_id = 'חובה להזין מספר מד מים';
    } else if (type === 'Business') {
      if (!formData.business_name) newErrors.business_name = 'חובה להזין שם עסק';
      if (!formData.owner_name) newErrors.owner_name = 'חובה להזין שם בעלים';
      if (!formData.location) newErrors.location = 'חובה להזין מיקום';
      if (!formData.parcel_id) newErrors.parcel_id = 'חובה להזין מספר גוש/חלקה';
      if (!formData.arnona_id) newErrors.arnona_id = 'חובה להזין מספר ארנונה';
      if (!formData.water_id) newErrors.water_id = 'חובה להזין מספר מד מים';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (type === 'Resident') {
        const payload = {
          building_number: Number(formData.building_number),
          units_per_building: Number(formData.units_per_building || 4),
          apartment_name: formData.apartment_name,
          floor: formData.floor,
          tenant_name: formData.tenant_name,
          owner_name: formData.owner_name,
          owner_type: formData.owner_type,
          allocation_status: formData.allocation_status,
          rent: formData.rent ? Number(formData.rent) : null,
          square_meters: formData.square_meters ? Number(formData.square_meters) : 0,
          arnona_id: formData.arnona_id,
          water_id: formData.water_id,
          electricity_id: formData.electricity_id,
          contract_end: formData.contract_end,
          phone: formData.phone,
          email: formData.email,
          payment_dest: formData.payment_dest,
          maintenance_log: formData.maintenance_log
        };
        await addResident(payload);
      } else if (type === 'Student') {
        const payload = {
          building_number: Number(formData.building_number),
          units_per_building: Number(formData.units_per_building || 4),
          apartment_num: Number(formData.apartment_num),
          tenant_name: formData.tenant_name,
          rent: formData.rent ? Number(formData.rent) : null,
          arnona_id: formData.arnona_id,
          water_id: formData.water_id,
          contract_end: formData.contract_end,
          phone: formData.phone,
          email: formData.email,
          payment_dest: formData.payment_dest,
          maintenance_log: formData.maintenance_log
        };
        await addStudent(payload);
      } else if (type === 'Business') {
        const payload = {
          business_name: formData.business_name,
          owner_name: formData.owner_name,
          location: formData.location,
          parcel_id: Number(formData.parcel_id),
          rent: formData.rent ? Number(formData.rent) : null,
          arnona_id: formData.arnona_id,
          water_id: formData.water_id,
          contract_end: formData.contract_end,
          phone: formData.phone,
          email: formData.email,
          status: formData.status,
          square_meters: formData.square_meters ? Number(formData.square_meters) : null,
          maintenance_log: formData.maintenance_log
        };
        await addBusiness(payload);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('שגיאה בשמירת הרשומה');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1100,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#0f172a', width: '90%', maxWidth: '800px',
        maxHeight: '90vh', borderRadius: '12px', border: '1px solid #334155',
        display: 'flex', flexDirection: 'column', color: '#f8fafc',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', direction: 'rtl'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px', borderBottom: '1px solid #1e293b'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={22} color="#3b82f6" />
            הוספת {type === 'Resident' ? 'דירת תושב' : type === 'Student' ? 'דירת סטודנט' : 'עסק חדש'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            cursor: 'pointer', padding: '4px'
          }}>
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Conditional Building fields */}
            {type !== 'Business' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>מספר בית / בניין *</label>
                  <input
                    type="number"
                    value={formData.building_number}
                    onChange={e => handleChange('building_number', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: errors.building_number ? '1px solid #ef4444' : '1px solid #334155', color: '#fff' }}
                    placeholder="לדוגמא: 27"
                  />
                  {errors.building_number && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.building_number}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>מספר דירות בבית (פיזי) *</label>
                  <input
                    type="number"
                    value={formData.units_per_building}
                    onChange={e => handleChange('units_per_building', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    placeholder="בבית משותף יש בדרך כלל 4 או 8 דירות"
                  />
                </div>

                {type === 'Resident' ? (
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>שם דירה *</label>
                    <input
                      type="text"
                      value={formData.apartment_name}
                      onChange={e => handleChange('apartment_name', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: errors.apartment_name ? '1px solid #ef4444' : '1px solid #334155', color: '#fff' }}
                      placeholder="לדוגמא: א, ב, 1"
                    />
                    {errors.apartment_name && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.apartment_name}</span>}
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>מספר דירה *</label>
                    <input
                      type="number"
                      value={formData.apartment_num}
                      onChange={e => handleChange('apartment_num', e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: errors.apartment_num ? '1px solid #ef4444' : '1px solid #334155', color: '#fff' }}
                      placeholder="לדוגמא: 1, 2"
                    />
                    {errors.apartment_num && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.apartment_num}</span>}
                  </div>
                )}
              </>
            )}

            {/* Business Specific */}
            {type === 'Business' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>שם העסק *</label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={e => handleChange('business_name', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: errors.business_name ? '1px solid #ef4444' : '1px solid #334155', color: '#fff' }}
                    placeholder="שם החברה או הפעילות"
                  />
                  {errors.business_name && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.business_name}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>שם בעלים *</label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={e => handleChange('owner_name', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: errors.owner_name ? '1px solid #ef4444' : '1px solid #334155', color: '#fff' }}
                  />
                  {errors.owner_name && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.owner_name}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>מיקום במפה / אזור *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => handleChange('location', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: errors.location ? '1px solid #ef4444' : '1px solid #334155', color: '#fff' }}
                    placeholder="לדוגמא: אזור תעשייה, מוסכים"
                  />
                  {errors.location && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.location}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>גוש/חלקה *</label>
                  <input
                    type="number"
                    value={formData.parcel_id}
                    onChange={e => handleChange('parcel_id', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: errors.parcel_id ? '1px solid #ef4444' : '1px solid #334155', color: '#fff' }}
                  />
                  {errors.parcel_id && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.parcel_id}</span>}
                </div>
              </>
            )}

            {/* Common fields */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>שם הדייר / שוכר</label>
              <input
                type="text"
                value={formData.tenant_name}
                onChange={e => handleChange('tenant_name', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                placeholder="השאר ריק אם פנוי"
              />
            </div>

            {type === 'Resident' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>קומה</label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={e => handleChange('floor', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>שם בעלי הדירה (למשל, 4 בעלים בבית משותף)</label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={e => handleChange('owner_name', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                    placeholder="שמות הבעלים"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>סוג בעלות</label>
                  <select
                    value={formData.owner_type}
                    onChange={e => handleChange('owner_type', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  >
                    <option value="קיבוץ">קיבוץ</option>
                    <option value="חבר משק">חבר משק</option>
                    <option value="יורשים">יורשים</option>
                    <option value="בעלות מעורבת">בעלות מעורבת (קיבוץ, יורשים, חברי משק)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>סטטוס שיוך</label>
                  <select
                    value={formData.allocation_status}
                    onChange={e => handleChange('allocation_status', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                  >
                    <option value="לא משויך">לא משויך</option>
                    <option value="משויך">משויך</option>
                    <option value="בפוטנציאל לשיוך / שיווק לנקלטים">בפוטנציאל לשיוך / שיווק לנקלטים</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>שכ״ד (₪)</label>
              <input
                type="number"
                value={formData.rent}
                onChange={e => handleChange('rent', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>מ״ר</label>
              <input
                type="number"
                value={formData.square_meters}
                onChange={e => handleChange('square_meters', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>מספר מזהה ארנונה *</label>
              <input
                type="text"
                value={formData.arnona_id}
                onChange={e => handleChange('arnona_id', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: errors.arnona_id ? '1px solid #ef4444' : '1px solid #334155', color: '#fff' }}
              />
              {errors.arnona_id && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.arnona_id}</span>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>מד מים {type !== 'Resident' && '*'}</label>
              <input
                type="text"
                value={formData.water_id}
                onChange={e => handleChange('water_id', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: errors.water_id ? '1px solid #ef4444' : '1px solid #334155', color: '#fff' }}
              />
              {errors.water_id && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.water_id}</span>}
            </div>

            {type === 'Resident' && (
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>מד חשמל</label>
                <input
                  type="text"
                  value={formData.electricity_id}
                  onChange={e => handleChange('electricity_id', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>סיום חוזה</label>
              <input
                type="text"
                value={formData.contract_end}
                onChange={e => handleChange('contract_end', e.target.value)}
                placeholder="לדוגמא: 31/12/2026"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>טלפון ליצירת קשר</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>אימייל</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
              />
            </div>

            {type !== 'Business' && (
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>למי משלמים / גורם משלם</label>
                <select
                  value={formData.payment_dest}
                  onChange={e => handleChange('payment_dest', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                >
                  <option value="קיבוץ">קיבוץ</option>
                  <option value="יורשים בניהול הקיבוץ">יורשים בניהול הקיבוץ</option>
                  <option value="ישירות ליורשים">ישירות ליורשים</option>
                </select>
              </div>
            )}

            {type === 'Business' && (
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>סטטוס / הסדרת שימושים</label>
                <select
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                >
                  <option value="הוסדר">הוסדר</option>
                  <option value="בטיפול">בטיפול</option>
                  <option value='לא התקבל דו"ח מרמ"י'>לא התקבל מרמ"י</option>
                </select>
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>הערות תחזוקה</label>
            <textarea
              value={formData.maintenance_log}
              onChange={e => handleChange('maintenance_log', e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: '#fff', resize: 'vertical' }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
            <button
              type="submit"
              style={{
                flex: 1, background: '#2563eb', border: 'none', padding: '12px',
                borderRadius: '6px', color: '#fff', cursor: 'pointer',
                fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <Save size={18} />
              שמור רשומה
            </button>
            
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#334155', border: 'none', padding: '12px 24px',
                borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;
