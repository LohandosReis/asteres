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

export default function NewsScreen() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Assim que a tela abrir, ele busca as notícias reais
  useEffect(() => {
    buscarNoticiasEspaciais();
  }, []);

  const buscarNoticiasEspaciais = async () => {
    try {
      // API oficial de notícias espaciais (traz as 15 mais recentes)
      const response = await fetch(
        "https://api.spaceflightnewsapi.net/v4/articles/?limit=15",
      );
      const data = await response.json();

      setNoticias(data.results);
    } catch (error) {
      console.log("Erro ao buscar notícias: ", error);
      // Se der erro de internet, você pode setar aquele array manual aqui como "Plano B"
    } finally {
      setLoading(false);
    }
  };

  // Função que abre a notícia completa no navegador do celular
  const abrirNoticia = async (url: string) => {
    const suportado = await Linking.canOpenURL(url);
    if (suportado) {
      await Linking.openURL(url);
    } else {
      console.log("Não foi possível abrir o link da notícia: " + url);
    }
  };

  // Formatador de data simples para deixar o visual mais limpo
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notícias Espaciais</Text>
        </View>

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
            renderItem={({ item }) => (
              // O onPress chama a função para abrir o link da notícia
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
                  <Text style={styles.newsTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  {/* Opcional: Mostra um resuminho da notícia antes de clicar */}
                  <Text style={styles.newsSummary} numberOfLines={2}>
                    {item.summary}
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
  header: { marginBottom: 20, marginTop: 10 },
  title: { color: "#FFF", fontSize: 28, fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#4DB6AC", marginTop: 10, fontSize: 16 },
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
