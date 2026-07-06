import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const scoreColor = s => s >= 8 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';

// ── Modal ──────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
    <div className="glass anim-scale-in" style={{ width: '100%', maxWidth: 520, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#eef0ff' }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5a6080', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

// ── Stat card ──────────────────────────────────────────────
const StatCard = ({ emoji, label, value, color }) => (
  <div className="glass" style={{ padding: '20px 22px' }}>
    <div style={{ fontSize: 24, marginBottom: 10 }}>{emoji}</div>
    <p style={{ fontSize: 12, color: '#5a6080', marginBottom: 4 }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 800, color: color || '#eef0ff', letterSpacing: '-0.02em' }}>{value ?? '—'}</p>
  </div>
);

// ── User form ──────────────────────────────────────────────
const UserForm = ({ initial = {}, onSave, onClose, isEdit }) => {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    password: '',
    role: initial.role || 'user',
    targetRole: initial.targetRole || '',
  });
  const [saving, setSaving] = useState(false);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email are required');
    if (!isEdit && !form.password) return toast.error('Password is required for new users');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await onSave(payload);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5a6080', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</label>
      <input type={type} name={name} value={form[name]} onChange={onChange} placeholder={placeholder} className="input" />
    </div>
  );

  return (
    <div>
      <Field label="Full Name"    name="name"       placeholder="John Doe" />
      <Field label="Email"        name="email"      type="email" placeholder="john@example.com" />
      <Field label={isEdit ? "New Password (leave blank to keep)" : "Password"} name="password" type="password" placeholder="Min 6 characters" />
      <Field label="Target Role"  name="targetRole" placeholder="e.g. Backend Engineer" />
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5a6080', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Role</label>
        <select name="role" value={form.role} onChange={onChange}
          style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#eef0ff', fontSize: 14, fontFamily: 'Inter', outline: 'none' }}>
          <option value="user"  style={{ background: '#0e1117' }}>User</option>
          <option value="admin" style={{ background: '#0e1117' }}>Admin</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
          {saving ? <><span className="spin" style={{ width: 14, height: 14 }} />{isEdit ? 'Saving...' : 'Creating...'}</> : isEdit ? 'Save Changes' : 'Create User'}
        </button>
      </div>
    </div>
  );
};

// ── Main Admin Panel ───────────────────────────────────────
const AdminPanel = () => {
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | 'create' | { type: 'edit'|'delete', user }

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
    } catch {}
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?page=${page}&limit=10&search=${search}&sort=-createdAt`);
      setUsers(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (payload) => {
    await api.post('/admin/users', payload);
    toast.success('User created!');
    fetchUsers(); fetchStats();
  };

  const handleUpdate = async (id, payload) => {
    await api.put(`/admin/users/${id}`, payload);
    toast.success('User updated!');
    fetchUsers();
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setModal(null);
      fetchUsers(); fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const pages = Math.ceil(total / 10);

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.03em' }}>Admin Panel</h1>
        </div>
        <p style={{ fontSize: 14, color: '#5a6080' }}>Manage users, view platform stats, and control access.</p>
      </div>

      {/* Platform stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
          <StatCard emoji="👥" label="Total Users"     value={stats.totalUsers}        color="#a5a0ff" />
          <StatCard emoji="🎯" label="Total Sessions"  value={stats.totalSessions}     color="#22d3ee" />
          <StatCard emoji="✅" label="Completed"        value={stats.completedSessions} color="#10b981" />
          <StatCard emoji="📝" label="Total Questions" value={stats.totalInterviews}   color="#f59e0b" />
        </div>
      )}

      {/* Users table */}
      <div className="glass anim-fade-up d1" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#eef0ff' }}>Users ({total})</h2>
          <div style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 500, justifyContent: 'flex-end' }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              style={{ flex: 1, padding: '9px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#eef0ff', fontSize: 13, outline: 'none', fontFamily: 'Inter' }} />
            <button onClick={() => setModal('create')} className="btn btn-primary" style={{ width: 'auto', padding: '9px 18px', fontSize: 13, whiteSpace: 'nowrap' }}>
              + Add User
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <span className="spin" style={{ width: 28, height: 28, color: '#6c63ff' }} />
          </div>
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#3d4466', padding: 48, fontSize: 14 }}>No users found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['User', 'Email', 'Role', 'Sessions', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#3d4466', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: '#eef0ff' }}>{u.name}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px', color: '#8b93b8' }}>{u.email}</td>

                    <td style={{ padding: '14px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: u.role === 'admin' ? 'rgba(239,68,68,0.12)' : 'rgba(108,99,255,0.12)',
                        color: u.role === 'admin' ? '#ef4444' : '#a5a0ff',
                        border: `1px solid ${u.role === 'admin' ? 'rgba(239,68,68,0.25)' : 'rgba(108,99,255,0.25)'}`,
                      }}>{u.role}</span>
                    </td>

                    <td style={{ padding: '14px', color: '#8b93b8', textAlign: 'center' }}>{u.totalSessions}</td>

                    <td style={{ padding: '14px', color: '#5a6080', whiteSpace: 'nowrap' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setModal({ type: 'edit', user: u })}
                          style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)', color: '#a5a0ff', cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s' }}>
                          Edit
                        </button>
                        <button onClick={() => setModal({ type: 'delete', user: u })}
                          style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>← Prev</button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#5a6080', padding: '0 12px' }}>
              Page {page} of {pages}
            </span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>Next →</button>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'create' && (
        <Modal title="Create New User" onClose={() => setModal(null)}>
          <UserForm onSave={handleCreate} onClose={() => setModal(null)} isEdit={false} />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title={`Edit — ${modal.user.name}`} onClose={() => setModal(null)}>
          <UserForm
            initial={modal.user}
            onSave={(payload) => handleUpdate(modal.user._id, payload)}
            onClose={() => setModal(null)}
            isEdit
          />
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title="Delete User" onClose={() => setModal(null)}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ fontSize: 15, color: '#eef0ff', fontWeight: 600, marginBottom: 8 }}>Delete {modal.user.name}?</p>
            <p style={{ fontSize: 13, color: '#5a6080', marginBottom: 28, lineHeight: 1.6 }}>
              This will permanently delete the user and all their sessions, questions, and feedback. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => handleDelete(modal.user._id)}
                style={{ flex: 1, padding: '12px 24px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>
                Delete Forever
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminPanel;