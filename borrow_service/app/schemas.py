from pydantic import BaseModel, ConfigDict
from datetime import date

class BorrowBase(BaseModel):
    """
    Définit les données communes à tous les emprunts.
    Le type 'date' garantit que le format valide (AAAA-MM-JJ).
    """
    livre: str  # Référence ISBN du livre
    utilisateur: str  # Identifiant unique de l'utilisateur
    date_retour_prevue: date

# --- SCHÉMA DE CRÉATION ---

class BorrowCreate(BorrowBase):
    """
    Données requises pour enregistrer un nouvel emprunt.
    On demande seulement les infos de base, le reste est géré par le serveur.
    """
    pass

class Borrow(BorrowBase):
    """
    Regroupe les infos saisies et les données gérées automatiquement par le serveur.
    """
    id_emprunt: int  # Identifiant unique automatique (Clé primaire)
    date_emprunt: date  # Date de prise du livre (gérée par le système)
    date_retour_reel: date | None   # 'None' signifie que le livre n'a pas encore été rendu. La date sera remplie uniquement lors du retour effectif.
    
    # Permet de transformer les objets de la base de données en JSON
    model_config = ConfigDict(from_attributes=True)

