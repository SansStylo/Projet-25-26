
## A faire apres un pull

npm install
npm install -D ts-node
crée fichier .env (pour vous en local) mettre le lien bdd : DATABASE_URL="postgresql://postgres:root@localhost:5432/suivi_pedago?schema=public"

modifier url si vous avez installer avec un autre mdp et un autre nom de bdd

npx prisma generate


commande utilse prisma : 
npx prisma generate
npx prisma db push
npx prisma studio (utilise pour visualisé directement la bdd)


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

npm run dev


Donnée test dans prisma/seed.ts
mdp en clair pourr testé


- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.




