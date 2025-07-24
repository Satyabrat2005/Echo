# ECHO: AI-Powered Memory Assistant for Alzheimer’s Patients

## Overview
ECHO is a modular, privacy-first memory assistant built on the Internet Computer Protocol (ICP). It helps Alzheimer’s patients with context-aware cues and supports caregivers with real-time alerts and memory anchoring.

## Project Structure
### Tech Stack

| Layer             | Technology                               | Role / Purpose                                                                 |
|------------------|-------------------------------------------|--------------------------------------------------------------------------------|
| 🖥 Frontend       | HTML, CSS, JavaScript (agent-js)          | Patient-facing UI and communication with the ICP canister                     |
| ⛓ Smart Contracts | Motoko (on Internet Computer)             | On-chain logic for memory queries, caregiver updates, and patient data        |
| 🌐 SDK / Bridge    | agent-js (DFINITY JavaScript SDK)         | Enables frontend to securely communicate with the ICP backend (canister)      |
| 🛠 Dev Tools       | DFX CLI, ICP Local Replica                | Tooling to develop, test, deploy Motoko canisters on local/test/main network  |
| 🧠 ML/AI Layer     | Python, FastAPI, Whisper, pyAudioAnalysis | Emotion detection from voice or text inputs; optional behavior inference       |
| 🤖 LLM Agent       | Dspy.ai                                   | Generates adaptive, empathetic responses using language models (LLM agent)     |
| 🌍 Hosting         | Replit, Render, or ICP Mainnet            | Hosts frontend, ML API, and canisters for demo or production environments      |

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

## Frontend Canister Integration

To connect the frontend to the Motoko canister locally:
1. Run:
   ```sh
   dfx generate memory_assistant
   ```
2. Copy the generated JS file (e.g., `.dfx/local/canisters/memory_assistant/memory_assistant.js`)
   into the `frontend/` directory or serve it via a local server.
3. Add the following script tag to `index.html` **before** `memory_assistant.js`:
   ```html
   <script src="memory_assistant.js"></script>
   <script src="./memory_assistant.js"></script>
   ```
4. Now the frontend can call the canister methods directly.

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