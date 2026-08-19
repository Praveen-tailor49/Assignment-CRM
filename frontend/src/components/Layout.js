import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { LayoutDashboard, Users, UserCog, Briefcase, User, LogOut, Menu, X, ChevronDown, Bell } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Avatar from './ui/Avatar';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const hasPermission = (requiredPermission) => {
    if (!user) return false;
    let hasPerm = false;
    for (const role of user.Roles || []) {
      for (const permission of role.Permissions || []) {
        if (permission.name === requiredPermission) {
          hasPerm = true;
          break;
        }
      }
      if (hasPerm) break;
    }
    return hasPerm;
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Briefcase, permission: 'lead.view' },
    { name: 'Users', path: '/users', icon: Users, permission: 'user.view' },
    { name: 'Roles', path: '/roles', icon: UserCog, permission: 'role.view' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium rounded-xl shadow-lg border border-gray-100' }} />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <LayoutDashboard size={24} className="stroke-[2.5]" />
            <span className="font-bold text-xl tracking-tight text-gray-900">CRM PRO</span>
          </div>
        </div>
        
        <div className="px-4 py-6">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.permission && !hasPermission(item.permission)) return null;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon size={18} className="mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <Bell size={20} />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <Avatar name={user?.name} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700 leading-none">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.Roles?.[0]?.name}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                    <NavLink 
                      to="/profile" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={16} className="mr-3 text-gray-400" />
                      Profile Settings
                    </NavLink>
                    <div className="h-px bg-gray-100 my-1" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} className="mr-3 text-red-400" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
