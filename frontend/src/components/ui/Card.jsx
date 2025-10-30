import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
};

export default Card;


