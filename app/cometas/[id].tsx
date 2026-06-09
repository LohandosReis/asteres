import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const cometasData: Record<string, any> = {
  halley: {
    nome: "Cometa Halley",
    tipo: "Cometa Periódico",
    desc: "Talvez o cometa mais famoso do mundo, visível a olho nu da Terra a cada 75-76 anos.",
    orbita: "Elíptica e retrógrada, levando cerca de 75.3 anos para completar uma volta ao redor do Sol.",
    tamanho: "Aproximadamente 15 km de comprimento por 8 km de largura.",
    constituicao: "Gelo de água, monóxido de carbono, metano, amônia, poeira e rocha carbonácea.",
    curiosidades: [
      "Sua última aparição foi em 1986 e a próxima será em meados de 2061.",
      "A missão Giotto da ESA chegou incrivelmente perto e fotografou seu núcleo escuro.",
    ],
  },
  halebopp: {
    nome: "Cometa Hale-Bopp",
    tipo: "Cometa de Longo Período",
    desc: "Um dos cometas mais observados do século XX, permanecendo visível a olho nu por impressionantes 18 meses.",
    orbita: "Altamente elíptica, com um período orbital estimado em aproximadamente 2.500 anos.",
    tamanho: "Seu núcleo gigante possui cerca de 60 km de diâmetro.",
    constituicao: "Altas concentrações de monóxido de carbono congelado, gelo e silicatos.",
    curiosidades: [
      "Foi descoberto independentemente por Alan Hale e Thomas Bopp em 1995.",
      "Sua cauda de íons de sódio brilhava intensamente no céu noturno.",
    ],
  },
  neowise: {
    nome: "Cometa NEOWISE",
    tipo: "Cometa de Longo Período",
    desc: "Descoberto em 2020 pelo telescópio espacial WISE, tornou-se um espetáculo visível a olho nu em todo o planeta.",
    orbita: "Quase parabólica, com um período de órbita estimado em cerca de 6.800 anos.",
    tamanho: "Seu núcleo mede aproximadamente 5 km de diâmetro.",
    constituicao: "Mistura densa de poeira cósmica, rochas e gases congelados remanescentes da formação do Sistema Solar.",
    curiosidades: [
      "Sobreviveu à sua aproximação máxima com o Sol (periélio) sem se despedaçar.",
      "Foi amplamente fotografado por astronautas a bordo da Estação Espacial Internacional.",
    ],
  },
};

// IDs fixos da NASA para os cometas
const NASA_FIXED_IDS: Record<string, string> = {
  halley: "PIA00245",
  halebopp: "PIA01299",
  neowise: "GSFC_20200723_pages_000045",
};

export default function DetailCometas() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const item = cometasData[id as string] || cometasData.halley;

  useEffect(() => {
    const fetchNasaImage = async () => {
      setLoading(true);
      try {
        const nasaId = NASA_FIXED_IDS[id as string];

        if (nasaId) {
          const assetRes = await fetch(`https://images-api.nasa.gov/asset/${nasaId}`);
          const assetData = await assetRes.json();
          const items: string[] = assetData.collection.items.map((i: any) => i.href);

          const largeImg =
            items.find((href) => href.includes("~orig.")) ||
            items.find((href) => href.includes("~large.")) ||
            items.find((href) => href.endsWith(".jpg") || href.endsWith(".png")) ||
            items[0];

          if (largeImg) {
            setNasaImage(largeImg.replace(/^http:\/\//i, "https://"));
            return;
          }
        }

        // Fallback de busca textual caso o ID falhe
        const searchTerm = `${item.nome} comet space`;
        const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchTerm)}&media_type=image`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.collection.items.length > 0) {
          const items = data.collection.items;
          const bestImage = items[0];

          try {
            const nasaIdFromSearch = bestImage.data[0].nasa_id;
            const assetRes2 = await fetch(`https://images-api.nasa.gov/asset/${nasaIdFromSearch}`);
            const assetData2 = await assetRes2.json();
            const items2: string[] = assetData2.collection.items.map((i: any) => i.href);
            const largeImg2 =
              items2.find((href) => href.includes("~orig.")) ||
              items2.find((href) => href.includes("~large.")) ||
              items2.find((href) => href.endsWith(".jpg")) ||
              items2[0];

            if (largeImg2) {
              setNasaImage(largeImg2.replace(/^http:\/\//i, "https://"));
              return;
            }
          } catch (_) {}

          const thumb = bestImage.links?.[0]?.href;
          if (thumb) setNasaImage(thumb.replace(/^http:\/\//i, "https://"));
        }
      } catch (error) {
        console.error("Erro ao buscar imagem da NASA:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNasaImage();
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#FFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#4DB6AC" style={styles.loader} />
          ) : (
            <SafeNasaImage uri={nasaImage} style={styles.image} />
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.nome}</Text>
          <Text style={styles.subtitle}>{item.tipo}</Text>

          <View style={styles.nasaBadge}>
            <Text style={styles.nasaBadgeText}>IMAGEM OFICIAL NASA</Text>
          </View>

          <Text style={styles.desc}>{item.desc}</Text>

          {/* Dados Técnicos customizados para Cometas */}
          <Text style={styles.sectionTitle}>Características Orbitais</Text>
          <Text style={styles.dadoTexto}><Text style={styles.boldLabel}>Órbita:</Text> {item.orbita}</Text>
          <Text style={styles.dadoTexto}><Text style={styles.boldLabel}>Tamanho:</Text> {item.tamanho}</Text>
          <Text style={styles.dadoTexto}><Text style={styles.boldLabel}>Constituição:</Text> {item.constituicao}</Text>

          <Text style={styles.sectionTitle}>Curiosidades</Text>
          {item.curiosidades.map((c: string, i: number) => (
            <Text key={i} style={styles.curiosidade}>• {c}</Text>
          ))}

          <Text style={styles.apiCredit}>
            Arquivo NASA: {id?.toString().toUpperCase()} {"\n"}
            Banco de dados integrado ao arquivo de imagens espaciais.
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#05050A" },
  back: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 30,
  },
  imageContainer: { width: "100%", height: 400, backgroundColor: "#111", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  loader: { alignSelf: "center" },
  content: { padding: 20 },
  title: { color: "#FFF", fontSize: 32, fontWeight: "bold" },
  subtitle: { color: "#4DB6AC", fontSize: 18, marginBottom: 10 },
  nasaBadge: {
    backgroundColor: "rgba(77, 182, 172, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 172, 0.3)",
  },
  nasaBadgeText: { color: "#4DB6AC", fontSize: 10, fontWeight: "bold" },
  desc: { color: "#CCC", fontSize: 16, lineHeight: 26, marginBottom: 10 },
  sectionTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginTop: 25, marginBottom: 10 },
  dadoTexto: { color: "#E0E0E0", fontSize: 15, lineHeight: 22, marginBottom: 6 },
  boldLabel: { color: "#4DB6AC", fontWeight: "bold" },
  curiosidade: { color: "#E0E0E0", fontSize: 15, marginBottom: 8 },
  apiCredit: { color: "#444", fontSize: 11, marginTop: 30, fontStyle: "italic", lineHeight: 18 },
});

const SafeNasaImage = ({ uri, style }: { uri: string | null; style: any }) => {
  const [imageError, setImageError] = React.useState(false);
  const fallbackImage = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80";
  const secureUri = uri ? uri.replace(/^http:\/\//i, "https://") : fallbackImage;
  const finalUri = imageError || !uri ? fallbackImage : secureUri;

  return (
    <Image
      source={{ uri: finalUri }}
      style={style}
      resizeMode="cover"
      onError={() => setImageError(true)}
    />
  );
};