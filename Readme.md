# 📧 MailMind — AI-Powered Email Assistant  

An intelligent email assistant built with **React (Vite)**, **FastAPI**, **Redis**, and **Celery**, powered by **LLaMA-70B**.  
This project transforms how users interact with their inbox by combining **task automation**, **smart replies**, and **natural language querying**.  

---

## 🚀 Features  

- ✅ **Extract Todos from Emails**  
  Automatically scans incoming emails to identify actionable tasks such as deadlines, meetings, or follow-ups.  
  This eliminates the need for manual task tracking and helps users stay organized directly from their inbox.  

- 📬 **Smart Reply Generator**  
  Determines whether an email requires a reply and, if so, drafts a contextually relevant and professional response.  
  This feature saves time by handling routine replies and ensures consistent communication tone.  

- ✍️ **AI-Powered Email Composer**  
  Allows users to draft new emails by conversing with the LLM in natural language.  
  Instead of struggling to phrase a message, users can describe their intent (e.g., *“Write a polite follow-up about yesterday’s meeting”*) and receive a polished email instantly.  

- 🔍 **Inbox Q&A**  
  Provides a conversational interface to query the inbox using plain English.  
  For example:  
  - *“Show me all emails from my advisor last week.”*  
  - *“What meetings are scheduled tomorrow?”*  
  - *“Summarize unread emails from today.”*  
  This reduces time spent searching manually and makes email management more intuitive. 

---

## 🛠️ Tech Stack  

- **Frontend**: React + Vite  
- **Backend**: Python + FastAPI + Uvicorn  
- **AI Model**: LLaMA 80B  
- **Task Queue**: Celery + Redis  

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