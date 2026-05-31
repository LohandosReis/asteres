import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── TRADUÇÃO via MyMemory (gratuita, sem chave) ──────────────────
const traduzir = async (texto: string): Promise<string> => {
  if (!texto?.trim()) return texto;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      texto.slice(0, 500)
    )}&langpair=en|pt-BR`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText;
    return texto;
  } catch {
    return texto;
  }
};

// Traduz título + resumo em uma única requisição (economia de quota)
const traduzirNoticia = async (
  titulo: string,
  resumo: string
): Promise<{ tituloPT: string; resumoPT: string }> => {
  const separador = " ||| ";
  const combinado = `${titulo}${separador}${resumo}`;
  try {
    const traduzido = await traduzir(combinado);
    const partes = traduzido.split(separador);
    return {
      tituloPT: partes[0]?.trim() || titulo,
      resumoPT: partes[1]?.trim() || resumo,
    };
  } catch {
    return { tituloPT: titulo, resumoPT: resumo };
  }
};

type Noticia = {
  id: number;
  title: string;
  summary: string;
  image_url: string;
  url: string;
  news_site: string;
  published_at: string;
  tituloPT?: string;
  resumoPT?: string;
  traduzido?: boolean;
};

export default function NewsScreen() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [traduzindo, setTraduzindo] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [idioma, setIdioma] = useState<"pt" | "en">("pt");

  useEffect(() => {
    buscarNoticiasEspaciais();
  }, []);

  const buscarNoticiasEspaciais = async () => {
    setLoading(true);
    setProgresso(0);
    try {
      const response = await fetch(
        "https://api.spaceflightnewsapi.net/v4/articles/?limit=15"
      );
      const data = await response.json();
      const resultados: Noticia[] = data.results;

      // Mostra notícias em inglês imediatamente
      setNoticias(resultados);
      setLoading(false);

      // Traduz em background, 3 por vez para não sobrecarregar a API
      setTraduzindo(true);
      const tamanhoLote = 3;
      const noticiasComTrad = [...resultados];

      for (let i = 0; i < resultados.length; i += tamanhoLote) {
        const lote = resultados.slice(i, i + tamanhoLote);
        const traduzidas = await Promise.all(
          lote.map((n) => traduzirNoticia(n.title, n.summary))
        );
        traduzidas.forEach((t, j) => {
          noticiasComTrad[i + j] = {
            ...noticiasComTrad[i + j],
            tituloPT: t.tituloPT,
            resumoPT: t.resumoPT,
            traduzido: true,
          };
        });
        // Atualiza a lista progressivamente a cada lote
        setNoticias([...noticiasComTrad]);
        setProgresso(Math.min(i + tamanhoLote, resultados.length));
      }
    } catch (error) {
      console.log("Erro ao buscar notícias:", error);
    } finally {
      setLoading(false);
      setTraduzindo(false);
    }
  };

  const abrirNoticia = async (url: string) => {
    const suportado = await Linking.canOpenURL(url);
    if (suportado) await Linking.openURL(url);
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString("pt-BR");
  };

  const getTitulo = (item: Noticia) =>
    idioma === "pt" && item.tituloPT ? item.tituloPT : item.title;

  const getResumo = (item: Noticia) =>
    idioma === "pt" && item.resumoPT ? item.resumoPT : item.summary;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notícias Espaciais</Text>
            {traduzindo && (
              <Text style={styles.traduzindoText}>
                🌐 Traduzindo... {progresso}/{noticias.length}
              </Text>
            )}
          </View>

          {/* Botão PT / EN */}
          {!loading && (
            <TouchableOpacity
              style={styles.idiomaBtn}
              onPress={() => setIdioma(idioma === "pt" ? "en" : "pt")}
            >
              <Ionicons
                name="language"
                size={16}
                color="#4DB6AC"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.idiomaBtnText}>
                {idioma === "pt" ? "PT 🇧🇷" : "EN 🇺🇸"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── LOADING INICIAL ── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4DB6AC" />
            <Text style={styles.loadingText}>
              Buscando dados da NASA e agências...
            </Text>
          </View>
        ) : (
          <FlatList
            data={noticias}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              traduzindo ? (
                <View style={styles.footerTraduzindo}>
                  <ActivityIndicator size="small" color="#4DB6AC" />
                  <Text style={styles.footerTraduzindoText}>
                    Traduzindo notícias restantes...
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.newsCard}
                onPress={() => abrirNoticia(item.url)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.newsImage}
                />
                <View style={styles.newsInfo}>

                  {/* Badge de idioma por notícia */}
                  {idioma === "pt" && (
                    <View style={styles.tradBadge}>
                      {item.traduzido ? (
                        <>
                          <Ionicons name="checkmark-circle" size={11} color="#4DB6AC" />
                          <Text style={styles.tradBadgeText}> Traduzido</Text>
                        </>
                      ) : (
                        <>
                          <ActivityIndicator size={10} color="#888" />
                          <Text style={[styles.tradBadgeText, { color: "#888" }]}> Traduzindo...</Text>
                        </>
                      )}
                    </View>
                  )}

                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {getTitulo(item)}
                  </Text>

                  <Text style={styles.newsSummary} numberOfLines={2}>
                    {getResumo(item)}
                  </Text>

                  <View style={styles.newsMeta}>
                    <Text style={styles.newsSource}>{item.news_site}</Text>
                    <Text style={styles.newsDate}>
                      {formatarData(item.published_at)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
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
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 10,
  },
  title: { color: "#FFF", fontSize: 28, fontWeight: "bold" },
  traduzindoText: { color: "#4DB6AC", fontSize: 11, marginTop: 4 },

  idiomaBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(77,182,172,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(77,182,172,0.3)",
    marginTop: 4,
  },
  idiomaBtnText: { color: "#4DB6AC", fontSize: 13, fontWeight: "bold" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#4DB6AC", marginTop: 10, fontSize: 16 },

  footerTraduzindo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  footerTraduzindoText: { color: "#888", fontSize: 13 },

  newsCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2A2A3E",
  },
  newsImage: { width: "100%", height: 180, backgroundColor: "#2A2A3E" },
  newsInfo: { padding: 15 },

  tradBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  tradBadgeText: { color: "#4DB6AC", fontSize: 10 },

  newsTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    lineHeight: 24,
  },
  newsSummary: {
    color: "#A0A0B0",
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  newsMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsSource: { color: "#4DB6AC", fontSize: 14, fontWeight: "bold" },
  newsDate: { color: "#888", fontSize: 12 },
});