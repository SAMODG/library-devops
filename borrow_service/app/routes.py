from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from . import crud, schemas, database
from datetime import datetime

router = APIRouter()

# --- CONNEXION À LA BASE ---

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- GESTION DES EMPRUNTS ---

@router.post("/borrows/", response_model=schemas.Borrow)
def create_borrow(borrow: schemas.BorrowCreate, db: Session = Depends(get_db)):
    """
    Enregistre un emprunt. Si le CRUD renvoie un code d'erreur (str),
    on le transforme en une erreur HTTP spécifique (404, 403, 400 ou 503).
    """
    result = crud.create_borrow(db, borrow)
    
    # Gestion des erreurs métier renvoyées par le service
    if isinstance(result, str):
        error_map = {
            "USER_NOT_FOUND": (404, "Utilisateur introuvable"),
            "LIMIT_REACHED": (403, "Limite d'emprunt atteinte"),
            "BOOK_UNAVAILABLE": (400, "Livre épuisé"),
            "USERS_SERVICE_DOWN": (503, "Service Users indisponible"),
            "BOOKS_SERVICE_DOWN": (503, "Service Books indisponible")
        }
        # Sélectionne le code et le message correspondant, sinon 500 par défaut
        code, msg = error_map.get(result, (500, "Erreur interne"))
        raise HTTPException(status_code=code, detail=msg)
    return result

@router.get("/borrows/", response_model=list[schemas.Borrow])
def get_borrows(db: Session = Depends(get_db)):
    """Récupère la liste globale de tous les emprunts enregistrés."""
    return crud.get_borrows(db)

@router.get("/borrows/history/{id_utilisateur}", response_model=list[schemas.Borrow])
def get_user_borrow_history(id_utilisateur: str, db: Session = Depends(get_db)):
    """
    Récupère l'historique des emprunts d'un utilisateur spécifique.
    Renvoie une liste vide [] si aucun emprunt n'est trouvé.
    """
    history = crud.get_user_history(db, id_utilisateur)
    if not history:
        return []
    return history

@router.post("/borrows/{id_emprunt}/return", response_model=schemas.Borrow)
def return_borrow(id_emprunt: int, db: Session = Depends(get_db)):
    """
    Finalise un emprunt en enregistrant la date de retour d'aujourd'hui.
    Si l'ID de l'emprunt n'existe pas, renvoie une erreur 404.
    """
    date_str = datetime.today().strftime("%Y-%m-%d")
    result = crud.return_borrow(db, id_emprunt, date_str)
    if not result:
        raise HTTPException(status_code=404, detail="Emprunt introuvable")
    return result

@router.get("/borrows/late/", response_model=list[schemas.Borrow])
def late_borrows(db: Session = Depends(get_db)):
    """
    Liste tous les emprunts dont la date de retour prévue est dépassée 
    par rapport à la date du jour.
    """
    date_str = datetime.today().strftime("%Y-%m-%d")
    return crud.get_late_borrows(db, date_str)

