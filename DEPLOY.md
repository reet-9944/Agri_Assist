# Deploy AgriAssist to Google Cloud Run

## Prerequisites
- Google Cloud account with billing enabled
- `gcloud` CLI installed and authenticated
- Docker installed

---

## 1. Set up environment

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
```

---

## 2. Deploy Backend

```bash
cd backend

# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/agriassist-backend

# Deploy to Cloud Run
gcloud run deploy agriassist-backend \
  --image gcr.io/YOUR_PROJECT_ID/agriassist-backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "JWT_SECRET=your_secret,OPENWEATHER_API_KEY=your_key,CROP_HEALTH_API_KEY=your_key,GOOGLE_CLIENT_ID=your_id,FRONTEND_URL=https://YOUR_FRONTEND_URL"
```

Note the backend URL from the output (e.g. `https://agriassist-backend-xxxx-el.a.run.app`)

---

## 3. Deploy Frontend

```bash
cd frontend

# Build and push (pass backend URL as build arg)
gcloud builds submit \
  --tag gcr.io/YOUR_PROJECT_ID/agriassist-frontend \
  --build-arg REACT_APP_API_URL=https://agriassist-backend-xxxx-el.a.run.app \
  --build-arg REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Deploy to Cloud Run
gcloud run deploy agriassist-frontend \
  --image gcr.io/YOUR_PROJECT_ID/agriassist-frontend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## 4. API Keys Setup

| Key | Where to get |
|-----|-------------|
| `OPENWEATHER_API_KEY` | [openweathermap.org](https://openweathermap.org/api) — free tier |
| `CROP_HEALTH_API_KEY` | [admin.kindwise.com](https://admin.kindwise.com) — 100 free credits |
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) → APIs → Credentials → OAuth 2.0 |
| `JWT_SECRET` | Any random 32+ char string |

### Google OAuth Setup
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add Authorized JavaScript origins: your frontend Cloud Run URL
4. Add Authorized redirect URIs: your frontend Cloud Run URL
5. Copy Client ID to both backend `GOOGLE_CLIENT_ID` and frontend `REACT_APP_GOOGLE_CLIENT_ID`

---

## 5. Local Development

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in your API keys in backend/.env
npm install
node server.js

# Frontend (new terminal)
cp frontend/.env.example frontend/.env
# Fill in REACT_APP_API_URL=http://localhost:5000
npm install
npm start
```
