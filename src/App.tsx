import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import Header from './components/Header';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Courses from './pages/Courses';
import Team from './pages/Team';
import Contact from './pages/Contact';
import AdminCourses from './pages/admin/AdminCourses';
import AdminTeam from './pages/admin/AdminTeam';
import AdminAttendees from './pages/admin/AdminAttendees';
import AdminCategories from './pages/admin/AdminCategories';
import AdminEmailConfig from './pages/admin/AdminEmailConfig';
import AdminTesting from './pages/admin/AdminTesting';
import Login from './pages/admin/Login';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <Home />
                <Footer />
              </>
            }
          />
          <Route
            path="/courses"
            element={
              <>
                <Header />
                <Courses />
                <Footer />
              </>
            }
          />
          <Route
            path="/portfolio"
            element={
              <>
                <Header />
                <Portfolio />
                <Footer />
              </>
            }
          />
          <Route
            path="/team"
            element={
              <>
                <Header />
                <Team />
                <Footer />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Header />
                <Contact />
                <Footer />
              </>
            }
          />

          {/* Auth Routes */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="attendees" element={<AdminAttendees />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="team" element={<AdminTeam />} />
                    <Route path="email-config" element={<AdminEmailConfig />} />
                    <Route path="testing" element={<AdminTesting />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
