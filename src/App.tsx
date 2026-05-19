import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import GlobalDashboard from './components/GlobalDashboard';
import PropertyTables from './components/PropertyTables';
import PropertyMap from './components/PropertyMap';
import Paychecks from './components/Paychecks';
import { Shield, ShieldAlert } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { role, setRole } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.pathname.substring(1) || 'res';

  const toggleRole = () => {
    setRole(role === 'Editor' ? 'Viewer' : 'Editor');
  };

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
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 10px' }}>
          <button 
            onClick={toggleRole}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: role === 'Editor' ? '#ef4444' : '#3b82f6', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            {role === 'Editor' ? <ShieldAlert size={14} /> : <Shield size={14} />}
            {role === 'Editor' ? 'עורך (Editor)' : 'צופה (Viewer)'}
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
