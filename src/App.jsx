import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import ContactsPage from './pages/ContactsPage';
import ProfilePage from './pages/ProfilePage';
import InfoPage from './pages/InfoPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/info" element={<InfoPage />} />
    </Routes>
  );
}

export default App;
