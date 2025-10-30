import React, { useMemo, useState, useEffect } from 'react';
import DesktopSidebar from './DesktopSidebar';

const DashboardLayout = ({
  role = 'user',
  menuGroups = [],
  activeKey,
  onSelect,
  children,
  header,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const leftMarginClass = useMemo(() => {
    if (!isDesktop) return '';
    return collapsed ? 'md:ml-12' : 'md:ml-52';
  }, [collapsed, isDesktop]);

  return (
    <div className="min-h-screen bg-white text-[13px] text-gray-800">
      {/* Fixed offset for global Navbar assumed at top-16 */}
      <div className="hidden md:block">
        <DesktopSidebar
          menuGroups={menuGroups}
          activeKey={activeKey}
          onSelect={onSelect}
          topOffsetClass="top-16"
        />
      </div>

      <div className={`transition-all duration-300 ease-in-out flex flex-col min-h-screen ${leftMarginClass}`}>
        {/* Optional slot for page-level header beneath global navbar */}
        {header ? (
          <div className="sticky top-16 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-slate-200">
            <div className="page-container py-3">
              {header}
            </div>
          </div>
        ) : null}

        <main className="flex-1 overflow-y-auto">
          <div className="page-container py-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;


