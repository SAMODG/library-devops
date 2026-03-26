import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookMarked, Trash2, Search, Edit3, Plus, 
  RotateCcw, BookOpen, BookmarkCheck, XCircle 
} from 'lucide-react';

const API_URL = "http://localhost:8000/books/";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIsbn, setEditingIsbn] = useState(null);
  const [loading, setLoading] = useState(false);

  const [bookData, setBookData] = useState({
    isbn: '', titre: '', auteur: '',
    categorie: '', annee_publication: '', nb_exemplaires: 1
  });

 
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setBooks(res.data);
    } catch (err) {
      console.error("Erreur API Livres:", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, []);

  // 2. RECHERCHE
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${API_URL}search/`, {
        params: { titre: searchTerm, auteur: searchTerm, isbn: searchTerm }
      });
      setBooks(res.data);
    } catch (err) { console.error("Erreur recherche"); }
  };

  // 3. ENREGISTREMENT (AJOUT OU MODIF)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...bookData,
      annee_publication: parseInt(bookData.annee_publication),
      nb_exemplaires: parseInt(bookData.nb_exemplaires)
    };

    try {
      if (editingIsbn) {
        await axios.put(`${API_URL}${editingIsbn}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }
      resetForm();
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de l'opération");
    }
  };

  // 4. ACTIONS DE STOCK (EMPRUNT/RETOUR)
  const handleAction = async (isbn, action) => {
    try {
      await axios.post(`${API_URL}${isbn}/${action}`);
      fetchBooks();
    } catch (err) { alert(err.response?.data?.detail || "Action impossible"); }
  };

  const handleDelete = async (isbn) => {
    if (window.confirm("Supprimer ce livre ?")) {
      try {
        await axios.delete(`${API_URL}${isbn}`);
        fetchBooks();
      } catch (err) { alert("Erreur suppression"); }
    }
  };

  const startEdit = (book) => {
    setEditingIsbn(book.isbn);
    setBookData(book);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingIsbn(null);
    setBookData({ isbn: '', titre: '', auteur: '', categorie: '', annee_publication: '', nb_exemplaires: 1 });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Catalogue</h1>
          <p className="text-slate-500 font-medium">Gérez le stock de livres de la DIT</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <input 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher..." 
            className="p-2 outline-none w-64 text-sm"
          />
          <button className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition">
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* FORMULAIRE DE GESTION */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
           {editingIsbn ? <Edit3 size={20} className="text-orange-500"/> : <Plus size={20} className="text-green-500"/>}
           {editingIsbn ? "Modifier le livre" : "Ajouter un nouveau titre"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input className="border-b-2 border-slate-100 p-2 focus:border-blue-500 outline-none transition disabled:bg-slate-50" placeholder="ISBN" value={bookData.isbn} onChange={e => setBookData({...bookData, isbn: e.target.value})} disabled={editingIsbn} required />
          <input className="border-b-2 border-slate-100 p-2 focus:border-blue-500 outline-none transition" placeholder="Titre" value={bookData.titre} onChange={e => setBookData({...bookData, titre: e.target.value})} required />
          <input className="border-b-2 border-slate-100 p-2 focus:border-blue-500 outline-none transition" placeholder="Auteur" value={bookData.auteur} onChange={e => setBookData({...bookData, auteur: e.target.value})} required />
          <input className="border-b-2 border-slate-100 p-2 focus:border-blue-500 outline-none transition" placeholder="Catégorie" value={bookData.categorie} onChange={e => setBookData({...bookData, categorie: e.target.value})} />
          <input type="number" className="border-b-2 border-slate-100 p-2 focus:border-blue-500 outline-none transition" placeholder="Année" value={bookData.annee_publication} onChange={e => setBookData({...bookData, annee_publication: e.target.value})} />
          <input type="number" className="border-b-2 border-slate-100 p-2 focus:border-blue-500 outline-none transition" placeholder="Stock initial" value={bookData.nb_exemplaires} onChange={e => setBookData({...bookData, nb_exemplaires: e.target.value})} />
          
          <div className="md:col-span-3 flex gap-3">
             <button className={`flex-1 p-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs transition ${editingIsbn ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingIsbn ? "Mettre à jour" : "Ajouter au catalogue"}
             </button>
             {editingIsbn && <button type="button" onClick={resetForm} className="px-6 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase text-xs">Annuler</button>}
          </div>
        </form>
      </div>

      {/* GRILLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book) => (
          <div key={book.isbn} className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-2xl transition-all border border-slate-100 flex flex-col h-full group">
            
            {/* Badge et Icône */}
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-700 group-hover:scale-110 transition-transform">
                <BookMarked size={32} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${book.statut === 'disponible' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {book.statut}
                </span>
                <span className="text-[10px] font-bold text-slate-400 italic">Stock: {book.nb_exemplaires}</span>
              </div>
            </div>

            {/* Infos Livre */}
            <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{book.titre}</h3>
            <p className="text-slate-400 font-semibold mb-6 uppercase text-[10px] tracking-widest">{book.auteur}</p>

            {/* Boutons d'action rapides */}
            <div className="grid grid-cols-2 gap-2 mb-6">
               <button onClick={() => handleAction(book.isbn, 'borrow')} disabled={book.nb_exemplaires === 0} className="bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 p-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition flex items-center justify-center gap-1 disabled:opacity-30">
                 <BookmarkCheck size={14}/> Emprunter
               </button>
               <button onClick={() => handleAction(book.isbn, 'return')} className="bg-slate-50 hover:bg-green-50 text-slate-600 hover:text-green-700 p-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition flex items-center justify-center gap-1">
                 <RotateCcw size={14}/> Retourner
               </button>
            </div>

            {/* Footer Carte */}
            <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
               <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">ISBN</span>
                  <span className="font-mono text-xs font-bold text-slate-600">{book.isbn}</span>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => startEdit(book)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"><Edit3 size={18}/></button>
                  <button onClick={() => handleDelete(book.isbn)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books;