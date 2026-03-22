# M.Y COIFFURE - Salon Management System

Application complète de gestion de salon de coiffure avec backend Node.js/Express et frontend React/Vite. Interface entièrement en français avec design responsive moderne.

## 🎯 Fonctionnalités

- **Dashboard** : Vue d'ensemble avec statistiques, revenus quotidiens/mensuels, rendez-vous à venir
- **Gestion des clients** : CRUD complet avec recherche, notes et historique
- **Planification** : Calendrier hebdomadaire des rendez-vous avec gestion des créneaux
- **Facturation** : Émission et suivi des factures avec statuts (payée/non réglée)
- **Interface responsive** : Optimisée pour mobile, tablette et desktop
- **Navigation mobile** : Menu hamburger avec sidebar rétractable
- **Sections repliables** : CollapsibleSection pour une meilleure UX mobile

## 🏗️ Architecture

### Backend
- **Runtime** : Node.js + Express
- **Base de données** : SQLite avec better-sqlite3
- **Structure** : Architecture modulaire (controllers, services, routes, middleware)
- **Validation** : Validation côté serveur avec messages d'erreur en français
- **CORS** : Activé pour communication frontend/backend cross-origin

### Frontend
- **Framework** : React 19 + Vite
- **Routing** : React Router DOM v7
- **Styling** : TailwindCSS avec design system personnalisé
- **HTTP Client** : Axios
- **Date/Time** : dayjs
- **Composants** : Architecture modulaire avec composants réutilisables

## 📁 Structure du projet

```
salon-mgmt/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration (env, db path)
│   │   ├── controllers/    # Contrôleurs API
│   │   ├── db/            # Schéma SQLite et initialisation
│   │   ├── middleware/    # Error handlers
│   │   ├── routes/        # Routes Express
│   │   ├── services/      # Logique métier + validation
│   │   └── utils/         # Helpers (logger, errors)
│   ├── data/              # Base de données SQLite
│   ├── railway.toml       # Config Railway (déploiement)
│   ├── nixpacks.toml      # Config Nixpacks
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   │   ├── Layout.jsx           # Layout principal + navbar
│   │   │   ├── Sidebar.jsx          # Navigation latérale
│   │   │   ├── CollapsibleSection.jsx  # Sections repliables
│   │   │   └── StatsCard.jsx        # Cartes de statistiques
│   │   ├── pages/         # Pages principales
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── Appointments.jsx
│   │   │   └── Invoices.jsx
│   │   ├── lib/           # API client + resources
│   │   ├── utils/         # Formatters (currency, date)
│   │   └── App.jsx        # Routes React Router
│   ├── vercel.json        # Config Vercel (SPA routing)
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Installation locale

### Prérequis
- Node.js 20+
- npm ou yarn

### Backend

```bash
cd backend
npm install

# Créer le fichier .env
cp .env.example .env
# Éditer .env si nécessaire (PORT, DATABASE_PATH)

# Démarrer le serveur
npm run dev  # Mode développement avec nodemon
npm start    # Mode production
```

Le backend démarre sur `http://localhost:4000` par défaut.

### Frontend

```bash
cd frontend
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build
npm run preview
```

Le frontend démarre sur `http://localhost:5173` par défaut.

## 🌐 Déploiement

### Backend (Railway)

1. Créer un projet Railway
2. Connecter le dépôt GitHub
3. Railway détecte automatiquement `nixpacks.toml` et `railway.toml`
4. Créer un volume persistant pour SQLite (défini dans `railway.toml`)
5. Le backend est déployé automatiquement

**Configuration Railway** :
- Build : `cd backend && npm install`
- Start : `cd backend && node src/server.js`
- Volume : `/data` pour la base de données SQLite

### Frontend (Vercel)

1. Importer le projet sur Vercel
2. Configurer le root directory : `frontend`
3. Framework preset : Vite
4. Vercel détecte automatiquement `vercel.json` pour le routing SPA
5. Le frontend est déployé automatiquement

**Configuration Vercel** :
- Root Directory : `frontend`
- Build Command : `npm run build`
- Output Directory : `dist`
- `vercel.json` gère les rewrites pour React Router

### Variables d'environnement

**Backend (Railway)** :
- `PORT` : Fourni automatiquement par Railway
- `DATABASE_PATH` : Optionnel (par défaut utilise le volume Railway)

**Frontend (Vercel)** :
- `VITE_API_URL` : URL du backend Railway (ex: `https://your-app.up.railway.app`)

## 🎨 Design System

### Couleurs
- **Brand** : Rose/Pink (`#e11d48`)
- **Background** : Dégradé slate-50 to rose-50
- **Text** : Slate-900 (titres), Slate-600 (corps), Slate-400 (helper)

### Breakpoints Tailwind
- `sm:` 640px - Tablettes portrait
- `md:` 768px - Tablettes landscape
- `lg:` 1024px - Desktop
- `xl:` 1280px - Large desktop

### Composants clés
- **CollapsibleSection** : Sections repliables avec chevron animé
- **StatsCard** : Cartes de statistiques avec label/value/helper
- **Layout** : Navbar top + hamburger menu + sidebar drawer

## 📱 Responsive Design

- **Mobile** : Menu hamburger, sections repliables fermées par défaut, tableaux avec scroll horizontal
- **Tablette** : Grilles adaptatives (2 colonnes), navigation top bar
- **Desktop** : Sidebar fixe, grilles 3+ colonnes, toutes les colonnes de tableaux visibles

## 🌍 Internationalisation

Application entièrement en français :
- Interface utilisateur (labels, boutons, messages)
- Messages de validation backend
- Messages d'erreur
- Format de date/heure français
- Format de devise (€)

## 🔧 Scripts disponibles

### Backend
```bash
npm run dev      # Développement avec nodemon
npm start        # Production
```

### Frontend
```bash
npm run dev      # Serveur de développement
npm run build    # Build production
npm run preview  # Preview du build
npm run lint     # Linter ESLint
```

## 📝 API Endpoints

Base URL : `http://localhost:4000/api`

- `GET /health` - Health check
- `GET /stats` - Statistiques globales
- `GET|POST /clients` - Gestion clients
- `GET|PUT|DELETE /clients/:id`
- `GET|POST /appointments` - Gestion rendez-vous
- `GET|PUT|DELETE /appointments/:id`
- `GET|POST /invoices` - Gestion factures
- `GET|PUT|DELETE /invoices/:id`
- `GET|POST /services` - Gestion prestations
- `GET|POST /suppliers` - Gestion fournisseurs

## 🛠️ Technologies

**Backend** :
- express 5.2.1
- better-sqlite3 12.6.2
- cors 2.8.6
- dotenv 17.2.3

**Frontend** :
- react 19.2.0
- react-router-dom 7.0.2
- axios 1.7.9
- dayjs 1.11.13
- tailwindcss 3.4.15
- vite 7.2.4

## 📄 License

ISC

## 👥 Auteur

Développé pour M.Y COIFFURE - Salon de coiffure
