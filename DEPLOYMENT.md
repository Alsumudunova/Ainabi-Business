# Деплой гид — GitHub → Vercel (+ Railway/Render)

## Маанилүү: Vercel — frontend үчүн, backend үчүн эмес

Vercel статикалык сайттар жана serverless функциялар үчүн эң мыкты. Бирок бул
жердеги backend (Express + Prisma + PostgreSQL + httpOnly cookie) — узак
иштеген, туруктуу коннекциялары бар классикалык сервер. Аны Vercel'дин
serverless моделине киргизүү мүмкүн, бирок татаалдашат (ар бир сурамда жаңы
Prisma коннекциясы база лимитин тез түгөтөт).

**Сунушталган схема:**
- **Frontend (React/Vite)** → **Vercel**
- **Backend (Express API) + PostgreSQL** → **Railway** же **Render**

Экөө тең акысыз tier'ден баштайт, орнотуу 15-20 мүнөт алат.

---

## 1. GitHub'го чыгаруу

```bash
cd /Users/alsu/Desktop/ainabi-bussines
git init
git add .
git commit -m "Initial commit — Ainabi Business"
git branch -M main
git remote add origin https://github.com/<сиздин-username>/ainabi-business.git
git push -u origin main
```

`.gitignore` файлдар (root, `backend/`, `frontend/`) `.env` файлдарды жана
`node_modules`'ду автоматтык түрдө сыртта калтырат — сырларыңыз GitHub'го
эч качан жиберилбейт. Push кылардан мурун текшериңиз:

```bash
git status   # .env файлдар тизмеде жок болушу керек
```

---

## 2. Backend → Railway (же Render)

1. https://railway.app — GitHub аккаунтуңуз менен кириңиз.
2. **New Project → Deploy from GitHub repo** → репозиторийиңизди тандаңыз.
3. **Root Directory**'ди `backend` кылып коюңуз (монорепо болгондуктан).
4. **+ New → Database → PostgreSQL** кошуп, Railway автоматтык `DATABASE_URL`
   берет.
5. **Variables** бөлүмүнө төмөнкүлөрдү коюңуз (`backend/.env.example`ден
   көчүрүп, чыныгы маанилерди коюңуз):

   | Айнымалы | Маани |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Railway автоматтык берет |
   | `JWT_ACCESS_SECRET` | `openssl rand -base64 48` менен түзүлгөн |
   | `JWT_REFRESH_SECRET` | `openssl rand -base64 48` менен түзүлгөн (башка) |
   | `CLIENT_URL` | `https://ваш-домен.vercel.app` (Vercel'ден кийин коёсуз) |
   | `COOKIE_CROSS_SITE` | `true` (frontend/backend башка домендерде болгондуктан) |
   | `GOOGLE_CLIENT_ID` | Google Cloud Console'догу Client ID |

6. **Build Command**: `npm install && npx prisma generate && npm run build`
7. **Start Command**: `npx prisma migrate deploy && npm start`
8. Деплойдон кийин Railway сизге `https://xxxx.up.railway.app` дарегин
   берет — бул сиздин backend URL'иңиз.

Эгер чыныгы домен (`api.ainabi.kg`) байлагыңыз келсе — Railway'дин Settings →
Domains бөлүмүнөн жасайсыз.

---

## 3. Frontend → Vercel

1. https://vercel.com — GitHub менен кириңиз.
2. **Add New → Project** → репозиторийиңизди тандаңыз.
3. **Root Directory**: `frontend`
4. Framework автоматтык **Vite** деп табылат.
5. **Environment Variables**:

   | Айнымалы | Маани |
   |---|---|
   | `VITE_API_URL` | Railway'ден алган backend URL, мис. `https://xxxx.up.railway.app` |
   | `VITE_GOOGLE_CLIENT_ID` | Ошол эле Google Client ID |

6. **Deploy** басыңыз. Бүткөндөн кийин Vercel `https://xxxx.vercel.app`
   дарегин берет.
7. Домениңиз бар болсо — Vercel → Settings → Domains бөлүмүнөн кошуңуз.

**Маанилүү:** Frontend URL белгилүү болгондон кийин, Railway'деги
`CLIENT_URL` айнымалысын ошол чыныгы Vercel/домен дарегине жаңыртыңыз
(`https://xxxx.vercel.app` же `https://ainabi.kg`), антпесе CORS бөгөйт.

---

## 4. Google Sign-In'ди продакшенге чыгаруу

1. https://console.cloud.google.com/apis/credentials → Client ID'ди ачыңыз.
2. **Authorized JavaScript origins**'ке кошуңуз: `https://ваш-домен.vercel.app`
   (жана өз доменди да, эгер бар болсо).
3. **OAuth consent screen** → **Publishing status** → **PUBLISH APP**.
   - Талап кылынат: Privacy Policy шилтемеси (жөнөкөй барак жасап, `/privacy`
     сыяктуу жолго коюуга болот).
   - Негизги scope'лор (email, profile) "sensitive" эмес — Google'дун узак
     текшерүүсүн талап кылбайт, көбүнчө дароо жарыяланат.

---

## 5. Акыркы текшерүү (checklist)

- [ ] `backend/.env`, `frontend/.env` GitHub'го түшкөн жок
- [ ] `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — 48+ белгилүү, кокустан
      түзүлгөн (эч качан `dev_...` калбасын — сервер муну текшерип, ката
      берет)
- [ ] Railway'де `NODE_ENV=production`
- [ ] Railway'де `COOKIE_CROSS_SITE=true`
- [ ] `CLIENT_URL` чыныгы Vercel/домен дарегине коюлган
- [ ] `VITE_API_URL` чыныгы Railway/домен дарегине коюлган
- [ ] Google Console'до эки жерге тең (`Authorized origins` + `.env`'лер)
      бирдей Client ID
- [ ] `npx prisma migrate deploy` биринчи деплойдо иштетилди (база бош
      болбошу үчүн)
- [ ] Сайтка `https://` менен гана кирилет (HTTP'тан автоматтык
      багытталат — Vercel/Railway муну өзү жасайт)

Ушулардын баары аткарылса, домениңизди Google'го (жана бардык колдонуучуга)
коркунучсуз ачсаңыз болот.
