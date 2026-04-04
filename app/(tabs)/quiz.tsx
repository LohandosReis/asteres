import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GEMINI_API_KEY = "AIzaSyD2mLEs_iYpQOpQg8HdIm1o8BWiZe7HzkU";

export default function QuizTabScreen() {
  const [loading, setLoading] = useState(true);
  const [globalScore, setGlobalScore] = useState(0);

  const [currentBatch, setCurrentBatch] = useState<any[]>([]);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [pontosNaRodada, setPontosNaRodada] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null);
  const [feedbackExibido, setFeedbackExibido] = useState(false);

  useEffect(() => {
    carregarProgresso();
  }, []);

  const carregarProgresso = async () => {
    try {
      const savedScore = await AsyncStorage.getItem("@quiz_score");
      setGlobalScore(savedScore ? parseInt(savedScore) : 0);
      gerarPerguntasComIA();
    } catch (error) {
      console.error("Erro ao carregar pontuação", error);
    }
  };

  const gerarPerguntasComIA = async () => {
    setLoading(true);
    setMostrarResultado(false);

    // =========================================================
    // ARMA 1: SORTEIO DE SUBTEMAS PARA NÃO REPETIR
    // =========================================================
    const listaDeTemas = [
      "Buracos Negros e Quasares",
      "Missões Espaciais (Apollo, Voyager)",
      "Telescópios (Hubble, James Webb)",
      "Galáxias e Nebulosas",
      "Exoplanetas",
      "Luas de Júpiter e Saturno",
      "Constelações e Estrelas",
      "História da Astronomia",
      "Física Quântica e Espaço",
      "Morte das Estrelas (Supernovas)",
      "Asteroides, Meteoros e Cometas",
      "A Teoria do Big Bang",
    ];
    // Pega 3 temas aleatórios dessa lista para esta rodada
    const temasSorteados = listaDeTemas
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .join(", ");
    const seedAleatoria = Math.floor(Math.random() * 999999);

    try {
      const prompt = `
        Gere 10 perguntas de múltipla escolha INÉDITAS, difíceis e curiosas em português do Brasil.
        
        REGRA 1: Foco EXCLUSIVO nestes temas: ${temasSorteados}.
        REGRA 2: NÃO faça perguntas clichês (ex: qual o maior planeta, quem pisou na lua primeiro). Seja criativo.
        REGRA 3: Retorne APENAS um array JSON puro. Sem formatação markdown (\`\`\`json).
        Semente: ${seedAleatoria}

        Estrutura OBRIGATÓRIA:
        [
          {
            "pergunta": "Texto da pergunta aqui",
            "opcoes": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
            "respostaCerta": 0,
            "explicacao": "Uma curiosidade detalhada."
          }
        ]
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache", // ARMA 2: Ignora a memória do celular
            Pragma: "no-cache",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            // ARMA 3: TEMPERATURE 1.2 OBRIGA A IA A SER MUITO MAIS ALEATÓRIA E CRIATIVA
            generationConfig: {
              temperature: 1.2,
            },
          }),
        },
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(`Erro da API: ${data.error.message}`);
      }

      const textoResposta = data.candidates[0].content.parts[0].text;
      let jsonLimpo = textoResposta
        .replace(/```json/gi, "")
        .replace(/```/gi, "")
        .trim();

      const perguntasGeradas = JSON.parse(jsonLimpo);

      setCurrentBatch(perguntasGeradas);
      setPerguntaAtual(0);
      setPontosNaRodada(0);
      setOpcaoSelecionada(null);
      setFeedbackExibido(false);
    } catch (error: any) {
      console.log("FALHA NA GERAÇÃO:", error.message);
      Alert.alert(
        "Sem conexão com IA",
        "Não foi possível criar perguntas novas agora. Carregando perguntas locais.",
      );

      const bancoEmbaralhado = [...bancoDeDadosLocalReserva]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      setCurrentBatch(bancoEmbaralhado);
      setPerguntaAtual(0);
      setPontosNaRodada(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAcaoBotao = async () => {
    if (opcaoSelecionada === null) return;

    if (!feedbackExibido) {
      const acertou =
        opcaoSelecionada === currentBatch[perguntaAtual].respostaCerta;
      let novaPontuacao = acertou
        ? globalScore + 1
        : Math.max(0, globalScore - 1);

      if (acertou) setPontosNaRodada(pontosNaRodada + 1);

      setGlobalScore(novaPontuacao);
      await AsyncStorage.setItem("@quiz_score", novaPontuacao.toString());
      setFeedbackExibido(true);
      return;
    }

    if (perguntaAtual + 1 < currentBatch.length) {
      setPerguntaAtual(perguntaAtual + 1);
      setOpcaoSelecionada(null);
      setFeedbackExibido(false);
    } else {
      setMostrarResultado(true);
    }
  };

  const resetarProgressoTotal = () => {
    Alert.alert("Zerar Pontuação", "Deseja apagar todos os seus pontos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim",
        onPress: async () => {
          await AsyncStorage.removeItem("@quiz_score");
          setGlobalScore(0);
          gerarPerguntasComIA();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#4DB6AC" />
          <Text style={{ color: "#4DB6AC", marginTop: 15 }}>
            Explorando o universo em busca de perguntas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const pergunta = currentBatch[perguntaAtual];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.scoreBadge}
          onPress={resetarProgressoTotal}
        >
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.globalScoreText}> {globalScore} PTS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {mostrarResultado ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Rodada Concluída!</Text>
            <Text style={styles.scoreText}>
              {pontosNaRodada} / {currentBatch.length}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={gerarPerguntasComIA}
            >
              <Text style={styles.buttonText}>Gerar Novas Perguntas (IA)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.quizContainer}>
            <Text style={styles.questionCounter}>
              Pergunta {perguntaAtual + 1} de {currentBatch.length}
            </Text>
            <Text style={styles.questionText}>{pergunta?.pergunta}</Text>

            <View style={styles.optionsContainer}>
              {pergunta?.opcoes.map((opcao: string, index: number) => {
                const isSelected = opcaoSelecionada === index;
                const isCorrect = index === pergunta.respostaCerta;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      !feedbackExibido &&
                        isSelected &&
                        styles.optionButtonSelected,
                      feedbackExibido && isCorrect && styles.optionCorrect,
                      feedbackExibido &&
                        isSelected &&
                        !isCorrect &&
                        styles.optionIncorrect,
                      feedbackExibido &&
                        !isSelected &&
                        !isCorrect &&
                        styles.optionDisabled,
                    ]}
                    onPress={() =>
                      !feedbackExibido && setOpcaoSelecionada(index)
                    }
                    activeOpacity={feedbackExibido ? 1 : 0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        feedbackExibido && isCorrect && styles.textCorrect,
                      ]}
                    >
                      {["A.", "B.", "C.", "D."][index]} {opcao}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {feedbackExibido && opcaoSelecionada !== pergunta.respostaCerta && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>
                  <Ionicons name="alert-circle" size={16} /> Explicação
                </Text>
                <Text style={styles.explanationText}>
                  {pergunta.explicacao}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                opcaoSelecionada === null && styles.buttonDisabled,
              ]}
              onPress={handleAcaoBotao}
              disabled={opcaoSelecionada === null}
            >
              <Text style={styles.buttonText}>
                {feedbackExibido ? "Próxima Pergunta" : "Confirmar Resposta"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const bancoDeDadosLocalReserva = [
  {
    pergunta: "Qual é a galáxia mais próxima da Via Láctea?",
    opcoes: ["Sombrero", "Andrômeda", "Triângulo", "Cartwheel"],
    respostaCerta: 1,
    explicacao: "Andrômeda é a galáxia espiral mais próxima de nós.",
  },
  {
    pergunta:
      "Qual lua de Júpiter tem potencial para abrigar vida em oceanos subterrâneos?",
    opcoes: ["Io", "Calisto", "Titã", "Europa"],
    respostaCerta: 3,
    explicacao:
      "Europa possui uma crosta de gelo e provavelmente um oceano líquido abaixo.",
  },
  {
    pergunta: "Como se chama a explosão final de uma estrela muito massiva?",
    opcoes: ["Supernova", "Anã Branca", "Buraco Negro", "Nebulosa"],
    respostaCerta: 0,
    explicacao:
      "A supernova é o estágio explosivo final na vida de estrelas supermassivas.",
  },
  {
    pergunta: "Qual foi o primeiro satélite artificial a orbitar a Terra?",
    opcoes: ["Apollo 11", "Explorer 1", "Sputnik 1", "Voyager 1"],
    respostaCerta: 2,
    explicacao:
      "Lançado em 1957 pela União Soviética, o Sputnik 1 iniciou a era espacial.",
  },
  {
    pergunta: "Qual planeta tem os ventos mais fortes do Sistema Solar?",
    opcoes: ["Júpiter", "Marte", "Netuno", "Urano"],
    respostaCerta: 2,
    explicacao:
      "Netuno tem ventos supersônicos que chegam a mais de 2.000 km/h.",
  },
  {
    pergunta: "Em que ano o homem pisou na lua?",
    opcoes: ["1965", "1969", "1972", "1958"],
    respostaCerta: 1,
    explicacao: "Neil Armstrong pisou na lua em 20 de julho de 1969.",
  },
  {
    pergunta:
      "Qual dessas constelações é facilmente identificada por 'Três Marias'?",
    opcoes: ["Órion", "Cruzeiro do Sul", "Escorpião", "Ursa Maior"],
    respostaCerta: 0,
    explicacao:
      "As Três Marias formam o cinto do caçador na constelação de Órion.",
  },
  {
    pergunta: "O que é um exoplaneta?",
    opcoes: [
      "Planeta sem lua",
      "Planeta fora do sistema solar",
      "Planeta gasoso",
      "Planeta anão",
    ],
    respostaCerta: 1,
    explicacao:
      "Exoplanetas são planetas que orbitam outras estrelas que não o nosso Sol.",
  },
];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#05050A",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: { paddingHorizontal: 20, paddingTop: 15, alignItems: "flex-end" },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.4)",
  },
  globalScoreText: { color: "#FFD700", fontWeight: "bold", fontSize: 16 },
  container: { flex: 1, padding: 20, justifyContent: "center" },
  quizContainer: { flex: 1, justifyContent: "center" },
  questionCounter: {
    color: "#4DB6AC",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  questionText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  optionsContainer: { marginBottom: 20 },
  optionButton: {
    backgroundColor: "#1A1A2E",
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: { borderColor: "#4DB6AC", backgroundColor: "#111F2D" },
  optionText: { color: "#FFF", fontSize: 18 },
  optionCorrect: { backgroundColor: "#2E7D32", borderColor: "#4CAF50" },
  textCorrect: { color: "#FFF", fontWeight: "bold" },
  optionIncorrect: { backgroundColor: "#C62828", borderColor: "#EF5350" },
  optionDisabled: { opacity: 0.5 },
  explanationBox: {
    backgroundColor: "rgba(77, 182, 172, 0.1)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 172, 0.3)",
  },
  explanationTitle: {
    color: "#4DB6AC",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  explanationText: { color: "#E0E0E0", fontSize: 15, lineHeight: 22 },
  button: {
    backgroundColor: "#4DB6AC",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    width: "100%",
  },
  buttonDisabled: { backgroundColor: "#2A4D4A" },
  buttonText: { color: "#05050A", fontSize: 18, fontWeight: "bold" },
  resultContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  resultTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  scoreText: {
    color: "#4DB6AC",
    fontSize: 60,
    fontWeight: "bold",
    marginBottom: 40,
  },
});
