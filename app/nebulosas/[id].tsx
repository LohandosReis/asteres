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
  orion: {
    nome: "Nebulosa de Órion",
    tipo: "Nebulosa de Emissão",
    desc: "Uma das nebulosas mais famosas e visíveis a olho nu, localizada a 1.344 anos-luz da Terra.",
    curiosidades: [
      "É uma das regiões de formação estelar mais estudadas.",
      "Tem cerca de 24 anos-luz de diâmetro.",
    ],
  },
  carina: {
    nome: "Nebulosa de Carina",
    tipo: "Nebulosa de Emissão e Reflexão",
    desc: "Uma das maiores e mais brilhantes nebulosas do céu, lar de algumas das estrelas mais massivas conhecidas.",
    curiosidades: [
      "É quatro vezes maior que a Nebulosa de Órion.",
      "Contém a hipergigante Eta Carinae, uma das estrelas mais luminosas da galáxia.",
    ],
  },
};

export default function Detail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const NASA_API_KEY = "cpbdC3dZ268gOVortguzZgqUfbKGDodrnV4rYO68";
  const item = planetasData[id as string] || planetasData.orion;

  useEffect(() => {
    const fetchNasaImage = async () => {
      setLoading(true);
      try {
        const searchTerms: Record<string, string> = {
          orion: "Orion Nebula Hubble Space Telescope",
          carina: "Carina Nebula Hubble James Webb",
        };

        const searchTerm = searchTerms[id as string] || `${id} nebula`;
        const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(
          searchTerm,
        )}&media_type=image`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.collection.items.length > 0) {
          const items = data.collection.items;
          const bestImage =
            items.find((i: any) =>
              i.data[0].description?.toLowerCase().includes("nebula"),
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

// COMPONENTE BLINDADO DE IMAGEM
const SafeNasaImage = ({ uri, style }: { uri: string | null; style: any }) => {
  const [imageError, setImageError] = React.useState(false);
  const fallbackImage =
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800";
  const secureUri = uri
    ? uri.replace(/^http:\/\//i, "https://")
    : fallbackImage;
  const finalUri = imageError ? fallbackImage : secureUri;

  return (
    <Image
      source={{ uri: finalUri }}
      style={style}
      resizeMode="cover"
      onError={() => setImageError(true)}
    />
  );
};