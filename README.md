
# ISEN Suivi - Plateforme Pédagogique

Application web de suivi pédagogique et d'aide à la décision pour ISEN.

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

### 4. Créer les tables dans la BDD ( ne pas hésiter a reset si demandé puis refaire la commande push)
```bash
npx prisma db push
```

### 5. metttre des données dans  la BDD (à refaire si vous avez reset avant !)
```bash
npx prisma db seed
```
*(optionnel, pour avoir des utilisateurs de test)*

---

## 📊 Comprendre Prisma, SQL et PostgreSQL

### **PostgreSQL** 
- **Base de données relationnelle** : stocke les données de manière structurée
- Utilise le langage **SQL** pour les requêtes

### **SQL** 
- Langage standard pour interroger les bases de données
- Exemple : `SELECT * FROM utilisateur WHERE email = 'prof@isen.fr';`
- Voir : [prisma/migrations/](prisma/migrations/) pour les scripts SQL

### **Prisma** 
- **ORM** (Object-Relational Mapping) : traduit automatiquement vos données en objets JavaScript
- Vous n'écrivez **pas de SQL brut**, Prisma génère les requêtes pour vous
- Fichier de config : [prisma/schema.prisma](prisma/schema.prisma)
- Types TypeScript générés automatiquement pour la sécurité

**Exemple avec Prisma :**
```typescript
// Au lieu d'écrire SQL brut, vous écrivez :
const user = await prisma.utilisateur.findUnique({
  where: { email: 'prof@isen.fr' }
});
```

---

## 🛠️ Commandes Prisma utiles

| Commande | Utilité |
|----------|---------|
| `npx prisma generate` | Génère le client Prisma et les types TypeScript |
| `npx prisma db push` | Crée/met à jour les tables selon le schéma |
| `npx prisma studio` | **Ouvre une interface graphique** pour visualiser et modifier la BDD |
| `npx prisma db seed` | Exécute le script seed.ts pour peupler les données de test |
| `npx prisma migrate dev --name <nom>` | Crée une nouvelle migration (changement de schéma) |

---

## 🔑 Données de test

Les identifiants de test sont dans [prisma/seed.ts](prisma/seed.ts) :

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `prof@isen.fr` | `password123` | Enseignant |
| `admin@isen.fr` | `admin123` | Administrateur |
| `responsable@isen.fr` | `resp123` | Responsable Pédagogique |

 **Les mots de passe sont en clair** (non hachés) pour faciliter les tests. À sécuriser plus tard

---

## Démarrer l'application

```bash
npm run dev
```

Ouvrir : [http://localhost:3000](http://localhost:3000)

---

## 📚 Ressources utiles

- [Next.js Documentation](https://nextjs.org/docs) - Fonctionnalités Next.js
- [Prisma Documentation](https://www.prisma.io/docs) - Guide complet Prisma
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Référence PostgreSQL




