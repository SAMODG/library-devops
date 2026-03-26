import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookmarkPlus, History, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';

const Borrows = () => {
  const [borrows, setBorrows] = useState([]); // Liste globale
  const [userHistory, setUserHistory] = useState([]); // Historique spécifique
  const [searchId, setSearchId] = useState('');
  
  const [newBorrow, setNewBorrow] = useState({
    livre: '',
    utilisateur: '',
    date_retour_prevue: ''
  });

  const API_URL = "http://localhost:8002/borrows";

  const fetchBorrows = async () => {
    try {
      const res = await axios.get(`${API_URL}/`);
      setBorrows(res.data);
    } catch (err) {
      console.error("Erreur chargement emprunts");
    }
  };

  // Recherche d'historique par ID 
  const fetchUserHistory = async () => {
    if (!searchId) return;
    try {
      const res = await axios.get(`${API_URL}/history/${searchId}`);
      setUserHistory(res.data);
    } catch (err) {
      console.error("Erreur historique");
      setUserHistory([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/`, newBorrow);
      setNewBorrow({ livre: '', utilisateur: '', date_retour_prevue: '' });
      fetchBorrows();
    } catch (err) {
      // Affiche l'erreur précise renvoyée par HTTPException (403, 404, etc.)
      alert(err.response?.data?.detail || "Erreur lors de l'emprunt");
    }
  };

  const handleReturn = async (id) => {
    try {
      
      await axios.post(`${API_URL}/${id}/return`);
      fetchBorrows();
      if (searchId) fetchUserHistory(); // Actualise l'historique si on regarde un utilisateur
    } catch (err) {
      alert("Erreur lors du retour");
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  // On sépare les emprunts en cours (date_retour_reel est null)
  const activeBorrows = borrows.filter(b => b.date_retour_reel === null);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 bg-slate-50 min-h-screen">
      
      <header className="border-b pb-4">
        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Gestion des Emprunts</h1>
      </header>

      {/* FORMULAIRE D'EMPRUNT */}
      <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600">
          <BookmarkPlus /> Nouvel Emprunt
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="ISBN Livre"
            value={newBorrow.livre}
            onChange={e => setNewBorrow({...newBorrow, livre: e.target.value})}
            required
          />
          <input
            className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="ID Utilisateur"
            value={newBorrow.utilisateur}
            onChange={e => setNewBorrow({...newBorrow, utilisateur: e.target.value.toUpperCase()})}
            required
          />
          <input
            type="date"
            className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={newBorrow.date_retour_prevue}
            onChange={e => setNewBorrow({...newBorrow, date_retour_prevue: e.target.value})}
            required
          />
          <button className="bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-blue-600 transition-all uppercase text-xs tracking-widest">
            Confirmer Prêt
          </button>
        </form>
      </section>

      {/* EMPRUNTS ACTUELS */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Clock className="text-orange-500" /> Emprunts en cours ({activeBorrows.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBorrows.map(b => (
            <div key={b.id_emprunt} className="bg-white border p-6 rounded-2xl shadow-sm hover:border-blue-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-1 rounded uppercase">Actif</span>
                <span className="font-mono text-[10px] text-slate-400">ID #{b.id_emprunt}</span>
              </div>
              <p className="font-bold text-slate-900 underline decoration-blue-500 decoration-2">Livre: {b.livre}</p>
              <p className="text-sm text-slate-600 mt-1 italic font-medium tracking-tight">Lecteur: {b.utilisateur}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400">
                  RETOUR PRÉVU : <br/>
                  <span className="text-slate-900">{b.date_retour_prevue}</span>
                </div>
                <button
                  onClick={() => handleReturn(b.id_emprunt)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                >
                  Marquer retour
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HISTORIQUE PAR UTILISATEUR */}
      <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="text-blue-400" /> Historique Membre
          </h2>
          <div className="flex bg-slate-800 rounded-xl p-1 overflow-hidden border border-slate-700">
            <input 
              className="bg-transparent p-2 outline-none text-sm px-4"
              placeholder="Chercher un ID..."
              value={searchId}
              onChange={e => setSearchId(e.target.value.toUpperCase())}
            />
            <button onClick={fetchUserHistory} className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition-all">
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userHistory.map(b => (
            <div key={b.id_emprunt} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-blue-300">{b.livre}</p>
                <p className="text-[10px] text-slate-400 tracking-widest uppercase">Sortie: {b.date_emprunt}</p>
              </div>
              <div className="text-right">
                {b.date_retour_reel ? (
                  <span className="text-green-400 text-[10px] font-black flex items-center gap-1 uppercase">
                    <CheckCircle size={12}/> Rendu le {b.date_retour_reel}
                  </span>
                ) : (
                  <span className="text-orange-400 text-[10px] font-black flex items-center gap-1 uppercase animate-pulse">
                    <AlertCircle size={12}/> Non rendu
                  </span>
                )}
              </div>
            </div>
          ))}
          {userHistory.length === 0 && searchId && (
            <p className="text-slate-500 text-sm italic italic">Aucune donnée pour cet identifiant.</p>
          )}
        </div>
      </section>

    </div>
  );
};

export default Borrows;