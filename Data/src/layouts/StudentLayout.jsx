import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { mockAuth } from '../utils/auth';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Code,
  FolderKanban,
  Bot,
  Menu,
  X,
  LogOut,
  Shield,
  FileText,
  Target
} from 'lucide-react';

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = mockAuth.getCurrentUser();
  const isAdmin = user && mockAuth.isAdmin(user);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Topics', path: '/topics' },
    { icon: Video, label: 'Video Lectures', path: '/lectures' },
    { icon: Code, label: 'Practice Simulators', path: '/simulators' },
    { icon: FolderKanban, label: 'Project Lab', path: '/projects' },
    { icon: FileText, label: 'Resume Builder', path: '/resume' },
    { icon: Target, label: 'Interview Prep', path: '/interview' },
    { icon: Bot, label: 'AI Mentor', path: '/ai-mentor' },
  ];

  const handleLogout = () => {
    // Clear user immediately
    mockAuth.logout();
    // Force navigation immediately
    window.location.href = '/login';
  };

  const isActive = (path) => {
    if (path === '/interview') {
      return location.pathname.startsWith('/interview');
    }
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-primary">DataScience Academy</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Back to Admin Panel Button - Only for Admin Users */}
        {isAdmin && (
          <div className="px-4 pt-4 pb-2 border-b border-gray-800">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all bg-gray-800/50"
            >
              <Shield size={20} />
              {sidebarOpen && <span className="font-medium">Back to Admin Panel</span>}
            </button>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-primary text-white button-glow'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
