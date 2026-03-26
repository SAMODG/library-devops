import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Users as UsersIcon, Eye, Fingerprint, ShieldCheck, GraduationCap, Briefcase } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    type_utilisateur: 'etudiant'
  });

  
  const API_URL = "http://localhost:8005/users/"; 

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur chargement liste users");
    } finally { setLoading(false); }
  };

  const fetchUserProfile = async (id) => {
    try {
      const res = await axios.get(`${API_URL}${id}`);
      setSelectedUser(res.data);
      
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (err) {
      console.error("Erreur profil utilisateur");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // le backend génère l'ID et le max_emprunts automatiquement
      await axios.post(API_URL, newUser);
      setNewUser({ nom: '', prenom: '', type_utilisateur: 'etudiant' });
      fetchUsers();
    } catch (err) {
      alert("Erreur lors de l'ajout de l'utilisateur. Vérifiez le CORS sur le port 8005.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper pour les icônes de profil
  const getTypeBadge = (type) => {
    const styles = {
      'etudiant': { bg: 'bg-blue-100', text: 'text-blue-700', icon: <GraduationCap size={14}/> },
      'enseignant': { bg: 'bg-purple-100', text: 'text-purple-700', icon: <ShieldCheck size={14}/> },
      'personnelAdministratif': { bg: 'bg-orange-100', text: 'text-orange-700', icon: <Briefcase size={14}/> }
    };
    return styles[type] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: <UsersIcon size={14}/> };
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 bg-slate-50 min-h-screen">
      
      <header className="border-b pb-6">
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter italic">Gestion des Membres</h1>
      </header>

      {/* FORMULAIRE D'AJOUT */}
      <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <UserPlus className="text-blue-600" /> Inscrire un nouvel adhérent
        </h2>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Prénom"
            value={newUser.prenom}
            onChange={e => setNewUser({...newUser, prenom: e.target.value})}
            required
          />
          <input
            className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Nom"
            value={newUser.nom}
            onChange={e => setNewUser({...newUser, nom: e.target.value})}
            required
          />
          <select
            className="border p-3 rounded-xl bg-white outline-none cursor-pointer"
            value={newUser.type_utilisateur}
            onChange={e => setNewUser({...newUser, type_utilisateur: e.target.value})}
          >
            <option value="etudiant">Étudiant</option>
            <option value="enseignant">Enseignant</option>
            <option value="personnelAdministratif">Personnel Administratif</option>
          </select>
          <button className="bg-slate-900 text-white p-3 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">
            Ajouter
          </button>
        </form>
      </section>

      {/* LISTE DES UTILISATEURS */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <UsersIcon size={24}/> Membres enregistrés
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {users.map(u => {
            const badge = getTypeBadge(u.type_utilisateur);
            return (
              <div key={u.id_utilisateur} className="bg-white border p-6 rounded-[1.5rem] hover:shadow-lg transition-all group relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-2 px-3 rounded-bl-xl text-[10px] font-black uppercase flex items-center gap-1 ${badge.bg} ${badge.text}`}>
                  {badge.icon} {u.type_utilisateur === 'personnelAdministratif' ? 'Admin' : u.type_utilisateur}
                </div>
                
                <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Fingerprint size={24} />
                </div>

                <h3 className="font-bold text-lg text-slate-900 truncate">
                  {u.prenom} {u.nom}
                </h3>
                <p className="text-xs font-mono text-slate-400 mb-4">ID: {u.id_utilisateur}</p>

                <button
                  onClick={() => fetchUserProfile(u.id_utilisateur)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-600 p-2 rounded-lg text-xs font-bold hover:bg-blue-50 hover:text-blue-700 transition-all"
                >
                  <Eye size={14} /> Voir le profil complet
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* VUE PROFIL DÉTAILLÉE */}
      {selectedUser && (
        <section className="mt-12 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-start mb-8">
             <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
               Profil de l'adhérent
             </h2>
             <button onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white font-bold">Fermer</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Identifiant Unique</p>
                <p className="text-2xl font-mono font-bold tracking-widest text-white italic">{selectedUser.id_utilisateur}</p>
              </div>
              <div>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Nom & Prénom</p>
                <p className="text-3xl font-black">{selectedUser.prenom} {selectedUser.nom}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Statut du membre</p>
                <p className="text-xl font-bold flex items-center gap-2 uppercase">
                   {getTypeBadge(selectedUser.type_utilisateur).icon} {selectedUser.type_utilisateur}
                </p>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Quota d'emprunt autorisé</p>
                <p className="text-4xl font-black text-white">{selectedUser.max_emprunts} <span className="text-sm text-slate-500 font-medium">Livres maximum</span></p>
              </div>
            </div>
          </div>
        </section>
      )}

      {users.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest">
          Aucun membre trouvé
        </div>
      )}
    </div>
  );
};

export default Users;