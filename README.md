
# Junia'lytics- Plateforme Pédagogique

Application web de suivi pédagogique des étudiants et d'aide à la décision pour JUNIA.

Projet réalisé par :
- Logan Comble
- Florian Desrousseaux
- Kylian Opel
- Noé Portenart
- Audrey Vasseur

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

### 1. **Node.js** (v18+)
- Télécharger : [nodejs.org](https://nodejs.org)
- Vérifier : `node --version` et `npm --version`

### 2. **PostgreSQL** (Base de données)
- **Télécharger** : [postgresql.org](https://www.postgresql.org/download/)
- **Installation Windows** :
  - Installer PostgreSQL (gardez le port par défaut 5432)
  - Pendant l'installation, vous définirez un mot de passe pour l'utilisateur `root` 
  - Installer pgAdmin (outil graphique pour gérer la BDD)
  
- **Vérifier l'installation** : `psql --version`

### 3. **Créer une base de données PostgreSQL**
```bash
# Via pgAdmin (interface graphique) OU via le terminal :
psql -U postgres -c "CREATE DATABASE suivi_pedago;"
```

---

##  Installation après un pull (première fois, ne pas hésiter à refaire si problème)

### 1. Installer les dépendances npm
```bash
npm install
npm install -D tsx
```

### 2. Créer le fichier `.env` (configuration locale)
Créer un fichier `.env` à la racine du projet :

```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/suivi_pedago?schema=public"
```

**Adapter selon votre installation :**
- Remplacer `root` par votre mot de passe PostgreSQL
- Remplacer `suivi_pedago` par le nom de votre base de données
- Si PostgreSQL n'est pas sur le port 5432, adapter aussi

### 3. Générer le client Prisma
```bash
npx prisma generate
```

### 4. Créer les tables dans la BDD ( ne pas hésiter à reset si demandé puis refaire la commande push)
```bash
npx prisma db push
```

### 5. Mettre des données dans  la BDD (à refaire si vous avez reset avant !)
```bash
npx prisma db seed
```
*(optionnel, pour avoir des utilisateurs de test)*

---
### 6. Installations supplémentaires :
Pour la gestion des mots de passe oubliés sur la page de connexion
```bash
npm install nodemailer
```

```bash
npm install --save-dev @types/nodemailer
```

Rajouter dans votre .env cette ligne avec le mot de passe de l'adresse email correspondant
pour configurer l'adresse qui enverra les mails automatiques de récupération de mots de passe
(ici le mot de passe est déjà donné)
```env
GMAIL_PASS=dlbdzqwgpcdkweeh
```

Pour ajouter le hachage des mots de passe :
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

Pour ajouter la modulation entre thème clair et sombre
```bash
npm install next-themes
```


## Démarrer l'application

```bash
npm run dev
```

Ouvrir : [http://localhost:3000](http://localhost:3000)

---

## Commandes Prisma utiles

| Commande | Utilité |
|----------|---------|
| `npx prisma generate` | Génère le client Prisma et les types TypeScript |
| `npx prisma db push` | Crée/met à jour les tables selon le schéma |
| `npx prisma studio` | **Ouvre une interface graphique** pour visualiser et modifier la BDD |
| `npx prisma db seed` | Exécute le script seed.ts pour peupler les données de test |
| `npx prisma migrate dev --name <nom>` | Crée une nouvelle migration (changement de schéma) |

---

## Données de test

Les identifiants de test sont dans [prisma/seed.ts](prisma/seed.ts) :

|         Email        |  Mot de passe  |          Rôle           |
|----------------------|----------------|-------------------------|
| `prof@isen.fr`       | `password123`  | Enseignant              |
| `admin@isen.fr`      | `admin123`     | Administrateur          |
| `responsable@isen.fr`| `resp123`      | Responsable Pédagogique |

 **Attention : Les mots de passe sont hachés dans la bdd**


## Documentation

- [Next.js Documentation](https://nextjs.org/docs) - Fonctionnalités Next.js
- [Prisma Documentation](https://www.prisma.io/docs) - Guide complet Prisma
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Référence PostgreSQL

