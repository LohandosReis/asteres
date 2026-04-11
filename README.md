# 🚀 Asteres - Explorador Astronômico

Asteres é um aplicativo mobile moderno desenvolvido com React Native e Expo Router, dedicado à exploração do universo. O app oferece uma experiência imersiva para aprender sobre planetas, luas, nebulosas, galáxias e constelações, com imagens oficiais da NASA e um quiz interativo.

---

## 🛠️ Tecnologias e Ferramentas

- **Framework**: Expo (React Native) com suporte a TypeScript
- **Navegação**: Expo Router v6 (File-based routing)
- **Ícones**: Ionicons e MaterialCommunityIcons (@expo/vector-icons)
- **Armazenamento Local**: AsyncStorage (para persistência de dados)
- **APIs Externas**: NASA Images API para imagens oficiais
- **Estilização**: StyleSheet nativo com foco em Dark Mode
- **Build**: EAS Build para distribuição

---

## ✨ Principais Funcionalidades

- **Exploração Interativa**: Navegue por categorias de objetos astronômicos (Planetas, Luas, Nebulosas, Galáxias, Constelações)
- **Detalhes Ricos**: Cada objeto possui descrição detalhada, curiosidades e imagens oficiais da NASA
- **Busca e Filtros**: Pesquisa por nome e filtros por categoria
- **Quiz Astronômico**: Teste seus conhecimentos com perguntas sobre o universo
- **Interface Dark Mode**: Design espacial com cores escuras e acentos em ciano (#4DB6AC)
- **Offline-First**: Dados locais garantem funcionamento mesmo sem internet

---

## 📂 Estrutura do Projeto

### Arquivos de Configuração

- `app.json` - Configuração principal do Expo (nome, ícones, splash screen, plugins)
- `eas.json` - Configuração do EAS Build para distribuição
- `package.json` - Dependências e scripts do projeto
- `tsconfig.json` - Configuração do TypeScript
- `eslint.config.js` - Regras de linting
- `expo-env.d.ts` - Tipos para variáveis de ambiente do Expo

### Diretório `app/` (Navegação Expo Router)

- `_layout.tsx` - Layout raiz da aplicação (Stack navigation)
- `modal.tsx` - Componente de modal global
- `(tabs)/` - Navegação por abas
  - `_layout.tsx` - Configuração das abas (Tab navigation com ícones e cores)
  - `index.tsx` - Tela inicial/Home
  - `explore.tsx` - Tela de exploração com lista de objetos astronômicos
  - `about.tsx` - Tela "Sobre" (não anexada)
  - `news.tsx` - Tela de notícias (não anexada)
  - `quiz.tsx` - Tela do quiz astronômico

### Diretórios de Detalhes (Dynamic Routes)

- `planetas/[id].tsx` - Detalhes de planetas (não anexado)
- `luas/[id].tsx` - Detalhes de luas (não anexado)
- `nebulosas/[id].tsx` - Detalhes de nebulosas (com dados e API NASA)
- `galaxias/[id].tsx` - Detalhes de galáxias (com dados e API NASA)
- `constelacoes/[id].tsx` - Detalhes de constelações (não anexado)

### Diretório `assets/`

- `images/` - Imagens do app (ícones, logos, etc.)

### Diretório `components/`

- `external-link.tsx` - Componente para links externos
- `haptic-tab.tsx` - Componente de aba com feedback háptico
- `hello-wave.tsx` - Componente de saudação animada
- `parallax-scroll-view.tsx` - Scroll view com efeito parallax
- `themed-text.tsx` - Texto com tema
- `themed-view.tsx` - View com tema
- `ui/` - Componentes de UI
  - `collapsible.tsx` - Componente colapsível
  - `icon-symbol.ios.tsx` - Ícones para iOS
  - `icon-symbol.tsx` - Ícones genéricos

### Diretório `constants/`

- `theme.ts` - Constantes de tema (cores, fontes, etc.)

### Diretório `hooks/`

- `use-color-scheme.ts` - Hook para detectar esquema de cores
- `use-color-scheme.web.ts` - Versão web do hook de cores
- `use-theme-color.ts` - Hook para cores do tema

### Diretório `scripts/`

- `reset-project.js` - Script para resetar o projeto

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- Expo CLI (`npm install -g @expo/cli`)
- Dispositivo físico ou emulador/simulador

### Instalação

```bash
# Clone o repositório (se aplicável)
git clone <url-do-repositorio>
cd asteres

# Instale as dependências
npm install
```

### Execução

```bash
# Inicie o servidor de desenvolvimento
npm start

# Ou diretamente com Expo
expo start

# Para plataformas específicas
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

### Build para Produção

```bash
# Build com EAS
eas build --platform android
eas build --platform ios
```

---

## 📱 Funcionalidades Detalhadas

### Tela de Exploração (`explore.tsx`)

- Lista todos os objetos astronômicos disponíveis
- Filtros por categoria (Todos, Planetas, Luas, Nebulosas, Galáxias, Constelações)
- Barra de pesquisa para encontrar objetos específicos
- Navegação para telas de detalhes via Expo Router

### Telas de Detalhes (`[id].tsx`)

- Layout consistente para todos os tipos de objetos
- Imagens oficiais da NASA via API
- Descrições científicas e curiosidades
- Navegação de volta com botão estilizado
- Fallback para imagens genéricas em caso de erro

### Quiz (`quiz.tsx`)

- Sistema de perguntas sobre astronomia
- Pontuação e feedback
- Interface interativa

---

## 🎨 Design System

- **Tema Dark**: Fundo `#05050A` (quase preto), texto branco
- **Cor de Destaque**: `#4DB6AC` (ciano/verde água)
- **Fonte**: Padrão do sistema com pesos variados
- **Espaçamento**: Consistente com padding de 20px nas telas principais
- **Ícones**: Ionicons e MaterialCommunityIcons com tamanhos de 28-30px

---

## 🔧 Desenvolvimento

### Convenções de Código

- TypeScript obrigatório
- ESLint para qualidade de código
- Expo Router para navegação file-based
- Componentes funcionais com hooks

### APIs Utilizadas

- **NASA Images API**: Para buscar imagens oficiais de objetos astronômicos
  - Endpoint: `https://images-api.nasa.gov/`
  - Busca por ID fixo ou termo de pesquisa
  - Fallback automático para imagens genéricas

### Gerenciamento de Estado

- Props drilling para navegação
- AsyncStorage para persistência local
- useState/useEffect para estado local

---

## 📄 Licença

Este projeto é propriedade de Lohan dos Reis. Todos os direitos reservados.

---

## 👨‍💻 Autor

**Lohan dos Reis**

- Desenvolvimento mobile com React Native/Expo
- Foco em aplicações educacionais e científicas

## 🚀 Como Instalar e Configurar

1. Clonar e Instalar Dependências:
   npm install @react-native-async-storage/async-storage @expo/vector-icons

2. Configurar a Chave da API:
   No arquivo app/(tabs)/quiz.tsx, insira sua chave do Google AI Studio na constante GEMINI_API_KEY.

3. Rodar o Projeto:
   npx expo start

---

## ⚠️ Resolução de Problemas (Troubleshooting)

"As perguntas estão repetindo (Loop de 8 perguntas)":
Isso acontece quando a API do Google falha (por falta de internet ou erro de chave). O app entra em modo de segurança e carrega as 8 perguntas padrão que estão no código. Verifique sua conexão e se a chave de API ainda é válida no painel do Google.

"O JSON deu erro de leitura":
A IA às vezes tenta enviar textos antes do código. Implementamos um filtro de limpeza que remove marcações de Markdown (```json) para garantir que o app sempre leia o array corretamente.

---

## � Design System

O app utiliza uma paleta de cores inspirada no espaço profundo:

- Fundo: #05050A (Preto Estelar)
- Primária: #4DB6AC (Verde Água/Nebulosa)
- Destaque: #FFD700 (Ouro/Estrela)
- Erro/Alerta: #EF5350 (Vermelho Marte)

---

Desenvolvido com foco em interatividade e aprendizado sobre o cosmos. 🌌
