import React, { createContext, useContext } from 'react';

const SidebarContext = createContext({ collapsed: false });

export const SidebarProvider = ({ collapsed = false, children }) => {
  return (
    <SidebarContext.Provider value={{ collapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);


