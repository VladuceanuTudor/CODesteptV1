
# CODesteptV1

# Cuprins

- [Descriere](#descriere)
- [Caracteristici](#caracteristici)
- [Tehnologii](#tehnologii)
- [Instalare](#instalare)
- [Utilizare](#utilizare)
- [Utilizare prin intermediul interfetei](#utilizare-prin-intermediul-interfetei)
  - [User](#user)
  - [Profesor](#profesor)
  - [Manager](#manager)
- [Functionalitati generale](#functionalitati-generale)
- [Arhitectura proiectului](#arhitectura-proiectului)
  - [Arhitectura Backend](#arhitectura-backend---nodejs-codestept-be)
  - [Arhitectura Frontend](#arhitectur%C4%83-frontend---nextjs-codestept)
- [Contact](#contact)


## Descriere

CODesteptV1 este o aplicație web full-stack concepută pentru a ajuta utilizatorii să practice și să-și îmbunătățească abilitățile de programare prin rezolvarea diverselor probleme de codificare. Platforma oferă o interfață prietenoasă, un editor de cod integrat cu evidențiere sintactică și un back-end robust pentru gestionarea datelor utilizatorilor și a trimiterilor de soluții.

## Caracteristici

- Autentificare utilizator și gestionare profil
- O gamă diversă de probleme de codificare, pe diferite niveluri de dificultate
- Editor de cod integrat cu feedback în timp real
- Istoric al trimiterilor și urmărirea progresului

## Tehnologii

- **Back-end:** Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, DockerDesktop
- **Front-end:** Next.js, React, TypeScript, Tailwind CSS, Codemirror

## Instalare

1. **Clonează repository-ul:**
   ```bash
   git clone https://github.com/VladuceanuTudor/CODesteptV1.git
   ```
2. **Navighează la dosarul back-end și instalează dependențele:**
   ```bash
   cd CODesteptV1/codestept-be
   npm install
   ```
3. **Creează un fișier `.env` în dosarul `codestept-be` cu următoarele variabile:**
   ```
    MONGO_URI=mongodb:
    JWT_SECRET=
    PORT=5000
    EMAIL_USER=  //pentru schimbarea parolei prin email
    EMAIL_PASS=
   ```
   **Notă:** Asigură-te că adaugi toate variabilele de mediu necesare, bazate pe cerințele din codul tău (de exemplu, dacă folosești alte servicii sau API-uri externe).
4. **Navighează la dosarul front-end și instalează dependențele:**
   ```bash
   cd ../codestept
   npm install
   ```
5. **Creează un fișier `.env` în dosarul `codestept` pentru a descrie ruta catre api-ul din back-end. Exemplu:**
    ```js
   API_URL=http://localhost:5000
   ```

## Utilizare

1. **Pornește serverul back-end:**
   ```bash
   cd codestept-be
   node index.js
   ```
2. **Pornește serverul de dezvoltare front-end:**
   ```bash
   cd codestept
   npm run dev
   ```
3. **Accesează aplicația în browser la [localhost:3000](https://localhost:3000).**

## Utilizare prin intermediul interfetei:

- Se pot vizualiza si anumite functionalitati daca esti guest dar majoritatea sunt dispoibile doar daca ai cont.

- Intrare in cont:
    - daca ati importat si baza de date actuala se pot accesa toate cele 3 tipuri de conturi(in fucntie de rol) cu urmatoarele credentiale:
        * user: Email: rusucalin2003@yahoo.com Passwd: 123
        * profesor: Email: tudorvladuceanu@gmail.com Passwd: qwe
        * manager: Email: vladuceanu.info@gmail.com Passwd: manager

- Pentru a ajunge la pagina principala(lista/tabelul de probleme) -> click pe LOGO-ul aplicatiei din Topbar.

### In functie de ce tip de cont ai ales fiecare are urmatoarele functionalitati:
> **Obs:** Conturile de tip Profesor contin toate functionalitaile unui cont de tip User.

#### User:
- Se poate da submit la o problema
- Poti vizualiza paginile de profil ale altor utilizatori
- Poti sa primesti teme de la userii de tip profesor(care ii sunt indrumatori)
- Poti sa iti schimbi usernameul sau poza de profil
- Poti sa strangi XP(facand probleme) si sa concurezi cu ceilalti useri sa ajungi in leaderboard(Top 10 users by xp) 
- Poate vedea problemele facute, acestea fiind afisate intr-o lista in profil
- Poate adauga olema la favorite(steluta), lista de asemena fiind vizibila in profil
- Poate da like/dislike la o problema
- Poate adauga un comentariu la o problema(se poate intra in sectiunea de comentarii din meniul principal cu probleme din boxul unei probleme)


#### Profesor:
- Poate crea noi probleme
- Poate vedea problemele facute de el si edita
- Poate asigna probleme ca tema userilor carora le este indrumator
- Poate face alti useri din user normal -> admin
- Poate vizualiza ce probleme au asignate la tema alti useri
- Poate cere unui user sa ii devina indrumator
- Poate sterge o tema asignata unui user

#### Manager:
- Are control complet asupra datelor stocate in baza de date
Din tabela de manager de la /manager (se poate accesa si din navbar)
- Pentru useri si probleme: new/edit/delete
- Poate si adauga/vizualiza temele
- Poate sterge comentarii

#### Functionalitati generale:
* Vizualizare probleme
* Cautare + filtrare probleme(cautarea se face dupa titlu, categorie si autor)
* Vizualizare useri + cautare
* Pagina de contact
* In navbarul din interfata unei probleme este adaugata functionalitatea de timer

#### Pagina de profil:
- Poti vedea:
   * profil
   * probleme rezolvate
   * probleme favorite
   * prieteni(relatie user-admin)
   * cereri de prietenie
   * setari

# Arhitectura proiectului:

## Arhitectura Backend - Node.js (`codestept-be`)

### 📁 config/
Configurare serviciu de email pentru schimbarea parolei.

### 📁 middleware/
Middleware pentru controlul accesului:
- `auth.js` – verifică autentificarea (ex: token JWT).
- `admin.js`, `manager.js` – filtrează accesul în funcție de rolul utilizatorului.

### 📁 models/
Modele Mongoose (MongoDB):
- `User.js` – definește schema utilizatorilor.
- `Problem.js` – definește schema exercițiilor.
- `Comment.js` - defineste schema comentariilor.

### 📁 routes/
API endpoints (REST):
- `auth.js` – login / logout / autentificare / verificare.
- `comment.js` - gestioneaza comentarii.
- `user.js` – date utilizator, profil.
- `problem.js` – operații CRUD pe exerciții.
- `homework.js` – rute pentru teme.
- `manager.js` – funcționalități manageriale CRUD.

### 📁 utils/
Funcții de utilitate:
- `dockerExecutor.js` – rulează cod sursă în containere Docker.
- `dockerExecutorTest.js` – teste pentru executorul Docker(a fost utilizat doar pentru debug in dezvoltare).

### ⚙️ .env
Configurări ascunse am precizat mai sus cum trebuie sa arate acest fisier pentru o functionare corecta.

### 🚀 index.js
Punctul de pornire al aplicației Express: încarcă middleware-urile, conectează baza de date, pornește serverul.

## Arhitectură Frontend - Next.js (`codestept`)

### 📁 public/
Imagini și resurse statice accesibile direct în browser (ex: `/avatar.png`, logo-uri, etc).

### 📁 src/
Conține întreg codul aplicației:

#### 📁 atoms/
State-uri globale gestionate cu Jotai (ex: `authModalAtom` controlează afișarea ferestrei de autentificare).

#### 📁 components/
Componente UI împărțite logic:
- `Buttons/`, `ui/`, `navbar/` – butoane, bare de navigare, componente vizuale reutilizabile.
- `Modals/` – ferestre modale pentru autentificare, teme, înregistrare etc.
- `ProblemsTable/`, `UserSearchBar.tsx`, `ProblemSearchBar.tsx` – componente pentru căutare și afișare date.
- `Workspace/` – interfață pentru rularea codului (editor, preview, explicații).

#### 📁 hooks/
Hooks personalizați pentru logica reutilizabilă în componentă (ex: interacțiuni cu backend, auth etc).

#### 📁 lib/
Funcții auxiliare sau librării proprii (posibil apeluri API, validări, parsere).

#### 📁 pages/
Rutele aplicației (Next.js generează automat pagini din aceste fișiere):
- `api/` – funcții server-side (API endpointuri).
- `auth/`, `contact/`, `users/`, `manager/`, `problems/`, `profile/` – pagini funcționale, organizate pe module.
- `404.tsx`, `_document.tsx`, `_app.tsx` – pagini speciale și configurații globale.

#### 📁 styles/
Fișiere CSS globale sau Tailwind setup.

#### 📁 utils/
Funcții utilitare care nu aparțin unui modul specific (ex: gestionare token-uri, validări date, etc).

---

### ⚙️ Alte fișiere
- `.env` – variabile de mediu (ex: URL backend, chei de acces).
- `package.json` – dependințe și scripturi (ex: `next`, `react`, `tailwindcss`).
- `next.config.js` – configurația aplicației Next.js.
- `tailwind.config.ts` – setări personalizate pentru TailwindCSS.
- `README.md` – documentația proiectului.

---

### 🔧 Funcționalități cheie
- **Autentificare & înregistrare** cu modale dedicate.
- **Gestionare exerciții și teme** prin interfețe manageriale.
- **WorkSpace** interactiv cu editor de cod integrat.
- **Tabele și filtre** pentru probleme și utilizatori.
- **Rulare cod sursă** integrată cu backend-ul (prin Docker).






## Contact

Pentru orice întrebări sau probleme, te rog să mă contactezi la [tudorvladuceanu@gmail.com].
