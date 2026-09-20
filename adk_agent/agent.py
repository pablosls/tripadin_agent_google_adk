import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente (.env do backend e local)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))
load_dotenv()

from google.adk import Agent

# Importação de ferramentas compatível com execução direta e como módulo ADK
try:
    from .tools import save_curated_cards_to_db, update_markdown_report
except ImportError:
    from tools import save_curated_cards_to_db, update_markdown_report

# O Google ADK exige obrigatoriamente a variável chamada 'root_agent'
root_agent = Agent(
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
