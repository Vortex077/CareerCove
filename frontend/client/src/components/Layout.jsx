import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { LogOut, LayoutDashboard, Briefcase, ClipboardList, Building2, BarChart3, Settings, Target } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isStudent = user?.role === 'STUDENT';
  const isAdmin   = user?.role === 'ADMIN' || user?.role === 'TNP_COORDINATOR' || user?.role === 'HOD';

  const navCls = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
      isActive
        ? 'bg-primary-lighter text-primary-dark'
        : 'text-secondary hover-nav'
    }`;

  const studentLinks = [
    { to: '/student/dashboard',    icon: <LayoutDashboard size={16}/>, label: 'Dashboard'    },
    { to: '/student/jobs',         icon: <Briefcase       size={16}/>, label: 'Jobs'         },
    { to: '/student/applications', icon: <ClipboardList   size={16}/>, label: 'Applications' },
    { to: '/student/profile',      icon: <Settings        size={16}/>, label: 'Profile'      },
  ];

  const adminLinks = [
    { to: '/admin/dashboard',    icon: <LayoutDashboard size={16}/>, label: 'Dashboard'    },
    { to: '/admin/companies',    icon: <Building2       size={16}/>, label: 'Companies'    },
    { to: '/admin/drives',       icon: <Target          size={16}/>, label: 'Drives'       },
    { to: '/admin/jobs',         icon: <Briefcase       size={16}/>, label: 'Jobs'         },
    { to: '/admin/applications', icon: <ClipboardList   size={16}/>, label: 'Pipeline'     },
    { to: '/reports',            icon: <BarChart3       size={16}/>, label: 'Reports'      },
  ];

  const links = isStudent ? studentLinks : adminLinks;

  // Role badge colour
  const roleMeta = {
    STUDENT:         { label: 'Student',     color: '#0F766E' },
    TNP_COORDINATOR: { label: 'T&P Coord.',  color: '#7C3AED' },
    HOD:             { label: 'HOD',          color: '#D97706' },
    ADMIN:           { label: 'Admin',        color: '#DC2626' },
  };
  const rm = roleMeta[user?.role] || { label: user?.role, color: '#64748B' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-secondary)' }}>

      {/* ── Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: 60, gap: '2rem' }}>

          {/* Brand */}
          <button
            onClick={() => navigate(isStudent ? '/student/dashboard' : '/admin/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Briefcase size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 700, color: '#134E4A', letterSpacing: '-0.02em' }}>
              CareerCove
            </span>
          </button>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {links.map(l => (
              <NavLink key={l.to} to={l.to} className={navCls}
                style={({ isActive }) => isActive
                  ? { background: '#CCFBF1', color: '#115E59' }
                  : { color: '#64748B' }
                }
              >
                {l.icon} {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* User pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '0.85rem',
                flexShrink: 0,
              }}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName || 'User'}
                </p>
                <span style={{ fontSize: '0.68rem', color: rm.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {rm.label}
                </span>
              </div>
            </div>

            <NotificationDropdown />

            <button
              onClick={handleLogout}
              title="Log out"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: '50%',
                background: 'none', border: '1px solid #E2E8F0',
                cursor: 'pointer', color: '#64748B',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.borderColor = '#FECACA'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="fade-in" style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: 'white', borderTop: '1px solid #E2E8F0', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
            © 2025 CareerCove — Placement Management System
          </p>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>
            All data is secure and encrypted.
          </p>
        </div>
      </footer>

    </div>
  );
}
