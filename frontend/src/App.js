import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Books from './pages/Books';
import Users from './pages/Users';
import Borrows from './pages/Borrows';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto py-8 px-4">
          <Routes>
            <Route path="/" element={<Books />} />
            <Route path="/users" element={<Users />} />
            <Route path="/borrows" element={<Borrows />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;