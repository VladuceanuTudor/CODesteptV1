
# CODesteptV1

## Descriere

CODesteptV1 este o aplicație web full-stack concepută pentru a ajuta utilizatorii să practice și să-și îmbunătățească abilitățile de programare prin rezolvarea diverselor probleme de codificare. Platforma oferă o interfață prietenoasă, un editor de cod integrat cu evidențiere sintactică și un back-end robust pentru gestionarea datelor utilizatorilor și a trimiterilor de soluții.

## Caracteristici

- Autentificare utilizator și gestionare profil
- O gamă diversă de probleme de codificare, pe diferite niveluri de dificultate
- Editor de cod integrat cu feedback în timp real
- Istoric al trimiterilor și urmărirea progresului

## Tehnologii

- **Back-end:** Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt
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
   MONGODB_URI=stringul_tău_de_conexiune_MongoDB
   JWT_SECRET=cheia_ta_secretă_JWT
   EMAIL_USER=adresa_ta_de_email
   EMAIL_PASS=parola_pentru_email
   ```
   **Notă:** Asigură-te că adaugi toate variabilele de mediu necesare, bazate pe cerințele din codul tău (de exemplu, dacă folosești alte servicii sau API-uri externe).
4. **Navighează la dosarul front-end și instalează dependențele:**
   ```bash
   cd ../codestept
   npm install
   ```
5. **(Opțional) Creează un fișier `.env.local` în dosarul `codestept` pentru variabilele de mediu specifice front-end-ului, dacă este necesar.**

## Utilizare

1. **Pornește serverul back-end:**
   ```bash
   cd codestept-be
   npm start
   ```
2. **Pornește serverul de dezvoltare front-end:**
   ```bash
   cd ../codestept
   npm run dev
   ```
3. **Accesează aplicația în browser la [localhost:3000](https://localhost:3000).**

## Contribuții

Contribuțiile sunt binevenite! Te rog să faci fork repository-ului și să trimiți un pull request cu modificările tale. Asigură-te că urmezi bunele practici de codare și că adaugi teste unde este cazul.

## Licență

Acest proiect este licențiat sub [Licența MIT](LICENSE).  
**Notă:** Dacă nu ai deja un fișier `LICENSE`, te rog să adaugi unul în repository-ul tău.

## Contact

Pentru orice întrebări sau probleme, te rog să mă contactezi la [tudorvladuceanu@gmail.com].
