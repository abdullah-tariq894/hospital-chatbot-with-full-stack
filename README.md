# My City Hospital — React Frontend (Vite)

Asli React project hai — Vite se build hota hai, alag component files hain,
`npm install` / `npm run dev` / `npm run build` sab kaam karta hai.

## Local chalane ka tarika

```bash
npm install
cp .env.example .env
# .env ke andar VITE_HOSPITAL_API_BASE apne backend ka URL rakho
npm run dev
```

Browser mein `http://localhost:5173` khul jayega.

## Vercel par deploy karna

1. Is poore folder ko GitHub par push karo.
2. Vercel dashboard -> "Add New Project" -> apna repo import karo.
3. Vercel khud "Vite" framework pehchan lega:
   - Build Command: `npm run build` (khud fill ho jayega)
   - Output Directory: `dist` (khud fill ho jayega)
4. Deploy se pehle Environment Variables mein ye add karo:
   - Key: `VITE_HOSPITAL_API_BASE`
   - Value: `https://hospital-backend-beryl.vercel.app` (ya jo bhi tumhara backend URL ho)
5. Deploy dabao. 1-2 min mein naya domain milega.

## Folder structure

```
src/
├── data/hospitalData.js   — offline fallback data (backend down ho to bhi chale)
├── lib/
│   ├── api.js              — MongoDB/Vercel backend se saari calls (GET/POST/PATCH/DELETE)
│   ├── schedule.js         — din/waqt ke hisaab se doctor ka live status
│   ├── search.js           — doctor/department/test dhoondna (EN/Urdu/Roman Urdu)
│   ├── claude.js           — out-of-scope sawaalon ke liye AI fallback
│   ├── router.js           — chatbot ka main "jawab kya doon" logic
│   └── suggestions.js      — autocomplete + welcome screen suggestions
├── components/              — Logo, DoctorCard, TestCard, ChatbotPage,
│                               ReceptionDashboard, AddDoctorModal, waghera
├── App.jsx                  — root component (chat / reception login / dashboard)
├── main.jsx                 — Vite entry point
└── index.css                 — saari global styling (colors, fonts, animations)
```

Reception login: `reception` / `reception123` (dev credentials, `ReceptionLogin.jsx` mein hain).
