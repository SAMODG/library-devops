from pydantic import BaseModel, ConfigDict, field_validator
from enum import Enum

# --- DÉFINITION DES PROFILS ---

class UserType(str, Enum):
    ETUDIANT = "etudiant"
    ENSEIGNANT = "enseignant"
    PERSONNEL = "personnelAdministratif"

class UserBase(BaseModel):
    """
    Informations communes à tous les utilisateurs.
    """
    nom: str
    prenom: str
    type_utilisateur: UserType

# --- SCHÉMA DE CRÉATION ---

class UserCreate(UserBase):
    """
    Données pour enregistrer un nouvel utilisateur.
    Corrige automatiquement le texte si l'utilisateur fait une petite erreur de saisie.
    """
    @field_validator("type_utilisateur", mode="before")
    @classmethod
    def validate_type(cls, v):
        if isinstance(v, str):
            v = v.strip().lower()
            if v == "personneladministratif":
                return "personnelAdministratif"
        return v

# --- SCHÉMA DE SORTIE ---

class User(UserBase):
    """
    Regroupe les infos saisies et les données générées automatiquement par le serveur.
    """
    id_utilisateur: str # Identifiant unique de l'utilisateur
    max_emprunts: int # Nombre maximum de livres autorisés pour ce profil

    model_config = ConfigDict(from_attributes=True)
