import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import PageTransition from './components/PageTransition';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<PageTransition><Feed /></PageTransition>} />
          <Route path="explore" element={<PageTransition><Explore /></PageTransition>} />
          <Route path="messages" element={<PageTransition><Messages /></PageTransition>} />
          <Route path="notifications" element={<PageTransition><Notifications /></PageTransition>} />
          <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
          <Route path="profile/:username" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="*" element={<PageTransition><Feed /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
