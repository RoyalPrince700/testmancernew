import React from 'react';

const Section = ({ children, className = '' }) => {
  return (
    <section className={`py-24 md:py-28 ${className}`}>
      <div className="page-container">
        {children}
      </div>
    </section>
  );
};

export default Section;


