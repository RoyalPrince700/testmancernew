import React from 'react';
import { Link } from 'react-router-dom';

const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2';

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white',
  secondary: 'border-2 border-slate-300 text-slate-900 hover:bg-slate-50',
  ghost: 'text-slate-700 hover:bg-slate-50',
};

const sizes = {
  sm: 'px-6 py-2 text-sm',
  md: 'px-6 py-2 text-base',
  lg: 'px-8 py-2 text-lg',

};

const Button = ({ variant = 'primary', size = 'md', to, className = '', children, ...props }) => {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
};

export default Button;


