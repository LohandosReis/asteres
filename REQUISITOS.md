# 📋 Especificação de Requisitos — Asteres

Documento completo de **Requisitos Funcionais (RF)** e **Requisitos Não Funcionais (RNF)** do aplicativo **Asteres — Explorador Astronômico**, levantados a partir da análise detalhada de todo o código-fonte do projeto.

- **Aplicação:** Asteres (app mobile educacional de astronomia)
- **Versão:** 1.0.0
- **Plataformas:** Android, iOS e Web
- **Stack principal:** Expo `~54`, React Native `0.81`, React `19`, TypeScript, Expo Router `~6`, Firebase `^12`

---

## 📑 Sumário

- [1. Visão Geral do Sistema](#1-visão-geral-do-sistema)
- [2. Requisitos Funcionais](#2-requisitos-funcionais)
  - [2.1 Navegação e Estrutura Geral](#21-navegação-e-estrutura-geral)
  - [2.2 Tela Início](#22-tela-início)
  - [2.3 Explorar (Catálogo)](#23-explorar-catálogo)
  - [2.4 Páginas de Detalhe](#24-páginas-de-detalhe)
  - [2.5 Quiz](#25-quiz)
  - [2.6 Hoje / APOD](#26-hoje--apod-foto-astronômica-do-dia)
  - [2.7 Notícias](#27-notícias)
  - [2.8 Social (Autenticação, Ranking e Desafios)](#28-social-autenticação-ranking-e-desafios)
  - [2.9 Favoritos / Curtidas](#29-favoritos--curtidas)
  - [2.10 Cache Offline](#210-cache-offline)
  - [2.11 Sobre](#211-sobre)
- [3. Requisitos Não Funcionais](#3-requisitos-não-funcionais)
- [4. Regras de Negócio](#4-regras-de-negócio)
- [5. Modelo de Dados](#5-modelo-de-dados)
- [6. Integrações Externas (APIs)](#6-integrações-externas-apis)
- [7. Catálogo de Conteúdo](#7-catálogo-de-conteúdo)
- [8. Observações Técnicas e Pontos de Atenção](#8-observações-técnicas-e-pontos-de-atenção)

---

## 1. Visão Geral do Sistema

O Asteres é um aplicativo educacional de astronomia, multiplataforma, que permite:

- Explorar 7 categorias astronômicas (Planetas, Luas, Nebulosas, Galáxias, Constelações, Cometas e Missões).
- Visualizar imagens oficiais da NASA em alta resolução nas páginas de detalhe.
- Jogar um quiz gamificado de ciência/astronomia com níveis, patentes, sequências e conquistas.
- Acompanhar a Foto Astronômica do Dia (APOD) com cálculos astronômicos em tempo real.
- Ler notícias do espaço traduzidas para o português.
- Criar conta, competir em um ranking global e enviar/receber desafios (módulo Social com Firebase).

---

## 2. Requisitos Funcionais

> Legenda de prioridade: **Essencial** (núcleo do produto), **Importante** (alto valor), **Desejável** (complementar).

### 2.1 Navegação e Estrutura Geral

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-001 | O sistema deve usar navegação baseada em arquivos (Expo Router), com uma pilha (Stack) raiz e um conjunto de abas. | Essencial |
| RF-002 | A barra de navegação inferior deve conter 8 abas: **Início**, **Explorar**, **Quiz**, **Hoje** (APOD), **Notícias**, **Social**, **Sobre**. | Essencial |
| RF-003 | Cada aba deve exibir ícone próprio (Ionicons), com estados visuais distintos para aba ativa (`#4DB6AC`) e inativa (`#888`). | Importante |
| RF-004 | A navegação por abas deve fornecer feedback háptico ao toque (componente `HapticTab`). | Desejável |
| RF-005 | Os cabeçalhos nativos devem ficar ocultos; cada tela renderiza o próprio cabeçalho. | Importante |
| RF-006 | O sistema deve suportar rotas dinâmicas de detalhe por categoria no formato `/{categoria}/{id}`. | Essencial |
| RF-007 | O sistema deve suportar deep links via esquema `asteres://` e rotas tipadas (`typedRoutes`). | Desejável |

### 2.2 Tela Início

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-010 | A tela inicial deve exibir o título "Asteres" e o subtítulo "Guia Definitivo do Cosmos". | Importante |
| RF-011 | A tela deve listar as 7 categorias astronômicas em cards, cada um com ícone, título e subtítulo descritivo. | Essencial |
| RF-012 | Ao tocar em um card de categoria, o app deve navegar para a aba **Explorar** já filtrada por aquela categoria (via parâmetro `?filter=`). | Essencial |
| RF-013 | Cada card deve exibir o selo "Explorar Categoria" com ícone de seta. | Desejável |

### 2.3 Explorar (Catálogo)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-020 | A tela deve exibir uma lista (FlatList) com todos os objetos astronômicos do catálogo. | Essencial |
| RF-021 | O sistema deve permitir **busca por nome** em tempo real (campo de texto "Pesquisar no universo..."). | Essencial |
| RF-022 | O sistema deve oferecer **filtros por categoria** em chips horizontais: Todos, Planetas, Luas, Nebulosas, Galáxias, Constelações, Cometas, Missões. | Essencial |
| RF-023 | A busca e o filtro devem ser combináveis (ambos aplicados simultaneamente). | Importante |
| RF-024 | A busca deve ser case-insensitive (ignorar maiúsculas/minúsculas). | Importante |
| RF-025 | Ao receber o parâmetro `filter` por navegação, a tela deve aplicar automaticamente o filtro correspondente. | Essencial |
| RF-026 | Cada item da lista deve exibir ícone (Ionicons para planetas/luas; MaterialCommunityIcons para as demais), nome e tipo. | Importante |
| RF-027 | Ao tocar em um item, o app deve abrir sua página de detalhe correspondente. | Essencial |
| RF-028 | Os nomes de categoria com acento devem ser exibidos corretamente nos chips (Galáxias, Constelações, Missões). | Desejável |

### 2.4 Páginas de Detalhe

Aplica-se às rotas: `planetas/[id]`, `luas/[id]`, `nebulosas/[id]`, `galaxias/[id]`, `constelacoes/[id]`, `cometas/[id]`, `missoes/[id]`.

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-030 | Cada página de detalhe deve exibir nome, tipo, descrição científica e lista de curiosidades do objeto. | Essencial |
| RF-031 | O sistema deve buscar e exibir a imagem oficial da NASA em alta resolução via NASA Images API. | Essencial |
| RF-032 | A busca de imagem deve priorizar versões `~orig.` e `~large.`, com fallback para `.jpg`/`.png` e, por fim, miniatura da busca. | Importante |
| RF-033 | Quando houver ID fixo da NASA mapeado para o objeto, ele deve ser usado preferencialmente; caso falhe, deve haver fallback por busca textual. | Importante |
| RF-034 | URLs de imagem `http://` devem ser convertidas para `https://` antes do uso. | Importante |
| RF-035 | Deve haver indicador de carregamento (`ActivityIndicator`) enquanto a imagem é buscada. | Importante |
| RF-036 | O sistema deve permitir **curtir/descurtir** (favoritar) o objeto; a ação exige usuário autenticado, exibindo alerta de "Login necessário" caso contrário. | Essencial |
| RF-037 | O sistema deve carregar e exibir um resumo da **Wikipédia** sobre o objeto. | Importante |
| RF-038 | O sistema deve oferecer botão **"Artigo"** que abre a página da Wikipédia do objeto no navegador. | Importante |
| RF-039 | O sistema deve oferecer botão **"Vídeo"** que abre uma busca por documentário no YouTube. | Importante |
| RF-040 | O sistema deve oferecer botão **"Abrir Original"** que abre a imagem da NASA em resolução máxima. | Desejável |
| RF-041 | O sistema deve permitir **baixar a imagem** para a galeria do dispositivo, solicitando permissão de mídia e exibindo confirmação de sucesso/erro. | Importante |
| RF-042 | Deve haver botão de **voltar** que retorna à tela anterior. | Importante |
| RF-043 | Caso o `id` recebido seja inválido, a página deve recorrer a um item padrão (ex.: primeiro da categoria) em vez de quebrar. | Importante |

### 2.5 Quiz

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-050 | O quiz deve obter perguntas de múltipla escolha da **Open Trivia DB** (categoria 17 — Ciência e Natureza), em lotes de até 50 perguntas. | Essencial |
| RF-051 | O sistema deve oferecer 3 **níveis de dificuldade**: Fácil (`easy`), Médio (`medium`) e Especialista (`hard`). | Essencial |
| RF-052 | Cada nível deve aplicar um **multiplicador de pontos**: Fácil ×1, Médio ×2, Especialista ×3. | Essencial |
| RF-053 | As perguntas e alternativas em inglês devem ser **traduzidas automaticamente para PT-BR** via MyMemory API. | Essencial |
| RF-054 | Caso a tradução online falhe, deve ser aplicado um **dicionário de fallback** de termos astronômicos. | Importante |
| RF-055 | As entidades HTML das perguntas (ex.: `&amp;`, `&quot;`) devem ser decodificadas para exibição correta. | Importante |
| RF-056 | O sistema deve embaralhar as alternativas e indicar visualmente acerto/erro após a resposta. | Essencial |
| RF-057 | O sistema deve manter uma **sequência de acertos** (streak) e exibir um selo "🔥 X seguidas!" a partir de 2 acertos consecutivos. | Importante |
| RF-058 | O sistema deve acumular a **pontuação total** e persisti-la localmente (`@quiz_score`). | Essencial |
| RF-059 | O sistema deve atribuir uma **patente/badge** conforme a pontuação total: Novato (<50), Explorador (<150), Veterano (<300), Lenda Cósmica (≥300). | Importante |
| RF-060 | O sistema deve possuir um conjunto de **conquistas** desbloqueáveis por: nº de rodadas (1, 5, 10), sequências de acertos (3, 5), rodada perfeita (10/10) e marcos de pontuação (25, 50, 100, 200). | Importante |
| RF-061 | Ao desbloquear uma conquista, o usuário deve receber notificação (alerta). | Desejável |
| RF-062 | O sistema deve registrar as perguntas já respondidas corretamente (`@quiz_acertadas`) para evitar repetições. | Desejável |
| RF-063 | O sistema deve persistir: rodadas concluídas (`@quiz_rodadas`), conquistas (`@quiz_conquistas`) e sequência máxima (`@quiz_max_sequencia`). | Importante |
| RF-064 | Quando o usuário estiver autenticado, a pontuação obtida deve ser publicada no Firebase, incrementando o **XP** e recalculando o **nível**. | Importante |
| RF-065 | O sistema deve permitir **resetar o progresso** do quiz (limpar pontuação, rodadas, conquistas, sequência e perguntas respondidas), mediante confirmação. | Importante |
| RF-066 | Respostas de API e traduções devem ser cacheadas localmente (`@quiz_api_cache_*`, `@quiz_translation_cache`) com validade de 24h para reduzir requisições. | Desejável |

### 2.6 Hoje / APOD (Foto Astronômica do Dia)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-070 | O sistema deve consumir a **NASA APOD API** e exibir a imagem/título/descrição do dia. | Essencial |
| RF-071 | A descrição (em inglês) deve ser traduzida para PT-BR. | Importante |
| RF-072 | O sistema deve calcular e exibir dados astronômicos do dia: distância e velocidade da **Terra** em relação ao Sol e a **fase atual da Lua** (com percentual de iluminação). | Importante |
| RF-073 | Quando o conteúdo do dia for um **vídeo**, o sistema deve tratar o caso adequadamente (não exibir como imagem). | Importante |
| RF-074 | O sistema deve permitir o **download** da imagem APOD para a galeria (componente `DownloadButton`). | Importante |
| RF-075 | O conteúdo da APOD deve ser **cacheado offline** (dados + imagem) com fallback para a última versão salva em caso de falha de rede. | Importante |

### 2.7 Notícias

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-080 | O sistema deve exibir um feed das últimas notícias espaciais via **Spaceflight News API**. | Essencial |
| RF-081 | Título e resumo de cada notícia devem ser traduzidos para PT-BR (otimizando a quota traduzindo título+resumo em uma única requisição). | Importante |
| RF-082 | Cada notícia deve exibir imagem, fonte e data de publicação. | Importante |
| RF-083 | Ao tocar numa notícia, o app deve abrir a matéria completa no navegador. | Importante |
| RF-084 | Deve haver indicador de carregamento durante a busca das notícias. | Importante |

### 2.8 Social (Autenticação, Ranking e Desafios)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-090 | O sistema deve permitir **cadastro** de usuário por e-mail/senha (Firebase Authentication), coletando também apelido (nome) e idade. | Essencial |
| RF-091 | O sistema deve permitir **login** por e-mail/senha. | Essencial |
| RF-092 | O sistema deve permitir **logout** (sair). | Essencial |
| RF-093 | No cadastro, a senha deve ter **no mínimo 6 caracteres**; e-mail, nome e idade são obrigatórios. | Importante |
| RF-094 | Ao autenticar, o sistema deve carregar o perfil do usuário no Firestore (`usuarios/{uid}`); se não existir, deve criar um perfil padrão. | Importante |
| RF-095 | Todo novo usuário deve iniciar no **nível 1** com **0 XP**. | Importante |
| RF-096 | O sistema deve exibir um **ranking global** com os 10 maiores níveis, em **tempo real** (listener do Firestore). | Essencial |
| RF-097 | O sistema deve permitir **buscar usuários** por nome dentro do ranking. | Importante |
| RF-098 | O sistema deve permitir **enviar desafios** a outros usuários (não é permitido desafiar a si mesmo). | Importante |
| RF-099 | O sistema deve **receber desafios em tempo real** e permitir **aceitar** ou **recusar** cada desafio. | Importante |
| RF-100 | O estado de login deve ser monitorado de forma reativa (`onAuthStateChanged`), atualizando a UI automaticamente. | Importante |

### 2.9 Favoritos / Curtidas

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-110 | O sistema deve permitir curtir/favoritar objetos astronômicos, persistindo por usuário no Firestore (coleção `likes`). | Importante |
| RF-111 | A curtida deve ser idempotente por usuário+item (chave `{uid}_{tipo}_{id}`), alternando entre curtido/não curtido. | Importante |
| RF-112 | A ação de curtir deve exigir autenticação. | Importante |

### 2.10 Cache Offline

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-120 | O sistema deve fornecer um mecanismo de cache (hook `useOfflineCache`) para salvar/recuperar dados de API com timestamp e expiração de 24h. | Importante |
| RF-121 | O sistema deve permitir **baixar e cachear imagens** localmente (no diretório de documentos, prefixo `img_`). | Importante |
| RF-122 | O sistema deve informar a **quantidade e o tamanho** (MB) das imagens em cache. | Desejável |
| RF-123 | O sistema deve permitir **limpar todo o cache** (imagens locais e chaves `@cache_*`). | Desejável |

### 2.11 Sobre

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-130 | A tela "Sobre" deve exibir logo, nome, versão e descrição do app. | Importante |
| RF-131 | A tela deve apresentar informações de Missão e Desenvolvimento. | Desejável |
| RF-132 | A tela deve exibir um botão "Avaliar o Aplicativo". | Desejável |

---

## 3. Requisitos Não Funcionais

### 3.1 Compatibilidade e Portabilidade

| ID | Requisito |
|----|-----------|
| RNF-001 | O app deve ser executável em **Android, iOS e Web** a partir de uma base de código única (Expo). |
| RNF-002 | Deve utilizar Expo `~54`, React Native `0.81`, React `19` e Expo Router `~6`. |
| RNF-003 | A orientação padrão da aplicação deve ser **retrato** (portrait). |
| RNF-004 | O `package` Android deve ser `com.lohandosreis.asteres`. |

### 3.2 Arquitetura e Manutenibilidade

| ID | Requisito |
|----|-----------|
| RNF-010 | O código deve ser escrito em **TypeScript** com modo `strict` habilitado. |
| RNF-011 | Deve ser usado o alias de importação `@/*` apontando para a raiz do projeto. |
| RNF-012 | A navegação deve usar **rotas tipadas** (`experiments.typedRoutes`). |
| RNF-013 | O projeto deve seguir o padrão de **componentes reutilizáveis** (`components/`) e separar serviços (`services/`) e hooks (`hooks/`). |
| RNF-014 | O projeto deve possuir configuração de **ESLint** (`eslint-config-expo`) e o lint deve passar via `npm run lint`. |
| RNF-015 | A configuração de backend (Firebase) deve estar centralizada em `services/firebaseConfig.ts`. |

### 3.3 Desempenho

| ID | Requisito |
|----|-----------|
| RNF-020 | Listas longas devem usar `FlatList` para renderização eficiente. |
| RNF-021 | Requisições a APIs externas devem usar **cache local com TTL de 24h** para reduzir tráfego e latência. |
| RNF-022 | Imagens da NASA devem ser carregadas de forma assíncrona, com fallback de resolução, e podem ser cacheadas localmente. |
| RNF-023 | Traduções devem ser cacheadas e agrupadas (ex.: título+resumo em uma só chamada) para economizar quota das APIs gratuitas. |

### 3.4 Usabilidade e UX

| ID | Requisito |
|----|-----------|
| RNF-030 | A interface deve adotar **tema escuro** consistente (fundo `#05050A`/`#0B0D17`, destaque `#4DB6AC`). |
| RNF-031 | Operações assíncronas devem exibir indicadores de carregamento. |
| RNF-032 | Erros e validações devem ser comunicados ao usuário por meio de alertas claros em português. |
| RNF-033 | A navegação deve oferecer feedback háptico. |
| RNF-034 | Ícones consistentes (Ionicons/MaterialCommunityIcons) devem ser usados em toda a navegação e listagens. |

### 3.5 Confiabilidade e Tolerância a Falhas

| ID | Requisito |
|----|-----------|
| RNF-040 | Falhas de rede em traduções, imagens e feeds devem ter **fallback** (dicionário local, imagem alternativa, último cache válido). |
| RNF-041 | Chamadas externas devem ser envolvidas em tratamento de erro (`try/catch`) sem travar a aplicação. |
| RNF-042 | O app deve continuar funcional offline para conteúdo já cacheado. |

### 3.6 Segurança e Privacidade

| ID | Requisito |
|----|-----------|
| RNF-050 | A autenticação deve ser feita via **Firebase Authentication** (e-mail/senha). |
| RNF-051 | Senhas devem ter no mínimo 6 caracteres (validação no cadastro). |
| RNF-052 | O acesso aos dados (perfis, likes, desafios) deve ser protegido por **Regras de Segurança do Firestore** (a configurar antes de produção). |
| RNF-053 | Ações sensíveis (curtir, publicar pontuação, desafiar) devem exigir usuário autenticado. |

### 3.7 Internacionalização

| ID | Requisito |
|----|-----------|
| RNF-060 | O conteúdo dinâmico em inglês (perguntas, notícias, descrições) deve ser apresentado em **PT-BR** via tradução automática. |
| RNF-061 | A arquitetura de tradução deve permitir expansão futura para outros idiomas. |

### 3.8 Persistência

| ID | Requisito |
|----|-----------|
| RNF-070 | Dados locais devem ser persistidos com **AsyncStorage** (pontuação, conquistas, caches). |
| RNF-071 | Imagens baixadas devem ser armazenadas via **expo-file-system**. |
| RNF-072 | Dados de usuário/ranking/desafios/likes devem ser persistidos no **Cloud Firestore**. |

### 3.9 Permissões

| ID | Requisito |
|----|-----------|
| RNF-080 | O app deve solicitar **permissão de mídia/galeria** (`expo-media-library`) antes de salvar imagens. |

### 3.10 Build e Distribuição

| ID | Requisito |
|----|-----------|
| RNF-090 | O projeto deve suportar build via **EAS** com perfis `development`, `preview` e `production`. |
| RNF-091 | O perfil de produção deve usar **auto-incremento** de versão; a fonte de versão é remota (`appVersionSource: remote`). |

---

## 4. Regras de Negócio

| ID | Regra |
|----|-------|
| RN-01 | **Cálculo de nível:** `nivel = max(1, floor(xp / 100) + 1)`. |
| RN-02 | **Pontuação do quiz:** pontos por acerto são multiplicados pelo nível de dificuldade (×1 / ×2 / ×3). |
| RN-03 | **Patentes do quiz:** Novato (<50), Explorador (50–149), Veterano (150–299), Lenda Cósmica (≥300). |
| RN-04 | **Ranking global:** ordenado por `nivel` desc, limitado aos 10 primeiros. |
| RN-05 | **Desafio:** um usuário não pode desafiar a si mesmo; desafios começam com status `pendente` e mudam para `aceito`/`recusado`. |
| RN-06 | **Curtida:** uma curtida por usuário por item (chave única `{uid}_{tipo}_{id}`); reenviar a ação remove a curtida. |
| RN-07 | **Expiração de cache:** dados/imagens em cache expiram em 24 horas. |
| RN-08 | **Novo usuário:** começa no nível 1 com 0 XP. |

---

## 5. Modelo de Dados

### 5.1 Cloud Firestore

| Coleção | Documento | Campos |
|---------|-----------|--------|
| `usuarios` | `{uid}` | `nome`, `idade`, `nivel`, `xp` |
| `likes` | `{uid}_{tipo}_{id}` | `userId`, `type`, `itemId`, `meta`, `createdAt` |
| `desafios` | auto-id | `remetenteId`, `remetenteNome`, `destinatarioId`, `destinatarioNome`, `status` (`pendente`/`aceito`/`recusado`), `dataEnvio` |

### 5.2 AsyncStorage (chaves locais)

| Chave | Conteúdo |
|-------|----------|
| `@quiz_score` | Pontuação total acumulada |
| `@quiz_rodadas` | Número de rodadas concluídas |
| `@quiz_conquistas` | Conquistas desbloqueadas |
| `@quiz_max_sequencia` | Maior sequência de acertos |
| `@quiz_acertadas` | Perguntas já respondidas corretamente |
| `@quiz_translation_cache` | Cache de traduções |
| `@quiz_api_cache_{easy\|medium\|hard}` | Cache de perguntas por dificuldade |
| `@cache_{chave}` | Cache genérico de dados de API (TTL 24h) |

### 5.3 Sistema de Arquivos

| Caminho | Conteúdo |
|---------|----------|
| `{document}/img_{id}.jpg` | Imagens cacheadas localmente |
| `{cache}/{filename}_{timestamp}.jpg` | Arquivo temporário de download antes de salvar na galeria |

---

## 6. Integrações Externas (APIs)

| Serviço | Uso | Autenticação |
|---------|-----|--------------|
| **NASA Images API** (`images-api.nasa.gov`) | Imagens dos objetos nas páginas de detalhe | Pública |
| **NASA APOD API** (`api.nasa.gov/planetary/apod`) | Foto astronômica do dia | Chave de API (`DEMO_KEY` por padrão) |
| **Open Trivia DB** (`opentdb.com`) | Perguntas do quiz (categoria 17 — Ciência e Natureza) | Pública |
| **MyMemory Translation** (`api.mymemory.translated.net`) | Tradução EN → PT-BR | Pública (com quota) |
| **Spaceflight News API** | Feed de notícias espaciais | Pública |
| **Wikipedia REST API** (`en.wikipedia.org/api/rest_v1`) | Resumos e links dos objetos | Pública |
| **YouTube (busca por URL)** | Abertura de busca por documentários | Pública |
| **Firebase** (Auth + Firestore) | Autenticação, perfis, ranking, desafios e likes | Config do projeto |

---

## 7. Catálogo de Conteúdo

Total de objetos no catálogo de exploração, por categoria:

| Categoria | Quantidade | Exemplos |
|-----------|------------|----------|
| Planetas | 8 | Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano, Netuno |
| Luas | 17 | Lua, Fobos, Deimos, Io, Europa, Ganimedes, Titã, Encélado… |
| Nebulosas | 12 | Órion, Carina, Águia, Caranguejo, Anel, Hélice, Cabeça de Cavalo… |
| Galáxias | 10 | Andrômeda, Via Láctea, Sombrero, Redemoinho, Triângulo, M87… |
| Constelações | 12 | Áries, Touro, Gêmeos, Câncer, Leão, Virgem… (zodíaco) |
| Cometas | 10 | Halley, Hale-Bopp, NEOWISE, Encke, Swift-Tuttle, ISON… |
| Missões | 10 | Apollo 11, Voyager 1, Artemis I, Hubble, James Webb, Curiosity… |

> Cada objeto possui página de detalhe própria com imagem da NASA, descrição, curiosidades e ações (curtir, artigo, vídeo, download).

---

## 8. Observações Técnicas e Pontos de Atenção

Itens identificados durante a análise do código que merecem atenção (não são, necessariamente, defeitos, mas recomendações):

1. **Chaves de API no código-fonte.** A chave do Firebase (`services/firebaseConfig.ts`) e chaves da NASA (uma `DEMO_KEY` em `apod.tsx` e uma chave real em `planetas/[id].tsx`) estão hardcoded. As chaves web do Firebase não são segredos, mas recomenda-se mover chaves da NASA para variáveis de ambiente (`app.config`/`extra`) e proteger o Firestore com Regras de Segurança antes de publicar.
2. **Quiz × categoria.** As perguntas vêm da Open Trivia DB **categoria 17 (Ciência e Natureza)** — escopo mais amplo que "apenas astronomia". A camada de tradução possui dicionário voltado a termos astronômicos.
3. **Regras de Segurança do Firestore.** Como ranking, desafios, likes e perfis são lidos/escritos pelo cliente, é essencial definir regras adequadas para evitar leitura/escrita indevida.
4. **Idade como string.** O campo `idade` é armazenado como texto no Firestore; padronizar como número facilitaria validações futuras.
5. **Internacionalização.** Hoje a tradução é fixa para PT-BR; a arquitetura permite generalizar para múltiplos idiomas.
