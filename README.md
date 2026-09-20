# 🌴 Tripadinho — Portal Inteligente de Turismo no Nordeste

> **🚀 Produção Online (Google Cloud Run):** [https://tripadinho-49968947040.southamerica-east1.run.app](https://tripadinho-49968947040.southamerica-east1.run.app)  
> **🤖 Google ADK Web UI (Agent Studio):** [https://tripadinho-49968947040.southamerica-east1.run.app/adk/](https://tripadinho-49968947040.southamerica-east1.run.app/adk/)

O **Tripadinho** é um portal completo de turismo voltado exclusivamente para as 9 capitais do Nordeste brasileiro (*Salvador, Recife, Fortaleza, Natal, João Pessoa, Maceió, Aracaju, São Luís e Teresina*). Ele reúne um catálogo dinâmico de experiências curadas por Inteligência Artificial (Google ADK & Gemini 3.6 Flash), um assistente virtual conversacional e uma página exclusiva para o viajante salvar e gerenciar suas metas em **"Meus Objetivos"**.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, Tailwind CSS (via CDN), Swiper.js (carrossel de destinos), AOS (Animate On Scroll) e Supabase JS SDK v2.
- **Backend:** Python 3.10+, FastAPI, Uvicorn, Pydantic, Python-dotenv.
- **Banco de Dados & Autenticação:** PostgreSQL gerenciado via Supabase (Auth com Google OAuth e tabelas relacionais).
- **Inteligência Artificial:**
  - **Google Gemini 3.6 Flash:** Chat conversacional com Tool Calling (`search_places`) integrado ao backend.
  - **Google Agent Development Kit (ADK):** Agente autônomo curador para pesquisa, geração e cadastro contínuo de experiências no banco de dados.

---

## 📁 Estrutura do Projeto

```text
tripadinho/
├── PRD.md                         # Documento de Requisitos do Produto e Objetivos de Negócio
├── IMPLEMENTATION_PLAN.md         # Plano e arquitetura técnica detalhada
├── TASKS.md                       # Checklist e marcos do projeto
├── WALKTHROUGH.md                 # Resumo das funcionalidades implementadas
├── schema.sql                     # Script SQL para criação das tabelas no Supabase
├── .env.example                   # Modelo de variáveis de ambiente
├── curated_experiences_adk.md     # Relatório das 54 experiências curadas pelo agente ADK
│
├── backend/                       # Servidor de API FastAPI
│   ├── main.py                    # Endpoints REST e integração com Gemini
│   ├── database.py                # Inicialização do cliente Supabase
│   ├── requirements.txt           # Dependências Python do projeto
│   └── .env                       # Variáveis de ambiente locais (não versionado)
│
├── frontend/                      # Aplicação Web estática
│   ├── index.html                 # Landing Page principal com slider de destinos
│   ├── destination.html           # Catálogo de Destinos & Experiências com filtros e salvamento
│   ├── objectives.html            # Página "Meus Objetivos" com gestão e remoção
│   ├── profile.html               # Perfil do usuário logado
│   ├── css/
│   │   └── style.css              # Animações customizadas e estilos globais
│   └── js/
│       ├── app.js                 # Autenticação Supabase (Google) e navegação
│       └── chatWidget.js          # Widget do assistente virtual inteligente
│
└── adk_agent/                     # Agente Autônomo Google ADK
    ├── curator.py                 # Orquestração da curadoria das 9 capitais
    └── tools.py                   # Ferramentas de gravação no banco e no Markdown
```

---

## 🛠️ Guia Completo: Como Rodar ou Reconstruir o Projeto do Zero

Siga os 5 passos abaixo para configurar e rodar o projeto em qualquer máquina:

### 1. Banco de Dados (Supabase / PostgreSQL)
1. Crie um projeto gratuito no [Supabase](https://supabase.com).
2. No menu lateral, acesse o **SQL Editor**.
3. Copie e cole todo o conteúdo do arquivo [`schema.sql`](schema.sql) e clique em **Run**:
   ```sql
   CREATE TABLE IF NOT EXISTS curated_cards (
       id SERIAL PRIMARY KEY,
       destination TEXT NOT NULL,
       title TEXT NOT NULL,
       description TEXT,
       image TEXT,
       type TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ALTER TABLE curated_cards DISABLE ROW LEVEL SECURITY;

   CREATE TABLE IF NOT EXISTS saved_cards (
       id SERIAL PRIMARY KEY,
       user_id TEXT NOT NULL,
       card_id TEXT NOT NULL,
       destination TEXT NOT NULL,
       title TEXT NOT NULL,
       description TEXT,
       image TEXT,
       type TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ALTER TABLE saved_cards DISABLE ROW LEVEL SECURITY;
   ```
4. *(Opcional para Login Google)*: Em **Authentication** > **Providers** > **Google**, ative o provider e insira seu `Client ID` e `Client Secret` do Google Cloud Console. Em **URL Configuration**, adicione `http://localhost:3000` em *Site URL* e *Redirect URLs*.

---

### 2. Configurar Variáveis de Ambiente

1. Crie o arquivo `backend/.env` baseado no `.env.example`:
   ```bash
   cp .env.example backend/.env
   ```
2. Preencha as chaves:
   - `SUPABASE_URL`: URL do projeto no Supabase (ex: `https://xxxx.supabase.co`).
   - `SUPABASE_KEY`: Chave anônima / pública do Supabase.
   - `GEMINI_API_KEY`: Chave gratuita gerada no [Google AI Studio](https://aistudio.google.com/app/apikey).
3. No frontend (`frontend/js/app.js`), certifique-se de que as constantes `SUPABASE_URL` e `SUPABASE_KEY` no início do arquivo apontam para o mesmo projeto Supabase.

---

### 3. Instalação das Dependências Python

Na raiz do projeto, crie e ative um ambiente virtual e instale os pacotes:

```bash
# Criação e ativação do ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalação das dependências
pip install -r backend/requirements.txt
```

---

### 4. Popular o Banco com o Agente ADK

Para pesquisar e cadastrar automaticamente as **54 experiências** (6 para cada uma das 9 capitais nordestinas) no banco de dados e atualizar o arquivo de documentação:

```bash
source venv/bin/activate
cd adk_agent
python curator.py
cd ..
```

---

### 5. Inicializar os Servidores

Abra dois terminais (ou execute em segundo plano):

**Terminal 1 — Backend (FastAPI):**
```bash
source venv/bin/activate
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- API rodando em: `http://localhost:8000`
- Documentação interativa Swagger: `http://localhost:8000/docs`

**Terminal 2 — Frontend:**
```bash
cd frontend
python3 -m http.server 3000
```
- Acesse a aplicação no navegador em: **`http://localhost:3000`**

---

## ☁️ Como Fazer o Deploy no Google Cloud Run

O Tripadinho pode ser publicado na nuvem do Google Cloud em poucos minutos. Siga o passo a passo abaixo:

### 1. Pré-requisitos
- Ter o [Google Cloud SDK (`gcloud`)](https://cloud.google.com/sdk/docs/install) instalado e autenticado:
  ```bash
  gcloud auth login
  gcloud config set project SEU_PROJETO_ID
  ```
- Habilitar as APIs do Cloud Run, Cloud Build e Artifact Registry:
  ```bash
  gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
  ```

---

### 2. Deploy Unificado (Portal Web + API FastAPI + Google ADK Web UI) — Recomendado
Esta é a abordagem oficial adotada no projeto, onde um **único container Cloud Run** gerencia toda a stack, sem custos duplicados e com a Web UI do ADK integrada em `/adk/`:

Execute o comando na raiz do projeto:

```bash
gcloud run deploy tripadinho \
  --source . \
  --project SEU_PROJETO_ID \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --set-env-vars "SUPABASE_URL=https://SEU_PROJETO.supabase.co,SUPABASE_KEY=SUA_KEY,GEMINI_API_KEY=SUA_KEY_GEMINI" \
  --quiet
```

**Resultado:**
- Portal Web disponível na raiz: `https://tripadinho-<id>.<regiao>.run.app`
- ADK Web UI Studio disponível em: `https://tripadinho-<id>.<regiao>.run.app/adk/`
- Documentação da API Swagger em: `https://tripadinho-<id>.<regiao>.run.app/docs`

---

### 3. Deploy Alternativo via CLI do Google ADK (Microserviço Isolado)
Se você preferir implantar **apenas o agente ADK** como um microserviço independente e com URL própria separada do portal, use o comando nativo do framework:

```bash
source venv/bin/activate

adk deploy cloud_run adk_agent \
  --project=SEU_PROJETO_ID \
  --region=southamerica-east1 \
  --service_name=tripadinho-adk-agent \
  --with_ui \
  --env SUPABASE_URL=https://SEU_PROJETO.supabase.co \
  --env SUPABASE_KEY=SUA_KEY \
  --env GEMINI_API_KEY=SUA_KEY_GEMINI \
  -- --allow-unauthenticated
```

---

### 4. Ajuste no Supabase para Autenticação Google
Após obter a URL gerada pelo Cloud Run (ex: `https://tripadinho-...run.app`):
1. Acesse o **Supabase Dashboard** > **Authentication** > **URL Configuration**.
2. Adicione a URL do Cloud Run em **Site URL** e em **Redirect URLs**:
   ```text
   https://tripadinho-49968947040.southamerica-east1.run.app/**
   ```
3. No Google Cloud Console (APIs & Serviços > Credenciais > Seu OAuth Client ID), adicione a URL em **Origens JavaScript autorizadas**.

---

## 📑 Documentação Complementar

- **[PRD.md](PRD.md):** Requisitos de Produto, Objetivos de Negócio, Personas, Jornada do Usuário e Estratégia de Monetização.
- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md):** Especificação técnica dos componentes, modelos de dados e endpoints.
- **[TASKS.md](TASKS.md):** Rastreabilidade de todas as tarefas e funcionalidades entregues.
- **[WALKTHROUGH.md](WALKTHROUGH.md):** Guia com passo a passo das telas e fluxos do usuário.
- **[schema.sql](schema.sql):** DDL completo do PostgreSQL.
