# 🚀 Asteres - Explorador Astronômico

Asteres é um aplicativo educacional de astronomia desenvolvido com React Native e Expo Router. O app permite explorar planetas, luas, nebulosas, galáxias e constelações com imagens oficiais da NASA e um quiz interativo de astronomia.

---

## 🧩 Visão Geral

- Aplicativo mobile criado com **Expo** e **TypeScript**
- Navegação baseada em arquivos usando **Expo Router**
- Conteúdo dividido em categorias astronômicas
- Imagens oficiais carregadas da **NASA Images API**
- Quiz de astronomia com perguntas traduzidas e pontuação local

---

## 📁 Estrutura do Projeto

- `app/` - todas as telas e rotas do aplicativo
  - `_layout.tsx` - layout de navegação principal
  - `modal.tsx` - modal global
  - `(tabs)/` - navegação por abas
    - `index.tsx` - página inicial
    - `explore.tsx` - catálogo de objetos astronômicos
    - `quiz.tsx` - quiz com perguntas de astronomia
    - `about.tsx` / `news.tsx` - telas extras
  - `planetas/[id].tsx`, `luas/[id].tsx`, `nebulosas/[id].tsx`, `galaxias/[id].tsx`, `constelacoes/[id].tsx` - páginas de detalhe com imagens NASA
- `components/` - componentes de UI reutilizáveis
- `constants/theme.ts` - variáveis de tema e cores
- `hooks/` - hooks personalizados de tema e esquema de cores
- `scripts/reset-project.js` - script de reset do projeto

---

## 🛠️ Tecnologias Usadas

- Expo
- React Native
- TypeScript
- Expo Router
- AsyncStorage
- @expo/vector-icons
- NASA Images API
- Open Trivia DB
- MyMemory Translation API

---

## 🚀 Como Executar

### Instalação

```bash
git clone <url-do-repositorio>
cd asteres
npm install
```

### Execução em Desenvolvimento

```bash
npm start
```

### Abrir em Plataformas

```bash
npm run android
npm run ios
npm run web
```

### Lint

```bash
npm run lint
```

### Reset do Projeto

```bash
npm run reset-project
```

---

## ✨ Funcionalidades Principais

- Exploração de objetos astronômicos por categoria
- Busca por nome e filtro por categoria em `app/(tabs)/explore.tsx`
- Detalhes com imagens reais da NASA
- Quiz de astronomia com pontuação persistente
- Fallback automático quando a API remota não entrega conteúdo suficiente

---

## 🔧 Observações Relevantes

- O quiz usa a API **Open Trivia DB** para obter perguntas e filtra apenas perguntas de astronomia.
- As perguntas recebidas são traduzidas para português com a API **MyMemory**.
- A pontuação do quiz é armazenada localmente em `AsyncStorage` na chave `@quiz_score`.
- As telas de detalhes usam a **NASA Images API** para exibir imagens oficiais sempre que disponíveis.
- A navegação central é gerenciada por `expo-router` em `app/_layout.tsx`.

---

## 📄 Scripts disponíveis

- `npm start` — inicia o Expo Dev Server
- `npm run android` — abre no dispositivo Android
- `npm run ios` — abre no dispositivo iOS
- `npm run web` — abre no navegador
- `npm run lint` — executa o lint do Expo
- `npm run reset-project` — reseta arquivos de layout/tela do projeto

---

## 📌 Status Atual

- Não há alterações pendentes no workspace atual.

---

## 🧑‍🚀 Autor

**Lohan dos Reis**

Aplicativo educacional de astronomia desenvolvido com Expo e React Native.
