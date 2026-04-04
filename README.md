# 🚀 Space Quiz AI - Desafio Intergaláctico com IA

O Space Quiz AI é um aplicativo mobile moderno desenvolvido com React Native e Expo Router. O grande diferencial deste projeto é a integração direta com a Inteligência Artificial Google Gemini, que atua como um mestre de cerimônias dinâmico, gerando perguntas inéditas e desafiadoras sobre o universo a cada nova rodada.

---

## 🛠️ Tecnologias e Ferramentas

- Framework: Expo (React Native) com suporte a TypeScript.
- Navegação: Expo Router v3 (File-based routing).
- IA Generativa: Google Gemini 1.5 Flash API.
- Armazenamento Local: AsyncStorage (para persistência de recordes e pontuação).
- Ícones: Ionicons (@expo/vector-icons).
- Estilização: StyleSheet nativo com foco em Dark Mode.

---

## ✨ Principais Funcionalidades

- Geração Infinita de Perguntas: Graças à IA, o quiz não possui um fim fixo. Cada rodada de 10 perguntas é gerada sob demanda.
- Sistema de Pontuação Inteligente:
  - Acertos somam +1 ponto.
  - Erros subtraem -1 ponto (o placar nunca fica negativo).
  - A pontuação global é salva no celular e não se perde ao fechar o app.
- Feedback Educativo: Além de saber se acertou ou errou, o usuário recebe uma explicação científica detalhada gerada pela IA após cada resposta.
- Mecanismo de Segurança (Fallback): Se a conexão com a internet falhar ou a API do Google atingir o limite, o app carrega automaticamente um banco de dados local de reserva para garantir que o jogo continue.

---

## 🧠 Engenharia de Prompt e Anti-Repetição

Para evitar que a IA repita sempre as mesmas perguntas básicas (como "qual o maior planeta"), o código implementa três camadas de controle:

1. Sorteio de Subtemas: O app sorteia aleatoriamente 3 temas de uma lista (ex: Buracos Negros, Missões Apollo, Exoplanetas) e ordena que a IA foque apenas neles.
2. Temperatura Variável: Configuramos a temperature: 1.2 na API, o que força o modelo a ser mais criativo e menos previsível.
3. Buster de Cache: Utilizamos seeds aleatórias e headers de no-cache para que o sistema não "reaproveite" respostas de rodadas anteriores.

---

## 📂 Estrutura do Projeto

/app
├── (tabs)
│ ├── \_layout.tsx # Configuração da barra de navegação inferior
│ ├── index.tsx # Dashboard / Home do app
│ └── quiz.tsx # TELA PRINCIPAL (Onde o jogo acontece)
├── \_layout.tsx # Configuração de rotas globais
└── +not-found.tsx # Tela de erro para rotas inexistentes

---

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

## 🎨 Design System

O app utiliza uma paleta de cores inspirada no espaço profundo:

- Fundo: #05050A (Preto Estelar)
- Primária: #4DB6AC (Verde Água/Nebulosa)
- Destaque: #FFD700 (Ouro/Estrela)
- Erro/Alerta: #EF5350 (Vermelho Marte)

---

Desenvolvido com foco em interatividade e aprendizado sobre o cosmos. 🌌
