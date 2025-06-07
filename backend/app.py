from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client
import uvicorn
import time
from datetime import datetime
import logging
import random
from document_processor import process_documents

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Verify environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([GOOGLE_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("Missing required environment variables")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize vector store
vector_store = process_documents(supabase_client=supabase)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)

# Rate limiting
RATE_LIMIT_WINDOW = 60  # 1 minute
MAX_REQUESTS = 30  # Reduced to 30 requests per minute
request_timestamps = []

# Available models in order of preference
AVAILABLE_MODELS = [
    "gemini-1.5-flash",  # Faster, more efficient model
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-8b"
]

class Question(BaseModel):
    question: str
    chat_history: List[dict] = []

def check_rate_limit():
    current_time = time.time()
    global request_timestamps
    request_timestamps = [ts for ts in request_timestamps if current_time - ts < RATE_LIMIT_WINDOW]
    
    if len(request_timestamps) >= MAX_REQUESTS:
        return False
    
    request_timestamps.append(current_time)
    return True

def validate_chat_history(chat_history: List[dict]) -> bool:
    if not isinstance(chat_history, list):
        return False
    
    for message in chat_history:
        if not isinstance(message, dict):
            return False
        if 'role' not in message or 'content' not in message:
            return False
        if message['role'] not in ['user', 'assistant']:
            return False
    
    return True

def get_relevant_context(question: str, k: int = 3):
    """Get relevant context from vector store"""
    if vector_store is None:
        return "No database context available."
    
    try:
        # Search for relevant documents
        docs = vector_store.similarity_search(question, k=k)
        
        # Format the context
        context = "\n\n".join([doc.page_content for doc in docs])
        return context
    except Exception as e:
        logger.error(f"Error getting context: {str(e)}")
        return "Error retrieving database context."

@app.post("/ask")
async def ask(request: Request):
    try:
        data = await request.json()
        logger.info(f"Received request data: {data}")
        
        question = data.get("question")
        chat_history = data.get("chat_history", [])
        
        if not question:
            logger.error("No question provided in request")
            return {"error": "No question provided."}
        
        if not validate_chat_history(chat_history):
            logger.error("Invalid chat history format")
            return {"error": "Invalid chat history format."}
        
        if not check_rate_limit():
            logger.warning("Rate limit exceeded")
            return {"error": "Rate limit exceeded. Please try again in a minute."}
        
        try:
            logger.info("Initializing Gemini model")
            # List available models first
            models = genai.list_models()
            logger.info(f"Available models: {[model.name for model in models]}")
            
            # Get relevant context from vector store
            context = get_relevant_context(question)
            logger.info(f"Retrieved context: {context[:200]}...")  # Log first 200 chars
            
            # Try each model in our list until one works
            last_error = None
            for model_name in AVAILABLE_MODELS:
                try:
                    logger.info(f"Trying model: {model_name}")
                    model = genai.GenerativeModel(model_name)
                    
                    # Create prompt with context
                    prompt = f"""Based on the following database information:

{context}

Please answer this question: {question}

Provide a detailed response using only the information from the database context above. If the information is not available in the context, say so."""
                    
                    logger.info("Generating response")
                    response = model.generate_content(prompt)
                    
                    if not response or not response.text:
                        logger.error("Empty response from Gemini")
                        continue
                    
                    answer = response.text
                    logger.info(f"Generated response: {answer[:100]}...")  # Log first 100 chars
                    
                    # Store the conversation in Supabase
                    try:
                        supabase.table('conversations').insert({
                            'question': question,
                            'answer': answer,
                            'timestamp': datetime.utcnow().isoformat()
                        }).execute()
                        logger.info("Stored conversation in Supabase")
                    except Exception as e:
                        logger.error(f"Failed to store conversation: {str(e)}")
                    
                    return {"answer": answer}
                    
                except Exception as e:
                    last_error = e
                    logger.warning(f"Failed with model {model_name}: {str(e)}")
                    continue
            
            # If we get here, all models failed
            logger.error(f"All models failed. Last error: {str(last_error)}")
            return {"error": "Unable to generate response. Please try again later."}
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {"error": f"Error generating response: {str(e)}"}
            
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return {"error": f"Error processing request: {str(e)}"}

@app.get("/")
def root():
    return {"message": "Gemini Chatbot API is running."}

@app.get("/test-supabase")
async def test_supabase():
    try:
        try:
            response = supabase.table('products').select("*").limit(1).execute()
            return {"status": "success", "message": "Successfully connected to Supabase"}
        except Exception as e:
            if "does not exist" in str(e):
                return {"status": "error", "message": "Products table does not exist"}
            raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    try:
        supabase.table('products').select("*").limit(1).execute()
        return {
            "status": "healthy",
            "supabase": "connected",
            "gemini": "configured",
            "vector_store": "initialized" if vector_store is not None else "not initialized",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@app.get("/test-db")
async def test_database():
    try:
        # Test each table
        products = supabase.table('products').select("*").execute()
        inventory = supabase.table('inventory').select("*").execute()
        sales = supabase.table('sales').select("*").execute()
        claims = supabase.table('claims').select("*").execute()
        dealers = supabase.table('dealers').select("*").execute()

        return {
            "status": "success",
            "data": {
                "products": products.data,
                "inventory": inventory.data,
                "sales": sales.data,
                "claims": claims.data,
                "dealers": dealers.data
            }
        }
    except Exception as e:
        logger.error(f"Database test failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
