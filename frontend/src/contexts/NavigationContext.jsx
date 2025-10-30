import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { menus } from '../config/menus';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const { user, isAdmin, isSubAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Get valid tabs for current user role
  const validTabs = useMemo(() => {
    if (!user) return new Set();
    const allMenus = [menus.user];
    if (isAdmin) allMenus.push(menus.admin);
    if (isSubAdmin) allMenus.push(menus.subadmin);
    const flattened = allMenus.flat();
    return new Set(flattened.flatMap((group) => group.items.map((item) => item.key)));
  }, [user, isAdmin, isSubAdmin]);

  // Default tab based on role
  const defaultTab = useMemo(() => {
    if (!user) return 'overview';
    // Default based on route: admin/subadmin routes use 'dashboard', main uses 'overview'
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/subadmin')) return 'dashboard';
    return 'overview';
  }, [user, location.pathname]);

  // Sync active tab with URL query param (?tab=...)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const nextTab = tabParam && validTabs.has(tabParam) ? tabParam : defaultTab;
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [searchParams, validTabs, defaultTab, activeTab]);

  // Reset to default tab when route changes (e.g., from /dashboard to /admin)
  useEffect(() => {
    if (location.pathname === '/dashboard' || location.pathname === '/admin' || location.pathname === '/subadmin') {
      const tabParam = searchParams.get('tab');
      const nextTab = tabParam && validTabs.has(tabParam) ? tabParam : defaultTab;
      setActiveTab(nextTab);
    }
  }, [location.pathname, validTabs, defaultTab, searchParams]);

  const selectTab = (tabKey) => {
    if (validTabs.has(tabKey)) {
      setActiveTab(tabKey);
      const next = new URLSearchParams(searchParams);
      next.set('tab', tabKey);
      setSearchParams(next, { replace: true });
    }
  };

  const value = {
    activeTab,
    selectTab,
    validTabs,
    defaultTab,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
