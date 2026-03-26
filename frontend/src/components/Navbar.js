import React from 'react';
import { Link } from 'react-router-dom';
import { Library, Users, ArrowLeftRight } from 'lucide-react';

const Navbar = () => (
  <nav className="bg-blue-700 text-white p-4 shadow-lg sticky top-0 z-50">
    <div className="container mx-auto flex justify-between items-center">
      <Link to="/" className="flex items-center gap-3 font-black text-2xl uppercase tracking-tight">
        <Library size={28} className="text-blue-200" />
        <span>Bibliotheque <span className="text-blue-200">DIT</span></span>
      </Link>
      <div className="flex gap-10 font-semibold text-sm uppercase">
        <Link to="/" className="flex items-center gap-2 hover:text-blue-200 transition-all"><Library size={18}/> Catalogue</Link>
        <Link to="/users" className="flex items-center gap-2 hover:text-blue-200 transition-all"><Users size={18}/> Membres</Link>
        <Link to="/borrows" className="flex items-center gap-2 hover:text-blue-200 transition-all"><ArrowLeftRight size={18}/> Emprunts</Link>
      </div>
    </div>
  </nav>
);

export default Navbar;

