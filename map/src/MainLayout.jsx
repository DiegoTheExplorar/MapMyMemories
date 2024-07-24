import React from 'react';
import HamburgerMenu from './HamburgerMenu/Hamburger';
const MainLayout = ({ children }) => {
  return (
    <>
      <HamburgerMenu />
      <div>{children}</div>
    </>
  );
};

export default MainLayout;