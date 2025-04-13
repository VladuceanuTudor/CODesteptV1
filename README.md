
# CODesteptV1

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
    EMAIL_USER=
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
   cd ../codestept
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

### In functie de ce tip de cont ai ales fiecare are urmatoarele functionalitati:
> [!mesaj]
> text

#### User:
- Se poate da submit la o problema
- Poti vizualiza paginile de profil ale altor utilizatori
- Poti sa primesti teme de la userii de tip profesor
- Poti sa iti schimbi usernameul sau parola
- Poti sa strangi XP(facand probleme) si sa concurezi cu ceilalti useri sa ajungi in leaderboard(Top 10 users by xp) 

#### Profesor:



## Contact

Pentru orice întrebări sau probleme, te rog să mă contactezi la [tudorvladuceanu@gmail.com].
