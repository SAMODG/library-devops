from sqlalchemy import Column, String, Integer
from .database import Base

class User(Base):
    __tablename__ = "users"
    id_utilisateur = Column(String(8), primary_key=True, index=True)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    type_utilisateur = Column(String, nullable=False) 
    max_emprunts = Column(Integer, nullable=False)
