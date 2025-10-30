import React from 'react';

const sizes = {
  h1: 'text-5xl md:text-6xl font-bold tracking-tight',
  h2: 'text-3xl md:text-4xl font-semibold tracking-tight',
  h3: 'text-2xl md:text-3xl font-semibold',
};

const Heading = ({ as = 'h2', children, className = '' }) => {
  const Tag = as;
  const cls = sizes[as] || sizes.h2;
  return <Tag className={`${cls} ${className}`}>{children}</Tag>;
};

export default Heading;


