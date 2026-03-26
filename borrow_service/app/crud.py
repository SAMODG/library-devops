from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime, date
import requests

# URLs internes pour communiquer avec les autres microservices dans Docker
BOOKS_SERVICE_URL = "http://books_service:8000/books"
USERS_SERVICE_URL = "http://users_service:8000/users"

# Dictionnaire de configuration des quotas d'emprunts selon le profil
BORROW_LIMITS = {
    "Etudiant": 3, 
    "Enseignant": 5, 
    "PersonnelAdministratif": 4
}

def create_borrow(db: Session, borrow: schemas.BorrowCreate):
    """
    Crée un emprunt en vérifiant les conditions auprès des autres services.
    """
    # 1. VÉRIFICATION UTILISATEUR : On demande au service Users si l'id existe
    try:
        user_req = requests.get(f"{USERS_SERVICE_URL}/{borrow.utilisateur}", timeout=5)
        if user_req.status_code != 200: return "USER_NOT_FOUND"
        
        u_data = user_req.json()
        u_type = u_data.get("type_utilisateur") 
    except: 
        # Le service Users est injoignable ou a planté
        return "USERS_SERVICE_DOWN"

# 2. VÉRIFICATION LIMITE : On compte les emprunts non rendus 
    count = db.query(models.Borrow).filter(
        models.Borrow.utilisateur == borrow.utilisateur,
        models.Borrow.date_retour_reel == None
    ).count()
    
   # On récupère la limite correspondante (3 par défaut si inconnu)
    limite = BORROW_LIMITS.get(u_type, 3) 
    
    if count >= limite: 
        return "LIMIT_REACHED"
    # 3. APPEL SERVICE BOOKS : On prévient le service des livres qu'un exemplaire est emprunté
    try:
        # On envoie une demande au service Books pour qu'il mette son stock à jour
        book_req = requests.post(f"{BOOKS_SERVICE_URL}/{borrow.livre}/borrow", timeout=5)
       
        if book_req.status_code != 200: return "BOOK_UNAVAILABLE"
    except: return "BOOKS_SERVICE_DOWN"

    # 4. SAUVEGARDE : Si tout est validé, on enregistre l'emprunt
    db_borrow = models.Borrow(
        livre=borrow.livre,
        utilisateur=borrow.utilisateur,
        date_emprunt=date.today(),
        date_retour_prevue=borrow.date_retour_prevue,
        date_retour_reel=None
    )
    db.add(db_borrow)
    db.commit()
    db.refresh(db_borrow)
    return db_borrow

def return_borrow(db: Session, id_emprunt: int, date_retour_reel_str: str):
    """
    Gère le retour d'un livre et met à jour le stock côté Books.
    """
    # On cherche l'emprunt correspondant en base
    db_borrow = db.query(models.Borrow).filter(models.Borrow.id_emprunt == id_emprunt).first()
    if not db_borrow or db_borrow.date_retour_reel: 
        return None

    # On prévient le service Books que le livre est revenu (pour le stock)
    try: requests.post(f"{BOOKS_SERVICE_URL}/{db_borrow.livre}/return", timeout=5)
    except: 
        pass

    # Convertit le texte reçu en objet Date compatible avec la base de données.
    # Gère automatiquement les formats avec tirets (-) ou slashs (/).
    fmt = "%Y-%m-%d" if "-" in date_retour_reel_str else "%d/%m/%Y"
    db_borrow.date_retour_reel = datetime.strptime(date_retour_reel_str, fmt).date()
    db.commit() # Enregistre la date de retour dans la base de donnée
    db.refresh(db_borrow)
    return db_borrow

def get_borrows(db: Session):
    """Récupère l'intégralité des emprunts stockés."""
    return db.query(models.Borrow).all()

def get_late_borrows(db: Session, current_date_str: str):
    """
    Compare la date prévue avec la date du jour pour trouver les retards.
    """
    borrows = db.query(models.Borrow).filter(models.Borrow.date_retour_reel == None).all()
    fmt = "%Y-%m-%d" if "-" in current_date_str else "%d/%m/%Y"
    today_dt = datetime.strptime(current_date_str, fmt).date()
    # On ne garde que les emprunts dont la date de retour est passée
    return [b for b in borrows if today_dt > b.date_retour_prevue]

def get_user_history(db: Session, id_utilisateur: str):
    """Filtre la base pour obtenir tous les emprunts d'un seul utilisateur."""
    return db.query(models.Borrow).filter(models.Borrow.utilisateur == id_utilisateur).all()


