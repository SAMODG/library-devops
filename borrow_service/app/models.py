from sqlalchemy import Column, Integer, String, Date
from .database import Base

class Borrow(Base):
    __tablename__ = "borrows"
    id_emprunt = Column(Integer, primary_key=True, index=True)
    livre = Column(String, nullable=False) # ISBN
    utilisateur = Column(String, nullable=False) # id_utilisateur
    date_emprunt = Column(Date, nullable=False)
    date_retour_prevue = Column(Date, nullable=False)
    date_retour_reel = Column(Date, nullable=True)

