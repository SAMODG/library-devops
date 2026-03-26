from sqlalchemy.orm import Session
from . import models, schemas

# --- CRÉATION ET LECTURE ---

def create_book(db: Session, book: schemas.BookCreate):
    """
    Crée un livre en base. 'model_dump' transforme le schéma Pydantic en dictionnaire 
    pour que SQLAlchemy puisse l'utiliser.
    """
    db_book = models.Book(**book.model_dump())
    db.add(db_book) # Prépare l'insertion
    db.commit() # Sauvegarde définitivement les changements dans la base de donnée
    db.refresh(db_book) # Récupère les valeurs données automatiquement par la base (ex: le statut) etc 
    return db_book

def get_books(db: Session):
    """Récupère la liste de tous les livres."""
    return db.query(models.Book).all()

def search_books(db: Session, titre: str, auteur: str, isbn: str):
    """
    Recherche flexible. 'ilike' permet de chercher sans se soucier des majuscules.
    On ajoute des filtres seulement si l'utilisateur a rempli les champs.
    """
    query = db.query(models.Book)
    if titre:
        query = query.filter(models.Book.titre.ilike(f"%{titre}%"))
    if auteur:
        query = query.filter(models.Book.auteur.ilike(f"%{auteur}%"))
    if isbn:
        query = query.filter(models.Book.isbn == isbn)
    return query.all()

# --- MISE À JOUR ET SUPPRESSION ---

def update_book(db: Session, isbn: str, book_update: schemas.BookUpdate):
    """
    Met à jour un livre. 'exclude_unset=True' permet de ne modifier 
    que les champs réellement envoyés par le client.
    """
    db_book = db.query(models.Book).filter(models.Book.isbn == isbn).first()
    if not db_book:
        return None
    for field, value in book_update.model_dump(exclude_unset=True).items():
        setattr(db_book, field, value)
    if book_update.nb_exemplaires is not None:
        db_book.statut = "indisponible" if db_book.nb_exemplaires == 0 else "disponible"
    db.commit()
    db.refresh(db_book)
    return db_book

def delete_book(db: Session, isbn: str):
    """Supprime un livre de la base via son ISBN."""
    db_book = db.query(models.Book).filter(models.Book.isbn == isbn).first()
    if not db_book:
        return None
    db.delete(db_book)
    db.commit()
    return db_book

# --- LOGIQUE D'INVENTAIRE (APPELÉE PAR LE SERVICE BORROW) ---

def borrow_book(db: Session, isbn: str):
    """
    Gère la sortie d'un livre. Diminue le stock et augmente le compteur d'emprunts.
    Si le stock tombe à 0, le livre passe en 'indisponible'.
    """
    db_book = db.query(models.Book).filter(models.Book.isbn == isbn).first()
    if db_book and db_book.nb_exemplaires > 0:
        db_book.nb_exemplaires -= 1
        db_book.nb_emprunts += 1
        if db_book.nb_exemplaires == 0:
            db_book.statut = "indisponible"
        db.commit()
        db.refresh(db_book)
        return db_book
    return None

def return_book(db: Session, isbn: str):
    """
    Gère le retour d'un livre. Augmente le stock et remet le statut en 'disponible'.
    """
    db_book = db.query(models.Book).filter(models.Book.isbn == isbn).first()
    if db_book:
        db_book.nb_exemplaires += 1
        db_book.statut = "disponible"
        db.commit()
        db.refresh(db_book)
        return db_book
    return None

