import React from 'react';
import { Link } from 'react-router-dom';

const SectionHeader = ({ title, description, viewAllHref }) => {
  return (
    <div className="mb-10 flex items-end justify-between gap-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-2 text-lg text-slate-600 max-w-3xl">{description}</p>
        ) : null}
      </div>
      {viewAllHref ? (
        <Link
          to={viewAllHref}
          className="text-sm text-slate-600 hover:text-slate-900 whitespace-nowrap"
        >
          View all →
        </Link>
      ) : null}
    </div>
  );
};

export default SectionHeader;


