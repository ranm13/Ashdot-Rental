import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Key, Trash2, Link, Copy, Check, Plus, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || (window.location.origin.includes('5173') ? 'http://localhost:3000/api' : '/api');

const UsersManage: React.FC = () => {
  const { token, user: currentUser } = useAppContext();
  const [users, setUsers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  
  // Invite form state
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'READ_ONLY'>('READ_ONLY');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsersAndInvites = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [usersRes, invitesRes] = await Promise.all([
        fetch(`${API_URL}/auth/users`, { headers }),
        fetch(`${API_URL}/auth/invitations`, { headers })
      ]);

      if (usersRes.ok && invitesRes.ok) {
        const usersData = await usersRes.json();
        const invitesData = await invitesRes.json();
        setUsers(usersData);
        setInvites(invitesData);
      } else {
        setError('שגיאה בטעינת משתמשים והזמנות מהשרת');
      }
    } catch (err) {
      setError('שגיאת תקשורת בחיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsersAndInvites();
    }
  }, [token]);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setGeneratedLink('');
    setCopied(false);

    try {
      const res = await fetch(`${API_URL}/auth/invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: inviteRole })
      });
      const data = await res.json();
      if (res.ok) {
        // Build invitation link
        const base = window.location.origin;
        const link = `${base}/register?token=${data.token}`;
        setGeneratedLink(link);
        setSuccess('הזמנה נוצרה בהצלחה!');
        // Refresh invites list
        fetchUsersAndInvites();
      } else {
        setError(data.error || 'שגיאה ביצירת הזמנה');
      }
    } catch (err) {
      setError('שגיאת תקשורת ביצירת הזמנה');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (id === currentUser?.id) {
      alert('אינך יכול למחוק את החשבון של עצמך!');
      return;
    }
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${username}?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        setSuccess(`המשתמש ${username} נמחק בהצלחה!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'שגיאה במחיקת המשתמש');
      }
    } catch (err) {
      setError('שגיאת תקשורת במחיקת המשתמש');
    }
  };

  const handleRevokeInvite = async (id: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך לבטל הזמנה זו?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/invitations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInvites(prev => prev.filter(i => i.id !== id));
        setSuccess('ההזמנה בוטלה בהצלחה!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'שגיאה בביטול ההזמנה');
      }
    } catch (err) {
      setError('שגיאת תקשורת בביטול ההזמנה');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      height: '100%',
      overflowY: 'auto',
      padding: '24px',
      background: '#0a0f1e',
      direction: 'rtl'
    }}>
      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            🛡️ ניהול משתמשים והזמנות
          </h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            ניהול המורשים למערכת, מחיקת משתמשים ויצירת קישורי הרשמה מאובטחים.
          </p>
        </div>
        <button
          onClick={fetchUsersAndInvites}
          disabled={loading}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#94a3b8',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
          רענן
        </button>
      </div>

      {/* NOTIFICATION BANNERS */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#fca5a5',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#86efac',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* GRID LAYOUT */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '24px',
        flex: 1
      }}>
        {/* LEFT COLUMN: ACTIVE USERS */}
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#3b82f6" />
            משתמשים פעילים במערכת ({users.length})
          </h2>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', textAlign: 'right' }}>
                  <th style={{ padding: '10px 8px', color: '#64748b' }}>שם משתמש</th>
                  <th style={{ padding: '10px 8px', color: '#64748b' }}>תפקיד</th>
                  <th style={{ padding: '10px 8px', color: '#64748b', textAlign: 'center' }}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#f8fafc' }}>
                      {u.username} {u.id === currentUser?.id && <span style={{ fontSize: '10px', color: '#10b981', fontStyle: 'italic' }}>(אתה)</span>}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        background: u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: u.role === 'ADMIN' ? '#fca5a5' : '#93c5fd',
                        border: u.role === 'ADMIN' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        {u.role === 'ADMIN' ? 'מנהל (Admin)' : 'צופה בלבד (Read-Only)'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        disabled={u.id === currentUser?.id}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: u.id === currentUser?.id ? '#334155' : '#ef4444',
                          cursor: u.id === currentUser?.id ? 'not-allowed' : 'pointer',
                          padding: '4px'
                        }}
                        title={u.id === currentUser?.id ? 'לא ניתן למחוק את המשתמש הנוכחי' : 'מחק משתמש'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: GENERATE INVITATIONS & ACTIVE INVITATIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* GENERATE INVITE PANEL */}
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="#a78bfa" />
              צור הזמנת הרשמה חדשה
            </h2>

            <form onSubmit={handleGenerateInvite} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>תפקיד המשתמש החדש:</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as any)}
                  style={{
                    width: '100%',
                    background: '#0a0f1e',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="READ_ONLY">צופה בלבד (Read-Only) - אין הרשאות עריכה/מחיקה</option>
                  <option value="ADMIN">מנהל מערכת (Admin) - הרשאות מלאות</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
                }}
              >
                <Plus size={16} />
                צור קישור הרשמה
              </button>
            </form>

            {generatedLink && (
              <div style={{
                marginTop: '20px',
                background: '#0a0f1e',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Link size={12} /> הקישור הבא בתוקף ל-24 שעות הקרובות בלבד:
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#a78bfa',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      direction: 'ltr',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleCopyLink}
                    style={{
                      background: copied ? '#10b981' : '#1e293b',
                      border: copied ? '1px solid #10b981' : '1px solid #334155',
                      color: '#fff',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 'bold'
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'הועתק!' : 'העתק'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE INVITES PANEL */}
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '20px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link size={18} color="#10b981" />
              הזמנות פתוחות שלא מומשו ({invites.filter(i => !i.used).length})
            </h2>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', textAlign: 'right' }}>
                    <th style={{ padding: '8px 4px', color: '#64748b' }}>קוד / טוקן</th>
                    <th style={{ padding: '8px 4px', color: '#64748b' }}>תפקיד מיועד</th>
                    <th style={{ padding: '8px 4px', color: '#64748b' }}>תוקף</th>
                    <th style={{ padding: '8px 4px', color: '#64748b' }}>סטטוס</th>
                    <th style={{ padding: '8px 4px', color: '#64748b', textAlign: 'center' }}>ביטול</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map(i => {
                    const isExpired = new Date(i.expiresAt) < new Date();
                    return (
                      <tr key={i.id} style={{ borderBottom: '1px solid #1e293b', opacity: (i.used || isExpired) ? 0.45 : 1 }}>
                        <td style={{ padding: '10px 4px', fontFamily: 'monospace', color: '#a78bfa', fontSize: '10px', direction: 'ltr', textAlign: 'right' }}>
                          {i.token.substring(0, 10)}...
                        </td>
                        <td style={{ padding: '10px 4px', fontWeight: 'bold' }}>
                          {i.role === 'ADMIN' ? 'מנהל (Admin)' : 'צופה (Read-Only)'}
                        </td>
                        <td style={{ padding: '10px 4px', color: '#94a3b8' }}>
                          {new Date(i.expiresAt).toLocaleDateString('he-IL')} {new Date(i.expiresAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '10px 4px' }}>
                          {i.used ? (
                            <span style={{ color: '#64748b', fontSize: '9px' }}>מומש</span>
                          ) : isExpired ? (
                            <span style={{ color: '#ef4444', fontSize: '9px' }}>פג תוקף</span>
                          ) : (
                            <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 'bold' }}>פעיל</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleRevokeInvite(i.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '2px'
                            }}
                            title="בטל הזמנה"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {invites.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        לא נמצאו הזמנות הרשמה
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManage;
