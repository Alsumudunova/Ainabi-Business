# Деплой гид

Эки жол бар. Vercel'дин **Multi-Service** функциясы (frontend + backend бир
эле Vercel долбоорунда, бир доменде) азыр туура иштеп тургандыктан, ошол
**Вариант A негизги жол**. Vercel'ди frontend'ге, ал эми backend'ди Railway'ге
бөлүп жайгаштыргыңыз келсе — **Вариант B**.

---

## Вариант A — баары бир Vercel долбоорунда (сунушталат)

Vercel GitHub репозиторийиңизди import кылганда `frontend/` жана `backend/`
экөөнү тең өзү таап, "Multi-Service" катары сунуштайт. Репонун түбүндөгү
[`vercel.json`](vercel.json) файлы даяр — ал:

- `/api/*` сурамдарын `backend` сервисине,
- калган баарын `frontend` сервисине багыттайт,

экөө тең **бир домендин астында** иштейт (мис. `ainabi.vercel.app`).
Ушундан улам frontend/backend "cross-site" эмес, **бир origin** болуп
эсептелет — cookie маселелери жоголот, конфигурация жөнөйт.

### Кадамдар

1. **GitHub'го чыгаруу** (эгер чыгара элек болсоңуз):

   ```bash
   cd /Users/alsu/Desktop/ainabi-bussines
   git init
   git add .
   git commit -m "Initial commit — Ainabi Business"
   git branch -M main
   git remote add origin https://github.com/<username>/ainabi-business.git
   git push -u origin main
   ```

   Push кылардан мурун: `git status` — `.env` файлдар тизмеде болбошу керек.

2. **PostgreSQL база табуу** — Vercel өзү Postgres бербейт. Эң жеңили:
   [Neon](https://neon.tech) (акысыз tier, serverless Postgres, Vercel менен
   тыгыз иштейт) же [Supabase](https://supabase.com). Аккаунт ачып, жаңы
   база түзүп, **connection string**ти (`DATABASE_URL`) көчүрүп алыңыз.

3. **Vercel'де import экраныңызда** (скриншотто көрсөткөн бет):
   - **Root Directory**: `./` бойдон калтырыңыз (өзгөртпөңүз! — экөө тең
     `vercel.json` аркылуу табылат).
   - `vercel.json` мурунтан репого кошулду, андыктан "Refresh" басуунун
     кереги жок — Vercel аны GitHub'дон өзү окуйт.
   - **Environment Variables** бөлүмүн ачып, төмөнкүлөрдү кошуңуз:

     | Айнымалы | Маани | Эскертүү |
     |---|---|---|
     | `NODE_ENV` | `production` | |
     | `DATABASE_URL` | Neon/Supabase'ден алган connection string | |
     | `JWT_ACCESS_SECRET` | `openssl rand -base64 48` | |
     | `JWT_REFRESH_SECRET` | `openssl rand -base64 48` (башка маани) | |
     | `CLIENT_URL` | Vercel берген домен, мис. `https://ainabi-business.vercel.app` | Deploy кылгандан кийин так дарек белгилүү болот — биринчи жолу божомол коюп, кийин так дарек менен жаңыртыңыз |
     | `COOKIE_CROSS_SITE` | **коюлбасын / `false`** | Бир доменде болгондуктан керек эмес |
     | `GOOGLE_CLIENT_ID` | Google Cloud Console'догу Client ID | |
     | `VITE_GOOGLE_CLIENT_ID` | Ошол эле Client ID | |
     | `VITE_API_URL` | **коюлбасын** | Бир домен болгондуктан `/api` өзү туура иштейт |

4. Import баракта `backend` сервисинин карточкасын ачып, **Build and
   Output Settings** бөлүмүнө (сиз көрсөткөн скриншотто ошол эле жерде)
   төмөнкү **Build Command**ди коюңуз (`prisma migrate deploy` база
   схемасын өзү орнотот, ар бир deploy'до коопсуз кайра иштетсе болот):

   ```
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

   (`postinstall` скрипти `prisma generate`ди өзү да чакырат — бул команда
   аны кайра ырастайт жана `migrate deploy`ди кошот.)

5. **Deploy** басыңыз.

6. Deploy бүткөндөн кийин чыныгы дарек белгилүү болот
   (`https://xxxx.vercel.app`). Ошол даректи `CLIENT_URL`
   айнымалысына так коюп, **Redeploy** басыңыз (Vercel Dashboard →
   Deployments → ... → Redeploy).

---

## Вариант B — Frontend Vercel'де, Backend Railway'де

Эгер backend'ди өзүнчө, туруктуу серверде (эч кандай serverless чектөөсүз)
кармагыңыз келсе:

### Backend → Railway

1. https://railway.app → **New Project → Deploy from GitHub repo**.
2. **Root Directory**: `backend`.
3. **+ New → Database → PostgreSQL** — Railway `DATABASE_URL`'ди өзү берет.
4. **Variables**: жогорудагы таблицадагыдай эле, бирок:
   - `COOKIE_CROSS_SITE` = **`true`** (frontend башка доменде болгондуктан)
   - `CLIENT_URL` = Vercel'ден алган frontend дареги
5. **Build Command**: `npm install && npx prisma generate && npm run build`
6. **Start Command**: `npx prisma migrate deploy && npm start`

### Frontend → Vercel

1. **Root Directory**: `frontend`.
2. **Environment Variables**:
   - `VITE_API_URL` = Railway'ден алган backend дареги (мис. `https://xxxx.up.railway.app`)
   - `VITE_GOOGLE_CLIENT_ID` = Google Client ID
3. Deploy болгондон кийин, Railway'деги `CLIENT_URL`'ди так Vercel дарегине
   жаңыртыңыз.

---

## Google Sign-In'ди продакшенге чыгаруу (эки вариантта тең)

1. https://console.cloud.google.com/apis/credentials → Client ID'ди ачыңыз.
2. **Authorized JavaScript origins**'ке чыныгы деплой дарегиңизди кошуңуз
   (мис. `https://ainabi-business.vercel.app`).
3. **OAuth consent screen** → **Publishing status** → **PUBLISH APP**.
   Талап кылынат: Privacy Policy шилтемеси (жөнөкөй барак жасап коюуга
   болот). Негизги scope'лор (email, profile) Google'дун узак текшерүүсүн
   талап кылбайт — көбүнчө дароо жарыяланат.

---

## Акыркы текшерүү (checklist)

- [ ] `.env` файлдар GitHub'го түшкөн жок (`git status` менен текшериңиз)
- [ ] `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — 48+ белгилүү, кокустан
      түзүлгөн (сервер `dev_...` же кыска сыр менен production'до
      баштала электе эле ката берет — бул атайылап ушундай)
- [ ] `DATABASE_URL` продакшен базага көрсөтөт (локалдук эмес)
- [ ] Вариант A: `COOKIE_CROSS_SITE` коюлган эмес / `false`, `VITE_API_URL` бош
- [ ] Вариант B: `COOKIE_CROSS_SITE=true`, `VITE_API_URL` backend дарегине коюлган
- [ ] `CLIENT_URL` чыныгы деплой дарегине туура коюлган (deploy кылгандан
      кийин жаңыртылды)
- [ ] Google Console'до `Authorized origins` + эки `.env`'дегі
      `GOOGLE_CLIENT_ID`/`VITE_GOOGLE_CLIENT_ID` бирдей
- [ ] Биринчи deploy'до `prisma migrate deploy` ийгиликтүү иштеди (Vercel/Railway
      логдорунан текшериңиз — "No pending migrations" же "applied" деп чыгышы керек)
- [ ] Сайтка `https://` менен гана кирилет

Ушулардын баары аткарылса, домениңизди коркунучсуз ачсаңыз болот.
