import asyncio
import os
from dotenv import load_dotenv

# Load env before importing tools that need SUPABASE_URL
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

from google.adk import Agent

try:
    from .tools import save_curated_cards_to_db, update_markdown_report
except ImportError:
    from tools import save_curated_cards_to_db, update_markdown_report

MD_PATH = os.path.join(os.path.dirname(__file__), "..", "curated_experiences_adk.md")

# Definição do Agente usando o Framework Google ADK
curator_agent = Agent(
    name="CuradorNordesteADK",
    model="gemini-3.6-flash",
    instruction=(
        "Você é um Agente Curador especialista no Nordeste do Brasil. "
        "Sua função é receber o nome de uma cidade, pesquisar e criar 6 experiências incríveis "
        "(sendo misturadas entre Passeio, Restaurante e Local de interesse). "
        "Depois de gerar os dados, você DEVE formatá-los como um array JSON e então "
        "chamar as DUAS ferramentas disponíveis em sequência: "
        "1. save_curated_cards_to_db (para salvar no banco) "
        "2. update_markdown_report (para salvar no arquivo md) "
        "Sempre passe o nome do destino e o JSON exato para as ferramentas. "
        "Ao finalizar, diga que terminou e resuma o que foi feito."
    ),
    tools=[save_curated_cards_to_db, update_markdown_report]
)

# Alias para padrão do Google ADK
root_agent = curator_agent

# Destinos do Nordeste
DESTINATIONS = [
    "Salvador", "Recife", "Fortaleza", 
    "Natal", "João Pessoa", "Maceió", 
    "Aracaju", "São Luís", "Teresina"
]

async def main():
    print("Iniciando Agente Curador ADK...")
    
    # Inicializa o arquivo Markdown se executado diretamente
    with open(MD_PATH, "w", encoding="utf-8") as f:
        f.write("# Experiências Curadas pelo Agente ADK\n\n")
        f.write("Este documento contém todas as experiências geradas pelo framework Google ADK.\n")
    
    # O ADK usa um Runner para orquestrar as chamadas
    # Aqui usaremos uma abstração mais direta caso o Runner exija setup complexo
    # Em ADK, o Agent_runner ou run_live são opções, mas para scripts simples
    # podemos instanciar um contexto manual ou usar a interface mais alto nível,
    # caso disponível.
    
    try:
        from google.adk import Runner
        runner = Runner()
        
        for dest in DESTINATIONS:
            print(f"\n[{dest}] Solicitando curadoria ao agente ADK...")
            prompt = f"Por favor, faça a curadoria de experiências para {dest}."
            
            from google.genai import types
            async for event in runner.run(
                user_id="tripadinho_admin",
                session_id="curation_session",
                new_message=types.Content(
                    role="user", 
                    parts=[types.Part.from_text(prompt)]
                ),
                run_config={"agent": curator_agent}
            ):
                if hasattr(event, "text") and event.text:
                    print(event.text, end="", flush=True)
            print("\n")
            
    except Exception as e:
        # Fallback if Runner requires more params (like session_service)
        print(f"Runner falhou ({e}), usando fallback nativo com ferramentas do ADK...")
        
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        
        for dest in DESTINATIONS:
            print(f"\n[{dest}] Processando com fallback...")
            prompt = f"Gere as 6 experiências para {dest} (misturadas entre Passeio, Restaurante e Local), chame save_curated_cards_to_db e update_markdown_report e finalize."
            
            chat = client.chats.create(
                model="gemini-3.6-flash",
                config=types.GenerateContentConfig(
                    tools=[save_curated_cards_to_db, update_markdown_report],
                    system_instruction=curator_agent.instruction
                )
            )
            
            response = chat.send_message(prompt)
            print("Resposta:", response.text)

if __name__ == "__main__":
    asyncio.run(main())
