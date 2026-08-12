# Tropical Village Elementary School Website

Official website and admin content system for **Tropical Village Elementary School (TVES)**.

- **School ID:** 107967
- **Location:** Pabahay 2000, Tropical Village, Brgy. San Francisco, General Trias City, Cavite
- **Division:** General Trias City
- **Region:** IV-A CALABARZON
- **School type:** Public elementary school

The site keeps the supplied school-website structure and routes while replacing unavailable TVES information with editable placeholders or “Coming soon” notices. Seeded facts come from the supplied school profile: established in 1995, Principal II Imelda S. Arevalo, 2,496 pupils, 71 teachers, 12 buildings, 55 classrooms, Madrasah support, and face-to-face learning.

## Stack

- Frontend: React 18 + Vite
- Backend: Node.js 18+ + Express
- Database: MySQL-compatible MySQL or TiDB Cloud
- Image uploads: Cloudinary
- Frontend hosting: Netlify
- Backend hosting: Render

## Repository layout

```text
frontend/       React public site and admin panel
backend/        Express API
database/       schema.sql and TVES seed.sql
```

## Local development

### 1. Create and seed the database

The scripts create/use `tves_db`. Run them from the project root with a local MySQL-compatible server:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

`seed.sql` resets the application tables before inserting the TVES starter content. Do not run it against a database containing data you need to keep.

### 2. Configure and start the API

```bash
cd backend
cp .env.example .env
# Fill in the database, Cloudinary, JWT, and CORS values.
npm install
npm run dev
```

Check the API at <http://localhost:5000/api/health>.

### 3. Configure and start the frontend

In another terminal:

```bash
cd frontend
cp .env.example .env
# Leave VITE_API_URL blank for local Vite proxy development.
npm install
npm run dev
```

Open <http://localhost:5173>. The Vite proxy sends `/api` requests to the local API.

## Database: TiDB Cloud

1. Create a TiDB Cloud Serverless cluster.
2. In **Connect**, choose the Node.js/MySQL connection details.
3. Create a database named `tves_db` if it is not already present.
4. Run `database/schema.sql`, then `database/seed.sql` against the cluster.
5. In Render, set:

```env
DB_HOST=<TiDB gateway host>
DB_PORT=4000
DB_USER=<TiDB user>
DB_PASSWORD=<TiDB password>
DB_NAME=tves_db
DB_SSL=true
```

Keep database credentials only in the hosting provider's environment-variable settings. Never commit `.env`.

## Cloudinary image storage

Create a Cloudinary account and copy the cloud name, API key, and API secret from **Dashboard → Settings → API Keys**. Set these backend variables:

```env
CLOUDINARY_CLOUD_NAME=<cloud name>
CLOUDINARY_API_KEY=<API key>
CLOUDINARY_API_SECRET=<API secret>
```

Uploads are stored under the `tves-uploads` folder. The admin panel can manage the school logo, banners, news images, staff photos, and other supported content.

## Render backend deployment

1. Create a new **Web Service** connected to this repository.
2. Set the service root directory to `backend`.
3. Use:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add all variables from `backend/.env.example`.
5. Set `FRONTEND_URL` to the final Netlify URL. Multiple origins may be comma-separated.
6. Deploy and verify:

```text
https://<your-render-service>.onrender.com/api/health
```

The response should report an `ok` status and identify the TVES API.

## Netlify frontend deployment

1. Create a Netlify site connected to this repository.
2. Set the base directory to `frontend`.
3. Use:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Set `VITE_API_URL` to the deployed Render API base URL, for example:

```env
VITE_API_URL=https://<your-render-service>.onrender.com
```

5. Deploy. The included SPA fallback configuration keeps React routes working on refresh.
6. Copy the final Netlify URL back into Render's `FRONTEND_URL`, then redeploy the API if needed.

## Admin access and magic-link setup

The existing admin authentication flow uses a magic code in the URL:

```text
https://<your-netlify-site>/admin/login/<your-private-code>
```

Set a private value in the backend:

```env
ADMIN_MAGIC_CODE=<long-private-value>
JWT_SECRET=<long-random-value>
```

The example value `TVES-ADMIN-CHANGE-ME` is for development only. Change it before deployment and do not publish it in documentation, screenshots, or source control. The school ID `107967` is not an admin password.

After signing in, use the admin panel to edit content, school information, dashboard figures, calendars, news, staff, FAQs, feedback links, Careers, and Guidance & Student Services. The admin login page and storage key are TVES-branded.

## First publishing checklist

- [ ] Run schema and TVES seed against the intended database.
- [ ] Set a unique `JWT_SECRET`.
- [ ] Set a private `ADMIN_MAGIC_CODE`.
- [ ] Configure TiDB SSL and verify the health endpoint.
- [ ] Configure Cloudinary and test an image upload.
- [ ] Deploy Render and set its `FRONTEND_URL`.
- [ ] Deploy Netlify with the Render API URL.
- [ ] Test the public homepage, contact form, Careers, Guidance, and admin login.
- [ ] Replace logo, map, Facebook, staff roster, committees, PPAs, and organization-chart placeholders when official assets/data are available.

## Main routes

Public pages include `/`, `/about`, `/admissions`, `/enrollment-statistics`, `/staff`, `/org-structure`, `/ppas`, `/news`, `/students-corner`, `/careers`, `/guidance`, `/faq`, `/contact`, and `/alumni`.

Admin pages are under `/admin`, including dashboard, content, school information, enrollment statistics, staff, news, calendar, feedback, visitor statistics, Careers, and Guidance.

## Production publishing workflow

1. Make and review changes locally.
2. Run the frontend build and backend checks.
3. Apply database schema changes deliberately; run seed only when a reset is intended.
4. Deploy the API, verify `/api/health`, then deploy the frontend.
5. Test public and admin routes in the deployed environment.
6. Keep backups of production data before destructive database operations.
