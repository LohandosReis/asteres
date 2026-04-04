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

const constData: Record<string, any> = {
  cruzeiro: {
    nome: "Cruzeiro do Sul",
    tipo: "Constelação do Hemisfério Sul",
    desc: "A menor das 88 constelações modernas, mas uma das mais famosas, usada há séculos para navegação.",
    curiosidades: [
      "Está presente na bandeira do Brasil.",
      "A estrela mais brilhante é a Acrux.",
      "Ajuda a localizar o polo sul celestial.",
    ],
  },
  // Se quiser adicionar mais depois, como Orion:
  orion: {
    nome: "Órion",
    tipo: "Constelação Equatorial",
    desc: "Uma das constelações mais reconhecíveis do céu noturno, lar das famosas Três Marias.",
    curiosidades: [
      "Contém a supergigante vermelha Betelgeuse.",
      "Visível em praticamente todo o mundo.",
    ],
  },
};

export default function ConstDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // SUA KEY DA NASA
  const NASA_API_KEY = "cpbdC3dZ268gOVortguzZgqUfbKGDodrnV4rYO68";

  const item = constData[id as string] || constData.cruzeiro;

  useEffect(() => {
    const fetchNasaImage = async () => {
      setLoading(true);
      try {
        // 1. MAPEAMENTO DE BUSCA PARA CONSTELAÇÕES
        // A NASA cataloga as constelações pelos seus nomes científicos/em inglês.
        const searchTerms: Record<string, string> = {
          cruzeiro: "Crux constellation Southern Cross",
          orion: "Orion constellation nebula",
          ursamaior: "Ursa Major constellation Big Dipper",
        };

        // Usa o termo mapeado ou um padrão se a constelação não estiver na lista
        const searchTerm = searchTerms[id as string] || `${id} constellation`;

        // 2. URL DE BUSCA
        const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(
          searchTerm,
        )}&media_type=image`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.collection.items.length > 0) {
          // 3. SELEÇÃO DA IMAGEM
          const items = data.collection.items;

          // Tentamos achar uma imagem que mencione constelação para evitar fotos de foguetes com esse nome
          const bestImage =
            items.find(
              (i: any) =>
                i.data[0].description
                  ?.toLowerCase()
                  .includes("constellation") ||
                i.data[0].title?.toLowerCase().includes("constellation"),
            ) || items[0];

          const imageUrl = bestImage.links[0].href;
          setNasaImage(imageUrl);
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
            <ActivityIndicator
              size="large"
              color="#4DB6AC"
              style={styles.loader}
            />
          ) : (
            <Image
              source={{ uri: nasaImage || "https://via.placeholder.com/800" }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.nome}</Text>
          <Text style={styles.subtitle}>{item.tipo}</Text>

          <View style={styles.nasaBadge}>
            <Text style={styles.nasaBadgeText}>IMAGEM OFICIAL NASA</Text>
          </View>

          <Text style={styles.desc}>{item.desc}</Text>

          <Text style={styles.sectionTitle}>História e Astronomia</Text>
          {item.curiosidades.map((c: string, i: number) => (
            <Text key={i} style={styles.curiosidade}>
              ★ {c}
            </Text>
          ))}

          <Text style={styles.apiCredit}>
            Arquivo NASA: Constelações {"\n"}
            Termo buscado no catálogo oficial.
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
  imageContainer: {
    width: "100%",
    height: 400,
    backgroundColor: "#111",
    justifyContent: "center",
  },
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
  desc: { color: "#CCC", fontSize: 16, lineHeight: 26 },
  sectionTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 10,
  },
  curiosidade: { color: "#E0E0E0", fontSize: 15, marginBottom: 8 },
  apiCredit: {
    color: "#444",
    fontSize: 11,
    marginTop: 30,
    fontStyle: "italic",
    lineHeight: 18,
  },
});
