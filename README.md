# Chatbot Project

This is a chatbot application that uses Google's Gemini model to answer questions about products, inventory, sales, and dealers.

## Project Structure

```
chatbot/
├── backend/                 # Backend Python FastAPI application
│   ├── app.py              # Main FastAPI application
│   ├── document_processor.py # Document processing and vector store
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # Frontend React application
│   ├── src/               # Source code
│   ├── public/            # Static files
│   └── package.json       # Node.js dependencies
│
└── README.md              # This file
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     .venv\Scripts\activate
     ```
   - Unix/MacOS:
     ```bash
     source .venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file with your credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   GOOGLE_API_KEY=your_google_api_key
   ```

6. Run the backend server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- Chat interface for asking questions
- Integration with Google's Gemini model
- Vector store for efficient document retrieval
- Supabase database integration
- Real-time responses

## API Endpoints

- `GET /` - Health check
- `GET /test-supabase` - Test Supabase connection
- `POST /ask` - Ask a question to the chatbot

## Technologies Used

- Backend:
  - FastAPI
  - LangChain
  - Google Gemini
  - Supabase
  - ChromaDB

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
