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

// IDs fixos da NASA — garante a imagem correta para cada planeta
const NASA_FIXED_IDS: Record<string, string> = {
  mercurio: "PIA15162",
  venus: "PIA00271",
  terra: "GSFC_20171208_Archive_e001589",
  marte: "PIA00407",
  jupiter: "PIA21775",
  saturno: "PIA17172",
  urano: "PIA18182",
  netuno: "PIA01492",
};

export default function Detail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const NASA_API_KEY = "cpbdC3dZ268gOVortguzZgqUfbKGDodrnV4rYO68";
  const item = planetasData[id as string] || planetasData.mercurio;

  useEffect(() => {
    const fetchNasaImage = async () => {
      setLoading(true);
      try {
        const nasaId = NASA_FIXED_IDS[id as string];

        if (nasaId) {
          // Busca o manifesto do asset para pegar a imagem em alta resolução
          const assetRes = await fetch(
            `https://images-api.nasa.gov/asset/${nasaId}`,
          );
          const assetData = await assetRes.json();

          const items: string[] = assetData.collection.items.map(
            (i: any) => i.href,
          );

          // Prioriza imagem original ou grande
          const largeImg =
            items.find((href) => href.includes("~orig.")) ||
            items.find((href) => href.includes("~large.")) ||
            items.find(
              (href) => href.endsWith(".jpg") || href.endsWith(".png"),
            ) ||
            items[0];

          if (largeImg) {
            setNasaImage(largeImg.replace(/^http:\/\//i, "https://"));
            return;
          }
        }

        // Fallback: busca por texto caso o ID fixo falhe
        const searchTerms: Record<string, string> = {
          mercurio: "Mercury planet Messenger mission global",
          venus: "Venus planet global view Magellan",
          terra: "Earth Blue Marble Apollo 17",
          marte: "Mars planet global view",
          jupiter: "Jupiter planet Juno mission",
          saturno: "Saturn planet Cassini mission rings",
          urano: "Uranus planet Voyager 2",
          netuno: "Neptune planet Voyager 2",
        };

        const searchTerm = searchTerms[id as string] || `${id} planet globe`;
        const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(
          searchTerm,
        )}&media_type=image&description=planet`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.collection.items.length > 0) {
          const items = data.collection.items;
          const bestImage =
            items.find((i: any) =>
              i.data[0].description?.toLowerCase().includes("planet"),
            ) || items[0];

          // Tenta pegar versão grande pelo ID
          try {
            const nasaIdFromSearch = bestImage.data[0].nasa_id;
            const assetRes2 = await fetch(
              `https://images-api.nasa.gov/asset/${nasaIdFromSearch}`,
            );
            const assetData2 = await assetRes2.json();
            const items2: string[] = assetData2.collection.items.map(
              (i: any) => i.href,
            );
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

          // Último recurso: thumbnail da busca
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
            <ActivityIndicator
              size="large"
              color="#4DB6AC"
              style={styles.loader}
            />
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

// COMPONENTE BLINDADO DE IMAGEM — evita tela preta
const SafeNasaImage = ({ uri, style }: { uri: string | null; style: any }) => {
  const [imageError, setImageError] = React.useState(false);

  const fallbackImage =
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80";

  const secureUri = uri
    ? uri.replace(/^http:\/\//i, "https://")
    : fallbackImage;

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
