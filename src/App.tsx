import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import GlobalDashboard from './components/GlobalDashboard';
import PropertyTables from './components/PropertyTables';
import PropertyMap from './components/PropertyMap';
import Paychecks from './components/Paychecks';
import AuthScreen from './components/AuthScreen';
import UsersManage from './components/UsersManage';
import { LogOut } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { role, isAuthenticated, user, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  // If not authenticated, force AuthScreen (handles both login & register based on URL token)
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const activeTab = location.pathname.substring(1) || 'res';

  return (
    <div id="app">
      {/* HEADER */}
      <div id="hdr">
        <div id="main-nav">
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#a78bfa', padding: '0 8px', flexShrink: 0 }}>
            אשדות
          </div>
          <button className={`nb ${activeTab === 'res' ? 'on' : ''}`} onClick={() => navigate('/res')}>
            🏠 דירות תושבים
          </button>
          <button className={`nb ${activeTab === 'stu' ? 'on' : ''}`} onClick={() => navigate('/stu')}>
            🎓 דירות סטודנטים
          </button>
          <button className={`nb ${activeTab === 'biz' ? 'on' : ''}`} onClick={() => navigate('/biz')}>
            🏬 עסקים
          </button>
          <button className={`nb ${activeTab === 'gen' ? 'on' : ''}`} onClick={() => navigate('/gen')}>
            📊 דשבורד
          </button>
          <button className={`nb ${activeTab === 'map' ? 'on' : ''}`} onClick={() => navigate('/map')}>
            🗺️ מפה
          </button>
          <button className={`nb ${activeTab === 'pay' ? 'on' : ''}`} onClick={() => navigate('/pay')}>
            💰 משכורות
          </button>
          {/* Admin User Management Tab */}
          {role === 'Admin' && (
            <button className={`nb ${activeTab === 'users' ? 'on' : ''}`} onClick={() => navigate('/users')}>
              🛡️ ניהול משתמשים
            </button>
          )}
        </div>
        
        {/* User profile & Logout button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
            <span style={{ fontWeight: 'bold', color: '#f1f5f9' }}>{user?.username}</span>
            <span style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '9px',
              fontWeight: 'bold',
              background: role === 'Admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: role === 'Admin' ? '#fca5a5' : '#93c5fd',
              border: role === 'Admin' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              {role === 'Admin' ? 'מנהל' : 'צופה'}
            </span>
          </div>
          
          <button 
            onClick={logout}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            title="התנתק מהמערכת"
          >
            <LogOut size={13} color="#ef4444" />
            <span style={{ color: '#ef4444' }}>התנתק</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div id="content" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/gen" element={<GlobalDashboard />} />
          <Route path="/res" element={<PropertyTables type="Resident" />} />
          <Route path="/stu" element={<PropertyTables type="Student" />} />
          <Route path="/biz" element={<PropertyTables type="Business" />} />
          <Route path="/map" element={<PropertyMap />} />
          <Route path="/pay" element={<Paychecks />} />
          {/* Admin User Management Route */}
          {role === 'Admin' && <Route path="/users" element={<UsersManage />} />}
          <Route path="*" element={<Navigate to="/res" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
