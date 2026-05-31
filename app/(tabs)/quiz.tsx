import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── CONQUISTAS ───────────────────────────────────────────────────
type Conquista = {
  id: string;
  emoji: string;
  nome: string;
  desc: string;
  tipo: "rodadas" | "sequencia" | "pontos" | "perfeito";
  valor: number;
};

const CONQUISTAS: Conquista[] = [
  { id: "primeiro_passo",  emoji: "🌟", nome: "Primeiro Passo",       desc: "Complete sua primeira rodada",          tipo: "rodadas",   valor: 1   },
  { id: "explorador",      emoji: "🚀", nome: "Explorador Espacial",   desc: "Complete 5 rodadas",                    tipo: "rodadas",   valor: 5   },
  { id: "guardiao",        emoji: "🌌", nome: "Guardião da Galáxia",   desc: "Complete 10 rodadas",                   tipo: "rodadas",   valor: 10  },
  { id: "sequencia3",      emoji: "🔥", nome: "Em Chamas",             desc: "Acerte 3 perguntas seguidas",           tipo: "sequencia", valor: 3   },
  { id: "sequencia5",      emoji: "💫", nome: "Sequência Cósmica",     desc: "Acerte 5 perguntas seguidas",           tipo: "sequencia", valor: 5   },
  { id: "perfeito",        emoji: "🎯", nome: "Rodada Perfeita",       desc: "Acerte todas as 10 perguntas",          tipo: "perfeito",  valor: 10  },
  { id: "pontos25",        emoji: "🌙", nome: "Astronauta Novato",     desc: "Alcance 25 pontos no total",            tipo: "pontos",    valor: 25  },
  { id: "pontos50",        emoji: "⭐", nome: "Estrela Cadente",       desc: "Alcance 50 pontos no total",            tipo: "pontos",    valor: 50  },
  { id: "pontos100",       emoji: "🪐", nome: "Viajante do Cosmos",    desc: "Alcance 100 pontos no total",           tipo: "pontos",    valor: 100 },
  { id: "pontos200",       emoji: "🌠", nome: "Mestre do Universo",    desc: "Alcance 200 pontos no total",           tipo: "pontos",    valor: 200 },
];

// ─── HELPERS ──────────────────────────────────────────────────────
const decodeHTML = (str: string): string =>
  str
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"');

const traduzir = async (texto: string): Promise<string> => {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|pt-BR`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText;
    return texto;
  } catch { return texto; }
};

const traduzirArray = async (arr: string[]): Promise<string[]> =>
  Promise.all(arr.map((item) => traduzir(item)));

const PALAVRAS_ASTRONOMIA = [
  "planet","star","moon","galaxy","nebula","comet","asteroid","solar","orbit",
  "telescope","nasa","space","universe","cosmos","constellation","supernova",
  "black hole","milky way","saturn","jupiter","mars","venus","mercury","uranus",
  "neptune","earth","sun","light year","apollo","hubble","astronaut","meteor",
  "eclipse","gravity","rocket","shuttle","astronomy","cosmic",
];

const isAstronomia = (p: string) =>
  PALAVRAS_ASTRONOMIA.some((kw) => p.toLowerCase().includes(kw));

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────
export default function QuizTabScreen() {
  const [loading, setLoading]               = useState(true);
  const [loadingMsg, setLoadingMsg]         = useState("Buscando perguntas...");
  const [globalScore, setGlobalScore]       = useState(0);
  const [currentBatch, setCurrentBatch]     = useState<any[]>([]);
  const [perguntaAtual, setPerguntaAtual]   = useState(0);
  const [pontosNaRodada, setPontosNaRodada] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null);
  const [feedbackExibido, setFeedbackExibido]   = useState(false);

  // ── Conquistas
  const [conquistasDesbloq, setConquistasDesbloq] = useState<string[]>([]);
  const [rodadasTotal, setRodadasTotal]           = useState(0);
  const [sequenciaAtual, setSequenciaAtual]       = useState(0);
  const [maxSequencia, setMaxSequencia]           = useState(0);
  const [novasConquistas, setNovasConquistas]     = useState<Conquista[]>([]);
  const [showModal, setShowModal]                 = useState(false);

  // ── Toast animado
  const toastAnim  = useRef(new Animated.Value(-120)).current;
  const [toastConquista, setToastConquista] = useState<Conquista | null>(null);
  const toastQueue = useRef<Conquista[]>([]);
  const toastAtivo = useRef(false);

  useEffect(() => { carregarProgresso(); }, []);

  // ── Carrega todos os dados salvos ─────────────────────────────
  const carregarProgresso = async () => {
    try {
      const [score, rodadas, conquistas, maxSeq] = await Promise.all([
        AsyncStorage.getItem("@quiz_score"),
        AsyncStorage.getItem("@quiz_rodadas"),
        AsyncStorage.getItem("@quiz_conquistas"),
        AsyncStorage.getItem("@quiz_max_sequencia"),
      ]);
      setGlobalScore(score ? parseInt(score) : 0);
      setRodadasTotal(rodadas ? parseInt(rodadas) : 0);
      setConquistasDesbloq(conquistas ? JSON.parse(conquistas) : []);
      setMaxSequencia(maxSeq ? parseInt(maxSeq) : 0);
    } catch (e) { console.error(e); }
    gerarPerguntas();
  };

  // ── Exibe toast de conquista ──────────────────────────────────
  const exibirToast = (conquista: Conquista) => {
    toastQueue.current.push(conquista);
    if (!toastAtivo.current) processarFila();
  };

  const processarFila = () => {
    if (toastQueue.current.length === 0) { toastAtivo.current = false; return; }
    toastAtivo.current = true;
    const proxima = toastQueue.current.shift()!;
    setToastConquista(proxima);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 0,    duration: 400, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(toastAnim, { toValue: -120, duration: 400, useNativeDriver: true }),
    ]).start(() => processarFila());
  };

  // ── Verifica e desbloqueia conquistas ─────────────────────────
  const verificarConquistas = async (
    novoPlacar: number,
    novaSequencia: number,
    novoMaxSeq: number,
    novasRodadas: number,
    pontosRodada: number,
    totalPerguntas: number,
  ) => {
    const savedRaw = await AsyncStorage.getItem("@quiz_conquistas");
    const jaDesbloq: string[] = savedRaw ? JSON.parse(savedRaw) : [];
    const novas: Conquista[] = [];

    for (const c of CONQUISTAS) {
      if (jaDesbloq.includes(c.id)) continue;
      let desbloqueou = false;
      if (c.tipo === "pontos"    && novoPlacar   >= c.valor) desbloqueou = true;
      if (c.tipo === "rodadas"   && novasRodadas >= c.valor) desbloqueou = true;
      if (c.tipo === "sequencia" && novoMaxSeq   >= c.valor) desbloqueou = true;
      if (c.tipo === "perfeito"  && pontosRodada >= c.valor && totalPerguntas >= c.valor)
        desbloqueou = true;

      if (desbloqueou) novas.push(c);
    }

    if (novas.length > 0) {
      const atualizadas = [...jaDesbloq, ...novas.map((c) => c.id)];
      await AsyncStorage.setItem("@quiz_conquistas", JSON.stringify(atualizadas));
      setConquistasDesbloq(atualizadas);
      setNovasConquistas((prev) => [...prev, ...novas]);
      novas.forEach((c) => exibirToast(c));
    }
  };

  // ── Gerar perguntas ───────────────────────────────────────────
  const gerarPerguntas = async () => {
    setLoading(true);
    setMostrarResultado(false);
    setNovasConquistas([]);
    setSequenciaAtual(0);
    setLoadingMsg("Buscando perguntas de astronomia...");

    try {
      const response = await fetch(
        "https://opentdb.com/api.php?amount=50&category=17&type=multiple"
      );
      const data = await response.json();
      if (data.response_code !== 0 || !data.results?.length)
        throw new Error("Sem perguntas disponíveis.");

      const filtradas = data.results.filter((item: any) =>
        isAstronomia(decodeHTML(item.question))
      );

      let perguntasFinais: any[] = [];

      if (filtradas.length >= 5) {
        setLoadingMsg("Traduzindo para o português...");
        const traduzidas = await Promise.all(
          filtradas.slice(0, 7).map(async (item: any) => {
            const perguntaTraduzida = await traduzir(decodeHTML(item.question));
            const todasOpcoes = [...item.incorrect_answers, item.correct_answer].map(decodeHTML);
            const opcoesTraduzidas = await traduzirArray(todasOpcoes);
            const indiceCorreta = todasOpcoes.indexOf(item.correct_answer);
            return {
              pergunta: perguntaTraduzida,
              opcoes: opcoesTraduzidas,
              respostaCerta: indiceCorreta,
              explicacao: `A resposta correta é: ${opcoesTraduzidas[indiceCorreta]}`,
            };
          })
        );
        const locais = [...bancoDeDadosLocalReserva]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10 - traduzidas.length);
        perguntasFinais = [...traduzidas, ...locais].sort(() => Math.random() - 0.5);
      } else {
        throw new Error("Poucas perguntas de astronomia na API.");
      }

      setCurrentBatch(perguntasFinais);
      setPerguntaAtual(0);
      setPontosNaRodada(0);
      setOpcaoSelecionada(null);
      setFeedbackExibido(false);
    } catch {
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

  // ── Ação do botão principal ───────────────────────────────────
  const handleAcaoBotao = async () => {
    if (opcaoSelecionada === null) return;

    if (!feedbackExibido) {
      const acertou = opcaoSelecionada === currentBatch[perguntaAtual].respostaCerta;
      const novaPontuacao = acertou ? globalScore + 1 : Math.max(0, globalScore - 1);
      const novaSequencia = acertou ? sequenciaAtual + 1 : 0;
      const novoMaxSeq    = Math.max(maxSequencia, novaSequencia);
      const novosPontos   = acertou ? pontosNaRodada + 1 : pontosNaRodada;

      if (acertou) setPontosNaRodada(novosPontos);
      setGlobalScore(novaPontuacao);
      setSequenciaAtual(novaSequencia);
      setMaxSequencia(novoMaxSeq);

      await Promise.all([
        AsyncStorage.setItem("@quiz_score", novaPontuacao.toString()),
        AsyncStorage.setItem("@quiz_max_sequencia", novoMaxSeq.toString()),
      ]);

      // Verifica conquistas de sequência imediatamente ao acertar
      await verificarConquistas(novaPontuacao, novaSequencia, novoMaxSeq, rodadasTotal, novosPontos, currentBatch.length);
      setFeedbackExibido(true);
      return;
    }

    if (perguntaAtual + 1 < currentBatch.length) {
      setPerguntaAtual(perguntaAtual + 1);
      setOpcaoSelecionada(null);
      setFeedbackExibido(false);
    } else {
      // Fim da rodada
      const novasRodadas = rodadasTotal + 1;
      setRodadasTotal(novasRodadas);
      await AsyncStorage.setItem("@quiz_rodadas", novasRodadas.toString());

      // Verifica conquistas de rodada e pontos
      await verificarConquistas(globalScore, sequenciaAtual, maxSequencia, novasRodadas, pontosNaRodada, currentBatch.length);
      setMostrarResultado(true);
    }
  };

  // ── Resetar tudo ──────────────────────────────────────────────
  const resetarProgressoTotal = () => {
    Alert.alert("Zerar Pontuação", "Deseja apagar todos os seus pontos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim",
        onPress: async () => {
          await AsyncStorage.multiRemove(["@quiz_score", "@quiz_rodadas", "@quiz_max_sequencia"]);
          setGlobalScore(0);
          setRodadasTotal(0);
          setMaxSequencia(0);
          gerarPerguntas();
        },
      },
    ]);
  };

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { alignItems: "center" }]}>
          <ActivityIndicator size="large" color="#4DB6AC" />
          <Text style={{ color: "#4DB6AC", marginTop: 15, textAlign: "center" }}>{loadingMsg}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pergunta = currentBatch[perguntaAtual];
  const totalConquistas = conquistasDesbloq.length;

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ── TOAST DE CONQUISTA ── */}
      <Animated.View style={[styles.toast, { transform: [{ translateY: toastAnim }] }]}>
        {toastConquista && (
          <>
            <Text style={styles.toastEmoji}>{toastConquista.emoji}</Text>
            <View>
              <Text style={styles.toastTitulo}>Conquista desbloqueada!</Text>
              <Text style={styles.toastNome}>{toastConquista.nome}</Text>
            </View>
          </>
        )}
      </Animated.View>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.scoreBadge} onPress={resetarProgressoTotal}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.globalScoreText}> {globalScore} PTS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.trophyBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.trophyEmoji}>🏆</Text>
          <Text style={styles.trophyCount}>{totalConquistas}/{CONQUISTAS.length}</Text>
        </TouchableOpacity>
      </View>

      {/* ── QUIZ ── */}
      <View style={styles.container}>
        {mostrarResultado ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Rodada Concluída!</Text>
            <Text style={styles.scoreText}>{pontosNaRodada} / {currentBatch.length}</Text>

            {/* Novas conquistas na tela de resultado */}
            {novasConquistas.length > 0 && (
              <View style={styles.novasConquistasBox}>
                <Text style={styles.novasConquistasTitulo}>🎉 Conquistas desbloqueadas!</Text>
                {novasConquistas.map((c) => (
                  <Text key={c.id} style={styles.novaConquistaItem}>
                    {c.emoji} {c.nome}
                  </Text>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={gerarPerguntas}>
              <Text style={styles.buttonText}>Novas Perguntas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.quizContainer}>
            {/* Barra de sequência */}
            {sequenciaAtual >= 2 && (
              <View style={styles.sequenciaBadge}>
                <Text style={styles.sequenciaText}>🔥 {sequenciaAtual} seguidas!</Text>
              </View>
            )}

            <Text style={styles.questionCounter}>
              Pergunta {perguntaAtual + 1} de {currentBatch.length}
            </Text>
            <Text style={styles.questionText}>{pergunta?.pergunta}</Text>

            <View style={styles.optionsContainer}>
              {pergunta?.opcoes.map((opcao: string, index: number) => {
                const isSelected = opcaoSelecionada === index;
                const isCorrect  = index === pergunta.respostaCerta;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      !feedbackExibido && isSelected && styles.optionButtonSelected,
                      feedbackExibido && isCorrect  && styles.optionCorrect,
                      feedbackExibido && isSelected && !isCorrect && styles.optionIncorrect,
                      feedbackExibido && !isSelected && !isCorrect && styles.optionDisabled,
                    ]}
                    onPress={() => !feedbackExibido && setOpcaoSelecionada(index)}
                    activeOpacity={feedbackExibido ? 1 : 0.7}
                  >
                    <Text style={[styles.optionText, feedbackExibido && isCorrect && styles.textCorrect]}>
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
                <Text style={styles.explanationText}>{pergunta.explicacao}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, opcaoSelecionada === null && styles.buttonDisabled]}
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

      {/* ── MODAL DE CONQUISTAS ── */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>🏆 Conquistas</Text>
              <Text style={styles.modalSubtitulo}>{totalConquistas} de {CONQUISTAS.length} desbloqueadas</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Barra de progresso */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(totalConquistas / CONQUISTAS.length) * 100}%` as any }]} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {CONQUISTAS.map((c) => {
                const desbloqueada = conquistasDesbloq.includes(c.id);
                return (
                  <View key={c.id} style={[styles.conquistaItem, !desbloqueada && styles.conquistaBloqueada]}>
                    <Text style={[styles.conquistaEmoji, !desbloqueada && { opacity: 0.3 }]}>{c.emoji}</Text>
                    <View style={styles.conquistaInfo}>
                      <Text style={[styles.conquistaNome, !desbloqueada && styles.conquistaTextoBloq]}>
                        {desbloqueada ? c.nome : "???"}
                      </Text>
                      <Text style={styles.conquistaDesc}>
                        {desbloqueada ? c.desc : "Continue jogando para desbloquear"}
                      </Text>
                    </View>
                    {desbloqueada && (
                      <Ionicons name="checkmark-circle" size={22} color="#4DB6AC" />
                    )}
                  </View>
                );
              })}
              <View style={styles.modalStats}>
                <Text style={styles.modalStatsTitle}>📊 Suas Estatísticas</Text>
                <Text style={styles.modalStatItem}>🎮 Rodadas jogadas: {rodadasTotal}</Text>
                <Text style={styles.modalStatItem}>🔥 Maior sequência: {maxSequencia}</Text>
                <Text style={styles.modalStatItem}>⭐ Pontuação total: {globalScore}</Text>
              </View>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── BANCO LOCAL ──────────────────────────────────────────────────
const bancoDeDadosLocalReserva = [
  { pergunta: "Qual é o maior planeta do Sistema Solar?", opcoes: ["Saturno", "Júpiter", "Urano", "Netuno"], respostaCerta: 1, explicacao: "A resposta correta é: Júpiter" },
  { pergunta: "Qual planeta é conhecido como o Planeta Vermelho?", opcoes: ["Vênus", "Mercúrio", "Marte", "Júpiter"], respostaCerta: 2, explicacao: "A resposta correta é: Marte" },
  { pergunta: "Quantas luas tem Saturno?", opcoes: ["12", "27", "62", "146"], respostaCerta: 3, explicacao: "A resposta correta é: 146 luas confirmadas" },
  { pergunta: "Qual é a estrela mais próxima do Sistema Solar?", opcoes: ["Sirius", "Próxima Centauri", "Vega", "Betelgeuse"], respostaCerta: 1, explicacao: "A resposta correta é: Próxima Centauri" },
  { pergunta: "Em que ano foi lançado o Telescópio Espacial Hubble?", opcoes: ["1985", "1990", "1995", "2000"], respostaCerta: 1, explicacao: "A resposta correta é: 1990" },
  { pergunta: "Qual lua de Júpiter é o corpo mais vulcanicamente ativo do Sistema Solar?", opcoes: ["Europa", "Ganimedes", "Io", "Calisto"], respostaCerta: 2, explicacao: "A resposta correta é: Io" },
  { pergunta: "O que é uma supernova?", opcoes: ["Uma nova estrela", "A explosão final de uma estrela massiva", "Um buraco negro", "Uma nebulosa em expansão"], respostaCerta: 1, explicacao: "A resposta correta é: A explosão final de uma estrela massiva" },
  { pergunta: "Qual constelação contém as famosas 'Três Marias'?", opcoes: ["Escorpião", "Ursa Maior", "Órion", "Cruzeiro do Sul"], respostaCerta: 2, explicacao: "A resposta correta é: Órion" },
  { pergunta: "Qual é o nome da galáxia em que vivemos?", opcoes: ["Andrômeda", "Sombrero", "Cartwheel", "Via Láctea"], respostaCerta: 3, explicacao: "A resposta correta é: Via Láctea" },
  { pergunta: "Qual cometa é famoso por passar perto da Terra a cada 75 anos?", opcoes: ["Halley", "Hale-Bopp", "Shoemaker-Levy", "Encke"], respostaCerta: 0, explicacao: "A resposta correta é: Halley" },
  { pergunta: "Qual planeta tem os anéis mais visíveis do Sistema Solar?", opcoes: ["Júpiter", "Urano", "Saturno", "Netuno"], respostaCerta: 2, explicacao: "A resposta correta é: Saturno" },
  { pergunta: "O que é um ano-luz?", opcoes: ["Um ano no espaço", "A distância percorrida pela luz em um ano", "A idade de uma estrela", "A velocidade da luz"], respostaCerta: 1, explicacao: "A resposta correta é: A distância percorrida pela luz em um ano" },
  { pergunta: "Qual missão levou o primeiro homem à Lua?", opcoes: ["Apollo 10", "Apollo 11", "Apollo 13", "Gemini 7"], respostaCerta: 1, explicacao: "A resposta correta é: Apollo 11" },
  { pergunta: "Qual é o nome do buraco negro no centro da Via Láctea?", opcoes: ["Cygnus X-1", "M87*", "Sagitário A*", "NGC 1277"], respostaCerta: 2, explicacao: "A resposta correta é: Sagitário A*" },
  { pergunta: "Qual planeta orbita o Sol de lado, com inclinação de 98 graus?", opcoes: ["Netuno", "Saturno", "Urano", "Júpiter"], respostaCerta: 2, explicacao: "A resposta correta é: Urano" },
  { pergunta: "Qual foi o primeiro satélite artificial enviado ao espaço?", opcoes: ["Explorer 1", "Vostok 1", "Sputnik 1", "Apollo 1"], respostaCerta: 2, explicacao: "A resposta correta é: Sputnik 1, em 1957" },
  { pergunta: "Quantos planetas existem no Sistema Solar?", opcoes: ["7", "8", "9", "10"], respostaCerta: 1, explicacao: "A resposta correta é: 8 planetas" },
  { pergunta: "Qual é o planeta mais quente do Sistema Solar?", opcoes: ["Mercúrio", "Marte", "Júpiter", "Vênus"], respostaCerta: 3, explicacao: "A resposta correta é: Vênus, por seu efeito estufa extremo" },
  { pergunta: "O Telescópio James Webb foi lançado em qual ano?", opcoes: ["2018", "2019", "2021", "2023"], respostaCerta: 2, explicacao: "A resposta correta é: 2021" },
  { pergunta: "Qual lua de Saturno possui rios e lagos de metano líquido?", opcoes: ["Encélado", "Mimas", "Titã", "Reia"], respostaCerta: 2, explicacao: "A resposta correta é: Titã" },
  { pergunta: "Qual é a constelação mais reconhecível do hemisfério sul?", opcoes: ["Órion", "Ursa Maior", "Cruzeiro do Sul", "Escorpião"], respostaCerta: 2, explicacao: "A resposta correta é: Cruzeiro do Sul" },
  { pergunta: "A que velocidade a luz viaja no vácuo?", opcoes: ["150.000 km/s", "300.000 km/s", "450.000 km/s", "600.000 km/s"], respostaCerta: 1, explicacao: "A resposta correta é: 300.000 km/s" },
  { pergunta: "Qual sonda está agora no espaço interestelar?", opcoes: ["Pioneer 10", "Voyager 1", "New Horizons", "Cassini"], respostaCerta: 1, explicacao: "A resposta correta é: Voyager 1, lançada em 1977" },
  { pergunta: "Qual planeta tem a maior tempestade do Sistema Solar?", opcoes: ["Saturno", "Netuno", "Júpiter", "Urano"], respostaCerta: 2, explicacao: "A resposta correta é: Júpiter, com a Grande Mancha Vermelha" },
  { pergunta: "Qual é o tipo de estrela que o nosso Sol é?", opcoes: ["Gigante Vermelha", "Anã Branca", "Anã Amarela", "Supergigante Azul"], respostaCerta: 2, explicacao: "A resposta correta é: Anã Amarela (tipo G)" },
  { pergunta: "Qual lua de Júpiter pode abrigar vida?", opcoes: ["Io", "Ganimedes", "Calisto", "Europa"], respostaCerta: 3, explicacao: "A resposta correta é: Europa" },
  { pergunta: "Qual é a galáxia mais próxima da Via Láctea?", opcoes: ["Sombrero", "Andrômeda", "Triângulo", "Cartwheel"], respostaCerta: 1, explicacao: "A resposta correta é: Andrômeda" },
  { pergunta: "Qual planeta tem os ventos mais rápidos do Sistema Solar?", opcoes: ["Júpiter", "Saturno", "Urano", "Netuno"], respostaCerta: 3, explicacao: "A resposta correta é: Netuno, com ventos de até 2.100 km/h" },
  { pergunta: "O que é uma nebulosa planetária?", opcoes: ["Nebulosa ao redor de planeta", "Gás ejetado por estrela moribunda", "Nuvem de poeira interestelar", "Berçário de planetas"], respostaCerta: 1, explicacao: "A resposta correta é: Gás ejetado por uma estrela moribunda" },
  { pergunta: "Qual é a distância média da Terra ao Sol?", opcoes: ["1 ano-luz", "1 UA (149,6 mi km)", "384.400 km", "1 parsec"], respostaCerta: 1, explicacao: "A resposta correta é: 1 UA (Unidade Astronômica) = 149,6 milhões de km" },
];

// ─── STYLES ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1, backgroundColor: "#05050A",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  // Toast
  toast: {
    position: "absolute", top: 0, left: 16, right: 16, zIndex: 999,
    backgroundColor: "#1A2E1A", borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1, borderColor: "#4CAF50",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 10,
  },
  toastEmoji:  { fontSize: 28 },
  toastTitulo: { color: "#4CAF50", fontSize: 11, fontWeight: "bold" },
  toastNome:   { color: "#FFF", fontSize: 14, fontWeight: "bold" },

  // Header
  header: {
    paddingHorizontal: 20, paddingTop: 15,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  scoreBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.15)",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,215,0,0.4)",
  },
  globalScoreText: { color: "#FFD700", fontWeight: "bold", fontSize: 16 },
  trophyBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(77,182,172,0.1)",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(77,182,172,0.3)",
    gap: 6,
  },
  trophyEmoji: { fontSize: 16 },
  trophyCount: { color: "#4DB6AC", fontWeight: "bold", fontSize: 14 },

  // Sequência
  sequenciaBadge: {
    alignSelf: "center", backgroundColor: "rgba(255,100,0,0.15)",
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,100,0,0.4)",
    marginBottom: 10,
  },
  sequenciaText: { color: "#FF6400", fontWeight: "bold", fontSize: 13 },

  // Quiz
  container: { flex: 1, padding: 20, justifyContent: "center" },
  quizContainer: { flex: 1, justifyContent: "center" },
  questionCounter: { color: "#4DB6AC", fontSize: 16, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  questionText:    { color: "#FFF", fontSize: 22, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  optionsContainer: { marginBottom: 20 },
  optionButton: {
    backgroundColor: "#1A1A2E", padding: 18, borderRadius: 15,
    marginBottom: 12, borderWidth: 2, borderColor: "transparent",
  },
  optionButtonSelected: { borderColor: "#4DB6AC", backgroundColor: "#111F2D" },
  optionText:    { color: "#FFF", fontSize: 16 },
  optionCorrect: { backgroundColor: "#2E7D32", borderColor: "#4CAF50" },
  textCorrect:   { color: "#FFF", fontWeight: "bold" },
  optionIncorrect: { backgroundColor: "#C62828", borderColor: "#EF5350" },
  optionDisabled:  { opacity: 0.5 },
  explanationBox: {
    backgroundColor: "rgba(77,182,172,0.1)", padding: 15,
    borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: "rgba(77,182,172,0.3)",
  },
  explanationTitle: { color: "#4DB6AC", fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  explanationText:  { color: "#E0E0E0", fontSize: 15, lineHeight: 22 },
  button:         { backgroundColor: "#4DB6AC", padding: 18, borderRadius: 15, alignItems: "center", width: "100%" },
  buttonDisabled: { backgroundColor: "#2A4D4A" },
  buttonText:     { color: "#05050A", fontSize: 18, fontWeight: "bold" },

  // Resultado
  resultContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  resultTitle:     { color: "#FFF", fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  scoreText:       { color: "#4DB6AC", fontSize: 60, fontWeight: "bold", marginBottom: 20 },
  novasConquistasBox: {
    backgroundColor: "rgba(77,182,172,0.1)", borderRadius: 14,
    padding: 16, marginBottom: 24, width: "100%",
    borderWidth: 1, borderColor: "rgba(77,182,172,0.3)",
  },
  novasConquistasTitulo: { color: "#4DB6AC", fontWeight: "bold", fontSize: 15, marginBottom: 8, textAlign: "center" },
  novaConquistaItem:     { color: "#FFF", fontSize: 14, marginBottom: 4 },

  // Modal
  modalOverlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContainer:  { backgroundColor: "#0D1117", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%" },
  modalHeader:     { marginBottom: 16 },
  modalTitulo:     { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  modalSubtitulo:  { color: "#888", fontSize: 13, marginTop: 2 },
  modalClose:      { position: "absolute", right: 0, top: 0, padding: 4 },
  progressBar:     { height: 6, backgroundColor: "#1A1A2E", borderRadius: 3, marginBottom: 20 },
  progressFill:    { height: 6, backgroundColor: "#4DB6AC", borderRadius: 3 },
  conquistaItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1A1A2E", borderRadius: 12,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#222",
  },
  conquistaBloqueada: { opacity: 0.5 },
  conquistaEmoji:     { fontSize: 28, marginRight: 14 },
  conquistaInfo:      { flex: 1 },
  conquistaNome:      { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  conquistaTextoBloq: { color: "#888" },
  conquistaDesc:      { color: "#888", fontSize: 12, marginTop: 2 },
  modalStats:         { backgroundColor: "#1A1A2E", borderRadius: 12, padding: 16, marginTop: 8 },
  modalStatsTitle:    { color: "#4DB6AC", fontWeight: "bold", fontSize: 15, marginBottom: 10 },
  modalStatItem:      { color: "#CCC", fontSize: 13, marginBottom: 6 },
});