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
import { publishQuizScore } from "../../services/contentHelpers";

// ─── TIPAGENS DE DIFICULDADE E BADGES ─────────────────────────────
type Dificuldade = "easy" | "medium" | "hard";

const MULTIPLICADORES: Record<Dificuldade, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const LABELS_DIFICULDADE: Record<Dificuldade, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Especialista",
};

// Define o Badge (Patente) baseado nos pontos totais
const getRankBadge = (score: number) => {
  if (score < 50) return { titulo: "Novato", icone: "🥉", cor: "#CD7F32" };
  if (score < 150) return { titulo: "Explorador", icone: "🥈", cor: "#C0C0C0" };
  if (score < 300) return { titulo: "Veterano", icone: "🥇", cor: "#FFD700" };
  return { titulo: "Lenda Cósmica", icone: "💎", cor: "#00E5FF" };
};

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
  {
    id: "primeiro_passo",
    emoji: "🌟",
    nome: "Primeiro Passo",
    desc: "Complete sua primeira rodada",
    tipo: "rodadas",
    valor: 1,
  },
  {
    id: "explorador",
    emoji: "🚀",
    nome: "Explorador Espacial",
    desc: "Complete 5 rodadas",
    tipo: "rodadas",
    valor: 5,
  },
  {
    id: "guardiao",
    emoji: "🌌",
    nome: "Guardião da Galáxia",
    desc: "Complete 10 rodadas",
    tipo: "rodadas",
    valor: 10,
  },
  {
    id: "sequencia3",
    emoji: "🔥",
    nome: "Em Chamas",
    desc: "Acerte 3 perguntas seguidas",
    tipo: "sequencia",
    valor: 3,
  },
  {
    id: "sequencia5",
    emoji: "💫",
    nome: "Sequência Cósmica",
    desc: "Acerte 5 perguntas seguidas",
    tipo: "sequencia",
    valor: 5,
  },
  {
    id: "perfeito",
    emoji: "🎯",
    nome: "Rodada Perfeita",
    desc: "Acerte todas as 10 perguntas",
    tipo: "perfeito",
    valor: 10,
  },
  {
    id: "pontos25",
    emoji: "🌙",
    nome: "Astronauta Novato",
    desc: "Alcance 25 pontos no total",
    tipo: "pontos",
    valor: 25,
  },
  {
    id: "pontos50",
    emoji: "⭐",
    nome: "Estrela Cadente",
    desc: "Alcance 50 pontos no total",
    tipo: "pontos",
    valor: 50,
  },
  {
    id: "pontos100",
    emoji: "🪐",
    nome: "Viajante do Cosmos",
    desc: "Alcance 100 pontos no total",
    tipo: "pontos",
    valor: 100,
  },
  {
    id: "pontos200",
    emoji: "🌠",
    nome: "Mestre do Universo",
    desc: "Alcance 200 pontos no total",
    tipo: "pontos",
    valor: 200,
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────
const decodeHTML = (str: string): string =>
  str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');

const translationCache = new Map<string, string>();
const API_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas
const MULTI_TRANSLATION_DELIMITER = " ||| ";

const fallbackDictionary: Record<string, string> = {
  Which: "Qual",
  What: "Qual",
  "How many": "Quantas",
  "How old": "Qual é a idade",
  "How far": "Quão distante",
  "How long": "Quanto tempo",
  "in the Solar System": "no Sistema Solar",
  "the Solar System": "o Sistema Solar",
  "the moon": "a Lua",
  "the Earth": "a Terra",
  "the Sun": "o Sol",
  "The Sun": "O Sol",
  planets: "planetas",
  planet: "planeta",
  star: "estrela",
  galaxy: "galáxia",
  nebula: "nebulosa",
  comet: "cometa",
  asteroid: "asteroide",
  satellite: "satélite",
  telescope: "telescópio",
  astronaut: "astronauta",
  rocket: "foguete",
  solar: "solar",
  orbit: "órbita",
  universe: "universo",
  supernova: "supernova",
  "black hole": "buraco negro",
  "light year": "ano-luz",
  meteor: "meteoro",
  eclipse: "eclipse",
  gravity: "gravidade",
  shuttle: "ônibus espacial",
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

const fallbackTranslate = (texto: string) => {
  let result = texto;
  Object.entries(fallbackDictionary).forEach(([search, replace]) => {
    const regex = new RegExp(`\\b${escapeRegExp(search)}\\b`, "gi");
    result = result.replace(regex, replace);
  });
  return result;
};

type ApiCacheEntry = {
  timestamp: number;
  questions: any[];
};

const apiCache = new Map<Dificuldade, ApiCacheEntry>();

const saveTranslationCache = async () => {
  try {
    const raw = Object.fromEntries(translationCache.entries());
    await AsyncStorage.setItem("@quiz_translation_cache", JSON.stringify(raw));
  } catch (e) {
    console.warn("Falha ao salvar cache de tradução", e);
  }
};

const saveApiCache = async (dificuldade: Dificuldade, questions: any[]) => {
  try {
    const entry = { timestamp: Date.now(), questions };
    apiCache.set(dificuldade, entry);
    await AsyncStorage.setItem(
      `@quiz_api_cache_${dificuldade}`,
      JSON.stringify(entry),
    );
  } catch (e) {
    console.warn("Falha ao salvar cache de perguntas", e);
  }
};

const loadPersistedCaches = async () => {
  try {
    const keys = [
      "@quiz_translation_cache",
      "@quiz_api_cache_easy",
      "@quiz_api_cache_medium",
      "@quiz_api_cache_hard",
    ];
    const stores = await AsyncStorage.multiGet(keys);
    const storeMap = stores.reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {} as Record<string, string | null>,
    );

    if (storeMap["@quiz_translation_cache"]) {
      const parsed = JSON.parse(storeMap["@quiz_translation_cache"]);
      if (parsed && typeof parsed === "object") {
        Object.entries(parsed).forEach(([text, translation]) => {
          if (typeof translation === "string")
            translationCache.set(text, translation);
        });
      }
    }

    (["easy", "medium", "hard"] as Dificuldade[]).forEach((difficulty) => {
      const key = `@quiz_api_cache_${difficulty}`;
      const raw = storeMap[key];
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (
        parsed?.timestamp &&
        typeof parsed.timestamp === "number" &&
        Array.isArray(parsed.questions)
      ) {
        apiCache.set(difficulty, {
          timestamp: parsed.timestamp,
          questions: parsed.questions,
        });
      }
    });
  } catch (e) {
    console.warn("Falha ao carregar cache persistente", e);
  }
};

const getCachedQuestions = (dificuldade: Dificuldade) => {
  const entry = apiCache.get(dificuldade);
  if (!entry || entry.questions.length === 0) return null;
  return entry.questions;
};

const isCacheFresh = (dificuldade: Dificuldade) => {
  const entry = apiCache.get(dificuldade);
  return Boolean(entry && Date.now() - entry.timestamp <= API_CACHE_TTL);
};

const shuffleArray = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

const traduzir = async (texto: string): Promise<string> => {
  const trimmed = texto.trim();
  if (!trimmed) return trimmed;
  if (translationCache.has(trimmed)) return translationCache.get(trimmed)!;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|pt-BR`;
    const res = await fetch(url);
    const data = await res.json();
    let traduzido = trimmed;

    if (
      data?.responseStatus === 200 &&
      typeof data?.responseData?.translatedText === "string" &&
      data.responseData.translatedText.trim().length > 0
    ) {
      traduzido = data.responseData.translatedText;
    } else if (
      Array.isArray(data?.matches) &&
      typeof data.matches[0]?.translation === "string" &&
      data.matches[0].translation.trim().length > 0
    ) {
      traduzido = data.matches[0].translation;
    }

    if (traduzido.trim() === trimmed) {
      traduzido = fallbackTranslate(trimmed);
    }

    translationCache.set(trimmed, traduzido);
    return traduzido;
  } catch (error) {
    console.warn("Erro ao traduzir texto:", texto, error);
    const fallback = fallbackTranslate(trimmed);
    translationCache.set(trimmed, fallback);
    return fallback;
  }
};

const traduzirArray = async (arr: string[]): Promise<string[]> => {
  const trimmedItems = arr.map((item) => item.trim());
  const allCached = trimmedItems.every(
    (item) => item.length > 0 && translationCache.has(item),
  );
  if (allCached) {
    return trimmedItems.map((item) => translationCache.get(item) ?? item);
  }

  const uniqueItems = Array.from(
    new Set(trimmedItems.filter((item) => item.length > 0)),
  );
  if (uniqueItems.length === 0) {
    return arr;
  }

  const combinedText = uniqueItems.join(MULTI_TRANSLATION_DELIMITER);
  const combinedTranslation = await traduzir(combinedText);
  const translatedParts = combinedTranslation
    .split(MULTI_TRANSLATION_DELIMITER)
    .map((part) => part.trim());

  if (translatedParts.length === uniqueItems.length) {
    uniqueItems.forEach((original, index) => {
      const translation =
        translatedParts[index] && translatedParts[index] !== original
          ? translatedParts[index]
          : fallbackTranslate(original);
      translationCache.set(original, translation);
    });
  } else {
    await Promise.all(uniqueItems.map((item) => traduzir(item)));
  }

  await saveTranslationCache();
  return trimmedItems.map((item) => translationCache.get(item) ?? item);
};

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

const isAstronomia = (p: string) =>
  PALAVRAS_ASTRONOMIA.some((kw) => p.toLowerCase().includes(kw));

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────
export default function QuizTabScreen() {
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState("Carregando progresso...");
  const [globalScore, setGlobalScore] = useState(0);
  const [currentBatch, setCurrentBatch] = useState<any[]>([]);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [pontosNaRodada, setPontosNaRodada] = useState(0);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null);
  const [feedbackExibido, setFeedbackExibido] = useState(false);

  const [fase, setFase] = useState<"selecao" | "jogando" | "resultado">(
    "selecao",
  );
  const [dificuldadeAtual, setDificuldadeAtual] =
    useState<Dificuldade>("medium");

  // ── Memória e Conquistas
  const [perguntasAcertadas, setPerguntasAcertadas] = useState<string[]>([]);
  const [conquistasDesbloq, setConquistasDesbloq] = useState<string[]>([]);
  const [rodadasTotal, setRodadasTotal] = useState(0);
  const [sequenciaAtual, setSequenciaAtual] = useState(0);
  const [maxSequencia, setMaxSequencia] = useState(0);
  const [novasConquistas, setNovasConquistas] = useState<Conquista[]>([]);
  const [showModal, setShowModal] = useState(false);

  // ── Toast animado
  const toastAnim = useRef(new Animated.Value(-120)).current;
  const [toastConquista, setToastConquista] = useState<Conquista | null>(null);
  const toastQueue = useRef<Conquista[]>([]);
  const toastAtivo = useRef(false);

  const rankAtual = getRankBadge(globalScore);

  useEffect(() => {
    carregarProgresso();
  }, []);

  // ── Carrega todos os dados salvos ─────────────────────────────
  const carregarProgresso = async () => {
    try {
      const [score, rodadas, conquistas, maxSeq, acertadas] = await Promise.all(
        [
          AsyncStorage.getItem("@quiz_score"),
          AsyncStorage.getItem("@quiz_rodadas"),
          AsyncStorage.getItem("@quiz_conquistas"),
          AsyncStorage.getItem("@quiz_max_sequencia"),
          AsyncStorage.getItem("@quiz_acertadas"), // Carrega as perguntas já respondidas
        ],
      );
      setGlobalScore(score ? parseInt(score) : 0);
      setRodadasTotal(rodadas ? parseInt(rodadas) : 0);
      setConquistasDesbloq(conquistas ? JSON.parse(conquistas) : []);
      setMaxSequencia(maxSeq ? parseInt(maxSeq) : 0);
      setPerguntasAcertadas(acertadas ? JSON.parse(acertadas) : []);
      await loadPersistedCaches();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setFase("selecao");
  };

  // ── Exibe toast de conquista ──────────────────────────────────
  const exibirToast = (conquista: Conquista) => {
    toastQueue.current.push(conquista);
    if (!toastAtivo.current) processarFila();
  };

  const processarFila = () => {
    if (toastQueue.current.length === 0) {
      toastAtivo.current = false;
      return;
    }
    toastAtivo.current = true;
    const proxima = toastQueue.current.shift()!;
    setToastConquista(proxima);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(toastAnim, {
        toValue: -120,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => processarFila());
  };

  // ── Verifica e desbloqueia conquistas ─────────────────────────
  const verificarConquistas = async (
    novoPlacar: number,
    novaSequencia: number,
    novoMaxSeq: number,
    novasRodadas: number,
    acertosRodada: number,
    totalPerguntas: number,
  ) => {
    const savedRaw = await AsyncStorage.getItem("@quiz_conquistas");
    const jaDesbloq: string[] = savedRaw ? JSON.parse(savedRaw) : [];
    const novas: Conquista[] = [];

    for (const c of CONQUISTAS) {
      if (jaDesbloq.includes(c.id)) continue;
      let desbloqueou = false;
      if (c.tipo === "pontos" && novoPlacar >= c.valor) desbloqueou = true;
      if (c.tipo === "rodadas" && novasRodadas >= c.valor) desbloqueou = true;
      if (c.tipo === "sequencia" && novoMaxSeq >= c.valor) desbloqueou = true;
      if (
        c.tipo === "perfeito" &&
        acertosRodada >= c.valor &&
        totalPerguntas >= c.valor
      )
        desbloqueou = true;

      if (desbloqueou) novas.push(c);
    }

    if (novas.length > 0) {
      const atualizadas = [...jaDesbloq, ...novas.map((c) => c.id)];
      await AsyncStorage.setItem(
        "@quiz_conquistas",
        JSON.stringify(atualizadas),
      );
      setConquistasDesbloq(atualizadas);
      setNovasConquistas((prev) => [...prev, ...novas]);
      novas.forEach((c) => exibirToast(c));
    }
  };

  // ── Gerar perguntas não repetidas ─────────────────────────────
  const gerarPerguntas = async (dificuldade: Dificuldade) => {
    setDificuldadeAtual(dificuldade);
    setFase("jogando");
    setLoading(true);
    setNovasConquistas([]);
    setSequenciaAtual(0);
    setLoadingMsg(`Buscando perguntas (${LABELS_DIFICULDADE[dificuldade]})...`);

    const cached = getCachedQuestions(dificuldade);
    if (cached && isCacheFresh(dificuldade)) {
      setLoadingMsg("Carregando perguntas do cache...");
      iniciarRodada(shuffleArray(cached));
      return;
    }

    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=50&category=17&difficulty=${dificuldade}&type=multiple`,
      );
      const data = await response.json();

      if (!data || data.response_code !== 0 || !Array.isArray(data.results)) {
        throw new Error("API inválida");
      }

      const acertadasSet = new Set(perguntasAcertadas);
      const filtradas = data.results.filter((item: any) => {
        const perguntaDecoded = decodeHTML(item.question);
        return (
          isAstronomia(perguntaDecoded) && !acertadasSet.has(perguntaDecoded)
        );
      });

      let perguntasFinais: any[] = [];

      if (filtradas.length > 0) {
        setLoadingMsg("Traduzindo para o português...");
        const limit = Math.min(filtradas.length, 7);
        const traduzidas = await Promise.all(
          filtradas.slice(0, limit).map(async (item: any) => {
            const perguntaDecoded = decodeHTML(item.question);
            const todasOpcoes = [
              ...item.incorrect_answers,
              item.correct_answer,
            ].map(decodeHTML);
            const traduzidos = await traduzirArray([
              perguntaDecoded,
              ...todasOpcoes,
            ]);
            const perguntaTraduzida = traduzidos[0];
            const opcoesTraduzidas = traduzidos.slice(1);
            const indiceCorreta = todasOpcoes.indexOf(item.correct_answer);
            return {
              idOriginal: perguntaDecoded, // Usamos o inglês original como ID
              pergunta: perguntaTraduzida,
              opcoes: opcoesTraduzidas,
              respostaCerta: indiceCorreta,
              explicacao: `A resposta correta é: ${opcoesTraduzidas[indiceCorreta]}`,
            };
          }),
        );

        // Pega do banco local as que não foram respondidas ainda
        const locais = [...bancoDeDadosLocalReserva]
          .filter(
            (p) =>
              p.difficulty === dificuldade &&
              !perguntasAcertadas.includes(p.pergunta),
          )
          .map((p) => ({ ...p, idOriginal: p.pergunta })) // Para o banco local, a própria string é o ID
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.max(0, 10 - traduzidas.length));

        perguntasFinais = [...traduzidas, ...locais].sort(
          () => Math.random() - 0.5,
        );
      } else {
        throw new Error("Esgotadas API");
      }

      await saveApiCache(dificuldade, perguntasFinais);
      iniciarRodada(perguntasFinais);
    } catch {
      const staleCached = getCachedQuestions(dificuldade);
      if (staleCached) {
        setLoadingMsg("Usando perguntas em cache auxiliar...");
        iniciarRodada(shuffleArray(staleCached));
        return;
      }

      // Fallback local se a API falhar ou esgotar
      const bancoFiltrado = [...bancoDeDadosLocalReserva]
        .filter(
          (p) =>
            p.difficulty === dificuldade &&
            !perguntasAcertadas.includes(p.pergunta),
        )
        .map((p) => ({ ...p, idOriginal: p.pergunta }))
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      iniciarRodada(bancoFiltrado);
    }
  };

  const iniciarRodada = (perguntas: any[]) => {
    if (perguntas.length === 0) {
      Alert.alert(
        "Uau!",
        "Você já acertou TODAS as perguntas deste nível! Tente outra dificuldade.",
      );
      setFase("selecao");
      setLoading(false);
      return;
    }
    setCurrentBatch(perguntas);
    setPerguntaAtual(0);
    setPontosNaRodada(0);
    setOpcaoSelecionada(null);
    setFeedbackExibido(false);
    setLoading(false);
  };

  // ── Ação do botão principal ───────────────────────────────────
  const handleAcaoBotao = async () => {
    if (opcaoSelecionada === null) return;

    if (!feedbackExibido) {
      const perguntaAtualObj = currentBatch[perguntaAtual];
      const acertou = opcaoSelecionada === perguntaAtualObj.respostaCerta;
      const multiplicador = MULTIPLICADORES[dificuldadeAtual];

      const novaPontuacao = acertou
        ? globalScore + multiplicador
        : Math.max(0, globalScore - 1);
      const novaSequencia = acertou ? sequenciaAtual + 1 : 0;
      const novoMaxSeq = Math.max(maxSequencia, novaSequencia);
      const novosAcertos = acertou ? pontosNaRodada + 1 : pontosNaRodada;

      if (acertou) {
        setPontosNaRodada(novosAcertos);

        // Salva a pergunta no array de acertadas para não repetir mais
        if (!perguntasAcertadas.includes(perguntaAtualObj.idOriginal)) {
          const novasAcertadas = [
            ...perguntasAcertadas,
            perguntaAtualObj.idOriginal,
          ];
          setPerguntasAcertadas(novasAcertadas);
          AsyncStorage.setItem(
            "@quiz_acertadas",
            JSON.stringify(novasAcertadas),
          );
        }
      }

      const delta = novaPontuacao - globalScore;
      setGlobalScore(novaPontuacao);
      if (delta > 0) {
        void publishQuizScore(delta).catch(() => {});
      }
      setSequenciaAtual(novaSequencia);
      setMaxSequencia(novoMaxSeq);

      await Promise.all([
        AsyncStorage.setItem("@quiz_score", novaPontuacao.toString()),
        AsyncStorage.setItem("@quiz_max_sequencia", novoMaxSeq.toString()),
      ]);

      await verificarConquistas(
        novaPontuacao,
        novaSequencia,
        novoMaxSeq,
        rodadasTotal,
        novosAcertos,
        currentBatch.length,
      );
      setFeedbackExibido(true);
      return;
    }

    if (perguntaAtual + 1 < currentBatch.length) {
      setPerguntaAtual(perguntaAtual + 1);
      setOpcaoSelecionada(null);
      setFeedbackExibido(false);
    } else {
      const novasRodadas = rodadasTotal + 1;
      setRodadasTotal(novasRodadas);
      await AsyncStorage.setItem("@quiz_rodadas", novasRodadas.toString());
      await verificarConquistas(
        globalScore,
        sequenciaAtual,
        maxSequencia,
        novasRodadas,
        pontosNaRodada,
        currentBatch.length,
      );
      setFase("resultado");
    }
  };

  // ── Resetar tudo ──────────────────────────────────────────────
  const resetarProgressoTotal = () => {
    Alert.alert(
      "Zerar Progresso",
      "Deseja apagar pontos e memória de perguntas?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim",
          onPress: async () => {
            await AsyncStorage.multiRemove([
              "@quiz_score",
              "@quiz_rodadas",
              "@quiz_max_sequencia",
              "@quiz_conquistas",
              "@quiz_acertadas",
            ]);
            setGlobalScore(0);
            setRodadasTotal(0);
            setMaxSequencia(0);
            setConquistasDesbloq([]);
            setPerguntasAcertadas([]);
            setFase("selecao");
          },
        },
      ],
    );
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

  const totalConquistas = conquistasDesbloq.length;
  const pergunta = currentBatch[perguntaAtual];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[styles.toast, { transform: [{ translateY: toastAnim }] }]}
      >
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

      {/* ── HEADER COM RANK BADGE ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.scoreBadge}
          onPress={resetarProgressoTotal}
        >
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.globalScoreText}> {globalScore} PTS</Text>
        </TouchableOpacity>

        {/* Novo Badge de Nível */}
        <View style={[styles.rankBadge, { borderColor: rankAtual.cor }]}>
          <Text style={styles.rankEmoji}>{rankAtual.icone}</Text>
          <Text style={[styles.rankText, { color: rankAtual.cor }]}>
            {rankAtual.titulo}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.trophyBtn}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.trophyEmoji}>🏆</Text>
          <Text style={styles.trophyCount}>
            {totalConquistas}/{CONQUISTAS.length}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* ── FASE: SELEÇÃO DE DIFICULDADE ── */}
        {fase === "selecao" && (
          <View style={styles.selectionContainer}>
            <Text style={styles.selectionTitle}>Escolha a Dificuldade</Text>
            <Text style={styles.selectionSubtitle}>
              Você já acertou {perguntasAcertadas.length} perguntas!
            </Text>

            <TouchableOpacity
              style={[styles.diffButton, styles.diffEasy]}
              onPress={() => gerarPerguntas("easy")}
            >
              <Text style={styles.diffButtonTitle}>🟢 Fácil</Text>
              <Text style={styles.diffButtonSubtitle}>+1 Ponto por acerto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.diffButton, styles.diffMedium]}
              onPress={() => gerarPerguntas("medium")}
            >
              <Text style={styles.diffButtonTitle}>🟡 Médio</Text>
              <Text style={styles.diffButtonSubtitle}>
                +2 Pontos por acerto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.diffButton, styles.diffHard]}
              onPress={() => gerarPerguntas("hard")}
            >
              <Text style={styles.diffButtonTitle}>🔴 Especialista</Text>
              <Text style={styles.diffButtonSubtitle}>
                +3 Pontos por acerto
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── FASE: RESULTADO ── */}
        {fase === "resultado" && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Rodada Concluída!</Text>
            <Text style={styles.scoreText}>
              {pontosNaRodada} / {currentBatch.length}
            </Text>
            <Text style={{ color: "#888", marginBottom: 20 }}>
              acertos totais na rodada
            </Text>

            {novasConquistas.length > 0 && (
              <View style={styles.novasConquistasBox}>
                <Text style={styles.novasConquistasTitulo}>
                  🎉 Conquistas desbloqueadas!
                </Text>
                {novasConquistas.map((c) => (
                  <Text key={c.id} style={styles.novaConquistaItem}>
                    {c.emoji} {c.nome}
                  </Text>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={() => setFase("selecao")}
            >
              <Text style={styles.buttonText}>Nova Rodada</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── FASE: JOGANDO ── */}
        {fase === "jogando" && (
          <View style={styles.quizContainer}>
            <View style={styles.quizHeaderRow}>
              <View
                style={[
                  styles.diffBadge,
                  dificuldadeAtual === "easy"
                    ? styles.badgeEasy
                    : dificuldadeAtual === "medium"
                      ? styles.badgeMedium
                      : styles.badgeHard,
                ]}
              >
                <Text style={styles.diffBadgeText}>
                  {LABELS_DIFICULDADE[dificuldadeAtual]}
                </Text>
              </View>

              {sequenciaAtual >= 2 && (
                <View style={styles.sequenciaBadge}>
                  <Text style={styles.sequenciaText}>
                    🔥 {sequenciaAtual} seguidas!
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.questionCounter}>
              Pergunta {perguntaAtual + 1} de {currentBatch.length}
            </Text>
            <Text style={styles.questionText}>{pergunta?.pergunta}</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.optionsContainer}
            >
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
            </ScrollView>

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

      {/* ── MODAL DE CONQUISTAS ── */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>🏆 Conquistas & Rank</Text>
              <Text style={styles.modalSubtitulo}>
                {totalConquistas} de {CONQUISTAS.length} desbloqueadas
              </Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      `${(totalConquistas / CONQUISTAS.length) * 100}%` as any,
                  },
                ]}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {CONQUISTAS.map((c) => {
                const desbloqueada = conquistasDesbloq.includes(c.id);
                return (
                  <View
                    key={c.id}
                    style={[
                      styles.conquistaItem,
                      !desbloqueada && styles.conquistaBloqueada,
                    ]}
                  >
                    <Text
                      style={[
                        styles.conquistaEmoji,
                        !desbloqueada && { opacity: 0.3 },
                      ]}
                    >
                      {c.emoji}
                    </Text>
                    <View style={styles.conquistaInfo}>
                      <Text
                        style={[
                          styles.conquistaNome,
                          !desbloqueada && styles.conquistaTextoBloq,
                        ]}
                      >
                        {desbloqueada ? c.nome : "???"}
                      </Text>
                      <Text style={styles.conquistaDesc}>
                        {desbloqueada
                          ? c.desc
                          : "Continue jogando para desbloquear"}
                      </Text>
                    </View>
                    {desbloqueada && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#4DB6AC"
                      />
                    )}
                  </View>
                );
              })}
              <View style={styles.modalStats}>
                <Text style={styles.modalStatsTitle}>📊 Suas Estatísticas</Text>
                <Text style={styles.modalStatItem}>
                  Patente Atual: {rankAtual.icone} {rankAtual.titulo}
                </Text>
                <Text style={styles.modalStatItem}>
                  Perguntas Acertadas: {perguntasAcertadas.length}
                </Text>
                <Text style={styles.modalStatItem}>
                  Rodadas jogadas: {rodadasTotal}
                </Text>
                <Text style={styles.modalStatItem}>
                  Pontuação total: {globalScore}
                </Text>
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
  // FÁCIL
  {
    difficulty: "easy",
    pergunta: "Qual é o maior planeta do Sistema Solar?",
    opcoes: ["Saturno", "Júpiter", "Urano", "Netuno"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Júpiter",
  },
  {
    difficulty: "easy",
    pergunta: "Qual planeta é conhecido como o Planeta Vermelho?",
    opcoes: ["Vênus", "Mercúrio", "Marte", "Júpiter"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Marte",
  },
  {
    difficulty: "easy",
    pergunta: "Qual é a estrela mais próxima da Terra?",
    opcoes: ["Sirius", "Próxima Centauri", "Sol", "Betelgeuse"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Sol",
  },
  {
    difficulty: "easy",
    pergunta: "Qual planeta tem os anéis mais visíveis do Sistema Solar?",
    opcoes: ["Júpiter", "Urano", "Saturno", "Netuno"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Saturno",
  },
  {
    difficulty: "easy",
    pergunta: "Qual missão levou o primeiro homem à Lua?",
    opcoes: ["Apollo 10", "Apollo 11", "Apollo 13", "Gemini 7"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Apollo 11",
  },
  {
    difficulty: "easy",
    pergunta: "Qual é o nome da galáxia em que vivemos?",
    opcoes: ["Andrômeda", "Sombrero", "Cartwheel", "Via Láctea"],
    respostaCerta: 3,
    explicacao: "A resposta correta é: Via Láctea",
  },
  {
    difficulty: "easy",
    pergunta: "Quantos planetas existem no Sistema Solar?",
    opcoes: ["7", "8", "9", "10"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: 8 planetas",
  },
  {
    difficulty: "easy",
    pergunta: "Qual planeta é o mais próximo do Sol?",
    opcoes: ["Vênus", "Terra", "Marte", "Mercúrio"],
    respostaCerta: 3,
    explicacao: "A resposta correta é: Mercúrio",
  },
  {
    difficulty: "easy",
    pergunta: "O que a Lua é da Terra?",
    opcoes: [
      "Um planeta",
      "Um satélite natural",
      "Uma estrela",
      "Um asteroide",
    ],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Um satélite natural",
  },
  {
    difficulty: "easy",
    pergunta: "Qual é o planeta mais quente do Sistema Solar?",
    opcoes: ["Mercúrio", "Marte", "Júpiter", "Vênus"],
    respostaCerta: 3,
    explicacao: "A resposta correta é: Vênus, por seu efeito estufa extremo",
  },

  // MÉDIO
  {
    difficulty: "medium",
    pergunta: "Em que ano foi lançado o Telescópio Espacial Hubble?",
    opcoes: ["1985", "1990", "1995", "2000"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: 1990",
  },
  {
    difficulty: "medium",
    pergunta: "Qual constelação contém as famosas 'Três Marias'?",
    opcoes: ["Escorpião", "Ursa Maior", "Órion", "Cruzeiro do Sul"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Órion",
  },
  {
    difficulty: "medium",
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
    difficulty: "medium",
    pergunta: "Qual foi o primeiro satélite artificial enviado ao espaço?",
    opcoes: ["Explorer 1", "Vostok 1", "Sputnik 1", "Apollo 1"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Sputnik 1, em 1957",
  },
  {
    difficulty: "medium",
    pergunta: "O Telescópio James Webb foi lançado em qual ano?",
    opcoes: ["2018", "2019", "2021", "2023"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: 2021",
  },
  {
    difficulty: "medium",
    pergunta: "Qual é a constelação mais reconhecível do hemisfério sul?",
    opcoes: ["Órion", "Ursa Maior", "Cruzeiro do Sul", "Escorpião"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Cruzeiro do Sul",
  },
  {
    difficulty: "medium",
    pergunta: "A que velocidade a luz viaja no vácuo?",
    opcoes: ["150.000 km/s", "300.000 km/s", "450.000 km/s", "600.000 km/s"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: 300.000 km/s",
  },
  {
    difficulty: "medium",
    pergunta: "Qual é a galáxia mais próxima da Via Láctea?",
    opcoes: ["Sombrero", "Andrômeda", "Triângulo", "Cartwheel"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Andrômeda",
  },
  {
    difficulty: "medium",
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
    difficulty: "medium",
    pergunta: "Qual planeta orbita o Sol de lado, com inclinação de 98 graus?",
    opcoes: ["Netuno", "Saturno", "Urano", "Júpiter"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Urano",
  },

  // HARD
  {
    difficulty: "hard",
    pergunta: "Quantas luas tem Saturno?",
    opcoes: ["12", "27", "62", "146"],
    respostaCerta: 3,
    explicacao: "A resposta correta é: 146 luas confirmadas",
  },
  {
    difficulty: "hard",
    pergunta:
      "Qual lua de Júpiter é o corpo mais vulcanicamente ativo do Sistema Solar?",
    opcoes: ["Europa", "Ganimedes", "Io", "Calisto"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Io",
  },
  {
    difficulty: "hard",
    pergunta: "Qual cometa é famoso por passar perto da Terra a cada 75 anos?",
    opcoes: ["Halley", "Hale-Bopp", "Shoemaker-Levy", "Encke"],
    respostaCerta: 0,
    explicacao: "A resposta correta é: Halley",
  },
  {
    difficulty: "hard",
    pergunta: "Qual é o nome do buraco negro no centro da Via Láctea?",
    opcoes: ["Cygnus X-1", "M87*", "Sagitário A*", "NGC 1277"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Sagitário A*",
  },
  {
    difficulty: "hard",
    pergunta: "Qual lua de Saturno possui rios e lagos de metano líquido?",
    opcoes: ["Encélado", "Mimas", "Titã", "Reia"],
    respostaCerta: 2,
    explicacao: "A resposta correta é: Titã",
  },
  {
    difficulty: "hard",
    pergunta: "Qual sonda está agora no espaço interestelar?",
    opcoes: ["Pioneer 10", "Voyager 1", "New Horizons", "Cassini"],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Voyager 1, lançada em 1977",
  },
  {
    difficulty: "hard",
    pergunta: "Qual planeta tem os ventos mais rápidos do Sistema Solar?",
    opcoes: ["Júpiter", "Saturno", "Urano", "Netuno"],
    respostaCerta: 3,
    explicacao: "A resposta correta é: Netuno, com ventos de até 2.100 km/h",
  },
  {
    difficulty: "hard",
    pergunta: "O que é uma nebulosa planetária?",
    opcoes: [
      "Nebulosa ao redor de planeta",
      "Gás ejetado por estrela moribunda",
      "Nuvem de poeira interestelar",
      "Berçário de planetas",
    ],
    respostaCerta: 1,
    explicacao: "A resposta correta é: Gás ejetado por uma estrela moribunda",
  },
  {
    difficulty: "hard",
    pergunta: "Qual é a distância média da Terra ao Sol?",
    opcoes: ["1 ano-luz", "1 UA (149,6 mi km)", "384.400 km", "1 parsec"],
    respostaCerta: 1,
    explicacao:
      "A resposta correta é: 1 UA (Unidade Astronômica) = 149,6 milhões de km",
  },
  {
    difficulty: "hard",
    pergunta: "Qual é o tipo espectral da nossa estrela, o Sol?",
    opcoes: [
      "M (Anã Vermelha)",
      "A (Estrela Branca)",
      "G (Anã Amarela)",
      "O (Supergigante Azul)",
    ],
    respostaCerta: 2,
    explicacao: "A resposta correta é: G (Anã Amarela - Classe G2V)",
  },
];

// ─── STYLES ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#05050A",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  toast: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    zIndex: 999,
    backgroundColor: "#1A2E1A",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#4CAF50",
    elevation: 10,
  },
  toastEmoji: { fontSize: 28 },
  toastTitulo: { color: "#4CAF50", fontSize: 11, fontWeight: "bold" },
  toastNome: { color: "#FFF", fontSize: 14, fontWeight: "bold" },

  header: {
    paddingHorizontal: 15,
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.4)",
  },
  globalScoreText: { color: "#FFD700", fontWeight: "bold", fontSize: 14 },

  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  rankEmoji: { fontSize: 14, marginRight: 4 },
  rankText: { fontWeight: "bold", fontSize: 13 },

  trophyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(77,182,172,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(77,182,172,0.3)",
    gap: 6,
  },
  trophyEmoji: { fontSize: 14 },
  trophyCount: { color: "#4DB6AC", fontWeight: "bold", fontSize: 13 },

  selectionContainer: { flex: 1, justifyContent: "center", padding: 10 },
  selectionTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  selectionSubtitle: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  diffButton: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
  },
  diffEasy: { backgroundColor: "rgba(76,175,80,0.1)", borderColor: "#4CAF50" },
  diffMedium: {
    backgroundColor: "rgba(255,193,7,0.1)",
    borderColor: "#FFC107",
  },
  diffHard: { backgroundColor: "rgba(244,67,54,0.1)", borderColor: "#F44336" },
  diffButtonTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  diffButtonSubtitle: { color: "#CCC", fontSize: 14 },

  quizHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  diffBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeEasy: {
    backgroundColor: "rgba(76,175,80,0.15)",
    borderColor: "#4CAF50",
  },
  badgeMedium: {
    backgroundColor: "rgba(255,193,7,0.15)",
    borderColor: "#FFC107",
  },
  badgeHard: {
    backgroundColor: "rgba(244,67,54,0.15)",
    borderColor: "#F44336",
  },
  diffBadgeText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  sequenciaBadge: {
    backgroundColor: "rgba(255,100,0,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,100,0,0.4)",
  },
  sequenciaText: { color: "#FF6400", fontWeight: "bold", fontSize: 12 },

  container: { flex: 1, padding: 20, justifyContent: "center" },
  quizContainer: { flex: 1, justifyContent: "center" },
  questionCounter: {
    color: "#4DB6AC",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  questionText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  optionsContainer: { flex: 1, marginBottom: 20 },
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
    backgroundColor: "rgba(77,182,172,0.1)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(77,182,172,0.3)",
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
    marginBottom: 5,
  },
  novasConquistasBox: {
    backgroundColor: "rgba(77,182,172,0.1)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(77,182,172,0.3)",
  },
  novasConquistasTitulo: {
    color: "#4DB6AC",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 8,
    textAlign: "center",
  },
  novaConquistaItem: { color: "#FFF", fontSize: 14, marginBottom: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#0D1117",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: { marginBottom: 16 },
  modalTitulo: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  modalSubtitulo: { color: "#888", fontSize: 13, marginTop: 2 },
  modalClose: { position: "absolute", right: 0, top: 0, padding: 4 },
  progressBar: {
    height: 6,
    backgroundColor: "#1A1A2E",
    borderRadius: 3,
    marginBottom: 20,
  },
  progressFill: { height: 6, backgroundColor: "#4DB6AC", borderRadius: 3 },
  conquistaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#222",
  },
  conquistaBloqueada: { opacity: 0.5 },
  conquistaEmoji: { fontSize: 28, marginRight: 14 },
  conquistaInfo: { flex: 1 },
  conquistaNome: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  conquistaTextoBloq: { color: "#888" },
  conquistaDesc: { color: "#888", fontSize: 12, marginTop: 2 },

  modalStats: {
    marginTop: 20,
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#222",
  },
  modalStatsTitle: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  modalStatItem: { color: "#CCC", fontSize: 14, marginBottom: 6 },
});
