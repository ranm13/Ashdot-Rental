import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Lock, User, Key, Check, AlertCircle, ArrowRight, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || (window.location.origin.includes('5173') ? 'http://localhost:3000/api' : '/api');

const AuthScreen: React.FC = () => {
  const { login } = useAppContext();
  const [isRegister, setIsRegister] = useState(false);
  const [inviteToken, setInviteToken] = useState('');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [tokenRole, setTokenRole] = useState('');
  const [tokenError, setTokenError] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check URL token on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setIsRegister(true);
      setInviteToken(token);
      validateToken(token);
    } else {
      setIsRegister(false);
      setInviteToken('');
      setIsValidToken(null);
    }
  }, [window.location.search]);

  const validateToken = async (token: string) => {
    setLoading(true);
    setTokenError('');
    try {
      const res = await fetch(`${API_URL}/auth/invitation/${token}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setIsValidToken(true);
        setTokenRole(data.role);
      } else {
        setIsValidToken(false);
        setTokenError(data.error || 'הזמנה לא בתוקף או שלא נמצאה במערכת');
      }
    } catch (err) {
      setIsValidToken(false);
      setTokenError('שגיאת תקשורת בבדיקת ההזמנה');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('נא להזין שם משתמש וסיסמה');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || 'שם משתמש או סיסמה שגויים');
      }
    } catch (err) {
      setError('שגיאת תקשורת בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError('כל השדות הם חובה');
      return;
    }
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }
    if (password.length < 4) {
      setError('הסיסמה חייבת להכיל לפחות 4 תווים');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: inviteToken, username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('ההרשמה בוצעה בהצלחה! כעת ניתן להתחבר');
        setUsername(username); // keep username for login
        setPassword('');
        setConfirmPassword('');
        // Remove token from query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          setIsRegister(false);
          setSuccess('');
          setError('');
        }, 2000);
      } else {
        setError(data.error || 'שגיאה במהלך ההרשמה');
      }
    } catch (err) {
      setError('שגיאת תקשורת בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      fontFamily: 'inherit',
      direction: 'rtl'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.45)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '40px',
        width: '380px',
        maxWidth: '90vw',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        {/* LOGO */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: '#fff',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '20px',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
        }}>
          א
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
          מערכת אשדות
        </h1>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 30px 0' }}>
          {isRegister ? 'יצירת משתמש חדש במערכת' : 'אנא הזן פרטי חיבור'}
        </p>

        {loading && isValidToken === null && isRegister ? (
          <div style={{ padding: '20px', color: '#94a3b8', fontSize: '14px' }}>
            בודק את תוקף ההזמנה...
          </div>
        ) : isRegister && isValidToken === false ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              padding: '16px',
              color: '#fca5a5',
              fontSize: '13px',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={28} color="#ef4444" />
              <span>{tokenError || 'הזמנה זו אינה תקפה.'}</span>
            </div>
            <button
              onClick={() => {
                window.history.replaceState({}, document.title, window.location.pathname);
                setIsRegister(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              <ArrowRight size={16} /> חזרה למסך התחברות
            </button>
          </div>
        ) : (
          <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ textAlign: 'right' }}>
            {/* ALERT BANNERS */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#fca5a5',
                fontSize: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#86efac',
                fontSize: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Check size={16} style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}

            {isRegister && isValidToken && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#93c5fd',
                fontSize: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Shield size={16} style={{ flexShrink: 0 }} />
                <span>הרשמה בתפקיד: <strong>{tokenRole === 'ADMIN' ? 'מנהל מערכת (Admin)' : 'צפייה בלבד (Read-Only)'}</strong></span>
              </div>
            )}

            {/* INPUT FIELDS */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
                שם משתמש
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '13px',
                    padding: '10px 12px 10px 36px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="הזן שם משתמש"
                  autoFocus
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              </div>
            </div>

            <div style={{ marginBottom: isRegister ? '16px' : '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
                סיסמה
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '13px',
                    padding: '10px 12px 10px 36px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="הזן סיסמה"
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              </div>
            </div>

            {isRegister && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
                  אימות סיסמה
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      padding: '10px 12px 10px 36px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="הזן סיסמה שנית"
                  />
                  <Key size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                </div>
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? 'מבצע פעולה...' : isRegister ? 'הרשם והכנס למערכת' : 'התחבר למערכת'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
