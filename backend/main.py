import os
import sys
import uuid
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.generativeai as genai

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

from database import supabase

app = FastAPI(title="Tripadinho API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

# Define the Tool / Function for Gemini
def search_places(query: str, destination: str, type: str) -> List[dict]:
    """
    Busca recomendações reais de lugares (restaurantes, passeios, atrações) no Nordeste do Brasil.
    
    Args:
        query: O termo de busca (ex: "restaurante romântico", "passeio de buggy").
        destination: A cidade destino (ex: "Salvador", "Natal").
        type: O tipo de local (ex: "Restaurante", "Passeio", "Hospedagem", "Atração").
    """
    # In a real app, we would call Google Places API here.
    # For now, we simulate structured responses based on the destination.
    # This proves the agentic flow: Gemini decides to call this, we return structured data, 
    # and it gets forwarded to the frontend as cards.
    
    mock_db = {
        "Salvador": [
            {"id": str(uuid.uuid4()), "title": "Pelourinho", "description": "Centro histórico famoso por sua arquitetura colonial e cultura afro-brasileira vibrante.", "type": "Atração", "image": "https://images.unsplash.com/photo-1624800223707-1647413000b0?q=80&w=600&auto=format&fit=crop"},
            {"id": str(uuid.uuid4()), "title": "Restaurante Amado", "description": "Alta gastronomia com vista para a Baía de Todos os Santos. Ideal para casais.", "type": "Restaurante", "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop"}
        ],
        "Recife": [
            {"id": str(uuid.uuid4()), "title": "Marco Zero", "description": "Ponto de partida da cidade com vista para o Parque das Esculturas.", "type": "Atração", "image": "https://images.unsplash.com/photo-1629739414571-085e3a8bce73?q=80&w=600&auto=format&fit=crop"}
        ],
        "Fortaleza": [
            {"id": str(uuid.uuid4()), "title": "Praia do Futuro", "description": "Famosa pelas mega barracas de praia e caranguejada.", "type": "Passeio", "image": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80"}
        ]
    }
    
    results = mock_db.get(destination, [
        {"id": str(uuid.uuid4()), "title": f"{query} em {destination}", "description": f"Uma excelente opção de {type.lower()} em {destination} selecionada especialmente para você.", "type": type, "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600&auto=format&fit=crop"}
    ])
    
    # Inject the destination into the mock results if not present
    for r in results:
        r["destination"] = destination
        
    return results

# Initialize model with tools
model = genai.GenerativeModel('gemini-3.6-flash', tools=[search_places])

class ChatMessage(BaseModel):
    message: str
    history: List[dict] = []

class Card(BaseModel):
    id: str
    destination: str
    title: str
    description: str
    image: str
    type: str

class SaveCardRequest(BaseModel):
    user_id: str
    card: Card

@app.post("/api/chat")
async def chat_endpoint(req: ChatMessage):
    if not os.environ.get("GEMINI_API_KEY"):
        return {"response": "A API Key do Gemini não está configurada no backend.", "cards": []}

    try:
        # Reconstruct history for Gemini (basic mapping)
        formatted_history = []
        for msg in req.history:
            formatted_history.append({"role": msg["role"], "parts": [msg["parts"][0]["text"]]})

        chat = model.start_chat(history=formatted_history)
        
        system_instruction = "Você é um assistente de viagens do portal Tripadinho. Você sempre ajuda o usuário a encontrar as melhores atrações do Nordeste. Use a ferramenta 'search_places' para buscar lugares reais e enviar ao usuário. Quando usar a ferramenta, avise o usuário que você encontrou algumas opções."
        
        response = chat.send_message(f"{system_instruction}\n\nUsuário: {req.message}")
        
        cards_to_return = []
        response_text = ""

        # Safely extract function call if it exists
        fc = None
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.function_call:
                    fc = part.function_call
                    break

        if fc:
            if fc.name == "search_places":
                # Convert Protocol Buffer map to dict safely
                args = {k: v for k, v in type(fc.args).items(fc.args)} if hasattr(fc.args, 'items') else dict(fc.args)
                
                # Execute the python function
                places = search_places(**args)
                cards_to_return = places
                
                # Send the function response back to Gemini to get a natural language summary
                function_response = chat.send_message(
                    genai.protos.Content(
                        parts=[genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name='search_places',
                                response={'result': places}
                            )
                        )]
                    )
                )
                response_text = function_response.text
        else:
            response_text = response.text

        return {"response": response_text, "cards": cards_to_return}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"response": f"Desculpe, ocorreu um erro: {str(e)}", "cards": []}

class RemoveCardRequest(BaseModel):
    user_id: str
    card_id: Optional[str] = None
    title: Optional[str] = None

@app.get("/api/destinations")
async def get_destinations():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase não configurado")
    try:
        res = supabase.table("curated_cards").select("destination, image, type").execute()
        dest_map = {}
        state_map = {
            "Salvador": "Bahia",
            "Recife": "Pernambuco",
            "Fortaleza": "Ceará",
            "Natal": "Rio Grande do Norte",
            "João Pessoa": "Paraíba",
            "Maceió": "Alagoas",
            "Aracaju": "Sergipe",
            "São Luís": "Maranhão",
            "Teresina": "Piauí"
        }
        for item in res.data:
            d = item.get("destination")
            if not d:
                continue
            if d not in dest_map:
                dest_map[d] = {
                    "destination": d,
                    "state": state_map.get(d, "Nordeste"),
                    "image": item.get("image") or "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80",
                    "count": 1
                }
            else:
                dest_map[d]["count"] += 1
        return {"destinations": list(dest_map.values())}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/experiences")
async def get_experiences(destination: Optional[str] = None):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase não configurado")
    try:
        query = supabase.table("curated_cards").select("*")
        if destination and destination != "Todos":
            query = query.eq("destination", destination)
        res = query.execute()
        return {"experiences": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/cards/save")
async def save_card(req: SaveCardRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase não configurado")
    try:
        # Check if already saved
        existing = supabase.table("saved_cards").select("id").eq("user_id", req.user_id).eq("title", req.card.title).execute()
        if existing.data and len(existing.data) > 0:
            return {"message": "Card já estava salvo", "data": existing.data[0]}

        data = {
            "user_id": req.user_id,
            "card_id": req.card.id or str(req.card.title),
            "destination": req.card.destination,
            "title": req.card.title,
            "description": req.card.description,
            "image": req.card.image,
            "type": req.card.type
        }
        res = supabase.table("saved_cards").insert(data).execute()
        return {"message": "Card salvo com sucesso", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/cards/remove")
async def remove_card(req: RemoveCardRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase não configurado")
    try:
        query = supabase.table("saved_cards").delete().eq("user_id", req.user_id)
        if req.title:
            query = query.eq("title", req.title)
        elif req.card_id:
            query = query.eq("card_id", req.card_id)
        else:
            raise HTTPException(status_code=400, detail="Informe title ou card_id")
        
        res = query.execute()
        return {"message": "Card removido com sucesso", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/cards/saved/{user_id}")
async def get_saved_cards(user_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase não configurado")
    try:
        res = supabase.table("saved_cards").select("*").eq("user_id", user_id).execute()
        return {"cards": res.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Mount Google ADK Web UI at /adk
try:
    from google.adk.cli.fast_api import get_fast_api_app
    adk_dir = os.path.join(os.path.dirname(__file__), "..", "adk_agent")
    if not os.path.exists(adk_dir):
        adk_dir = os.path.join(os.getcwd(), "adk_agent")

    if os.path.exists(adk_dir):
        adk_app = get_fast_api_app(
            agents_dir=adk_dir,
            web=True,
            session_service_uri="memory://",
            artifact_service_uri="memory://",
            url_prefix="/adk"
        )
        app.mount("/adk", adk_app)
        print("Google ADK Web UI montada com sucesso em /adk!")
except Exception as e:
    print(f"Aviso ao inicializar ADK Web UI: {e}")

# Mount static frontend files
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
if not os.path.exists(frontend_dir):
    frontend_dir = os.path.join(os.getcwd(), "frontend")

if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
