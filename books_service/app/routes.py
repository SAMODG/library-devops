from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from . import crud, schemas, database

router = APIRouter()
# --- GESTION DE LA BASE DE DONNÉES ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ROUTES PUBLIQUES (GESTION DU CATALOGUE) ---

@router.post("/books/", response_model=schemas.Book)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    """Crée un nouveau livre en utilisant les données envoyées par le client."""
    return crud.create_book(db, book)

@router.get("/books/", response_model=list[schemas.Book])
def get_books(db: Session = Depends(get_db)):
    """Affiche la liste de tous les livres présents dans la bibliothèque."""
    return crud.get_books(db)

@router.get("/books/search/", response_model=list[schemas.Book])
def search_books(titre: str = "", auteur: str = "", isbn: str = "", db: Session = Depends(get_db)):
    """
    Permet de chercher un livre. Les paramètres sont optionnels : 
    on peut chercher par titre, par auteur ou par ISBN.
    """
    return crud.search_books(db, titre, auteur, isbn)

@router.put("/books/{isbn}", response_model=schemas.Book)
def update_book(isbn: str, book_update: schemas.BookUpdate, db: Session = Depends(get_db)):
    """
    Modifie les infos d'un livre via son ISBN. 
    Si l'ISBN n'existe pas, on renvoie une erreur 404 (Not Found).
    """
    db_book = crud.update_book(db, isbn, book_update)
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    return db_book

@router.delete("/books/{isbn}")
def delete_book(isbn: str, db: Session = Depends(get_db)):
    """Supprime un livre du catalogue. Renvoie une confirmation si l'opération réussit."""
    db_book = crud.delete_book(db, isbn)
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"detail": "Book deleted"}

@router.post("/books/{isbn}/borrow", include_in_schema=False)
def api_borrow_book(isbn: str, db: Session = Depends(get_db)):
    """
    Route 'cachée' de la doc publique. Elle est appelée par le service 'Borrow' 
    pour diminuer le stock quand quelqu'un emprunte un livre.
    """
    book = crud.borrow_book(db, isbn)
    if not book:
        raise HTTPException(status_code=400, detail="Livre non disponible")
    return book

@router.post("/books/{isbn}/return", include_in_schema=False)
def api_return_book(isbn: str, db: Session = Depends(get_db)):
    """
    Route 'cachée' appelée par le service 'Borrow' lors d'un retour 
    pour remettre le livre en stock.
    """
    book = crud.return_book(db, isbn)
    if not book:
        raise HTTPException(status_code=404, detail="Livre introuvable")
    return book

