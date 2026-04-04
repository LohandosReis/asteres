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

const planetasData: Record<string, any> = {
  mercurio: {
    nome: "Mercúrio",
    tipo: "Planeta Rochoso",
    desc: "O menor planeta do sistema solar e o mais próximo do Sol.",
    curiosidades: ["Não tem luas.", "Um ano dura apenas 88 dias terrestres."],
  },
  venus: {
    nome: "Vênus",
    tipo: "Planeta Rochoso",
    desc: "O planeta mais quente do sistema solar devido ao efeito estufa.",
    curiosidades: [
      "Gira no sentido horário.",
      "Pressão atmosférica 90x maior que a da Terra.",
    ],
  },
  terra: {
    nome: "Terra",
    tipo: "Planeta Rochoso",
    desc: "Nosso lar, o único lugar conhecido no universo com vida.",
    curiosidades: [
      "71% de sua superfície é água.",
      "Possui um campo magnético protetor.",
    ],
  },
  marte: {
    nome: "Marte",
    tipo: "Planeta Rochoso",
    desc: "O planeta vermelho, lar do maior vulcão do sistema solar.",
    curiosidades: ["Tem gelo nos polos.", "A atmosfera é composta 95% de CO2."],
  },
  jupiter: {
    nome: "Júpiter",
    tipo: "Gigante Gasoso",
    desc: "O maior planeta, com uma massa duas vezes maior que todos os outros juntos.",
    curiosidades: [
      "Tem 95 luas.",
      "A Grande Mancha Vermelha é uma tempestade gigante.",
    ],
  },
  saturno: {
    nome: "Saturno",
    tipo: "Gigante Gasoso",
    desc: "Famoso por seu espetacular sistema de anéis de gelo e rocha.",
    curiosidades: [
      "Flutuaria se houvesse um oceano grande o suficiente.",
      "A lua Titã tem atmosfera densa.",
    ],
  },
  urano: {
    nome: "Urano",
    tipo: "Gigante de Gelo",
    desc: "Um gigante gelado que orbita o sol de lado.",
    curiosidades: ["A temperatura cai para -224°C.", "Tem 27 luas conhecidas."],
  },
  netuno: {
    nome: "Netuno",
    tipo: "Gigante de Gelo",
    desc: "O planeta mais distante do Sol, conhecido por seus ventos fortes.",
    curiosidades: [
      "Ventos chegam a 2.100 km/h.",
      "Sua cor azul vem do metano.",
    ],
  },
};

export default function Detail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // SUA KEY DA NASA
  const NASA_API_KEY = "cpbdC3dZ268gOVortguzZgqUfbKGDodrnV4rYO68";

  const item = planetasData[id as string] || planetasData.mercurio;

  useEffect(() => {
    const fetchNasaImage = async () => {
      setLoading(true);
      try {
        // 1. MAPEAMENTO DE BUSCA REFINADA (Termos que a NASA entende perfeitamente)
        const searchTerms: Record<string, string> = {
          mercurio: "Mercury planet Messenger mission global",
          venus: "Venus planet global view Magellan",
          terra: "Earth Blue Marble Apollo 17",
          marte: "Mars planet global view",
          jupiter: "Jupiter planet Juno mission",
          saturno: "Saturno planet Cassini mission rings",
          urano: "Uranus planet Voyager 2",
          netuno: "Neptune planet Voyager 2",
        };

        // Seleciona o termo baseado no ID ou usa um padrão
        const searchTerm = searchTerms[id as string] || `${id} planet globe`;

        // 2. URL COM FILTROS DE QUALIDADE
        const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(
          searchTerm,
        )}&media_type=image&description=planet`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.collection.items.length > 0) {
          // 3. SELEÇÃO INTELIGENTE
          const items = data.collection.items;

          // Tentamos encontrar uma imagem que tenha 'planet' na descrição para evitar lixo
          const bestImage =
            items.find((i: any) =>
              i.data[0].description?.toLowerCase().includes("planet"),
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

          <Text style={styles.sectionTitle}>Curiosidades</Text>
          {item.curiosidades.map((c: string, i: number) => (
            <Text key={i} style={styles.curiosidade}>
              • {c}
            </Text>
          ))}

          <Text style={styles.apiCredit}>
            Arquivo NASA: {id?.toString().toUpperCase()} {"\n"}
            Busca refinada aplicada para este astro.
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
