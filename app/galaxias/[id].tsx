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

const galaxiasData: Record<string, any> = {
  andromeda: {
    nome: "Andrômeda (M31)",
    tipo: "Galáxia Espiral",
    desc: "A galáxia espiral mais próxima da nossa Via Láctea. Ela é tão grande que contém cerca de um trilhão de estrelas.",
    curiosidades: [
      "Vai colidir com a Via Láctea em 4 bilhões de anos.",
      "É visível a olho nu em locais escuros.",
      "Está a 2,5 milhões de anos-luz de distância.",
    ],
  },
  vialactea: {
    nome: "Via Láctea",
    tipo: "Galáxia Espiral Barrada",
    desc: "Nossa casa no universo. Uma coleção massiva de estrelas, gás e poeira, com um buraco negro supermassivo no centro.",
    curiosidades: [
      "Tem cerca de 13,6 bilhões de anos.",
      "O Sol leva 230 milhões de anos para dar uma volta nela.",
      "Contém entre 100 e 400 bilhões de estrelas.",
    ],
  },
  sombrero: {
    nome: "Galáxia Sombrero (M104)",
    tipo: "Galáxia Espiral",
    desc: "Uma das galáxias mais fotogênicas do universo, com um bojo central brilhante e uma faixa de poeira escura que lembra um chapéu mexicano.",
    curiosidades: [
      "Está a 28 milhões de anos-luz da Terra.",
      "Tem um buraco negro supermassivo no centro.",
      "É uma das galáxias mais luminosas próximas a nós.",
    ],
  },
  redemoinho: {
    nome: "Galáxia Redemoinho (M51)",
    tipo: "Galáxia Espiral",
    desc: "Uma galáxia espiral interagindo com sua companheira NGC 5195. Foi a primeira galáxia a ter sua estrutura espiral identificada.",
    curiosidades: [
      "Está a cerca de 23 milhões de anos-luz.",
      "Interage gravitacionalmente com NGC 5195.",
      "Tem intensas regiões de formação estelar.",
    ],
  },
  triangulo: {
    nome: "Galáxia do Triângulo (M33)",
    tipo: "Galáxia Espiral",
    desc: "A terceira maior galáxia do Grupo Local, depois da Via Láctea e Andrômeda. Possui regiões de formação estelar muito ativas.",
    curiosidades: [
      "Está a 2,7 milhões de anos-luz.",
      "Contém cerca de 40 bilhões de estrelas.",
      "É um dos objetos mais distantes visíveis a olho nu.",
    ],
  },
  centauroA: {
    nome: "Centaurus A (NGC 5128)",
    tipo: "Galáxia Elíptica",
    desc: "Uma das galáxias mais estudadas do céu, famosa por seu jato relativístico emitido pelo buraco negro central.",
    curiosidades: [
      "Está a apenas 13 milhões de anos-luz.",
      "Emite fortíssimas ondas de rádio.",
      "Seu buraco negro tem 55 milhões de massas solares.",
    ],
  },
  magalhaesgr: {
    nome: "Grande Nuvem de Magalhães",
    tipo: "Galáxia Irregular",
    desc: "Uma galáxia satélite da Via Láctea, visível a olho nu no hemisfério sul. É um laboratório natural para o estudo da formação estelar.",
    curiosidades: [
      "Está a apenas 160 mil anos-luz.",
      "Contém a Nebulosa da Tarântula, a maior região HII conhecida.",
      "Orbita a Via Láctea junto com a Pequena Nuvem.",
    ],
  },
  magalhaespq: {
    nome: "Pequena Nuvem de Magalhães",
    tipo: "Galáxia Irregular",
    desc: "Uma galáxia anã satélite da Via Láctea, visível no hemisfério sul. Tem intensa atividade de formação de novas estrelas.",
    curiosidades: [
      "Está a cerca de 200 mil anos-luz.",
      "Contém algumas das estrelas mais brilhantes conhecidas.",
      "Interage gravitacionalmente com a Grande Nuvem.",
    ],
  },
  m87: {
    nome: "Galáxia M87",
    tipo: "Galáxia Elíptica Gigante",
    desc: "Uma das maiores galáxias conhecidas, famosa por abrigar o primeiro buraco negro já fotografado pela humanidade.",
    curiosidades: [
      "Seu buraco negro tem 6,5 bilhões de massas solares.",
      "Foi o primeiro buraco negro fotografado, em 2019.",
      "Emite um jato de plasma que se estende por 5.000 anos-luz.",
    ],
  },
  pinwheel: {
    nome: "Galáxia Pinwheel (M101)",
    tipo: "Galáxia Espiral",
    desc: "Uma galáxia espiral frontal com braços bem definidos, repleta de regiões de formação estelar coloridas e brilhantes.",
    curiosidades: [
      "Está a 21 milhões de anos-luz.",
      "Tem o dobro do diâmetro da Via Láctea.",
      "Foi fotografada em detalhe pelo Telescópio Hubble.",
    ],
  },
};

// IDs Corrigidos para apontar exatamente para a galáxia correta
const NASA_FIXED_IDS: Record<string, string> = {
  andromeda: "PIA04921", // Andromeda Galaxy
  vialactea: "PIA18913", // Milky Way Untangled (melhor que o anterior)
  sombrero: "PIA15426", // The Sombrero Galaxy Split Personality (melhor que o anterior)
  redemoinho: "PIA04230", // Whirlpool Galaxy (melhor que o anterior)
  triangulo: "PIA25165", // Triangulum Galaxy Imaged by Herschel, Planck, IRAS, COBE (melhor que o anterior)
  centauroA: "PIA04624", // Galaxy Centaurus A (melhor que o anterior)
  magalhaesgr: "iss071e418742", // The Large Magellanic Cloud and the Small Magellanic Cloud (imagem combinada)
  magalhaespq: "iss071e418742", // The Large Magellanic Cloud and the Small Magellanic Cloud (imagem combinada)
  m87: "PIA23122", // Spitzer Captures Messier 87 (melhor que o anterior)
  pinwheel: "PIA14403", // M 101: The Pinwheel Galaxy (melhor que o anterior)
};

// Termos de busca otimizados para a API da NASA (usando 'q=' para busca geral)
const SEARCH_TERMS: Record<string, string> = {
  andromeda: "Andromeda Galaxy M31",
  vialactea: "Milky Way Galaxy",
  sombrero: "Sombrero Galaxy M104",
  redemoinho: "Whirlpool Galaxy M51",
  triangulo: "Triangulum Galaxy M33",
  centauroA: "Centaurus A NGC 5128",
  magalhaesgr: "Large Magellanic Cloud LMC",
  magalhaespq: "Small Magellanic Cloud SMC",
  m87: "M87 Galaxy Messier 87",
  pinwheel: "Pinwheel Galaxy M101",
};

export default function GalaxiaDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // A chave de API não é estritamente necessária para buscas públicas de imagens,
  // mas foi mantida caso você adicione outras rotas da NASA no futuro.
  const NASA_API_KEY = "cpbdC3dZ268gOVortguzZgqUfbKGDodrnV4rYO68";
  const item = galaxiasData[id as string] || galaxiasData.andromeda;

  useEffect(() => {
    const fetchNasaImage = async () => {
      setLoading(true);
      try {
        const nasaId = NASA_FIXED_IDS[id as string];
        let imageUrl = null;

        if (nasaId) {
          // Tenta buscar a imagem usando o ID fixo
          const assetRes = await fetch(
            `https://images-api.nasa.gov/asset/${nasaId}`,
          );
          const assetData = await assetRes.json();

          if (assetData.collection && assetData.collection.items) {
            const items: string[] = assetData.collection.items.map(
              (i: any) => i.href,
            );

            const largeImg =
              items.find((href) => href.includes("~orig.")) ||
              items.find((href) => href.includes("~large.")) ||
              items.find(
                (href) => href.endsWith(".jpg") || href.endsWith(".png"),
              ) ||
              items[0];

            if (largeImg) {
              imageUrl = largeImg.replace(/^http:\/\//i, "https://");
            }
          }
        }

        if (!imageUrl) {
          // Fallback: busca por texto usando termos otimizados
          const searchTerm = SEARCH_TERMS[id as string] || `${id} galaxy`;
          // Usar 'q=' para busca geral, que é mais flexível que 'title='
          const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(
            searchTerm,
          )}&media_type=image`;

          const response = await fetch(url);
          const data = await response.json();

          if (data.collection && data.collection.items.length > 0) {
            const firstItem = data.collection.items[0];
            const nasaIdFromSearch = firstItem.data[0].nasa_id;

            try {
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
                imageUrl = largeImg2.replace(/^http:\/\//i, "https://");
              }
            } catch (_) {
              console.log(
                "Falha ao buscar imagem em alta resolução do fallback, tentando thumbnail.",
              );
            }

            // Último recurso: thumbnail se nenhuma imagem grande for encontrada
            if (!imageUrl) {
              const thumb = firstItem.links?.[0]?.href;
              if (thumb) imageUrl = thumb.replace(/^http:\/\//i, "https://");
            }
          }
        }

        setNasaImage(imageUrl);
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

          <Text style={styles.sectionTitle}>Fatos Galácticos</Text>
          {item.curiosidades.map((c: string, i: number) => (
            <Text key={i} style={styles.curiosidade}>
              ✦ {c}
            </Text>
          ))}

          <Text style={styles.apiCredit}>
            Arquivo NASA: Galáxias {`\n`}
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

// COMPONENTE BLINDADO DE IMAGEM — evita tela preta
const SafeNasaImage = ({ uri, style }: { uri: string | null; style: any }) => {
  const [imageError, setImageError] = React.useState(false);

  // Uma imagem de espaço genérica bonita como último caso
  const fallbackImage =
    "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200&q=80";

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
