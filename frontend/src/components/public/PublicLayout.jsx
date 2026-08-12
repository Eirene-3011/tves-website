import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CSMFloatingWidget from './CSMFloatingWidget';

export default function PublicLayout() {
  const location = useLocation();
  const isHomepage = location.pathname === '/';

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      {/* CSM floating widget appears only on the homepage */}
      {isHomepage && <CSMFloatingWidget />}
    </>
  );
}
