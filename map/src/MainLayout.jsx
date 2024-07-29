import React from 'react';
import HamburgerMenu from './HamburgerMenu/Hamburger';

const MainLayout = ({ children, toggleDarkMode, isDarkMode }) => {
  return (
    <>
      <HamburgerMenu toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white">{children}</div>
    </>
  );
};

export default MainLayout;
