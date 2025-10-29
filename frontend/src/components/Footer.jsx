import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-black py-4 shadow-sm">
      <div className="text-center text-gray-600 text-sm">
        © {currentYear} TestMancer. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
