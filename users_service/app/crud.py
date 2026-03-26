import string, random
from sqlalchemy.orm import Session
from . import models, schemas

def generer_id_utilisateur(length: int = 8):
    """
    Crée un code unique (mélange de lettres et chiffres) pour chaque utilisateur.
    Exemple : 'B3X7R9A1'.
    """
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))

def create_user(db: Session, user: schemas.UserCreate):
    """
    Enregistre un utilisateur en calculant automatiquement son ID et son quota de livres.
    """
    # Définit le nombre de livres autorisés selon le profil
    type_map = {"etudiant": 3, "enseignant": 5, "personnelAdministratif": 4}
    max_emprunts = type_map.get(user.type_utilisateur, 3)
    db_user = models.User(
        id_utilisateur=generer_id_utilisateur(),
        nom=user.nom,
        prenom=user.prenom,
        type_utilisateur=user.type_utilisateur,
        max_emprunts=max_emprunts
    )
    db.add(db_user) # Prépare l'ajout
    db.commit() # Sauvegarde définitivement dans la base de donnée
    db.refresh(db_user) 
    return db_user

def get_users(db: Session):
    """Récupère la liste de tous les utilisateurs inscrits."""
    return db.query(models.User).all()

def get_user_by_id(db: Session, user_id: str):
    """Cherche un utilisateur précis dans la base grâce à son identifiant unique."""
    return db.query(models.User).filter(models.User.id_utilisateur == user_id).first()
