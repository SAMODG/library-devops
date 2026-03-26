from pydantic import BaseModel, ConfigDict

class BookBase(BaseModel):
    """
    Définit les attributs communs à toutes les opérations sur les livres.
    Pydantic assure le typage strict (ex: l'année doit être un entier).
    """
    isbn: str
    titre: str
    auteur: str
    categorie: str
    annee_publication: int
    nb_exemplaires: int

class BookCreate(BookBase):
    """
    Utilisé lors du POST /books. 
    Il hérite de BookBase car tous les champs sont requis à la création.
    """
    pass

class BookUpdate(BaseModel):
    # Permet la mise à jour partielle : seuls les champs envoyés seront modifiés en base.
    # Si un champ n'est pas fourni, il reste à 'None' et n'est pas traité par le CRUD.
    titre: str | None = None
    auteur: str | None = None
    categorie: str | None = None
    annee_publication: int | None = None
    nb_exemplaires: int | None = None
   
class Book(BookBase):
    """Schéma de sortie : définit exactement ce que l'API renvoie. 
    Il regroupe les infos saisies par l'utilisateur et les données gérées automatiquement par le serveur (ex: nombre d'emprunts  et le statut (disponible/indisponible))"""
    
    nb_emprunts: int
    statut: str

    # Permet à Pydantic de lire les objets SQLAlchemy (ORM) 
    # pour les transformer automatiquement en JSON
    model_config = ConfigDict(from_attributes=True)
