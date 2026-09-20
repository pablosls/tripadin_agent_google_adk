import json
import os
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL else None

def save_curated_cards_to_db(destination: str, experiences_json: str) -> str:
    """
    Saves a curated list of experiences into the Supabase 'curated_cards' table.
    
    Args:
        destination: The name of the city (e.g. "Salvador").
        experiences_json: A JSON string representing a list of dicts. 
                          Each dict must have: title, description, type, image.
    
    Returns:
        A success or error message string.
    """
    if not supabase:
        return "Erro: Configuração do Supabase não encontrada."
        
    try:
        exp_list = json.loads(experiences_json)
        inserted = 0
        for exp in exp_list:
            record = {
                "destination": destination,
                "title": exp.get("title", "Sem Título"),
                "description": exp.get("description", ""),
                "image": exp.get("image", ""),
                "type": exp.get("type", "Passeio")
            }
            # This requires 'curated_cards' table in Supabase
            supabase.table("curated_cards").insert(record).execute()
            inserted += 1
        return f"Sucesso! {inserted} experiências cadastradas no banco de dados para {destination}."
    except Exception as e:
        return f"Falha ao salvar no banco: {str(e)}"

def update_markdown_report(destination: str, experiences_json: str) -> str:
    """
    Appends the curated experiences to a Markdown report file.
    
    Args:
        destination: The name of the city (e.g. "Salvador").
        experiences_json: A JSON string representing a list of dicts. 
                          Each dict must have: title, description, type, image.
                          
    Returns:
        A success or error message string.
    """
    try:
        exp_list = json.loads(experiences_json)
        # Salva na raiz do projeto usando caminho absoluto
        md_path = os.path.join(os.path.dirname(__file__), "..", "curated_experiences_adk.md")
        
        with open(md_path, "a", encoding="utf-8") as f:
            f.write(f"\n## Destino: {destination}\n\n")
            for exp in exp_list:
                f.write(f"### {exp.get('title', 'Sem Título')} ({exp.get('type', 'Geral')})\n")
                f.write(f"- **Descrição:** {exp.get('description', '')}\n")
                f.write(f"- **Imagem:** {exp.get('image', '')}\n\n")
        
        return "Sucesso! Relatório Markdown atualizado."
    except Exception as e:
        return f"Falha ao atualizar o Markdown: {str(e)}"
