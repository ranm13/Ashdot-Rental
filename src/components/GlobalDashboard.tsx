import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Check, X, Edit2, Trash2, LayoutDashboard, Users, FileText, ArrowLeft } from 'lucide-react';

const GlobalDashboard: React.FC = () => {
  const { residents, students, businesses, expenses, employees, maintenanceIssues, role, addExpense, updateExpense, softDeleteExpense } = useAppContext();
  const navigate = useNavigate();
  
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'salaries' | 'expenses'>('dashboard');
  const [selectedDashboard, setSelectedDashboard] = useState<string>('global');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);

  const isEditor = role === 'Admin';

  // --- Calculations for Resident Apartments ---
  const totalResUnits = residents.length;
  const occupiedResUnits = residents.filter(r => r.tenant_name && r.tenant_name.trim() !== '').length;
  const vacantResUnits = totalResUnits - occupiedResUnits;
  const resMonthlyRent = residents.reduce((acc, r) => acc + (r.rent || 0), 0);
  const resAnnualRent = resMonthlyRent * 12;
  const resOccupancyRate = totalResUnits > 0 ? Math.round((occupiedResUnits / totalResUnits) * 100) : 0;
  
  const residentBuildingIds = new Set(residents.map(r => r.building_id));
  const resMaintenanceCount = maintenanceIssues.filter(m => m.status !== 'טופל' && residentBuildingIds.has(m.building_id)).length;

  // --- Calculations for Student Apartments ---
  const totalStuUnits = students.length;
  const occupiedStuUnits = students.filter(s => s.tenant_name && s.tenant_name.trim() !== '').length;
  const vacantStuUnits = totalStuUnits - occupiedStuUnits;
  const stuMonthlyRent = students.reduce((acc, s) => acc + (s.rent || 0), 0);
  const stuAnnualRent = stuMonthlyRent * 12;
  const stuOccupancyRate = totalStuUnits > 0 ? Math.round((occupiedStuUnits / totalStuUnits) * 100) : 0;

  const studentBuildingIds = new Set(students.map(s => s.building_id));
  const stuMaintenanceCount = maintenanceIssues.filter(m => m.status !== 'טופל' && studentBuildingIds.has(m.building_id)).length;

  // --- Calculations for Businesses ---
  const totalBizUnits = businesses.length;
  const activeBizUnits = businesses.filter(b => b.is_active).length;
  const bizMonthlyRent = businesses.reduce((acc, b) => acc + (b.rent || 0), 0);
  const bizAnnualRent = bizMonthlyRent * 12;

  // --- Overall Calculations ---
  const totalMonthlyIncome = resMonthlyRent + stuMonthlyRent + bizMonthlyRent;
  const totalAnnualIncome = totalMonthlyIncome * 12;
  const salariesExpense = employees.reduce((acc, emp) => acc + (emp.salary || 0), 0);
  const totalOpenMaintenance = maintenanceIssues.filter(m => m.status !== 'טופל').length;
  const totalMaintenanceCost = maintenanceIssues.filter(m => m.status !== 'טופל').reduce((acc, m) => acc + (m.cost || 0), 0);

  // --- Cost Center Calculations ---
  const salariesCost = employees.reduce((acc, emp) => acc + (emp.salary || 0), 0);
  const legalCost = expenses
    .filter(e => e.category === 'עו"ד' || e.category === 'משפטי' || e.category.includes('עו"ד'))
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const constructionMaintenanceCost = maintenanceIssues.reduce((acc, m) => acc + (m.cost || 0), 0) + expenses
    .filter(e => e.category === 'בינוי ואחזקה' || e.category.includes('אחזקה') || e.category.includes('בינוי'))
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const itSoftwareCost = expenses
    .filter(e => e.category === 'הוצאות מחשוב ותוכנות' || e.category.includes('מחשוב') || e.category.includes('תוכנה') || e.category.includes('תוכנות'))
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  // --- Current Expenses Column Helpers ---
  const lawyerExpense = expenses.filter(e => e.category === 'עו"ד' || e.category === 'משפטי').reduce((acc, e) => acc + e.amount, 0);
  const otherExpenses = expenses.filter(e => e.category !== 'עו"ד' && e.category !== 'משפטי' && e.category !== 'משכורות').reduce((acc, e) => acc + e.amount, 0);

  const startEdit = (exp: any) => {
    if (!isEditor) return;
    setEditingId(exp.id);
    setEditForm({ ...exp });
  };

  const handleSave = async (id: string) => {
    const payload = { ...editForm, amount: Number(editForm.amount) };
    if (id === 'new') {
      await addExpense(payload);
      setIsAdding(false);
    } else {
      await updateExpense(id, payload);
      setEditingId(null);
    }
    setEditForm({});
  };

  const renderDepartmentDashboard = (dept: string) => {
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptSalaries = deptEmployees.reduce((acc, emp) => acc + (emp.salary || 0), 0);
    
    // Filter department-specific maintenance issues
    let deptMaintIssues: any[] = [];
    if (dept === 'סטודנטים') {
      const studentBuildings = new Set(students.map(s => s.building_id));
      deptMaintIssues = maintenanceIssues.filter(m => studentBuildings.has(m.building_id));
    } else if (dept === 'אחזקה') {
      deptMaintIssues = maintenanceIssues;
    } else {
      deptMaintIssues = [];
    }

    const openDeptMaint = deptMaintIssues.filter(m => m.status !== 'טופל');
    const deptMaintCost = openDeptMaint.reduce((acc, m) => acc + (m.cost || 0), 0);

    // Department-specific income (e.g. Students has student rent income)
    let deptIncome = 0;
    if (dept === 'סטודנטים') {
      deptIncome = students.reduce((acc, s) => acc + (s.rent || 0), 0);
    }

    // Percentage of total salaries
    const totalSalaries = employees.reduce((acc, emp) => acc + (emp.salary || 0), 0);
    const salariesPercent = totalSalaries > 0 ? Math.round((deptSalaries / totalSalaries) * 100) : 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', direction: 'rtl', marginTop: '10px' }}>
        {/* Department Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: '12px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>עובדים במחלקה</div>
            <div style={{ color: '#a78bfa', fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>
              {deptEmployees.length} עובדים
            </div>
          </div>
          
          <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: '12px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>הוצאות שכר מחלקתיות</div>
            <div style={{ color: '#f87171', fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>
              ₪{deptSalaries.toLocaleString()}
              <span style={{ fontSize: '12px', color: '#94a3b8', marginRight: '6px', fontWeight: 'normal' }}>
                ({salariesPercent}% מכלל השכר)
              </span>
            </div>
          </div>

          {dept === 'סטודנטים' ? (
            <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: '12px' }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>הכנסות מגורים (חודשי)</div>
              <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>
                ₪{deptIncome.toLocaleString()}
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', padding: '16px 20px', borderRadius: '12px' }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>קריאות תחזוקה פתוחות</div>
              <div style={{ color: '#fbbf24', fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>
                {openDeptMaint.length} קריאות
                {deptMaintCost > 0 && (
                  <span style={{ fontSize: '12px', color: '#94a3b8', marginRight: '6px', fontWeight: 'normal' }}>
                    (עלות: ₪{deptMaintCost.toLocaleString()})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Employee list card */}
          <div style={{
            backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
            borderRight: '4px solid #a78bfa', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: 0 }}>👥 צוות עובדי המחלקה</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deptEmployees.map(emp => (
                <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{emp.name}</span>
                    <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{emp.role}</div>
                  </div>
                  <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '14px' }}>₪{emp.salary?.toLocaleString()}</span>
                </div>
              ))}
              {deptEmployees.length === 0 && (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>אין עובדים פעילים במחלקה זו</div>
              )}
            </div>
          </div>

          {/* Operational/Maintenance Info Card */}
          <div style={{
            backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
            borderRight: '4px solid #3b82f6', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
              {dept === 'סטודנטים' ? '🎓 סטטוס תפוסת דירות סטודנטים' : '🔧 יומן תחזוקת מחלקה'}
            </h4>
            {dept === 'סטודנטים' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>סה"כ דירות סטודנטים</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{students.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>מאוכלסות</span>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{students.filter(s => s.tenant_name && s.tenant_name.trim() !== '').length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>פנויות</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{students.filter(s => !s.tenant_name || s.tenant_name.trim() === '').length}</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {openDeptMaint.slice(0, 4).map(issue => (
                  <div key={issue.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '8px', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>בית {issue.building_id} - {issue.type}</span>
                      <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{issue.description || 'אין תיאור'}</div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 'bold' }}>{issue.status}</span>
                      <div style={{ color: '#94a3b8', fontSize: '11px' }}>₪{issue.cost?.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {openDeptMaint.length === 0 && (
                  <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>אין קריאות תחזוקה פתוחות משויכות</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
      backgroundColor: '#070a13', color: '#f8fafc', overflowY: 'auto',
      padding: '24px', direction: 'rtl'
    }}>
      
      {/* Sub-Header Tabs Selector */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}>
            {selectedDashboard === 'global' ? 'דשבורד כללי' : `דשבורד מחלקת ${selectedDashboard}`}
          </h2>
          
          {activeSubTab === 'dashboard' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>בחר תצוגה:</span>
              <select
                value={selectedDashboard}
                onChange={e => setSelectedDashboard(e.target.value)}
                style={{
                  backgroundColor: '#111827',
                  color: '#fff',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="global">דשבורד כללי (מסטר)</option>
                <option value="סטודנטים">מחלקת סטודנטים</option>
                <option value="אחזקה">מחלקת אחזקה</option>
                <option value="חינוך">מחלקת חינוך</option>
                <option value="מינהלה">מחלקת מינהלה</option>
                <option value="קהילה">מחלקת קהילה</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Rounded Premium Button Selectors */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setActiveSubTab('dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: 'bold',
              cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: activeSubTab === 'dashboard' ? '#2563eb' : '#1e293b',
              color: activeSubTab === 'dashboard' ? '#fff' : '#94a3b8'
            }}
          >
            <LayoutDashboard size={14} />
            <span>דשבורד</span>
          </button>
          
          <button 
            onClick={() => setActiveSubTab('salaries')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: 'bold',
              cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: activeSubTab === 'salaries' ? '#581c87' : '#1e293b',
              color: activeSubTab === 'salaries' ? '#f3e8ff' : '#94a3b8'
            }}
          >
            <Users size={14} />
            <span>משכורות</span>
          </button>

          <button 
            onClick={() => setActiveSubTab('expenses')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: 'bold',
              cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: activeSubTab === 'expenses' ? '#166534' : '#1e293b',
              color: activeSubTab === 'expenses' ? '#dcfce7' : '#94a3b8'
            }}
          >
            <FileText size={14} />
            <span>הוצאות</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'dashboard' && (
        selectedDashboard === 'global' ? (
          <>
            {/* Master Global Dashboard Aggregated Cost Centers */}
            <div style={{
              backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
              padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 ריכוז עלויות מערכת (הוצאות מערכת)
              </span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px'
              }}>
                <div style={{ backgroundColor: '#070a13', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px', borderRight: '4px solid #fbbf24' }}>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>משכורות עובדים</div>
                  <div style={{ color: '#fbbf24', fontSize: '18px', fontWeight: 'bold' }}>₪{salariesCost.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#070a13', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px', borderRight: '4px solid #f87171' }}>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>עו"ד</div>
                  <div style={{ color: '#f87171', fontSize: '18px', fontWeight: 'bold' }}>₪{legalCost.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#070a13', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px', borderRight: '4px solid #3b82f6' }}>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>בינוי ואחזקה</div>
                  <div style={{ color: '#3b82f6', fontSize: '18px', fontWeight: 'bold' }}>₪{constructionMaintenanceCost.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: '#070a13', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px', borderRight: '4px solid #ec4899' }}>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>הוצאות מחשוב ותוכנות</div>
                  <div style={{ color: '#ec4899', fontSize: '18px', fontWeight: 'bold' }}>₪{itSoftwareCost.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Top Big Stat Cards Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Card 1: הכנסה חודשית */}
              <div style={{
                backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
                padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>הכנסה חודשית</span>
                <span style={{ color: '#22c55e', fontSize: '22px', fontWeight: '800' }}>
                  ₪{totalMonthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Card 2: הכנסה שנתית */}
              <div style={{
                backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
                padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>הכנסה שנתית</span>
                <span style={{ color: '#22c55e', fontSize: '22px', fontWeight: '800' }}>
                  ₪{totalAnnualIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Card 3: משכורות */}
              <div style={{
                backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
                padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>משכורות</span>
                <span style={{ color: '#fbbf24', fontSize: '22px', fontWeight: '800' }}>
                  ₪{salariesExpense.toLocaleString()}
                </span>
              </div>

              {/* Card 4: תחזוקה פתוחה */}
              <div style={{
                backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
                padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>תחזוקה פתוחה</span>
                <span style={{ color: '#f87171', fontSize: '22px', fontWeight: '800' }}>
                  {totalOpenMaintenance} קריאות
                </span>
              </div>
            </div>

            {/* Detailed Metric Section Cards (Listed Vertically) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Section 1: דירות תושבים */}
              <div style={{
                backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
                borderRight: '4px solid #a78bfa', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
              }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                    🏠 דירות תושבים
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ backgroundColor: '#581c87', color: '#f3e8ff', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' }}>
                      סה"כ {totalResUnits}
                    </span>
                    <span style={{ backgroundColor: '#064e3b', color: '#d1fae5', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' }}>
                      מאוכלסות {occupiedResUnits}
                    </span>
                    <span style={{ backgroundColor: '#7f1d1d', color: '#fee2e2', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' }}>
                      פנויות {vacantResUnits}
                    </span>
                  </div>
                </div>

                {/* Data Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>שכ"ד חודשי</span>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '15px' }}>₪{resMonthlyRent.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>שכ"ד שנתי</span>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '15px' }}>₪{resAnnualRent.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>אחוז תפוסה</span>
                    <span style={{ color: '#a78bfa', fontWeight: 'bold', fontSize: '15px' }}>{resOccupancyRate}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>תחזוקה נדרשת</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '15px' }}>{resMaintenanceCount} קריאות</span>
                      <span style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>עלות מוערכת: ₪{totalMaintenanceCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => navigate('/res')}
                  style={{
                    alignSelf: 'flex-start', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                    borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', transition: 'background-color 0.2s', marginTop: '4px'
                  }}
                >
                  <span>פתח</span>
                  <ArrowLeft size={14} />
                </button>
              </div>

              {/* Section 2: דירות סטודנטים */}
              <div style={{
                backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
                borderRight: '4px solid #3b82f6', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
              }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                    🎓 דירות סטודנטים
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ backgroundColor: '#1e3a8a', color: '#dbeafe', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' }}>
                      סה"כ {totalStuUnits}
                    </span>
                    <span style={{ backgroundColor: '#064e3b', color: '#d1fae5', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' }}>
                      מאוכלסות {occupiedStuUnits}
                    </span>
                    <span style={{ backgroundColor: '#7f1d1d', color: '#fee2e2', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' }}>
                      פנויות {vacantStuUnits}
                    </span>
                  </div>
                </div>

                {/* Data Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>שכ"ד חודשי</span>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '15px' }}>₪{stuMonthlyRent.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>שכ"ד שנתי</span>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '15px' }}>₪{stuAnnualRent.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>אחוז תפוסה</span>
                    <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '15px' }}>{stuOccupancyRate}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>תחזוקה נדרשת</span>
                    <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '15px' }}>{stuMaintenanceCount} קריאות</span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => navigate('/stu')}
                  style={{
                    alignSelf: 'flex-start', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                    borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', transition: 'background-color 0.2s', marginTop: '4px'
                  }}
                >
                  <span>פתח</span>
                  <ArrowLeft size={14} />
                </button>
              </div>

              {/* Section 3: עסקים */}
              <div style={{
                backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
                borderRight: '4px solid #fbbf24', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
              }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                    🏢 עסקים
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ backgroundColor: '#7c2d12', color: '#ffedd5', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' }}>
                      סה"כ {totalBizUnits}
                    </span>
                    <span style={{ backgroundColor: '#064e3b', color: '#d1fae5', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' }}>
                      פעילים {activeBizUnits}
                    </span>
                  </div>
                </div>

                {/* Data Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>שכ"ד חודשי</span>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '15px' }}>₪{bizMonthlyRent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>שכ"ד שנתי</span>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '15px' }}>₪{bizAnnualRent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>תחזוקה נדרשת</span>
                    <span style={{ color: '#64748b', fontWeight: 'bold', fontSize: '15px' }}>-</span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => navigate('/biz')}
                  style={{
                    alignSelf: 'flex-start', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                    borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', transition: 'background-color 0.2s', marginTop: '4px'
                  }}
                >
                  <span>פתח</span>
                  <ArrowLeft size={14} />
                </button>
              </div>

              {/* Section 4: הוצאות שוטפות */}
              <div style={{
                backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
                borderRight: '4px solid #ec4899', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
              }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                    💸 הוצאות שוטפות
                  </span>
                </div>

                {/* Data Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>משכורות</span>
                    <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '15px' }}>₪{salariesExpense.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>עו"ד</span>
                    <span style={{ color: lawyerExpense > 0 ? '#f87171' : '#64748b', fontStyle: lawyerExpense > 0 ? 'normal' : 'italic', fontSize: '15px', fontWeight: 'bold' }}>
                      {lawyerExpense > 0 ? `₪${lawyerExpense.toLocaleString()}` : 'הזן ערך'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>אחר</span>
                    <span style={{ color: otherExpenses > 0 ? '#f87171' : '#64748b', fontStyle: otherExpenses > 0 ? 'normal' : 'italic', fontSize: '15px', fontWeight: 'bold' }}>
                      {otherExpenses > 0 ? `₪${otherExpenses.toLocaleString()}` : 'הזן ערך'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => setActiveSubTab('expenses')}
                  style={{
                    alignSelf: 'flex-start', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                    borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', transition: 'background-color 0.2s', marginTop: '4px'
                  }}
                >
                  <span>פרטים</span>
                  <ArrowLeft size={14} />
                </button>
              </div>

              {/* Section 5: תחזוקה */}
              <div style={{
                backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
                borderRight: '4px solid #f59e0b', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
              }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                    🔧 תחזוקה
                  </span>
                </div>

                {/* Data Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>קריאות פתוחות</span>
                    <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '15px' }}>{totalOpenMaintenance}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>עלות צפויה</span>
                    <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '15px' }}>₪{totalMaintenanceCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </>
        ) : (
          renderDepartmentDashboard(selectedDashboard)
        )
      )}

      {activeSubTab === 'salaries' && (
        <>
          {/* Salaries Specific Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
              padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>סה"כ עובדים</span>
              <span style={{ color: '#a78bfa', fontSize: '22px', fontWeight: '800' }}>
                {employees.length} עובדים
              </span>
            </div>

            <div style={{
              backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
              padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>משכורות (חודשי)</span>
              <span style={{ color: '#f87171', fontSize: '22px', fontWeight: '800' }}>
                ₪{salariesExpense.toLocaleString()}
              </span>
            </div>

            <div style={{
              backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
              padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>צפי משכורות שנתי</span>
              <span style={{ color: '#f87171', fontSize: '22px', fontWeight: '800' }}>
                ₪{(salariesExpense * 12).toLocaleString()}
              </span>
            </div>

            <div style={{
              backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
              padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>ממוצע שכר לעובד</span>
              <span style={{ color: '#3b82f6', fontSize: '22px', fontWeight: '800' }}>
                ₪{Math.round(employees.length > 0 ? salariesExpense / employees.length : 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Salaries Breakdown Layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Section 1: עובדים פעילים */}
            <div style={{
              backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
              borderRight: '4px solid #581c87', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                  👥 עובדים פעילים
                </span>
                <span style={{ backgroundColor: '#581c87', color: '#f3e8ff', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px' }}>
                  סה"כ {employees.length} עובדים
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {employees.map(emp => (
                  <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{emp.name}</span>
                      <span style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{emp.role} (מחלקת {emp.department})</span>
                    </div>
                    <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '15px' }}>₪{emp.salary?.toLocaleString()}</span>
                  </div>
                ))}
                {employees.length === 0 && (
                  <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>אין עובדים פעילים במערכת</div>
                )}
              </div>
            </div>

            {/* Section 2: התפלגות שכר לפי מחלקה */}
            <div style={{
              backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px',
              borderRight: '4px solid #3b82f6', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                  📊 התפלגות שכר לפי מחלקה
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(
                  employees.reduce((acc: any, emp) => {
                    if (!acc[emp.department]) acc[emp.department] = { count: 0, salary: 0 };
                    acc[emp.department].count += 1;
                    acc[emp.department].salary += emp.salary || 0;
                    return acc;
                  }, {})
                ).map(([dept, data]: [string, any]) => (
                  <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{dept}</span>
                      <span style={{ backgroundColor: '#1e3a8a', color: '#dbeafe', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>
                        {data.count} עובדים
                      </span>
                    </div>
                    <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '15px' }}>₪{data.salary.toLocaleString()}</span>
                  </div>
                ))}
                {employees.length === 0 && (
                  <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>אין נתוני מחלקות</div>
                )}
              </div>
            </div>

            {/* Manager Link Button */}
            <button 
              onClick={() => navigate('/pay')}
              style={{
                alignSelf: 'center', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc',
                borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s', marginTop: '10px'
              }}
            >
              <span>ניהול עובדים ומשכורות מלא</span>
              <ArrowLeft size={16} />
            </button>

          </div>
        </>
      )}

      {activeSubTab === 'expenses' && (
        <div style={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#fff' }}>מעקב הוצאות מערכת</h3>
            {isEditor && (
              <button 
                className="btn btn-primary" 
                onClick={() => { setIsAdding(true); setEditForm({ category: '', description: '', amount: 0, frequency: 'חד פעמי' }); }}
                disabled={isAdding}
                style={{
                  padding: '8px 16px', background: '#2563eb', border: 'none', borderRadius: '6px',
                  color: '#fff', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s'
                }}
              >
                ➕ הוסף הוצאה
              </button>
            )}
          </div>
          
          <table className="at" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'right', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '12px' }}>קטגוריה</th>
                <th style={{ padding: '12px' }}>תיאור</th>
                <th style={{ padding: '12px' }}>סכום (₪)</th>
                <th style={{ padding: '12px' }}>תדירות</th>
                <th style={{ padding: '12px' }}>תאריך העלאה</th>
                {isEditor && <th style={{ padding: '12px', textAlign: 'center' }}>פעולות</th>}
              </tr>
            </thead>
            <tbody>
              {isAdding && (
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '12px' }}><input className="apt-in" type="text" value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} placeholder="קטגוריה..." /></td>
                  <td style={{ padding: '12px' }}><input className="apt-in" type="text" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="תיאור..." /></td>
                  <td style={{ padding: '12px' }}><input className="apt-in" type="number" value={editForm.amount || ''} onChange={e => setEditForm({...editForm, amount: e.target.value})} placeholder="סכום..." /></td>
                  <td style={{ padding: '12px' }}>
                    <select className="bc-status-sel" value={editForm.frequency || 'חד פעמי'} onChange={e => setEditForm({...editForm, frequency: e.target.value})}>
                      <option value="חד פעמי">חד פעמי</option>
                      <option value="חודשי">חודשי</option>
                      <option value="שנתי">שנתי</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px' }}>-</td>
                  <td style={{ padding: '12px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <button className="eb" onClick={() => handleSave('new')}><Check size={14} /></button>
                    <button className="eb" onClick={() => setIsAdding(false)}><X size={14} /></button>
                  </td>
                </tr>
              )}
              {expenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  {editingId === exp.id ? (
                    <>
                      <td style={{ padding: '12px' }}><input className="apt-in" type="text" value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} /></td>
                      <td style={{ padding: '12px' }}><input className="apt-in" type="text" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} /></td>
                      <td style={{ padding: '12px' }}><input className="apt-in" type="number" value={editForm.amount || ''} onChange={e => setEditForm({...editForm, amount: e.target.value})} /></td>
                      <td style={{ padding: '12px' }}>
                        <select className="bc-status-sel" value={editForm.frequency || ''} onChange={e => setEditForm({...editForm, frequency: e.target.value})}>
                          <option value="חד פעמי">חד פעמי</option>
                          <option value="חודשי">חודשי</option>
                          <option value="שנתי">שנתי</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px' }}>{new Date(exp.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button className="eb" onClick={() => handleSave(exp.id)}><Check size={14} /></button>
                        <button className="eb" onClick={() => setEditingId(null)}><X size={14} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '12px' }}>{exp.category}</td>
                      <td style={{ padding: '12px' }}>{exp.description}</td>
                      <td style={{ padding: '12px', color: '#22c55e', fontWeight: 'bold' }}>₪{exp.amount?.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>{exp.frequency}</td>
                      <td style={{ padding: '12px' }}>{new Date(exp.date).toLocaleDateString()}</td>
                      {isEditor && (
                        <td style={{ padding: '12px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button className="eb" onClick={() => startEdit(exp)}><Edit2 size={14} /></button>
                          <button className="eb" onClick={() => softDeleteExpense(exp.id)}><Trash2 size={14} color="#ef4444" /></button>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))}
              {expenses.length === 0 && !isAdding && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>לא קיימות הוצאות במערכת</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GlobalDashboard;
