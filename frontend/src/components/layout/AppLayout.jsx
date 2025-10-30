import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useLocation, useNavigate } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import { SidebarProvider } from '../../contexts/SidebarContext';
import { menus } from '../../config/menus';

const AppLayout = ({ children }) => {
  const { user, isAdmin, isSubAdmin } = useAuth();
  const { activeTab, selectTab } = useNavigation();
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarMode, setSidebarMode] = useState('guest');

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Set initial sidebar mode based on user status
  useEffect(() => {
    if (user) {
      setSidebarMode('main');
    } else {
      setSidebarMode('guest');
    }
  }, [user]);

  // Available sidebar modes based on user role
  const availableModes = useMemo(() => {
    if (!user) return [{ key: 'guest', label: 'Navigation' }];
    const modes = [{ key: 'main', label: 'Main' }];
    if (isAdmin) modes.push({ key: 'admin', label: 'Admin' });
    if (isSubAdmin) modes.push({ key: 'subadmin', label: 'Sub Admin' });
    return modes;
  }, [user, isAdmin, isSubAdmin]);

  // Keep mode in sync with current route on initial load/route changes
  useEffect(() => {
    if (!user) return;
    if (location.pathname.startsWith('/admin') && isAdmin) {
      setSidebarMode('admin');
    } else if (location.pathname.startsWith('/subadmin') && isSubAdmin) {
      setSidebarMode('subadmin');
    } else if (location.pathname.startsWith('/dashboard')) {
      setSidebarMode('main');
    }
  }, [location.pathname, user, isAdmin, isSubAdmin]);

  // Compute menu groups based on current sidebar mode
  const menuGroups = useMemo(() => {
    if (!user) return menus.guest;
    if (sidebarMode === 'admin' && isAdmin) return menus.admin;
    if (sidebarMode === 'subadmin' && isSubAdmin) return menus.subadmin;
    return menus.user;
  }, [user, sidebarMode, isAdmin, isSubAdmin]);

  const handleModeChange = (modeKey) => {
    setSidebarMode(modeKey);
    // Navigate to the corresponding route so content matches the sidebar
    if (modeKey === 'admin') {
      if (location.pathname !== '/admin') navigate('/admin');
    } else if (modeKey === 'subadmin') {
      if (location.pathname !== '/subadmin') navigate('/subadmin');
    } else {
      if (location.pathname !== '/dashboard') navigate('/dashboard');
    }

    // If the current active tab doesn't exist in the new mode, set to first item
    const nextMenus = modeKey === 'admin' ? menus.admin : modeKey === 'subadmin' ? menus.subadmin : menus.user;
    const nextValidKeys = new Set(nextMenus.flatMap((g) => g.items.map((i) => i.key)));
    if (!nextValidKeys.has(activeTab)) {
      const firstKey = nextMenus[0]?.items?.[0]?.key;
      if (firstKey) selectTab(firstKey);
    }
  };

  const leftMarginClass = useMemo(() => {
    if (!isDesktop) return '';
    return collapsed ? 'md:ml-16' : 'md:ml-52';
  }, [collapsed, isDesktop]);

  return (
    <SidebarProvider collapsed={collapsed}>
    <div className="min-h-screen bg-white text-[13px] text-gray-800">
      {/* Global Desktop Sidebar */}
      <div className="hidden md:block">
        <DesktopSidebar
          menuGroups={menuGroups}
          activeKey={activeTab}
          onSelect={selectTab}
          topOffsetClass="top-16" // Sidebar starts below fixed navbar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          modes={availableModes}
          currentMode={sidebarMode}
          onChangeMode={handleModeChange}
        />
      </div>

      <div className={`transition-all duration-300 ease-in-out flex flex-col min-h-screen ${leftMarginClass}`}>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </SidebarProvider>
  );
};

export default AppLayout;
