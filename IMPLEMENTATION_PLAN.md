# Plano de Implementação: Destinos Dinâmicos, Catálogo de Experiências e "Meus Objetivos"

Implementar a leitura dinâmica dos destinos do Supabase, página completa de Experiências dos Destinos com botões de salvar/remover, e a nova página "Meus Objetivos" com gerenciamento completo de itens salvos.

## User Review Required

> [!NOTE]
> - A nova página **Meus Objetivos** (`objectives.html`) substituirá/complementará o perfil para focar nos roteiros e metas de viagem do usuário, permitindo gerenciar (salvar e remover) cada experiência.
> - O navbar será atualizado em todas as páginas para incluir links diretos para "Destinos & Experiências" e "Meus Objetivos".

## Proposed Changes

### Backend (FastAPI)

#### [MODIFY] [backend/main.py](file:///Users/pablosls/Desktop/develop/antigravity/tripadinho/backend/main.py)
- Adicionar endpoints para suportar as novas funcionalidades:
  - `GET /api/destinations`: Retorna a lista de capitais/destinos únicos cadastrados em `curated_cards` com fotos representativas e contagem de experiências.
  - `GET /api/experiences`: Retorna as experiências cadastradas em `curated_cards`, com suporte a filtro opcional por destino (`?destination=Salvador`).
  - `POST /cards/remove` ou `DELETE /cards/saved/{user_id}/{card_identifier}`: Remove uma experiência salva da tabela `saved_cards` no Supabase pelo `user_id` e identificador (ou título/id).
  - Garantir tratamento adequado para evitar duplicidades ao salvar e permitir checagem ágil.

---

### Frontend

#### [MODIFY] [frontend/index.html](file:///Users/pablosls/Desktop/develop/antigravity/tripadinho/frontend/index.html)
- Conectar o carrossel de destinos ao backend/Supabase para renderizar os slides de cidades dinamicamente a partir dos dados do banco.
- Atualizar o menu de navegação com link para "Experiências" e "Meus Objetivos".

#### [MODIFY] [frontend/destination.html](file:///Users/pablosls/Desktop/develop/antigravity/tripadinho/frontend/destination.html)
- Transformar em uma página rica de **Destinos & Experiências**:
  - Seletor/Abas para navegar entre as 9 capitais do Nordeste ou ver todas.
  - Grade de cards com todas as experiências da cidade selecionada (vindas de `curated_cards` do Supabase).
  - Em cada card: Imagem, Tag de Tipo (Passeio, Restaurante, Local), Título, Descrição e Botão Dinâmico de Ação (**"Salvar em Meus Objetivos"** ou **"Remover dos Objetivos"** se já estiver salvo).
  - Feedback visual imediato ao clicar para salvar ou remover.

#### [NEW] [frontend/objectives.html](file:///Users/pablosls/Desktop/develop/antigravity/tripadinho/frontend/objectives.html)
- Nova página **"Meus Objetivos"**:
  - Cabeçalho com identificação do usuário e resumo de objetivos (ex: "X experiências salvas em Y destinos").
  - Exibição de todos os cards salvos pelo usuário autenticado, organizados por destino ou tipo.
  - Botão **"Remover dos Objetivos"** em cada card com remoção instantânea da tela e do banco.
  - Estado vazio estilizado quando o usuário não tiver experiências salvas, com botão de ação para explorar destinos.

#### [MODIFY] [frontend/js/app.js](file:///Users/pablosls/Desktop/develop/antigravity/tripadinho/frontend/js/app.js)
- Atualizar a barra de navegação no estado autenticado para incluir **"Meus Objetivos"** e **"Experiências"**.
- Funções utilitárias compartilhadas para verificar cards salvos pelo usuário logado e alternar status (salvar/remover).

---

## Verification Plan

### Automated / Manual Verification
1. **Verificar Endpoints do Backend:**
   - Testar `GET /api/destinations` -> deve retornar as 9 capitais cadastradas.
   - Testar `GET /api/experiences?destination=Salvador` -> deve retornar as experiências de Salvador.
   - Testar `POST /cards/save` e remoção via endpoint -> deve inserir e deletar na tabela `saved_cards`.
2. **Verificar Frontend no Navegador:**
   - Acessar `http://localhost:3000` e verificar se os destinos são carregados do banco.
   - Acessar a página de experiências (`destination.html`) e testar navegação entre capitais.
   - Clicar em "Salvar em Meus Objetivos" e conferir mudança visual do botão para "Remover".
   - Checar se os itens salvos aparecem corretamente em "Meus Objetivos".

---

## Atualização Secundária: Segurança e Supabase Auth

Após a implementação inicial, o projeto foi fortificado com o módulo de Autenticação do Supabase (Google OAuth e E-mail/Senha).

### [MODIFY] [backend/main.py](file:///Users/pablosls/Desktop/develop/antigravity/tripadinho/backend/main.py)
- Proteção da API: implementação da dependência `Depends(get_current_user)` checando o Token JWT para todos os endpoints `/cards/*` e para o `DELETE /api/users/me`.
- Liberação do endpoint estático de credenciais (`/api/config`) para injeção segura no front-end.

### [NEW] [frontend/js/auth.js](file:///Users/pablosls/Desktop/develop/antigravity/tripadinho/frontend/js/auth.js)
- Controlador de sessão unificado e empacotador de requisições `fetchWithAuth(url, options)` para anexar automaticamente o Bearer JWT nas requisições ao backend.

### [NEW] [frontend/login.html](file:///Users/pablosls/Desktop/develop/antigravity/tripadinho/frontend/login.html)
- Interface oficial de login e criação de contas conectada ao Supabase Auth.

### [NEW] [frontend/profile.html](file:///Users/pablosls/Desktop/develop/antigravity/tripadinho/frontend/profile.html)
- Tela de Perfil do Usuário para exibir os metadados do provedor OAuth e disponibilizar a função de exclusão definitiva da conta.
