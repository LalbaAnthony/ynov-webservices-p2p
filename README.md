# 🎮 Connect Four – Multiplayer (P2P)

Ce projet est un **Puissance 4 multijoueur en peer-to-peer (PeerJS)** construit avec :

* **Next.js (App Router)** pour le frontend
* **TypeScript**
* **PeerJS** pour la connexion directe entre joueurs
* **TailwindCSS** pour le style
* **shadcn/ui** pour l'interface
* Une logique de jeu custom dans `/lib/connect-four`

Ce README explique :

1. Comment installer et lancer le projet
2. Comment fonctionne le jeu
3. Comment fonctionne la connexion P2P
4. Structure du projet

---

## 🚀 Installation & Lancement

### **1. Installer les dépendances**

```bash
npm install
```

### **2. Lancer le serveur de développement**

```bash
npm run dev
```

Le projet sera disponible sur :

```
http://localhost:3000
```

### **3. Build pour la production**

```bash
npm run build
npm start
```

---

## 🧩 Fonctionnement du jeu

Le jeu est un classique **Puissance 4** :

* Deux joueurs
* Plateau 7 colonnes × 6 lignes
* Les joueurs déposent un jeton chacun leur tour
* Le premier à aligner **4 jetons** horizontalement, verticalement ou diagonalement gagne

### 🔄 Gestion du tour

* Le joueur 1 commence
* À chaque coup valide, le tour bascule automatiquement au joueur adverse

### ⬇️ Placement du jeton

* Lorsqu'un joueur clique sur une colonne, le jeton tombe dans **la première case libre en partant du bas**
* Si la colonne est pleine : le coup est ignoré

### 🏆 Conditions de victoire

L’algorithme vérifie :

* Alignement horizontal
* Alignement vertical
* Alignements diagonaux ↘️ et ↗️

Une égalité est déclarée si le plateau est rempli sans vainqueur.

### 🔁 Replay

Une fois la partie finie, les joueurs peuvent recommencer une partie sans recharger la page.

---

## 🌐 Fonctionnement du multijoueur (PeerJS)

Le jeu utilise un **échange de messages entre pairs** via `peer-manager.ts`.

### 🔧 Étapes du P2P

1. Le premier joueur crée une partie → génère un **ID d’invitation**
2. Le second joueur le rejoint via ce même ID
3. Les deux navigateurs échangent :

   * une **offer** PeerJS
   * une **answer**
   * des **ICE candidates**
4. Une fois la connexion établie, les joueurs communiquent **directement**, sans serveur

### 📡 Synchronisation du jeu

Chaque action est envoyée à l’autre joueur :

* Coup joué
* État du plateau
* Tour actuel
* Fin de partie

---

## 📁 Structure du projet

```
.
├── app
│   ├── layout.tsx      → Layout global du site
│   └── page.tsx        → Page principale contenant le jeu
├── components
│   ├── connect-four.tsx → Composant UI principal du jeu
│   └── ui/              → Composants shadcn/ui
├── hooks
│   └── use-connect-four.ts → Hook gérant l'état du jeu
├── lib
│   └── connect-four/
│       ├── game-logic.ts   → Logique pure du Puissance 4
│       ├── peer-manager.ts → Gestion PeerJS
│       ├── types.ts        → Types du domaine
│       └── utils.ts        → Fonctions utilitaires
├── public
│   → assets
└── README.md
```

---

## 🧠 Technologies utilisées

* **Next.js** (App Router)
* **TypeScript**
* **PeerJS** pour la communication temps réel
* **TailwindCSS** + **shadcn/ui**
