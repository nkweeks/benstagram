import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import UploadModal from './UploadModal';
import './Layout.css';

const Layout = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar onCreateClick={() => setIsUploadOpen(true)} />
      <main className="layout-content">
        <Outlet />
      </main>
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
};

export default Layout;
