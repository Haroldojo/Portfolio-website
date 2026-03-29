import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AISearchBar from './components/AISearchBar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import AdminResumeImport from './pages/AdminResumeImport';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/about" element={<Home />} /> {/* About scrolls to section on Home */}
            <Route path="/resume" element={<Resume />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/import-resume" element={<AdminResumeImport />} />
          </Routes>
        </main>
        <Footer />
        <AISearchBar />
      </div>
    </Router>
  );
}

export default App;

