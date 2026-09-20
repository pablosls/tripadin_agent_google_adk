# Walkthrough: Destinos do Supabase, Catálogo de Experiências e "Meus Objetivos"

Implementamos com sucesso todos os 5 requisitos solicitados para a leitura e gerenciamento de destinos e experiências no Tripadinho.

## 1. Destinos lidos dinamicamente do Supabase
- Criado o endpoint `GET /api/destinations` no backend que agrega os destinos cadastrados na tabela `curated_cards`, calculando o estado, imagens representativas e o total de experiências disponíveis em cada cidade.
- O carrossel de destinos da Landing Page (`index.html`) agora carrega essas informações diretamente da API em tempo real.

## 2. Página de Destinos & Experiências (`destination.html`)
- Página completa exibindo as 54 experiências cadastradas no banco de dados.
- Filtros interativos por **Capitais do Nordeste** (Salvador, Recife, Fortaleza, Natal, João Pessoa, Maceió, Aracaju, São Luís, Teresina e "Todos") e por **Tipos** (Passeios, Restaurantes, Locais).
- Cards detalhados com foto, tag de categoria colorida, tag do destino, título e descrição.

## 3. Botão Dinâmico de Salvar / Remover Experiência
- Em cada card na página de experiências, foi adicionado um botão de ação com estado reativo:
  - Se ainda não estiver salvo: **"+ Salvar em Meus Objetivos"**
  - Se já estiver salvo na conta do usuário: **"✓ Salvo / Remover dos Objetivos"**
- Ação em 1 clique com notificação flutuante (Toast) e sincronização com o banco.

## 4 e 5. Nova Página "Meus Objetivos" (`objectives.html`)
- Página dedicada ao planejamento do usuário.
- Painel de estatísticas com contador de experiências e cidades salvas.
- Filtro rápido por destino através de tags clicáveis.
- Experiências agrupadas por destino.
- Botão **"Remover dos Meus Objetivos"** em cada cartão para remoção instantânea na interface e no banco de dados.
- Estado vazio estilizado orientando o usuário a explorar o catálogo quando não houver itens salvos.

## Endpoints Adicionados no Backend (`main.py`)
- `GET /api/destinations`: Lista destinos agregados do banco.
- `GET /api/experiences`: Lista experiências cadastradas com filtro opcional `?destination=...`.
- `POST /cards/save`: Salva experiência no perfil evitando duplicidades.
- `POST /cards/remove`: Remove experiência salva do usuário pelo título ou ID.
- `GET /cards/saved/{user_id}`: Retorna todas as experiências salvas do usuário.

## 6. Deploy no Google Cloud Run e Google ADK Web UI
- Container unificado compilado via Cloud Build e hospedado em `southamerica-east1` (São Paulo).
- Servindo tanto a aplicação web (`/`), quanto os endpoints da API (`/api/`) e a interface oficial do Google ADK (`/adk/`).
- **URL do Portal:** [https://tripadinho-49968947040.southamerica-east1.run.app](https://tripadinho-49968947040.southamerica-east1.run.app)
- **URL do ADK Studio:** [https://tripadinho-49968947040.southamerica-east1.run.app/adk/](https://tripadinho-49968947040.southamerica-east1.run.app/adk/)

