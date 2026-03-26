from fastapi import FastAPI
from . import routes, models, database
from fastapi.middleware.cors import CORSMiddleware
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Users Service")


app.add_middleware(
    CORSMiddleware,
allow_origins=["http://localhost:8082"],  
    allow_credentials=True,
    allow_methods=["*"],  # Autorise GET, POST, etc.
    allow_headers=["*"],
)
app.include_router(routes.router)

