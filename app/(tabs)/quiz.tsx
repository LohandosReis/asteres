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

const decodeHTML = (str: string): string => {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
};

const traduzir = async (texto: string): Promise<string> => {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|pt-BR`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText;
    return texto;
  } catch {
    return texto;
  }
};

const traduzirArray = async (arr: string[]): Promise<string[]> => {
  return Promise.all(arr.map((item) => traduzir(item)));
};

// Palavras-chave para filtrar perguntas de astronomia
const PALAVRAS_ASTRONOMIA = [
  "planet",
  "star",
  "moon",
  "galaxy",
  "nebula",
  "comet",
  "asteroid",
  "solar",
  "orbit",
  "telescope",
  "nasa",
  "space",
  "universe",
  "cosmos",
  "constellation",
  "supernova",
  "black hole",
  "milky way",
  "saturn",
  "jupiter",
  "mars",
  "venus",
  "mercury",
  "uranus",
  "neptune",
  "earth",
  "sun",
  "light year",
  "apollo",
  "hubble",
  "astronaut",
  "meteor",
  "eclipse",
  "gravity",
  "rocket",
  "shuttle",
  "astronomy",
  "cosmic",
];

const isAstronomia = (pergunta: string): boolean => {
  const lower = pergunta.toLowerCase();
  return PALAVRAS_ASTRONOMIA.some((kw) => lower.includes(kw));
};

export default function QuizTabScreen() {
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState("Buscando perguntas...");
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
    } catch (error) {
      console.error("Erro ao carregar pontuação", error);
    }
    gerarPerguntas();
  };

  const gerarPerguntas = async () => {
    setLoading(true);
    setMostrarResultado(false);
    setLoadingMsg("Buscando perguntas de astronomia...");

    try {
      // Busca 50 perguntas de Science & Nature para ter margem de filtrar
      const url =
        "https://opentdb.com/api.php?amount=50&category=17&type=multiple";
      const response = await fetch(url);
      const data = await response.json();

      if (data.response_code !== 0 || !data.results?.length) {
        throw new Error("Sem perguntas disponíveis.");
      }

      // Filtra só as de astronomia
      const filtradas = data.results.filter((item: any) =>
        isAstronomia(decodeHTML(item.question)),
      );

      // Se tiver pelo menos 5 da API, usa elas + completa com banco local
      let perguntasFinais: any[] = [];

      if (filtradas.length >= 5) {
        setLoadingMsg("Traduzindo para o português...");

        const traduzidas = await Promise.all(
          filtradas.slice(0, 7).map(async (item: any) => {
            const perguntaTraduzida = await traduzir(decodeHTML(item.question));
            const todasOpcoes = [
              ...item.incorrect_answers,
              item.correct_answer,
            ].map(decodeHTML);
            const opcoesTraduzidas = await traduzirArray(todasOpcoes);
            const indiceCorreta = todasOpcoes.indexOf(item.correct_answer);
            return {
              pergunta: perguntaTraduzida,
              opcoes: opcoesTraduzidas,
              respostaCerta: indiceCorreta,
              explicacao: `A resposta correta é: ${opcoesTraduzidas[indiceCorreta]}`,
            };
          }),
        );

        // Completa com banco local para chegar em 10
        const locais = [...bancoDeDadosLocalReserva]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10 - traduzidas.length);

        perguntasFinais = [...traduzidas, ...locais].sort(
          () => Math.random() - 0.5,
        );
      } else {
        // API não retornou suficiente — usa só banco local
        throw new Error("Poucas perguntas de astronomia na API.");
      }

      setCurrentBatch(perguntasFinais);
      setPerguntaAtual(0);
      setPontosNaRodada(0);
      setOpcaoSelecionada(null);
      setFeedbackExibido(false);
    } catch (error: any) {
      console.log("ERRO:", error.message);

      // Fallback: banco local embaralhado
      const bancoEmbaralhado = [...bancoDeDadosLocalReserva]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      setCurrentBatch(bancoEmbaralhado);
      setPerguntaAtual(0);
      setPontosNaRodada(0);
      setOpcaoSelecionada(null);
      setFeedbackExibido(false);
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
          gerarPerguntas();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#4DB6AC" />
          <Text
            style={{ color: "#4DB6AC", marginTop: 15, textAlign: "center" }}
          >
            {loadingMsg}
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
            <TouchableOpacity style={styles.button} onPress={gerarPerguntas}>
              <Text style={styles.buttonText}>Novas Perguntas</Text>
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

// Banco local grande e variado — só astronomia
const bancoDeDadosLocalReserva = [
  {
    pergunta: "Qual é o maior planeta do Sistema Solar?",
    opcoes: ["Saturno", "Júpiter", "Urano", "Netuno"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Júpiter",
  },
  {
    pergunta: "Qual planeta é conhecido como o Planeta Vermelho?",
    opcoes: ["Vênus", "Mercúrio", "Marte", "Júpiter"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Marte",
  },
  {
    pergunta: "Quantas luas tem Saturno?",
    opcoes: ["12", "27", "62", "146"],
    respostaCerta: 3,
    explicacao: "A resposta correta é: 146 luas confirmadas",
  },
  {
    pergunta: "Qual é a estrela mais próxima do Sistema Solar?",
    opcoes: ["Sirius", "Próxima Centauri", "Vega", "Betelgeuse"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Próxima Centauri",
  },
  {
    pergunta: "Em que ano foi lançado o Telescópio Espacial Hubble?",
    opcoes: ["1985", "1990", "1995", "2000"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: 1990",
  },
  {
    pergunta:
      "Qual lua de Júpiter é o corpo mais vulcanicamente ativo do Sistema Solar?",
    opcoes: ["Europa", "Ganimedes", "Io", "Calisto"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Io",
  },
  {
    pergunta: "O que é uma supernova?",
    opcoes: [
      "Uma nova estrela",
      "A explosão final de uma estrela massiva",
      "Um buraco negro",
      "Uma nebulosa em expansão",
    ],
    respostaCerta: 1,
    explicacao: "A resposta correta é: A explosão final de uma estrela massiva",
  },
  {
    pergunta: "Qual constelação contém as famosas 'Três Marias'?",
    opcoes: ["Escorpião", "Ursa Maior", "Órion", "Cruzeiro do Sul"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Órion",
  },
  {
    pergunta: "Qual é o nome da galáxia em que vivemos?",
    opcoes: ["Andrômeda", "Sombrero", "Cartwheel", "Via Láctea"],
    respostaCerta: 3,
    explicacao: "A resposta correta é: Via Láctea",
  },
  {
    pergunta: "Qual cometa é famoso por passar perto da Terra a cada 75 anos?",
    opcoes: ["Halley", "Hale-Bopp", "Shoemaker-Levy", "Encke"],
    respostaCerta: 0,
    explicacao: "A resposta correta é: Halley",
  },
  {
    pergunta: "Qual planeta tem os anéis mais visíveis do Sistema Solar?",
    opcoes: ["Júpiter", "Urano", "Saturno", "Netuno"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Saturno",
  },
  {
    pergunta: "O que é um ano-luz?",
    opcoes: [
      "Um ano no espaço",
      "A distância percorrida pela luz em um ano",
      "A idade de uma estrela",
      "A velocidade da luz",
    ],
    respostaCerta: 1,
    explicacao:
      "A resposta correta é: A distância percorrida pela luz em um ano",
  },
  {
    pergunta: "Qual missão levou o primeiro homem à Lua?",
    opcoes: ["Apollo 10", "Apollo 11", "Apollo 13", "Gemini 7"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Apollo 11",
  },
  {
    pergunta: "Qual é o nome do buraco negro no centro da Via Láctea?",
    opcoes: ["Cygnus X-1", "M87*", "Sagitário A*", "NGC 1277"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Sagitário A*",
  },
  {
    pergunta: "Qual planeta orbita o Sol de lado, com inclinação de 98 graus?",
    opcoes: ["Netuno", "Saturno", "Urano", "Júpiter"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Urano",
  },
  {
    pergunta:
      "Qual é a nebulosa mais famosa e visível a olho nu na constelação de Órion?",
    opcoes: [
      "Nebulosa do Caranguejo",
      "Nebulosa de Órion (M42)",
      "Nebulosa da Águia",
      "Nebulosa da Hélice",
    ],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Nebulosa de Órion (M42)",
  },
  {
    pergunta: "Qual foi o primeiro satélite artificial enviado ao espaço?",
    opcoes: ["Explorer 1", "Vostok 1", "Sputnik 1", "Apollo 1"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Sputnik 1, em 1957",
  },
  {
    pergunta: "Quantos planetas existem no Sistema Solar?",
    opcoes: ["7", "8", "9", "10"],
    respostaCerta: 1,
    explicacao:
      "A resposta correta é: 8 planetas (Plutão foi reclassificado como planeta anão)",
  },
  {
    pergunta: "Qual é o planeta mais quente do Sistema Solar?",
    opcoes: ["Mercúrio", "Marte", "Júpiter", "Vênus"],
    respostaCerta: 3,
    explicacao: "A resposta correta é: Vênus, por seu efeito estufa extremo",
  },
  {
    pergunta: "O Telescópio James Webb foi lançado em qual ano?",
    opcoes: ["2018", "2019", "2021", "2023"],
    respostaCerta: 2,
    explicacao:
      "A resposta correta é: 2021, com operações científicas iniciadas em 2022",
  },
  {
    pergunta: "Qual lua de Saturno possui rios e lagos de metano líquido?",
    opcoes: ["Encélado", "Mimas", "Titã", "Reia"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Titã",
  },
  {
    pergunta: "Qual é a constelação mais reconhecível do hemisfério sul?",
    opcoes: ["Órion", "Ursa Maior", "Cruzeiro do Sul", "Escorpião"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Cruzeiro do Sul",
  },
  {
    pergunta: "A que velocidade a luz viaja no vácuo?",
    opcoes: ["150.000 km/s", "300.000 km/s", "450.000 km/s", "600.000 km/s"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: 300.000 km/s",
  },
  {
    pergunta:
      "Qual é o nome da sonda que saiu do Sistema Solar e agora está no espaço interestelar?",
    opcoes: ["Pioneer 10", "Voyager 1", "New Horizons", "Cassini"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Voyager 1, lançada em 1977",
  },
  {
    pergunta: "Qual planeta tem a maior tempestade conhecida do Sistema Solar?",
    opcoes: ["Saturno", "Netuno", "Júpiter", "Urano"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Júpiter, com a Grande Mancha Vermelha",
  },
  {
    pergunta: "Qual é o tipo de estrela que o nosso Sol é?",
    opcoes: [
      "Gigante Vermelha",
      "Anã Branca",
      "Anã Amarela",
      "Supergigante Azul",
    ],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Anã Amarela (tipo G)",
  },
  {
    pergunta:
      "Qual lua de Júpiter tem um oceano subterrâneo que pode abrigar vida?",
    opcoes: ["Io", "Ganimedes", "Calisto", "Europa"],
    respostaCerta: 3,
    explicacao: "A resposta correta é: Europa",
  },
  {
    pergunta: "Qual é a galáxia mais próxima da Via Láctea?",
    opcoes: ["Sombrero", "Andrômeda", "Triângulo", "Cartwheel"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Andrômeda",
  },
  {
    pergunta: "Qual planeta tem os ventos mais rápidos do Sistema Solar?",
    opcoes: ["Júpiter", "Saturno", "Urano", "Netuno"],
    respostaCerta: 3,
    explicacao: "A resposta correta é: Netuno, com ventos de até 2.100 km/h",
  },
  {
    pergunta: "O que é uma nebulosa planetária?",
    opcoes: [
      "Uma nebulosa ao redor de um planeta",
      "A camada de gás ejetada por uma estrela moribunda",
      "Uma nuvem de poeira interestelar",
      "O berçário de novos planetas",
    ],
    respostaCerta: 1,
    explicacao:
      "A resposta correta é: A camada de gás ejetada por uma estrela moribunda",
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
    fontSize: 22,
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
  optionText: { color: "#FFF", fontSize: 16 },
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
