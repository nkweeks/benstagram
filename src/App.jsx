import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PageTransition from './components/PageTransition';
import ProfileRouter from './components/ProfileRouter';

// Dynamic Lazy Imports
const Feed = lazy(() => import('./pages/Feed'));
const Profile = lazy(() => import('./pages/Profile'));
const Explore = lazy(() => import('./pages/Explore'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Messages = lazy(() => import('./pages/Messages'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Settings = lazy(() => import('./pages/Settings'));
const PostPage = lazy(() => import('./pages/PostPage'));

// Native Fallback loader component for Code-Splitting
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
    <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Loading Benstagram...</p>
  </div>
);

import { CallProvider } from './contexts/CallContext';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<ProtectedRoute><PageTransition><Feed /></PageTransition></ProtectedRoute>} />
            <Route path="explore" element={<ProtectedRoute><PageTransition><Explore /></PageTransition></ProtectedRoute>} />
            <Route path="messages" element={<ProtectedRoute><PageTransition><Messages /></PageTransition></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute><PageTransition><Notifications /></PageTransition></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><PageTransition><Settings /></PageTransition></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><PageTransition><ProfileRouter /></PageTransition></ProtectedRoute>} />
            <Route path="profile/" element={<ProtectedRoute><PageTransition><ProfileRouter /></PageTransition></ProtectedRoute>} />
            <Route path="profile/:username" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
            <Route path="post/:postId" element={<ProtectedRoute><PageTransition><PostPage /></PageTransition></ProtectedRoute>} />
            <Route path="*" element={<ProtectedRoute><PageTransition><Feed /></PageTransition></ProtectedRoute>} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CallProvider>
          <AnimatedRoutes />
        </CallProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
