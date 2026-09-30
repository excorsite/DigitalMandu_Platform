# DigitalMandu Platform: Ahile S samma ko Pragati

**Update date:** 2026-09-29  
**Project type:** Food ordering ra eCommerce platform

Yo document ahile repository ma bhayeko code, existing project documentation, tests, ra Git history herera banाइएको current progress summary ho. Git history ko milestone section le repository ko pachhilla dekhiyeका 5 commits matra samेट्छ; purano development history ko sampurna record hoina.

## 1. Project ko Uddeshya

DigitalMandu academic MIS/eCommerce project bata independent full-stack food ordering platform ko rupma evolve bhayeko cha. Buyer le product browse garera order place garna sakcha; seller ra admin le product/order sambandhi kaam garna sakchan. MongoDB ma user, product, order, payment ra review sambandhi data rakhincha.

## 2. Ahileko Feature Haru

### Buyer

- Product list ra product detail herne.
- Shopping cart ma item rakhne ra quantity manage garne.
- Checkout garera Cash on Delivery (COD) wa Khalti payment flow use garne.
- Afno order history ra profile herne.
- Login ra registration flow use garne.
- Review sambandhi backend route ra frontend API integration cha.

### Seller

- Seller dashboard ra analytics view.
- Product list, product create/upload ra product update/delete ko workflow.
- Order list ra order status manage garne view.
- Product image upload backend ma Multer bata handle huncha.

### Admin

- Admin dashboard.
- User, product ra order manage garne pages.
- Backend ma admin order ra user management controllers/routes cha.
- Product create/update/delete route le authenticated `admin` wa `seller` role accept garcha.

### Order ra Payment

- Order create, buyer ko order history, ra admin order management backend ma cha.
- Khalti payment initiation ra verification sambandhi logic ra tests cha.
- Order status ma `pending`, `preparation`, `ontheway`, `delivered`, `cancelled` jasta states prayog huncha; Khalti verification le `confirmed` state pani set garna sakcha.
- Recommendation ko purchase signal banauda cancelled order ganidaina; paid wa delivered order matra successful purchase manincha.

### Recommendation Engine

- `Backend/services/recommendationService.js` ma purchase history adharit item-based collaborative filtering cha.
- Successful orders bata user-product interaction ra product similarity map bancha.
- Co-buyer cosine similarity ko aadhar ma user le pahile nakineko related products rank huncha.
- Naya user wa data kam huda popularity adharit fallback list dincha.
- Recommendation endpoint: `GET /api/recommendations`; logged-in user bhaye personalized list, natra public popular list dincha.
- Algorithm ko reproduction/detail guide: [algorithm_reproduce_recommendation.md](algorithm_reproduce_recommendation.md).

### Realtime

- Backend ma Socket.IO server initialize ra connection listener cha.
- Order-update realtime events ko pura implementation ahileko code bata confirm hudaina; lai scaffold/initialization ko rupma hernuparcha.

## 3. Technology ra Architecture

| Layer         | Technology / Pattern                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| Frontend      | React 19, Vite 6, React Router 7, Zustand, TanStack Query, Tailwind CSS, Axios  |
| Backend       | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Multer, Nodemailer, Socket.IO    |
| Database      | MongoDB local wa MongoDB Atlas                                                  |
| Frontend data | API client, endpoint modules, TanStack Query hooks, auth/cart/UI Zustand stores |
| Navigation    | Lazy-loaded page routes, buyer protected routes, seller role-protected routes   |

### Main Folders

```text
Backend/
  controller/       # auth, buyer, admin, global, recommendation logic
  database/         # MongoDB connection
  middlewares/      # authentication, role restriction, upload handling
  models/           # user, product, order, review schemas
  routes/           # API route groups
  services/         # async helper, email, recommendation service
  tests/            # controller, payment, recommendation tests
Frontend/
  src/api/          # HTTP client, endpoint functions, query hooks
  src/components/   # common controls and application layout
  src/pages/        # auth, buyer, seller, admin, payment screens
  src/store/        # auth, cart, UI state
  src/utils/        # cart, validation, formatting, error and image helpers
```

## 4. API Surface (High Level)

| Area            | Endpoint(s) / Notes                                                               |
| --------------- | --------------------------------------------------------------------------------- |
| Authentication  | `POST /api/register`, `POST /api/login`                                           |
| Products        | `GET /api/products`, `GET /api/products/:id`, product create/update/delete routes |
| Cart and orders | Cart routes, `POST /api/orders`, `GET /api/orders`                                |
| Admin orders    | `/api/getOrdersAsAnAdmin`, `/api/updateOrdersAsAnAdmin`                           |
| Payment         | Khalti initiation and verification routes under `/api/payment`                    |
| Profile         | Profile routes mounted under `/api/profile`                                       |
| Reviews         | User review routes under `/api`                                                   |
| Recommendations | `GET /api/recommendations`                                                        |

Exact request payloads ra response contract herna sambandhit route, controller, wa frontend endpoint file hernu. API detail root [README.md](README.md) ma pani cha.

## 5. Git History ma Dekhiyeka Recent Milestones

Yo repository ko pachhilla 5 commits bata dekhiएका mukhya kaam, purano dekhi naya kramma:

1. Empty product/order state ma galat `400` response ra cart parameter mismatch sudhar.
2. Buyer ra seller ko cart, checkout, home, profile, product details ra order workflows sudhar; image fallback, role/auth flow, seller product/order tools ra responsive Tailwind UI jod/sudhar.
3. Product management ra checkout utility sudhar; analytics dashboard ma Highcharts, cart page ko sudhar, product field mismatch ra product-create/payment sambandhi bug fixes.
4. Frontend ra backend ko current monorepo implementation add.
5. Product purchase history bata recommendations nikalne algorithm add.

## 6. Recent Automated Verification

2026-09-29 ma subproject directory bata chalाइएको:

- Backend: `node --test` — **11 tests pass, 0 fail**.
- Frontend: `npm run build` — **build pass**.
- Build output ma Browserslist/caniuse-lite data purano bhayeko warning aayo; build fail bhayena.

Backend package ma alag `test` script chaina, tesaile tests lai `Backend` directory bata `node --test` le chalauna sakincha.

## 7. Local Setup

### Backend

```powershell
cd Backend
npm install
# Backend/.env ma local MongoDB URI ra aawasyak config set garnu
npm run seed
npm run dev
```

Backend `.env` ma prayog hune mukhya values: `PORT`, `MONGO_URI`, `SECRET_KEY`, `EMAIL_USER`, `EMAIL_PASS`, `DOMAIN`, `BACKEND_URL`, `FRONTEND_URL`.

### Frontend

```powershell
cd Frontend
npm install --legacy-peer-deps
# Frontend/.env.local ma API URL set garnu
npm run dev
```

Frontend ko mukhya config: `VITE_API_BASE_URL`, `VITE_KHALTI_PUBLIC_KEY`, `VITE_SESSION_TIMEOUT`. `.env`/`.env.local` ma rakheko secret wa credential commit nagarnu.

## 8. Dhyan Dinुपर्ने / Baki Verify Garne Kura

- Backend ko CORS ahile `origin: "*"` cha; production agadi frontend domain ma simit garnu.
- Frontend admin routes `ProtectedRoute` le wrap gareko dekhinna; API-side authorization lai anivarya rakhnu ra admin navigation guard verify garnu.
- Socket.IO connection cha, tara user-facing live order update workflow sampurna cha bhanera code bata confirm bhayena.
- VS Code context ma pahileko Backend ra Frontend `npm run dev` attempts exit code `1` dekhaieko cha. Tyo attempt ko error output yo summary banauda upalabdha nabhayekale karan ajhai diagnose bhayeko chaina. Backend tests ra frontend production build chai mathi ullekh gare anusar pass chan.
- `Frontend/README.md` ahile pani generic Vite template text ho; project-specific setup ko lagi root README prayog garnu.

## 9. Sambandhit Documentation

- [README.md](README.md) — project overview, prerequisites, environment, API ra quick start.
- [algorithm_reproduce_recommendation.md](algorithm_reproduce_recommendation.md) — recommendation algorithm ko detailed reproduction guide.
- [PROJECT_BACKUP.md](PROJECT_BACKUP.md) — workspace ko generated source backup/inventory; progress report hoina.
