from sqlalchemy import Column, String, Integer
from .database import Base

class Book(Base):
    __tablename__ = "books"

    isbn = Column(String, primary_key=True, index=True)
    titre = Column(String, index=True)
    auteur = Column(String, index=True)
    categorie = Column(String, index=True)
    annee_publication = Column(Integer)
    nb_exemplaires = Column(Integer, default=1)
    nb_emprunts = Column(Integer, default=0)
    statut = Column(String, default="disponible")
