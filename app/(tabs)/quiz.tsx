import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ------------------------------------------------------------------
// BANCO DE DADOS: Perguntas, opções, respostas e explicações
// ------------------------------------------------------------------
const quizDatabase = [
  {
    id: "q1",
    pergunta: "Qual é o maior planeta do nosso sistema solar?",
    opcoes: ["Júpiter", "Marte", "Vênus", "Netuno"],
    respostaCerta: 0,
    explicacao:
      "Júpiter é um gigante gasoso, com uma massa 2,5 vezes maior do que a de todos os outros planetas do Sistema Solar juntos.",
  },
  {
    id: "q2",
    pergunta:
      "Qual lua de Júpiter é coberta por uma crosta de gelo e pode ter um oceano por baixo?",
    opcoes: ["Titã", "A Lua", "Europa", "Io"],
    respostaCerta: 2,
    explicacao:
      "A crosta de gelo de Europa é muito lisa, e cientistas acreditam que o calor do núcleo mantém um oceano líquido abaixo dessa crosta.",
  },
  {
    id: "q3",
    pergunta: "Qual é a galáxia mais próxima da nossa Via Láctea?",
    opcoes: ["Sombrero", "Andrômeda", "Triângulo", "Cartwheel"],
    respostaCerta: 1,
    explicacao:
      "Andrômeda (ou M31) é a galáxia espiral mais próxima de nós, localizada a cerca de 2,5 milhões de anos-luz de distância.",
  },
  {
    id: "q4",
    pergunta: "Qual é a estrela mais próxima da Terra?",
    opcoes: ["Sirius", "Alpha Centauri", "O Sol", "Betelgeuse"],
    respostaCerta: 2,
    explicacao:
      "Pode parecer pegadinha, mas o Sol é uma estrela! É a estrela central do nosso sistema e a mais próxima do nosso planeta.",
  },
  {
    id: "q5",
    pergunta: "Qual planeta é conhecido como o Planeta Vermelho?",
    opcoes: ["Vênus", "Júpiter", "Urano", "Marte"],
    respostaCerta: 3,
    explicacao:
      "Marte é vermelho por causa da grande quantidade de óxido de ferro (ferrugem) presente no pó e nas rochas de sua superfície.",
  },
  {
    id: "q6",
    pergunta: "Quem foi o primeiro ser humano a viajar para o espaço?",
    opcoes: ["Neil Armstrong", "Yuri Gagarin", "Buzz Aldrin", "John Glenn"],
    respostaCerta: 1,
    explicacao:
      "O cosmonauta soviético Yuri Gagarin fez história ao orbitar a Terra em 12 de abril de 1961.",
  },
  {
    id: "q7",
    pergunta: "Qual planeta tem os anéis mais visíveis e proeminentes?",
    opcoes: ["Saturno", "Urano", "Netuno", "Júpiter"],
    respostaCerta: 0,
    explicacao:
      "Embora outros planetas gasosos tenham anéis, os de Saturno são gigantescos e formados por bilhões de pedaços de gelo e rocha.",
  },
  {
    id: "q8",
    pergunta: "Qual é a lua de Saturno conhecida por ter lagos de metano?",
    opcoes: ["Europa", "Ganimedes", "Titã", "Encélado"],
    respostaCerta: 2,
    explicacao:
      "Titã é o único lugar no sistema solar, além da Terra, com corpos líquidos (rios e lagos de metano) em sua superfície.",
  },
  {
    id: "q9",
    pergunta: "Em que ano o homem pisou na Lua pela primeira vez?",
    opcoes: ["1965", "1969", "1971", "1959"],
    respostaCerta: 1,
    explicacao:
      "Os astronautas da missão Apollo 11 pisaram na superfície lunar no dia 20 de julho de 1969.",
  },
  {
    id: "q10",
    pergunta: "Qual é o planeta mais quente do Sistema Solar?",
    opcoes: ["Mercúrio", "Marte", "Vênus", "Júpiter"],
    respostaCerta: 2,
    explicacao:
      "Embora Mercúrio seja mais próximo do Sol, Vênus possui uma atmosfera densa que cria um efeito estufa extremo (cerca de 470°C).",
  },
  {
    id: "q11",
    pergunta:
      "Como se chama a explosão que ocorre no fim da vida de uma estrela massiva?",
    opcoes: ["Quasar", "Pulsar", "Supernova", "Anã Branca"],
    respostaCerta: 2,
    explicacao:
      "Quando uma estrela muito massiva esgota seu combustível, ela entra em colapso e explode em um evento brilhante chamado Supernova.",
  },
  {
    id: "q12",
    pergunta: "Qual foi o primeiro satélite artificial lançado ao espaço?",
    opcoes: ["Sputnik 1", "Explorer 1", "Vanguard 1", "Telstar"],
    respostaCerta: 0,
    explicacao:
      "O Sputnik 1 foi lançado pela União Soviética em 1957, marcando o início da Era Espacial.",
  },
];

const PERGUNTAS_POR_RODADA = 10;

export default function QuizScreen() {
  const [loading, setLoading] = useState(true);
  const [globalScore, setGlobalScore] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [noMoreQuestions, setNoMoreQuestions] = useState(false);

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
      const savedIds = await AsyncStorage.getItem("@quiz_answered");
      const savedScore = await AsyncStorage.getItem("@quiz_score");

      const parsedIds = savedIds ? JSON.parse(savedIds) : [];
      const parsedScore = savedScore ? parseInt(savedScore) : 0;

      setAnsweredIds(parsedIds);
      setGlobalScore(parsedScore);

      iniciarNovaRodada(parsedIds);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };

  const iniciarNovaRodada = (idsParaIgnorar: string[]) => {
    const perguntasDisponiveis = quizDatabase.filter(
      (q) => !idsParaIgnorar.includes(q.id),
    );

    if (perguntasDisponiveis.length === 0) {
      setNoMoreQuestions(true);
      setLoading(false);
      return;
    }

    const proximaRodada = perguntasDisponiveis
      .sort(() => Math.random() - 0.5)
      .slice(0, PERGUNTAS_POR_RODADA);

    setCurrentBatch(proximaRodada);
    setPerguntaAtual(0);
    setPontosNaRodada(0);
    setMostrarResultado(false);
    setOpcaoSelecionada(null);
    setFeedbackExibido(false);
    setLoading(false);
  };

  const handleAcaoBotao = async () => {
    if (opcaoSelecionada === null) return;

    // FASE 1: Usuário acabou de confirmar a resposta
    if (!feedbackExibido) {
      const pergunta = currentBatch[perguntaAtual];
      const acertou = opcaoSelecionada === pergunta.respostaCerta;

      let novaPontuacaoGlobal = globalScore;

      if (acertou) {
        setPontosNaRodada(pontosNaRodada + 1);
        novaPontuacaoGlobal += 1;
      } else {
        novaPontuacaoGlobal = Math.max(0, globalScore - 1);
      }

      setGlobalScore(novaPontuacaoGlobal);
      await AsyncStorage.setItem("@quiz_score", novaPontuacaoGlobal.toString());

      setFeedbackExibido(true);
      return;
    }

    // FASE 2: Usuário já viu o feedback e vai para a próxima
    const proximaPergunta = perguntaAtual + 1;
    if (proximaPergunta < currentBatch.length) {
      setPerguntaAtual(proximaPergunta);
      setOpcaoSelecionada(null);
      setFeedbackExibido(false);
    } else {
      await finalizarRodada();
    }
  };

  const finalizarRodada = async () => {
    try {
      const novosIdsRespondidos = currentBatch.map((q) => q.id);
      const todosIds = [...answeredIds, ...novosIdsRespondidos];

      await AsyncStorage.setItem("@quiz_answered", JSON.stringify(todosIds));
      setAnsweredIds(todosIds);
      setMostrarResultado(true);
    } catch (error) {
      console.error("Erro ao salvar IDs", error);
    }
  };

  const resetarProgressoTotal = async () => {
    await AsyncStorage.removeItem("@quiz_answered");
    await AsyncStorage.removeItem("@quiz_score");
    setAnsweredIds([]);
    setGlobalScore(0);
    setNoMoreQuestions(false);
    iniciarNovaRodada([]);
  };

  // --- RENDERIZAÇÃO DAS TELAS ---

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#4DB6AC" />
        </View>
      </SafeAreaView>
    );
  }

  if (noMoreQuestions) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Você Zerou o Quiz!</Text>
          <Text style={styles.scoreText}>{globalScore} pts</Text>
          <Text style={styles.scoreSubtext}>
            Você respondeu todas as perguntas disponíveis.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={resetarProgressoTotal}
          >
            <Text style={styles.buttonText}>Começar Tudo do Zero</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pergunta = currentBatch[perguntaAtual];
  const errou = feedbackExibido && opcaoSelecionada !== pergunta.respostaCerta;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER: Pontuação Global */}
      <View style={styles.header}>
        <View style={styles.scoreBadge}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.globalScoreText}> {globalScore} PTS</Text>
        </View>
      </View>

      <View style={styles.container}>
        {mostrarResultado ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Rodada Concluída!</Text>
            <Text style={styles.scoreText}>
              {pontosNaRodada} / {currentBatch.length}
            </Text>
            <Text style={styles.scoreSubtext}>Acertos nesta rodada</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => iniciarNovaRodada(answeredIds)}
            >
              <Text style={styles.buttonText}>Próximas Perguntas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.quizContainer}>
            <Text style={styles.questionCounter}>
              Pergunta {perguntaAtual + 1} de {currentBatch.length}
            </Text>

            <Text style={styles.questionText}>{pergunta.pergunta}</Text>

            <View style={styles.optionsContainer}>
              {pergunta.opcoes.map((opcao: string, index: number) => {
                const letras = ["A.", "B.", "C.", "D."];
                const isSelected = opcaoSelecionada === index;
                const isCorrectAnswer = index === pergunta.respostaCerta;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      // Se não confirmou, aplica estilo de seleção padrão
                      !feedbackExibido &&
                        isSelected &&
                        styles.optionButtonSelected,
                      // Se confirmou e é a certa: Fica Verde
                      feedbackExibido &&
                        isCorrectAnswer &&
                        styles.optionCorrect,
                      // Se confirmou, clicou nesta, e está errada: Fica Vermelha
                      feedbackExibido &&
                        isSelected &&
                        !isCorrectAnswer &&
                        styles.optionIncorrect,
                      // Se confirmou e não é nem a certa nem a clicada: Apagada
                      feedbackExibido &&
                        !isSelected &&
                        !isCorrectAnswer &&
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
                        !feedbackExibido &&
                          isSelected &&
                          styles.optionTextSelected,
                        feedbackExibido &&
                          isCorrectAnswer &&
                          styles.textCorrect,
                        feedbackExibido &&
                          isSelected &&
                          !isCorrectAnswer &&
                          styles.textIncorrect,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLetter,
                          feedbackExibido && { color: "rgba(255,255,255,0.7)" },
                        ]}
                      >
                        {letras[index]}
                      </Text>
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* CAIXA DE EXPLICAÇÃO SE ERRAR */}
            {errou && (
              <View style={styles.explanationBox}>
                <View style={styles.explanationHeader}>
                  <Ionicons name="alert-circle" size={20} color="#F44336" />
                  <Text style={styles.explanationTitle}>
                    Você perdeu 1 ponto!
                  </Text>
                </View>
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
  optionTextSelected: { color: "#4DB6AC", fontWeight: "bold" },
  optionLetter: { color: "#888", fontWeight: "bold", marginRight: 5 },

  optionCorrect: { backgroundColor: "#2E7D32", borderColor: "#4CAF50" },
  textCorrect: { color: "#FFF", fontWeight: "bold" },
  optionIncorrect: { backgroundColor: "#C62828", borderColor: "#EF5350" },
  textIncorrect: { color: "#FFF", fontWeight: "bold" },
  optionDisabled: { opacity: 0.5 },

  explanationBox: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.3)",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  explanationTitle: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
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
  scoreText: { color: "#4DB6AC", fontSize: 60, fontWeight: "bold" },
  scoreSubtext: {
    color: "#888",
    fontSize: 18,
    marginBottom: 40,
    textAlign: "center",
  },
});
