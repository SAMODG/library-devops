# Library DevOps — Guide de lancement

## 1. Structure du projet

```text
Backend_biblio/
├── frontend/
├── books_service/
├── users_service/
├── borrow_service/
├── docker-compose.yml
├── Jenkinsfile
└── README_devops.md
```

## 2. Services du projet

- Frontend : `http://localhost:8082`
- Books Service : `http://localhost:8000/docs`
- Users Service : `http://localhost:8005/docs`
- Borrow Service : `http://localhost:8002/docs`
- pgAdmin : `http://localhost:8080`
- PostgreSQL : `localhost:5432`

## 3. Lancement local avec Docker Compose

Depuis la racine du projet :

```bash
docker compose up --build -d
```

## 4. Vérifier que tout tourne

```bash
docker compose ps
```

## 5. Voir les logs

```bash
docker compose logs -f
```

## 6. Arrêter le projet

```bash
docker compose down
```

Pour supprimer aussi les volumes :

```bash
docker compose down -v
```

## 7. Accès PostgreSQL

- Host Docker : `postgres`
- Host machine : `localhost`
- Port : `5432`
- Base : `library`
- Utilisateur : `postgres`
- Mot de passe : `admin1`

## 8. Accès pgAdmin

- URL : `http://localhost:8080`
- Email : `admin@gmail.com`
- Mot de passe : `admin2`

## 9. Ajouter le serveur PostgreSQL dans pgAdmin

### Onglet General
- Name : `library-db`

### Onglet Connection
- Host name/address : `postgres`
- Port : `5432`
- Maintenance database : `library`
- Username : `postgres`
- Password : `admin1`

## 10. Notes d’intégration

- Tous les services utilisent le réseau `library_net`
- Les microservices backend utilisent `DATABASE_URL`
- Les communications inter-conteneurs utilisent les noms Docker (`postgres`, `books_service`, `users_service`, `borrow_service`)
- Le frontend est servi par Nginx sur le port interne `80` et exposé sur `8082`

## 11. Pipeline Jenkins

Le pipeline Jenkins doit :
1. récupérer le code depuis GitHub
2. construire les images Docker
3. déployer la stack avec Docker Compose
4. vérifier que les conteneurs sont bien lancés

Le `Jenkinsfile` fourni utilise :

```bash
docker compose build
docker compose up -d
docker compose ps
```

## 12. Commandes utiles

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f
docker compose down
docker compose restart frontend
```
