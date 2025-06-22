
# Mental Health Chatbot

An AI-powered chatbot designed to provide mental health support and resources. 

## 🌟 Features

- Real-time chat interface with AI-powered responses
- Mental health focused conversations with empathetic responses
- Modern, accessible UI built with React and Tailwind CSS
- Fast and reliable backend powered by FastAPI and Llama3

## 🛠️ Tech Stack

- React + TypeScript
- Tailwind CSS
- Vite
- FastAPI
- Ollama + Llama3
- Python



## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mental-health-chatbot
```

### 2. Backend Setup

#### Install Ollama and Pull Llama3

```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.com/install.sh | sh

# Pull the Llama3 model
ollama pull llama3
```

#### Set up Python Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Environment Configuration

```bash
# Copy the environment template
cp .env.sample .env

# Edit .env file with your configuration
nano .env  # or use your preferred editor
```

#### Start the Backend Server

```bash
uvicorn app.main:app --port 8000 --reload
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
mental-health-chatbot/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   └── deps.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── core/
│   │   ├── crud/
│   │   ├── db/
│   │   ├── vector/
│   │   └── schema/
│   ├── requirements.txt
│   ├── .env.sample
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```