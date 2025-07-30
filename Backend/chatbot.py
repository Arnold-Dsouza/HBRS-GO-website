from langchain_openai import ChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# import the .env file
from dotenv import load_dotenv


load_dotenv()
import os


# configuration
DATA_PATH = r"data"
CHROMA_PATH = r"chroma_db"



# initiate the model for OpenRouter DeepSeek V3 0324
llm = ChatOpenAI(
    temperature=0.5,
    model="deepseek/deepseek-chat-v3-0324",  # OpenRouter's DeepSeek V3 0324 model name
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    openai_api_base=os.getenv("OPENAI_API_BASE"),
)

# set up the embedding function for retrieval
embeddings_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
# connect to the chromadb with embedding_function
vector_store = Chroma(
    collection_name="example_collection",
    embedding_function=embeddings_model,
    persist_directory=CHROMA_PATH, 
)

# Set up the vectorstore to be the retriever
num_results = 5
retriever = vector_store.as_retriever(search_kwargs={'k': num_results})

# call this function for every message added to the chatbot
def stream_response(message, history):
    #print(f"Input: {message}. History: {history}\n")

    # retrieve the relevant chunks based on the question asked
    docs = retriever.invoke(message)

    # add all the chunks to 'knowledge'
    knowledge = ""

    for doc in docs:
        knowledge += doc.page_content+"\n\n"


    # make the call to the LLM (including prompt)
    if message is not None:

        partial_message = ""

        rag_prompt = f"""
        You are an assistent which answers questions based on knowledge which is provided to you.
        While answering, you don't use your internal knowledge, 
        but solely the information in the "The knowledge" section.
        You don't mention anything to the user about the povided knowledge.

        The question: {message}

        Conversation history: {history}

        The knowledge: {knowledge}

        """

        print(rag_prompt)

        # stream the response to the Gradio App
        for response in llm.stream(rag_prompt):
            partial_message += response.content
            yield partial_message


# FastAPI app for HTTP API
app = FastAPI()

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chatbot")
async def chatbot_endpoint(request: Request):
    data = await request.json()
    message = data.get("message")
    history = data.get("history", [])
    # stream_response yields partials, but for API we want the final answer
    response = ""
    for partial in stream_response(message, history):
        response = partial
    return JSONResponse({"response": response})