from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from . import crud, schemas, database

router = APIRouter()

# --- GESTION DE LA CONNEXION ---
def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# --- ROUTES DE L'API ---

@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Crée un nouvel utilisateur. 
    Utilise les données reçues pour créer un profil complet en base.
    """
    return crud.create_user(db, user)

@router.get("/users/", response_model=list[schemas.User])
def get_users(db: Session = Depends(get_db)):
    """
    Récupère la liste de tous les utilisateurs enregistrés dans le système.
    """
    return crud.get_users(db)

@router.get("/users/{id_utilisateur}", response_model=schemas.User)
def get_user(id_utilisateur: str, db: Session = Depends(get_db)):
    """
    Recherche un utilisateur spécifique via son identifiant unique.
    Renvoie une erreur 404 si l'utilisateur n'existe pas.
    """
    db_user = crud.get_user_by_id(db, id_utilisateur)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

