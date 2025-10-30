import React from 'react';

const FooterNavigation = ({ columns = [] }) => {
  return (
    <footer className="border-t border-slate-200">
      <div className="page-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {columns.map((col, idx) => (
            <div key={idx}>
              <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-3">{col.title}</div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-slate-600 hover:text-slate-900">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default FooterNavigation;


