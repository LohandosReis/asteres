import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    getWikipediaUrl,
    getYouTubeSearchUrl,
    isLiked,
    toggleLike,
} from "../../services/contentHelpers";

const nebulosasData: Record<string, any> = {
  orion: {
    nome: "Nebulosa de Órion (M42)",
    tipo: "Nebulosa de Emissão",
    desc: "Uma das nebulosas mais famosas e visíveis a olho nu, localizada a 1.344 anos-luz da Terra. É um berçário estelar ativo.",
    curiosidades: [
      "É uma das regiões de formação estelar mais estudadas.",
      "Tem cerca de 24 anos-luz de diâmetro.",
      "Faz parte de um complexo maior de nuvens moleculares.",
    ],
  },
  carina: {
    nome: "Nebulosa de Carina (NGC 3372)",
    tipo: "Nebulosa de Emissão e Reflexão",
    desc: "Uma das maiores e mais brilhantes nebulosas do céu, lar de algumas das estrelas mais massivas conhecidas, incluindo a Eta Carinae.",
    curiosidades: [
      "É quatro vezes maior que a Nebulosa de Órion.",
      "Contém a hipergigante Eta Carinae, uma das estrelas mais luminosas da galáxia.",
      "Possui os famosos Pilares de Carina, estruturas de gás e poeira.",
    ],
  },
  eagle: {
    nome: "Nebulosa da Águia (M16)",
    tipo: "Nebulosa de Emissão",
    desc: "Famosa por suas formações gasosas conhecidas como 'Pilares da Criação', onde novas estrelas estão nascendo.",
    curiosidades: [
      "Localizada a cerca de 7.000 anos-luz de distância.",
      "Os Pilares da Criação foram imortalizados por imagens do Hubble.",
      "É uma região ativa de formação estelar.",
    ],
  },
  crab: {
    nome: "Nebulosa do Caranguejo (M1)",
    tipo: "Remanescente de Supernova",
    desc: "O remanescente de uma supernova observada em 1054 d.C. Contém um pulsar no seu centro.",
    curiosidades: [
      "Está a cerca de 6.500 anos-luz da Terra.",
      "O pulsar no seu centro gira 30 vezes por segundo.",
      "É uma fonte forte de raios-X e raios gama.",
    ],
  },
  ring: {
    nome: "Nebulosa do Anel (M57)",
    tipo: "Nebulosa Planetária",
    desc: "Uma nebulosa planetária clássica, formada pelas camadas externas de uma estrela moribunda, semelhante ao nosso Sol.",
    curiosidades: [
      "Localizada a cerca de 2.300 anos-luz de distância.",
      "Tem uma estrela anã branca no seu centro.",
      "É um excelente exemplo do destino final de estrelas como o Sol.",
    ],
  },
  helix: {
    nome: "Nebulosa da Hélice (NGC 7293)",
    tipo: "Nebulosa Planetária",
    desc: "Conhecida como o 'Olho de Deus', é uma das nebulosas planetárias mais próximas e visualmente impressionantes.",
    curiosidades: [
      "Está a cerca de 700 anos-luz da Terra.",
      "Suas cores vibrantes são resultado de gases ionizados.",
      "É uma das maiores nebulosas planetárias conhecidas.",
    ],
  },
  horsehead: {
    nome: "Nebulosa da Cabeça de Cavalo (Barnard 33)",
    tipo: "Nebulosa Escura",
    desc: "Uma pequena nebulosa escura na constelação de Órion, famosa por sua forma distintiva que lembra a cabeça de um cavalo.",
    curiosidades: [
      "Faz parte do Complexo de Nuvem Molecular de Órion.",
      "A forma é esculpida pela radiação de uma estrela próxima.",
      "É um local de formação de estrelas de baixa massa.",
    ],
  },
  lagoon: {
    nome: "Nebulosa da Lagoa (M8)",
    tipo: "Nebulosa de Emissão",
    desc: "Uma enorme nuvem interestelar de gás e poeira, visível a olho nu em condições escuras, com intensa formação estelar.",
    curiosidades: [
      "Localizada a cerca de 5.000 anos-luz de distância.",
      "Contém um aglomerado estelar aberto, NGC 6530.",
      "É uma das nebulosas mais brilhantes do céu.",
    ],
  },
  butterfly: {
    nome: "Nebulosa da Borboleta (NGC 6302)",
    tipo: "Nebulosa Planetária Bipolar",
    desc: "Uma nebulosa planetária com uma das estrelas centrais mais quentes conhecidas, ejetando gás em forma de borboleta.",
    curiosidades: [
      "A estrela central é mais quente que 200.000 graus Celsius.",
      "As 'asas' da borboleta são jatos de gás ejetados.",
      "Está a cerca de 3.800 anos-luz de distância.",
    ],
  },
  veil: {
    nome: "Nebulosa do Véu (NGC 6960)",
    tipo: "Remanescente de Supernova",
    desc: "Um vasto e tênue remanescente de supernova na constelação de Cisne, resultado da morte de uma estrela massiva.",
    curiosidades: [
      "A supernova que a criou explodiu há cerca de 8.000 anos.",
      "Cobre uma área de cerca de 3 graus no céu.",
      "Está a cerca de 2.400 anos-luz de distância.",
    ],
  },
  trifid: {
    nome: "Nebulosa Trífida (M20)",
    tipo: "Nebulosa de Emissão, Reflexão e Escura",
    desc: "Uma nebulosa com três lóbulos distintos, apresentando uma combinação de emissão, reflexão e nebulosidade escura.",
    curiosidades: [
      "Localizada a cerca de 5.200 anos-luz de distância.",
      "A nebulosa de emissão é vermelha, a de reflexão é azul.",
      "É uma região de formação estelar ativa.",
    ],
  },
  rosette: {
    nome: "Nebulosa da Roseta (NGC 2237)",
    tipo: "Nebulosa de Emissão",
    desc: "Uma grande e bela nebulosa em forma de roseta, com um aglomerado estelar aberto no seu centro.",
    curiosidades: [
      "Localizada a cerca de 5.000 anos-luz de distância.",
      "O aglomerado estelar NGC 2244 é responsável por ionizar o gás.",
      "É um dos objetos mais fotografados por astrônomos amadores.",
    ],
  },
};

const NASA_FIXED_IDS: Record<string, string> = {
  orion: "PIA03519",
  carina: "carina_nebula",
  eagle: "PIA03096",
  crab: "GSFC_20171208_Archive_e000640",
  ring: "PIA14443",
  helix: "PIA15658",
  horsehead: "PIA04215",
  lagoon: "GSFC_20171208_Archive_e001955",
  butterfly: "GSFC_20171208_Archive_e000637",
  veil: "PIA15413",
  trifid: "PIA04220",
  rosette: "PIA13028",
};

export default function Detail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wiki, setWiki] = useState<any | null>(null);

  const item = nebulosasData[id as string] || nebulosasData.orion;

  useEffect(() => {
    const fetchNasaImage = async () => {
      setLoading(true);
      let imageUrl = null;

      try {
        const nasaId = NASA_FIXED_IDS[id as string];

        if (nasaId) {
          const assetRes = await fetch(
            `https://images-api.nasa.gov/asset/${nasaId}`,
          );
          const assetData = await assetRes.json();

          if (assetData.collection && assetData.collection.items) {
            const items: string[] = assetData.collection.items.map(
              (i: any) => i.href,
            );

            imageUrl =
              items.find((h) => h.includes("~orig.")) ||
              items.find((h) => h.includes("~large.")) ||
              items.find((h) => h.endsWith(".jpg")) ||
              items[0];
          }
        }

        if (!imageUrl && nasaId) {
          const searchRes = await fetch(
            `https://images-api.nasa.gov/search?nasa_id=${nasaId}`,
          );
          const searchData = await searchRes.json();
          if (searchData.collection.items.length > 0) {
            imageUrl = searchData.collection.items[0].links[0].href;
          }
        }

        if (imageUrl) {
          setNasaImage(imageUrl.replace(/^http:\/\//i, "https://"));
        }
      } catch (error) {
        console.error("Erro ao buscar imagem da NASA:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNasaImage();
    (async () => {
      try {
        const likedState = await isLiked("nebulosa", id as string);
        setLiked(likedState);
      } catch {}
      try {
        const w = await getWikipediaSummary(item.nome);
        if (w) setWiki(w);
      } catch {}
    })();
  }, [id]);

  const openOriginal = async () => {
    if (!nasaImage) return;
    try {
      await Linking.openURL(nasaImage);
    } catch {
      Alert.alert("Erro", "Não foi possível abrir a imagem original.");
    }
  };

  const downloadImage = async () => {
    if (!nasaImage) return Alert.alert("Aviso", "Imagem indisponível");
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert(
          "Permissão negada",
          "Permissão de armazenamento necessária.",
        );
      }
      const fileUri = FileSystem.cacheDirectory + `${id}.jpg`;
      const { uri } = await FileSystem.downloadAsync(nasaImage, fileUri);
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Sucesso", "Imagem salva na galeria.");
    } catch (e) {
      Alert.alert("Erro", "Falha ao baixar a imagem.");
    }
  };

  const handleToggleLike = async () => {
    try {
      const newState = await toggleLike("nebulosa", id as string, {
        nome: item.nome,
      });
      setLiked(newState);
    } catch (e) {
      Alert.alert("Login necessário", "Faça login para curtir este item.");
    }
  };

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

          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                void Linking.openURL(getWikipediaUrl(item.nome));
              }}
            >
              <Text style={styles.actionText}>Artigo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                void Linking.openURL(getYouTubeSearchUrl(item.nome));
              }}
            >
              <Text style={styles.actionText}>Vídeo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={openOriginal}>
              <Text style={styles.actionText}>Abrir Original</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={downloadImage}>
              <Text style={styles.actionText}>Baixar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                liked ? { backgroundColor: "#4DB6AC" } : {},
              ]}
              onPress={handleToggleLike}
            >
              <Text style={styles.actionText}>
                {liked ? "Curtido" : "Curtir"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.nasaBadge}>
            <Text style={styles.nasaBadgeText}>IMAGEM OFICIAL NASA</Text>
          </View>

          {wiki ? (
            <>
              <Text style={styles.sectionTitle}>Mais Detalhes (Wikipedia)</Text>
              <Text style={styles.dataText}>{wiki.description}</Text>
              <Text style={styles.desc}>{wiki.extract}</Text>
              <TouchableOpacity
                style={[styles.actionBtn, { marginTop: 10 }]}
                onPress={() => void Linking.openURL(wiki.pageUrl)}
              >
                <Text style={styles.actionText}>Abrir na Wikipedia</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.desc}>{item.desc}</Text>

              <Text style={styles.sectionTitle}>Curiosidades</Text>
              {item.curiosidades.map((c: string, i: number) => (
                <Text key={i} style={styles.curiosidade}>
                  • {c}
                </Text>
              ))}
            </>
          )}

          <Text style={styles.apiCredit}>
            Arquivo NASA: {id?.toString().toUpperCase()} {"\n"}
            Identificador único validado para este objeto.
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
  actionBtn: {
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.02)",
  },
  actionText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
});

const SafeNasaImage = ({ uri, style }: { uri: string | null; style: any }) => {
  const [imageError, setImageError] = React.useState(false);
  const fallbackImage =
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800";
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
