import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const DesktopSidebar = ({
  menuGroups = [],
  activeKey,
  onSelect,
  topOffsetClass = 'top-16',
  collapsed: externalCollapsed,
  onToggleCollapse,
  // Optional mode switcher (e.g., Main/Admin/Sub Admin)
  modes = [],
  currentMode,
  onChangeMode,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const location = useLocation();

  // Use external collapsed state if provided, otherwise use internal state
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setCollapsed = onToggleCollapse || setInternalCollapsed;

  return (
    <div
      className={
        `hidden md:block fixed ${topOffsetClass} left-0 h-[calc(100vh-4rem)] ` +
        `${collapsed ? 'w-16' : 'w-52'} bg-white transition-all duration-300 ease-in-out ` +
        `z-40 group ${collapsed ? 'pl-0' : 'pl-6'} pt-6`
      }
      aria-label="Primary"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-50 p-1.5 rounded-full bg-white border border-gray-200 shadow-md text-gray-400 hover:text-gray-700 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </button>

      <div className="flex flex-col h-full">
        <nav className={`flex-1 ${collapsed ? 'px-0' : 'px-3'} py-5 overflow-y-auto overflow-x-hidden`} role="navigation">
          {/* Mode Switcher Tabs */}
          {!collapsed && modes && modes.length > 0 ? (
            <div className="mb-6">
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                {modes.map((mode) => {
                  const isActiveMode = currentMode === mode.key;
                  return (
                    <button
                      key={mode.key}
                      onClick={() => onChangeMode && onChangeMode(mode.key)}
                      className={
                        `px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ` +
                        (isActiveMode
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white')
                      }
                      aria-pressed={isActiveMode}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="space-y-10">
            {menuGroups.map((group) => (
              <div key={group.title}>
                {!collapsed && !modes.find(mode => mode.label === group.title && mode.key === currentMode) && (
                  <p className="px-0 mb-1.5 text-[11px] font-semibold tracking-wide text-black uppercase">
                    {group.title}
                  </p>
                )}
                <div className="space-y-3">
                  {group.items.map((item) => {
                    const isActive = item.href ? (location.pathname === item.href) : (activeKey === item.key);
                    const commonClass = `w-full flex items-center ${collapsed ? 'justify-center px-0' : 'px-1'} py-3 text-[13px] font-medium transition-colors relative ` +
                      `${isActive ? 'text-black border-b-2 border-indigo-600' : 'text-black hover:text-black hover:bg-gray-50'}`;

                    if (item.href) {
                      return (
                        <Link
                          key={item.key}
                          to={item.href}
                          className={commonClass}
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={collapsed ? item.name : undefined}
                          title={collapsed ? item.name : undefined}
                        >
                          {item.icon ? <item.icon className={` w-5 h-5 ${collapsed ? 'ml-5' : 'mr-3'}`} /> : null}
                          {!collapsed && <span>{item.name}</span>}
                        </Link>
                      );
                    }

                    return (
                      <button
                        key={item.key}
                        onClick={() => onSelect && onSelect(item.key)}
                        className={commonClass}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={collapsed ? item.name : undefined}
                        title={collapsed ? item.name : undefined}
                      >
                        {item.icon ? <item.icon className={` w-5 h-5 ${collapsed ? 'ml-5' : 'mr-3'}`} /> : null}
                        {!collapsed && <span>{item.name}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default DesktopSidebar;


