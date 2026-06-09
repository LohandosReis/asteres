# 🚀 Asteres — Explorador Astronômico

**Asteres** é um aplicativo mobile educacional de astronomia construído com **React Native**, **Expo** e **Expo Router**. O app permite explorar planetas, luas, nebulosas, galáxias, constelações, cometas e missões espaciais com imagens oficiais da NASA, além de oferecer um quiz gamificado, foto astronômica do dia, notícias do espaço e um módulo social com ranking e desafios entre usuários.

> Guia Definitivo do Cosmos — feito para aprender astronomia de forma interativa.

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#️-tecnologias)
- [APIs e Serviços Externos](#-apis-e-serviços-externos)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
- [Configuração do Firebase](#-configuração-do-firebase)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Build com EAS](#-build-com-eas)
- [Modelo de Dados (Firestore)](#-modelo-de-dados-firestore)
- [Armazenamento Local](#-armazenamento-local)
- [Backlog / Roadmap](#-backlog--roadmap)
- [Autor](#-autor)

---

## 🧩 Visão Geral

- Aplicativo **multiplataforma** (Android, iOS e Web) feito com **Expo** e **TypeScript**.
- Navegação **baseada em arquivos** via **Expo Router** (com rotas tipadas).
- Conteúdo organizado em **7 categorias astronômicas**: Planetas, Luas, Nebulosas, Galáxias, Constelações, Cometas e Missões.
- Imagens carregadas dinamicamente da **NASA Images API**, com **cache offline** de imagens e dados.
- **Quiz gamificado** com níveis de dificuldade, patentes, conquistas e tradução automática das perguntas.
- **Autenticação** e recursos sociais (ranking global, busca de usuários e desafios) com **Firebase**.
- Tema escuro consistente em todo o app.

---

## ✨ Funcionalidades

O app é organizado em abas, cada uma cobrindo uma área de exploração:

### 🪐 Início (`index`)
Tela inicial com as categorias astronômicas apresentadas em cards com ícones, que direcionam para a aba **Explorar** com o filtro já aplicado.

### 🔍 Explorar (`explore`)
Catálogo completo de objetos astronômicos com **busca por nome** e **filtro por categoria** (suporta deep-link via parâmetro `?filter=`). Cada item leva à sua página de detalhes.

### 🧾 Páginas de Detalhe
Rotas dinâmicas dedicadas para cada categoria, com imagens da NASA, descrições científicas, curiosidades e links externos (Wikipédia / YouTube):
`planetas/[id]`, `luas/[id]`, `nebulosas/[id]`, `galaxias/[id]`, `constelacoes/[id]`, `cometas/[id]`, `missoes/[id]`.

### ❓ Quiz (`quiz`)
Quiz interativo de astronomia com:
- **Níveis de dificuldade** — Fácil, Médio e Especialista, com multiplicadores de pontos (1×, 2×, 3×).
- **Patentes/Badges** — Novato, Explorador, Veterano e Lenda Cósmica, definidas pela pontuação total.
- **Conquistas** — medalhas por rodadas completas, sequências de acertos, rodada perfeita e marcos de pontuação.
- **Tradução automática** das perguntas (EN → PT-BR) com cache de traduções e **dicionário de fallback** offline.
- **Pontuação persistente** localmente (`AsyncStorage`) e sincronização de XP/nível com o Firebase quando autenticado.

### 🔭 Hoje / APOD (`apod`)
Foto Astronômica do Dia (NASA APOD) com tradução da descrição, além de **cálculos astronômicos** em tempo real (posição/distância da Terra ao Sol, fase atual da Lua) e botão de **download** da imagem.

### 📰 Notícias (`news`)
Feed das últimas notícias espaciais via **Spaceflight News API**, com título e resumo traduzidos para português e links para a matéria completa.

### 👥 Social (`social`)
Módulo social com **Firebase Authentication**:
- Cadastro e login por e-mail/senha.
- Perfil de usuário (nome, idade, nível e XP).
- **Ranking global** dos top 10 usuários por nível, em tempo real.
- **Busca** de usuários e envio/recebimento de **desafios** (aceitar/recusar) em tempo real.

### ℹ️ Sobre (`about`)
Informações sobre o aplicativo, sua missão e as tecnologias utilizadas.

### 🌐 Recursos transversais
- **Favoritos / Likes** persistidos no Firestore por usuário.
- **Cache offline** de imagens e respostas de API (válido por 24h) via hook `useOfflineCache`.
- **Feedback háptico** na navegação por abas.

---

## 🛠️ Tecnologias

| Categoria | Stack |
|-----------|-------|
| Core | Expo `~54`, React Native `0.81`, React `19`, TypeScript `~5.9` |
| Navegação | Expo Router `~6` (rotas tipadas), React Navigation (bottom tabs) |
| Backend / Auth | Firebase `^12` (Authentication + Firestore) |
| Armazenamento local | `@react-native-async-storage/async-storage`, `expo-file-system` |
| UI / UX | `@expo/vector-icons`, `expo-image`, `react-native-reanimated`, `react-native-gesture-handler`, `expo-haptics` |
| Utilidades | `expo-web-browser`, `expo-linking`, `expo-sharing`, `expo-media-library`, `expo-splash-screen` |
| Qualidade | ESLint (`eslint-config-expo`) |

---

## 🔌 APIs e Serviços Externos

- **NASA Images API** — imagens oficiais dos objetos astronômicos.
- **NASA APOD API** — foto astronômica do dia (usa `DEMO_KEY` por padrão).
- **Open Trivia DB** — banco de perguntas do quiz (filtradas para astronomia).
- **MyMemory Translation API** — tradução automática EN → PT-BR (perguntas, notícias e descrições).
- **Spaceflight News API** — feed de notícias espaciais.
- **Wikipedia REST API** — resumos e links de aprofundamento.
- **Firebase** — autenticação e persistência (perfis, likes, desafios, ranking).

---

## 📁 Estrutura do Projeto

```
asteres/
├── app/                          # Telas e rotas (Expo Router)
│   ├── _layout.tsx               # Stack raiz de navegação
│   ├── modal.tsx                 # Modal global
│   ├── (tabs)/                   # Navegação por abas
│   │   ├── _layout.tsx           # Configuração das abas
│   │   ├── index.tsx             # Início
│   │   ├── explore.tsx           # Catálogo / busca / filtro
│   │   ├── quiz.tsx              # Quiz gamificado
│   │   ├── apod.tsx              # Foto do dia (APOD) + cálculos
│   │   ├── news.tsx              # Notícias espaciais
│   │   ├── social.tsx            # Auth, ranking e desafios
│   │   └── about.tsx             # Sobre
│   ├── planetas/[id].tsx         # Detalhe dinâmico — planetas
│   ├── luas/[id].tsx             # Detalhe dinâmico — luas
│   ├── nebulosas/[id].tsx        # Detalhe dinâmico — nebulosas
│   ├── galaxias/[id].tsx         # Detalhe dinâmico — galáxias
│   ├── constelacoes/[id].tsx     # Detalhe dinâmico — constelações
│   ├── cometas/[id].tsx          # Detalhe dinâmico — cometas
│   └── missoes/[id].tsx          # Detalhe dinâmico — missões
├── components/                   # Componentes de UI reutilizáveis
│   ├── Downloadbutton.tsx        # Botão de download de imagem
│   ├── haptic-tab.tsx            # Aba com feedback háptico
│   ├── parallax-scroll-view.tsx
│   ├── themed-text.tsx / themed-view.tsx
│   └── ui/                       # Ícones, collapsible, etc.
├── services/
│   ├── firebaseConfig.ts         # Inicialização do Firebase (auth + db)
│   └── contentHelpers.ts         # Likes, XP/nível, Wikipédia, YouTube
├── hooks/
│   ├── Useofflinecache.ts        # Cache offline de imagens e dados
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
├── constants/theme.ts            # Cores e variáveis de tema
├── scripts/reset-project.js      # Reseta o projeto a um estado em branco
├── assets/images/                # Ícones, logo e splash
├── app.json                      # Configuração do Expo
├── eas.json                      # Perfis de build do EAS
├── eslint.config.js
├── tsconfig.json
└── package.json
```

---

## ✅ Pré-requisitos

- **Node.js** 18+ (recomendado 20/22 LTS) e **npm**.
- **Expo Go** instalado no celular (Android/iOS) ou um emulador/simulador.
- (Opcional) **Expo CLI** / **EAS CLI** para builds nativos: `npm install -g eas-cli`.

---

## 🚀 Como Executar

### 1. Clonar e instalar

```bash
git clone https://github.com/LohandosReis/asteres.git
cd asteres
npm install
```

### 2. Iniciar o servidor de desenvolvimento

```bash
npm start
```

Escaneie o QR Code com o **Expo Go** ou pressione a tecla correspondente no terminal para abrir no emulador.

### 3. Abrir em uma plataforma específica

```bash
npm run android   # Emulador/dispositivo Android
npm run ios       # Simulador iOS (macOS)
npm run web       # Navegador
```

---

## 🔥 Configuração do Firebase

A inicialização do Firebase fica em [`services/firebaseConfig.ts`](services/firebaseConfig.ts). Para usar o seu próprio projeto, substitua o objeto `firebaseConfig` pelas credenciais do **seu** app (Console do Firebase → Configurações do projeto → Seus apps) e habilite:

1. **Authentication** → provedor **E-mail/Senha**.
2. **Cloud Firestore** (modo de produção ou teste) com as coleções descritas em [Modelo de Dados](#-modelo-de-dados-firestore).

> ℹ️ As chaves de API web do Firebase não são segredos — elas identificam o projeto e dependem das Regras de Segurança do Firestore/Auth para proteção. Ainda assim, configure regras adequadas antes de publicar.

---

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o Expo Dev Server |
| `npm run android` | Abre o app em um dispositivo/emulador Android |
| `npm run ios` | Abre o app em um simulador iOS |
| `npm run web` | Abre o app no navegador |
| `npm run lint` | Executa o ESLint (via `expo lint`) |
| `npm run reset-project` | Reseta o projeto a um estado inicial em branco |

---

## 📦 Build com EAS

Os perfis de build estão definidos em [`eas.json`](eas.json):

- **development** — build de desenvolvimento com dev client (distribuição interna).
- **preview** — build interna para testes.
- **production** — build de produção com auto-incremento de versão.

Exemplos:

```bash
eas build --profile preview --platform android
eas build --profile production --platform all
```

---

## 🗄️ Modelo de Dados (Firestore)

| Coleção | Documento | Campos principais |
|---------|-----------|-------------------|
| `usuarios` | `{uid}` | `nome`, `idade`, `nivel`, `xp` |
| `likes` | `{uid}_{tipo}_{id}` | `userId`, `type`, `itemId`, `meta`, `createdAt` |
| `desafios` | auto-id | `remetenteId`, `remetenteNome`, `destinatarioId`, `destinatarioNome`, `status` (`pendente`/`aceito`/`recusado`), `dataEnvio` |

O XP é incrementado a cada rodada do quiz e o `nivel` é recalculado como `floor(xp / 100) + 1` (ver `publishQuizScore` em `services/contentHelpers.ts`).

---

## 💾 Armazenamento Local

- **`@quiz_score`** (`AsyncStorage`) — pontuação acumulada do quiz.
- **Cache de imagens** (`expo-file-system`) — imagens da NASA baixadas localmente (`img_{id}.jpg`).
- **`@cache_*`** (`AsyncStorage`) — respostas de API com expiração de 24h, gerenciadas pelo hook `useOfflineCache`.

---

## 🔄 Backlog / Roadmap

Funcionalidades planejadas para versões futuras:

- **Internacionalização dinâmica** para idiomas além de PT-BR.
- **Modo offline completo** com pacotes de imagens baixáveis e cache inteligente.
- **Notificações** de desafios e novidades.
- **Expansão das conquistas** e sistema de recompensas.
- **Foto Astronômica do Dia (APOD)** em destaque na tela inicial.

---

## 🧑‍🚀 Autor

**Lohan dos Reis** ([@LohandosReis](https://github.com/LohandosReis))

Aplicativo educacional de astronomia desenvolvido com Expo e React Native. 🌌
