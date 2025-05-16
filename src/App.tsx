import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WikiProvider } from './contexts/WikiContext';
import { AuthProvider } from './contexts/AuthContext';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import WikiPage from './pages/WikiPage';
import EditPage from './pages/EditPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CreatePage from './pages/CreatePage';
import UserProfilePage from './pages/UserProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <WikiProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/wiki/:slug/*" element={<WikiPage />} />
              <Route path="/edit/:slug/*" element={<EditPage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/user/:username" element={<UserProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </WikiProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;