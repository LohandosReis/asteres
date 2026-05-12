import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ─── APOD API (chave gratuita em api.nasa.gov) ───────────────────
const NASA_API_KEY = "DEMO_KEY";

// ─── TRADUÇÃO via MyMemory (gratuita, sem chave) ─────────────────
const traduzir = async (texto: string): Promise<string> => {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      texto.slice(0, 500),
    )}&langpair=en|pt-BR`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText;
    return texto;
  } catch {
    return texto;
  }
};

// ─── CÁLCULOS ASTRONÔMICOS ────────────────────────────────────────

/** Posição orbital da Terra em relação ao Sol */
function calcularPosicaoTerra(date: Date) {
  const inicio = new Date(date.getFullYear(), 0, 1);
  const diaDoAno =
    Math.floor((date.getTime() - inicio.getTime()) / 86400000) + 1;

  // Periélio: ~3 de janeiro (dia 3). Excentricidade: 0.0167
  const anomaliaMedia = (((diaDoAno - 3 + 365) % 365) / 365) * 2 * Math.PI;
  const e = 0.0167;
  const a = 149.598; // milhões de km (1 UA)
  const distancia = a * (1 - e * Math.cos(anomaliaMedia));
  const distanciaUA = distancia / 149.598;

  // Ângulo a partir do equinócio vernal (20 de março ≈ dia 79)
  const anguloOrbital = (((diaDoAno - 79 + 365) % 365) / 365) * 360;

  // Velocidade orbital aproximada (29.8 km/s no periélio, varia com distância)
  const velocidade = (29.78 * (149.598 / distancia)).toFixed(2);

  return {
    distanciaKm: (distancia * 1_000_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 0,
    }),
    distanciaUA: distanciaUA.toFixed(4),
    anguloOrbital: anguloOrbital.toFixed(1),
    velocidadeKms: velocidade,
    diaDoAno,
    maisProximo:
      distanciaUA < 1 ? "Mais próxima do Sol" : "Mais distante do Sol",
  };
}

/** Fase da Lua baseada em lua nova de referência */
function calcularFaseLua(date: Date) {
  const referencia = new Date(2025, 0, 29); // lua nova conhecida
  const ciclo = 29.53059;
  const diff = (date.getTime() - referencia.getTime()) / 86400000;
  const fase = ((diff % ciclo) + ciclo) % ciclo;
  const iluminacao = Math.round(
    ((1 - Math.cos((fase / ciclo) * 2 * Math.PI)) / 2) * 100,
  );

  let nome = "";
  let emoji = "";
  if (fase < 1.85) {
    nome = "Lua Nova";
    emoji = "🌑";
  } else if (fase < 7.38) {
    nome = "Lua Crescente";
    emoji = "🌒";
  } else if (fase < 9.22) {
    nome = "Quarto Crescente";
    emoji = "🌓";
  } else if (fase < 14.77) {
    nome = "Lua Gibosa Crescente";
    emoji = "🌔";
  } else if (fase < 16.61) {
    nome = "Lua Cheia";
    emoji = "🌕";
  } else if (fase < 22.15) {
    nome = "Lua Gibosa Minguante";
    emoji = "🌖";
  } else if (fase < 23.99) {
    nome = "Quarto Minguante";
    emoji = "🌗";
  } else {
    nome = "Lua Minguante";
    emoji = "🌘";
  }

  const diasParaCheia =
    fase < 14.77 ? Math.round(14.77 - fase) : Math.round(ciclo - fase + 14.77);
  const diasParaNova = Math.round(ciclo - fase);

  return {
    nome,
    emoji,
    iluminacao,
    diasParaCheia,
    diasParaNova,
    diaNoFase: Math.round(fase),
  };
}

/** Estação do ano (Hemisfério Sul — Brasil) */
function calcularEstacao(date: Date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 12 && d >= 21) || m <= 2 || (m === 3 && d < 20))
    return { nome: "Verão", emoji: "☀️", proximo: "Outono em 20/Mar" };
  if ((m === 3 && d >= 20) || m <= 5 || (m === 6 && d < 21))
    return { nome: "Outono", emoji: "🍂", proximo: "Inverno em 21/Jun" };
  if ((m === 6 && d >= 21) || m <= 8 || (m === 9 && d < 22))
    return { nome: "Inverno", emoji: "❄️", proximo: "Primavera em 22/Set" };
  return { nome: "Primavera", emoji: "🌸", proximo: "Verão em 21/Dez" };
}

/** Próximos eventos astronômicos fixos do ano */
function proximosEventos(date: Date) {
  const ano = date.getFullYear();
  const eventos = [
    { data: new Date(ano, 2, 20), nome: "Equinócio de Outono", emoji: "🍂" },
    { data: new Date(ano, 5, 21), nome: "Solstício de Inverno", emoji: "❄️" },
    { data: new Date(ano, 8, 22), nome: "Equinócio de Primavera", emoji: "🌸" },
    { data: new Date(ano, 11, 21), nome: "Solstício de Verão", emoji: "☀️" },
    {
      data: new Date(ano + 1, 2, 20),
      nome: "Equinócio de Outono",
      emoji: "🍂",
    },
  ];
  return eventos
    .filter((e) => e.data > date)
    .slice(0, 3)
    .map((e) => {
      const dias = Math.ceil((e.data.getTime() - date.getTime()) / 86400000);
      return { ...e, dias, dataStr: e.data.toLocaleDateString("pt-BR") };
    });
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────
export default function ApodScreen() {
  const hoje = new Date();

  const [apodImage, setApodImage] = useState<string | null>(null);
  const [apodTitulo, setApodTitulo] = useState("");
  const [apodDescricao, setApodDescricao] = useState("");
  const [apodCopyright, setApodCopyright] = useState("");
  const [apodUrl, setApodUrl] = useState("");
  const [loadingApod, setLoadingApod] = useState(true);
  const [imageError, setImageError] = useState(false);

  const terra = calcularPosicaoTerra(hoje);
  const lua = calcularFaseLua(hoje);
  const estacao = calcularEstacao(hoje);
  const eventos = proximosEventos(hoje);

  const dataFormatada = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    buscarAPOD();
  }, []);

  const buscarAPOD = async () => {
    setLoadingApod(true);
    setImageError(false);
    try {
      const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`,
      );
      const data = await res.json();

      if (data.error) throw new Error(data.error.message);

      // Prefere a imagem HD quando disponível
      const imgUrl = data.hdurl || data.url;
      if (data.media_type === "video") {
        setApodImage(null); // vídeo: sem preview
      } else {
        setApodImage(imgUrl?.replace(/^http:\/\//i, "https://") || null);
      }

      setApodUrl(data.url || "");
      setApodCopyright(
        data.copyright
          ? `© ${data.copyright.trim()}`
          : "NASA / Domínio Público",
      );

      const [titulo, desc] = await Promise.all([
        traduzir(data.title || ""),
        traduzir(data.explanation || ""),
      ]);
      setApodTitulo(titulo);
      setApodDescricao(desc);
    } catch (err) {
      console.error("Erro APOD:", err);
      setApodTitulo("Foto Astronômica do Dia");
      setApodDescricao(
        "Não foi possível carregar a imagem de hoje. Verifique sua conexão.",
      );
    } finally {
      setLoadingApod(false);
    }
  };

  const fallbackImage =
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🔭 Hoje no Universo</Text>
          <Text style={styles.headerDate}>{dataFormatada}</Text>
        </View>
        <TouchableOpacity onPress={buscarAPOD} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color="#4DB6AC" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── FOTO DO DIA ── */}
        <View style={styles.apodContainer}>
          {loadingApod ? (
            <View style={styles.apodLoader}>
              <ActivityIndicator size="large" color="#4DB6AC" />
              <Text style={styles.loadingText}>Buscando foto do dia...</Text>
            </View>
          ) : (
            <Image
              source={{
                uri: imageError || !apodImage ? fallbackImage : apodImage,
              }}
              style={styles.apodImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          )}

          <View style={styles.apodOverlay}>
            <View style={styles.nasaBadge}>
              <Text style={styles.nasaBadgeText}>FOTO OFICIAL NASA • APOD</Text>
            </View>
            {apodCopyright ? (
              <Text style={styles.copyright}>{apodCopyright}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.content}>
          {/* ── TÍTULO E DESCRIÇÃO ── */}
          {!loadingApod && (
            <View style={styles.apodInfo}>
              <Text style={styles.apodTitulo}>{apodTitulo}</Text>
              <Text style={styles.apodDescricao}>{apodDescricao}</Text>
              {apodUrl ? (
                <TouchableOpacity onPress={() => Linking.openURL(apodUrl)}>
                  <Text style={styles.verOriginal}>Ver versão original ↗</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {/* ── POSIÇÃO DA TERRA ── */}
          <Text style={styles.sectionTitle}>🌍 Posição da Terra Hoje</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardItem}>
                <Text style={styles.cardLabel}>Distância do Sol</Text>
                <Text style={styles.cardValue}>{terra.distanciaUA} UA</Text>
                <Text style={styles.cardSub}>{terra.distanciaKm} km</Text>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardItem}>
                <Text style={styles.cardLabel}>Velocidade Orbital</Text>
                <Text style={styles.cardValue}>{terra.velocidadeKms} km/s</Text>
                <Text style={styles.cardSub}>em relação ao Sol</Text>
              </View>
            </View>
            <View style={styles.cardSeparator} />
            <View style={styles.cardRow}>
              <View style={styles.cardItem}>
                <Text style={styles.cardLabel}>Ângulo Orbital</Text>
                <Text style={styles.cardValue}>{terra.anguloOrbital}°</Text>
                <Text style={styles.cardSub}>do equinócio vernal</Text>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardItem}>
                <Text style={styles.cardLabel}>Dia do Ano</Text>
                <Text style={styles.cardValue}>{terra.diaDoAno}°</Text>
                <Text style={styles.cardSub}>{terra.maisProximo}</Text>
              </View>
            </View>
          </View>

          {/* ── ESTAÇÃO E LUA ── */}
          <View style={styles.rowCards}>
            {/* Estação */}
            <View style={[styles.card, styles.halfCard]}>
              <Text style={styles.cardLabel}>Estação (Sul)</Text>
              <Text style={styles.bigEmoji}>{estacao.emoji}</Text>
              <Text style={styles.cardValue}>{estacao.nome}</Text>
              <Text style={styles.cardSub}>{estacao.proximo}</Text>
            </View>

            {/* Lua */}
            <View style={[styles.card, styles.halfCard]}>
              <Text style={styles.cardLabel}>Fase da Lua</Text>
              <Text style={styles.bigEmoji}>{lua.emoji}</Text>
              <Text style={styles.cardValue}>{lua.nome}</Text>
              <Text style={styles.cardSub}>{lua.iluminacao}% iluminada</Text>
            </View>
          </View>

          {/* ── DETALHES DA LUA ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitleInner}>🌙 Calendário Lunar</Text>
            <View style={styles.cardRow}>
              <View style={styles.cardItem}>
                <Text style={styles.cardLabel}>Dia no Ciclo</Text>
                <Text style={styles.cardValue}>{lua.diaNoFase}/29</Text>
                <Text style={styles.cardSub}>ciclo sinódico</Text>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardItem}>
                <Text style={styles.cardLabel}>Próxima Lua Cheia</Text>
                <Text style={styles.cardValue}>
                  em {lua.diasParaCheia} dias
                </Text>
                <Text style={styles.cardSub}>🌕 aguarde</Text>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardItem}>
                <Text style={styles.cardLabel}>Próxima Lua Nova</Text>
                <Text style={styles.cardValue}>em {lua.diasParaNova} dias</Text>
                <Text style={styles.cardSub}>🌑 aguarde</Text>
              </View>
            </View>
          </View>

          {/* ── PRÓXIMOS EVENTOS ── */}
          <Text style={styles.sectionTitle}>
            📅 Próximos Eventos Astronômicos
          </Text>
          {eventos.map((ev, i) => (
            <View key={i} style={styles.eventoCard}>
              <Text style={styles.eventoEmoji}>{ev.emoji}</Text>
              <View style={styles.eventoInfo}>
                <Text style={styles.eventoNome}>{ev.nome}</Text>
                <Text style={styles.eventoData}>{ev.dataStr}</Text>
              </View>
              <View style={styles.eventoDias}>
                <Text style={styles.eventoDiasNum}>{ev.dias}</Text>
                <Text style={styles.eventoDiasLabel}>dias</Text>
              </View>
            </View>
          ))}

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#05050A",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A2E",
  },
  headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  headerDate: { color: "#888", fontSize: 12, marginTop: 2 },
  refreshBtn: {
    backgroundColor: "rgba(77,182,172,0.1)",
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(77,182,172,0.3)",
  },

  apodContainer: {
    width: "100%",
    height: 280,
    backgroundColor: "#111",
    position: "relative",
  },
  apodLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: "#4DB6AC", fontSize: 13 },
  apodImage: { width: "100%", height: "100%" },
  apodOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  nasaBadge: {
    backgroundColor: "rgba(77,182,172,0.85)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  nasaBadgeText: { color: "#05050A", fontSize: 9, fontWeight: "bold" },
  copyright: { color: "rgba(255,255,255,0.7)", fontSize: 9 },

  content: { padding: 16 },

  apodInfo: {
    backgroundColor: "#1A1A2E",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#222",
  },
  apodTitulo: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },
  apodDescricao: {
    color: "#CCC",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "justify",
  },
  verOriginal: {
    color: "#4DB6AC",
    fontSize: 12,
    marginTop: 10,
    textDecorationLine: "underline",
  },

  sectionTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 4,
  },

  card: {
    backgroundColor: "#1A1A2E",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#222",
  },
  cardTitleInner: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-around" },
  cardSeparator: { height: 1, backgroundColor: "#222", marginVertical: 12 },
  cardDivider: { width: 1, backgroundColor: "#222" },
  cardItem: { flex: 1, alignItems: "center", paddingHorizontal: 4 },
  cardLabel: {
    color: "#888",
    fontSize: 10,
    marginBottom: 4,
    textAlign: "center",
  },
  cardValue: {
    color: "#4DB6AC",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardSub: { color: "#666", fontSize: 10, marginTop: 2, textAlign: "center" },

  rowCards: { flexDirection: "row", gap: 12, marginBottom: 0 },
  halfCard: { flex: 1, alignItems: "center" },
  bigEmoji: { fontSize: 36, marginVertical: 6 },

  eventoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#222",
  },
  eventoEmoji: { fontSize: 28, marginRight: 14 },
  eventoInfo: { flex: 1 },
  eventoNome: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  eventoData: { color: "#888", fontSize: 12, marginTop: 2 },
  eventoDias: {
    alignItems: "center",
    backgroundColor: "rgba(77,182,172,0.1)",
    padding: 8,
    borderRadius: 10,
    minWidth: 52,
  },
  eventoDiasNum: { color: "#4DB6AC", fontSize: 20, fontWeight: "bold" },
  eventoDiasLabel: { color: "#4DB6AC", fontSize: 9 },
});
