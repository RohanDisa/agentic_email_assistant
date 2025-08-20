# 📧 MailMind — AI-Powered Email Assistant  

An intelligent email assistant built with **React (Vite)**, **FastAPI**, **Redis**, and **Celery**, powered by **LLaMA-70B**.  
This project transforms how users interact with their inbox by combining **task automation**, **smart replies**, and **natural language querying**.  

---

## 🚀 Features  

- ✅ **Extract Todos from Emails** – Automatically identifies and organizes actionable tasks from incoming messages.  
- 📬 **Smart Reply Generator** – Detects when an email requires a response and drafts context-aware replies.  
- ✍️ **AI-Powered Email Composer** – Write professional emails by conversing directly with a large language model.  
- 🔍 **Inbox Q&A** – Ask natural language questions about your inbox instead of manually searching (e.g., *“What meetings do I have tomorrow?”*).  

---

## 🛠️ Tech Stack  

- **Frontend**: React + Vite  
- **Backend**: Python + FastAPI + Uvicorn  
- **AI Model**: LLaMA 80B  
- **Task Queue**: Celery + Redis  
- **Database**: (add if you use MongoDB/Postgres, otherwise remove this line)  
- **Other**: REST APIs, JWT/Auth (if included)  

---

## ⚙️ Installation & Setup  

### Prerequisites  
- Node.js (v18+)  
- Python (3.10+)  
- Redis server running locally  

### 1. Clone the Repository  
git clone https://github.com/your-username/mailmind.git
cd mailmind

### 2. Frontend Setup 
cd frontend
npm install
npm run dev # starts Vite dev server

### 3. Backend Setup  
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

### 4. Start Celery Worker
celery -A worker.celery_app worker --loglevel=info