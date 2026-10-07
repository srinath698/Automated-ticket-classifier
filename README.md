# 🎫 TicketPulse AI — Support Ticket Classification & Routing Assistant

An end-to-end Machine Learning web application designed to automatically classify customer support tickets into relevant categories, recommend departmental routing, and provide grounded AI explanations.

Built with **TF-IDF + Logistic Regression (scikit-learn)**, a **FastAPI** backend, and a modern **React + Vite + Tailwind CSS** frontend.

---

## 🚀 Key Features

- **Authoritative ML Classification**:
  - Fitted `scikit-learn` Pipeline combining `TfidfVectorizer(max_features=5000, stop_words="english")` and `LogisticRegression(max_iter=1000, random_state=42)`.
  - Achieves **95.18% Test Accuracy** and **0.9980 Macro ROC-AUC** on a held-out test split of 166 deduplicated tickets.
- **Two Operating Modes**:
  - **Quick Classification**: Pure ML inference running 100% locally with zero external network or LLM dependencies.
  - **Enhanced AI Explanation**: Generates factual ticket summaries, linguistic rationale, and suggested next steps through OpenRouter without altering the authoritative ML classification.
- **Contextual AI Chatbot**:
  - Interactive ticket assistant grounded strictly in the current ticket's text and ML prediction.
- **Centralized Department Routing**:
  - `billing_issue` $\rightarrow$ **Billing Support**
  - `account_problem` $\rightarrow$ **Account Support**
  - `bug` $\rightarrow$ **Technical Support**
  - `feature_request` $\rightarrow$ **Product Team**
  - `general_inquiry` $\rightarrow$ **Customer Support**
- **Transparent Model Performance Dashboard**:
  - Live computation of accuracy, macro F1, log loss, ROC-AUC, per-class metrics, and an interactive confusion matrix.

---

## 📂 Project Architecture

```text
Automated-ticket-classifier/
├── backend/
│   ├── .env.example              # Placeholder configuration template
│   ├── app/
│   │   ├── config.py             # Environment settings and artifact paths
│   │   ├── schemas.py            # Pydantic request & response models
│   │   ├── main.py               # FastAPI application with CORS & static mounting
│   │   ├── routes/
│   │   │   └── api.py            # REST endpoints (/health, /predict, /explain, /chat, /metrics)
│   │   └── services/
│   │       ├── classifier.py     # Singleton ML model inference service
│   │       ├── routing.py        # Centralized department routing logic
│   │       ├── llm.py            # Async OpenRouter integration with error fallback
│   │       └── metrics.py        # Genuine held-out evaluation & confusion matrix
│   └── tests/
│       └── test_api.py           # Pytest test suite (11 passed tests)
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # API client module
│   │   ├── components/           # Reusable UI components (Badges, Chat, Cards, Header)
│   │   ├── pages/                # ClassifierPage, PerformancePage, AboutPage
│   │   ├── App.jsx               # Application shell and navigation
│   │   └── index.css             # Tailwind CSS & custom styling
│   └── dist/                     # Production build bundle
├── dataset/
│   └── support_tickets.csv       # Support tickets corpus (2,000 raw rows)
├── models/
│   └── ticket_classifier.joblib  # Serialized scikit-learn pipeline (11.2 KB)
├── notebooks/                    # EDA and training exploration notebooks
├── train.py                      # Reproducible pipeline training script
└── requirements.txt              # Complete Python dependencies
```

---

## 🛠️ Setup & Running Instructions (Windows PowerShell)

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node.js v26.7)

### 1. Install Backend Dependencies
In your repository root:
```powershell
pip install -r requirements.txt
```

### 2. Configure Optional AI Integration (OpenRouter)
Copy the example environment file:
```powershell
Copy-Item backend\.env.example backend\.env
```
Open `backend\.env` in an editor and set an OpenRouter API key. Keep the real key private and never commit it:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openrouter/free
```
*(Note: If you leave this placeholder, Quick Classification and Model Performance will still work completely. Enhanced explanation and chat will gracefully notify you that the key is in standby).*

### 3. Run the Backend API
From the `backend` directory:
```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8081
```
- API Health: `http://127.0.0.1:8081/api/health`
- Interactive Swagger Documentation: `http://127.0.0.1:8081/docs`

### 4. Run the Frontend

#### Option A: Production Mode (Single Server)
The built frontend is already precompiled into `frontend/dist/`. Simply navigate to:
```text
http://127.0.0.1:8081/
```
FastAPI automatically serves the complete React application and all API routes from port 8081.

#### Option B: Development Mode (Vite with Hot Reload)
In a separate PowerShell window:
```powershell
cd frontend
npm run dev
```
Open your browser at:
```text
http://localhost:5173/
```
(Vite proxies all `/api` calls directly to `http://127.0.0.1:8081`).

---

## 🧪 Testing

To run the backend test suite:
```powershell
cd backend
python -m pytest tests/test_api.py -v
```
The 11-test suite validates:
- Health check and model readiness
- Multi-class predictions for all 5 categories
- Department routing consistency
- Schema validation and error handling
- Held-out test set evaluation metrics
- Graceful degradation when LLM credentials are absent

---

## 📊 Held-Out Test Evaluation Results

Evaluated on the **166 held-out test tickets** (20% stratified test split) after complete text deduplication (dropping 1,174 repeated templates to prevent data leakage):

| Metric | Score |
|---|---|
| **Overall Accuracy** | **95.18%** (158 / 166 correct) |
| **Log Loss (Cross-Entropy)** | **0.3239** |
| **Macro ROC-AUC (OvR)** | **0.9980** |
| **Macro F1-Score** | **0.9444** |
| **Weighted F1-Score** | **0.9515** |

### Per-Class Performance
| Category | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| `account_problem` | 100.0% | 86.7% | 0.9286 | 15 |
| `billing_issue` | 100.0% | 92.6% | 0.9615 | 27 |
| `bug` | 93.9% | 100.0% | 0.9684 | 46 |
| `feature_request` | 95.9% | 100.0% | 0.9792 | 47 |
| `general_inquiry` | 90.0% | 87.1% | 0.8852 | 31 |

---

## 🔒 Security & Privacy Notice

- All API keys must remain in `backend/.env` (which is included in `.gitignore`). Never commit secret keys or expose them in client-side bundles.
- The web application is configured with CORS origin restrictions for local development.
- Please do not submit real user passwords, credentials, or sensitive Personally Identifiable Information (PII) into the ticket input.
