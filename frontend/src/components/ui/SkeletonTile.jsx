import React from 'react';

const SkeletonTile = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />
);

export default SkeletonTile;


