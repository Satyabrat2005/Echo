# ECHO: AI-Powered Memory Assistant for Alzheimer’s Patients

## Overview
ECHO is a modular, privacy-first memory assistant built on the Internet Computer Protocol (ICP). It helps Alzheimer’s patients with context-aware cues and supports caregivers with real-time alerts and memory anchoring.

## Project Structure
- `frontend/` – Patient-facing web interface (HTML/JS, agent-js)
- `src/` – Motoko canister code (memory logic)
- `backend-ml/` – (Optional) FastAPI microservice for emotion detection
- `dfx.json` – ICP project configuration
- `deploy.sh` – One-command local deployment

## Setup & Deployment

### Prerequisites
- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (for Motoko/ICP)
- Node.js (for frontend/agent-js)
- Python 3.8+ (for backend-ml, optional)

### 1. Clone & Install
```sh
git clone <repo-url>
cd echo_memory_assistant
```

### 2. Start ICP Local Replica
```sh
dfx start --background
```

### 3. Deploy Canisters
```sh
./deploy.sh
```

### 4. Run Frontend
Open `frontend/index.html` in your browser.

### 5. (Optional) Start ML Backend
```sh
cd backend-ml
pip install -r requirements.txt
uvicorn app:app --reload
```

## Usage
- Enter queries like "Who is this?" or "Where am I?" in the frontend.
- Caregivers can set memory anchors (future feature).
- Emotion detection and alerts are stubbed for demo.

## Extending
- Add new Motoko canisters for caregiver sync.
- Integrate real ML models in `backend-ml/`.
- Expand frontend for voice, TTS, or IoT integration.

---

For more, see code comments and docs in each folder. 