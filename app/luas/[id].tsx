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
    getWikipediaSummary,
    getWikipediaUrl,
    getYouTubeSearchUrl,
    isLiked,
    toggleLike,
} from "../../services/contentHelpers";

const luasData: Record<string, any> = {
  lua: {
    nome: "A Lua",
    tipo: "Satélite da Terra",
    desc: "O quinto maior satélite natural do Sistema Solar e o único lugar além da Terra onde seres humanos já pisaram.",
    curiosidades: [
      "Sempre mostra a mesma face para nós.",
      "Afasta-se da Terra 3,8 cm por ano.",
      "Causa as marés nos oceanos.",
    ],
  },
  fobos: {
    nome: "Fobos",
    tipo: "Lua de Marte",
    desc: "A maior das duas luas de Marte. Tem um formato irregular, lembrando uma batata, e está coberta de crateras.",
    curiosidades: [
      "Orbita Marte três vezes ao dia.",
      "Está colidindo lentamente com Marte.",
      "Pode se tornar um anel no futuro.",
    ],
  },
  deimos: {
    nome: "Deimos",
    tipo: "Lua de Marte",
    desc: "A menor das duas luas de Marte. É um dos menores satélites conhecidos do sistema solar.",
    curiosidades: [
      "Leva 30 horas para orbitar Marte.",
      "Superfície coberta por poeira fina.",
      "Provavelmente um asteroide capturado.",
    ],
  },
  io: {
    nome: "Io",
    tipo: "Lua de Júpiter",
    desc: "O corpo geologicamente mais ativo do sistema solar, coberto por centenas de vulcões em erupção constante.",
    curiosidades: [
      "Possui vulcões que ejetam enxofre.",
      "Sua superfície é renovada constantemente.",
      "A gravidade de Júpiter gera calor interno intenso.",
    ],
  },
  europa: {
    nome: "Europa",
    tipo: "Lua de Júpiter",
    desc: "Um dos lugares mais promissores para a busca de vida extraterrestre, devido ao seu oceano subterrâneo líquido.",
    curiosidades: [
      "Sua superfície é de puro gelo.",
      "Tem o dobro de água que a Terra.",
      "Possui uma atmosfera tênue de oxigênio.",
    ],
  },
  ganimedes: {
    nome: "Ganimedes",
    tipo: "Lua de Júpiter",
    desc: "A maior lua do Sistema Solar, sendo inclusive maior que o planeta Mercúrio.",
    curiosidades: [
      "Única lua com seu próprio campo magnético.",
      "Tem camadas de gelo e oceanos.",
      "Possui uma fina atmosfera de oxigênio.",
    ],
  },
  calisto: {
    nome: "Calisto",
    tipo: "Lua de Júpiter",
    desc: "A lua mais externa das quatro grandes luas de Júpiter. Possui a superfície mais craterizada do sistema solar.",
    curiosidades: [
      "Tem aproximadamente o tamanho de Mercúrio.",
      "Provavelmente tem um oceano subterrâneo.",
      "É uma das luas mais antigas do sistema solar.",
    ],
  },
  tita: {
    nome: "Titã",
    tipo: "Lua de Saturno",
    desc: "O segundo maior satélite do sistema solar e o único com uma atmosfera densa e nuvens.",
    curiosidades: [
      "Tem rios e lagos de metano líquido.",
      "Sua atmosfera é composta 95% de nitrogênio.",
      "Pode abrigar vida exótica.",
    ],
  },
  encelado: {
    nome: "Encélado",
    tipo: "Lua de Saturno",
    desc: "Uma pequena lua gelada famosa por seus gêiseres de água que jorram do polo sul.",
    curiosidades: [
      "É o corpo mais reflexivo do Sistema Solar.",
      "Alimenta um dos anéis de Saturno com gelo.",
      "Tem um oceano global sob a crosta.",
    ],
  },
  mimas: {
    nome: "Mimas",
    tipo: "Lua de Saturno",
    desc: "Conhecida como a 'Estrela da Morte' por sua semelhança com a nave de Star Wars, devido à enorme cratera Herschel.",
    curiosidades: [
      "A cratera Herschel tem 130 km de diâmetro.",
      "É uma das menores luas esféricas do sistema solar.",
      "Pode ter um oceano líquido interno.",
    ],
  },
  dione: {
    nome: "Dione",
    tipo: "Lua de Saturno",
    desc: "Uma lua gelada de Saturno com penhascos de gelo brilhantes e uma possível atmosfera tênue de oxigênio.",
    curiosidades: [
      "Tem falésias de gelo com centenas de km.",
      "Compartilha sua órbita com luas menores.",
      "Foi fotografada de perto pela sonda Cassini.",
    ],
  },
  reia: {
    nome: "Reia",
    tipo: "Lua de Saturno",
    desc: "A segunda maior lua de Saturno, composta principalmente de gelo e rocha.",
    curiosidades: [
      "Pode ter um sistema tênue de anéis.",
      "Sua superfície é densamente craterizada.",
      "Tem uma fraca atmosfera de oxigênio e CO2.",
    ],
  },
  tetis: {
    nome: "Tétis",
    tipo: "Lua de Saturno",
    desc: "Uma lua gelada de Saturno com um enorme canyon chamado Ithaca Chasma que percorre quase todo o globo.",
    curiosidades: [
      "Ithaca Chasma tem 2.000 km de extensão.",
      "Sua superfície é quase inteiramente de gelo.",
      "Tem uma grande cratera chamada Odisseu.",
    ],
  },
  miranda: {
    nome: "Miranda",
    tipo: "Lua de Urano",
    desc: "A menor das cinco principais luas de Urano, com uma paisagem caótica e penhascos gigantescos.",
    curiosidades: [
      "Tem o maior penhasco conhecido do sistema solar.",
      "Verona Rupes tem 20 km de altura.",
      "Fotografada pela Voyager 2 em 1986.",
    ],
  },
  ariel: {
    nome: "Ariel",
    tipo: "Lua de Urano",
    desc: "A lua de Urano com a superfície mais jovem e brilhante, coberta por vales e ravinas.",
    curiosidades: [
      "Tem muitos vales profundos e falhas.",
      "Possui a superfície mais clara de Urano.",
      "Sugere atividade geológica recente.",
    ],
  },
  titania: {
    nome: "Titânia",
    tipo: "Lua de Urano",
    desc: "A maior lua de Urano, com uma superfície marcada por grandes canyons e crateras de impacto.",
    curiosidades: [
      "É a oitava maior lua do sistema solar.",
      "Tem canyons com centenas de km.",
      "Pode ter um oceano interno.",
    ],
  },
  tritao: {
    nome: "Tritão",
    tipo: "Lua de Netuno",
    desc: "A maior lua de Netuno e a única grande lua que orbita no sentido contrário ao do seu planeta.",
    curiosidades: [
      "É um dos lugares mais frios do sistema solar.",
      "Tem vulcões que cospem nitrogênio líquido.",
      "É um objeto capturado do Cinturão de Kuiper.",
    ],
  },
};

const NASA_FIXED_IDS: Record<string, string> = {
  lua: "PIA14011", // ✅ Lua — LRO full Moon
  fobos: "PIA10368",
  deimos: "PIA11826",
  io: "PIA00583",
  europa: "PIA19048",
  ganimedes: "PIA00716",
  calisto: "PIA01299", // ✅ Calisto — Galileo global view
  tita: "PIA14921",
  encelado: "PIA17202",
  mimas: "PIA12568",
  dione: "PIA18317",
  reia: "PIA07763",
  tetis: "PIA17164",
  miranda: "PIA18185", // ✅ Miranda — Voyager 2
  ariel: "PIA00041",
  titania: "PIA00039",
  tritao: "PIA00317",
};

const SEARCH_TERMS: Record<string, string> = {
  lua: "Moon full globe Lunar Reconnaissance Orbiter",
  fobos: "Phobos moon Mars",
  deimos: "Deimos moon Mars",
  io: "Io moon Jupiter volcanic",
  europa: "Europa moon Jupiter global",
  ganimedes: "Ganymede moon Jupiter global",
  calisto: "Callisto moon Jupiter global",
  tita: "Titan moon Saturn Cassini",
  encelado: "Enceladus moon Saturn",
  mimas: "Mimas moon Saturn Cassini",
  dione: "Dione moon Saturn Cassini",
  reia: "Rhea moon Saturn Cassini",
  tetis: "Tethys moon Saturn Cassini",
  miranda: "Miranda moon Uranus Voyager",
  ariel: "Ariel moon Uranus Voyager",
  titania: "Titania moon Uranus Voyager",
  tritao: "Triton moon Neptune Voyager",
};

export default function LuaDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wiki, setWiki] = useState<any | null>(null);

  const NASA_API_KEY = "cpbdC3dZ268gOVortguzZgqUfbKGDodrnV4rYO68";
  const item = luasData[id as string] || luasData.lua;

  useEffect(() => {
    const fetchNasaImage = async () => {
      setLoading(true);
      try {
        const nasaId = NASA_FIXED_IDS[id as string];

        if (nasaId) {
          const assetRes = await fetch(
            `https://images-api.nasa.gov/asset/${nasaId}`,
          );
          const assetData = await assetRes.json();

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
            setNasaImage(largeImg.replace(/^http:\/\//i, "https://"));
            return;
          }
        }

        // Fallback: busca por texto
        const searchTerm = SEARCH_TERMS[id as string] || `${id} moon`;
        const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(
          searchTerm,
        )}&media_type=image`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.collection.items.length > 0) {
          const firstItem = data.collection.items[0];

          try {
            const nasaIdFromSearch = firstItem.data[0].nasa_id;
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

          const thumb = firstItem.links?.[0]?.href;
          if (thumb) setNasaImage(thumb.replace(/^http:\/\//i, "https://"));
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
        const likedState = await isLiked("lua", id as string);
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
      const newState = await toggleLike("lua", id as string, {
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

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Sobre este Mundo</Text>
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
            <Text style={styles.desc}>{item.desc}</Text>
          )}

          <Text style={styles.sectionTitle}>Curiosidades</Text>
          {item.curiosidades.map((c: string, i: number) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons name="sparkles" size={16} color="#4DB6AC" />
              <Text style={styles.curiosidade}>{c}</Text>
            </View>
          ))}

          <Text style={styles.apiCredit}>
            Arquivo NASA: Luas e Satélites {"\n"}
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
  subtitle: { color: "#4DB6AC", fontSize: 18, marginBottom: 5 },
  nasaBadge: {
    backgroundColor: "rgba(77, 182, 172, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginTop: 5,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 172, 0.3)",
  },
  nasaBadgeText: { color: "#4DB6AC", fontSize: 10, fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#333", marginVertical: 20 },
  desc: { color: "#CCC", fontSize: 16, lineHeight: 26, textAlign: "justify" },
  sectionTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 15,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  curiosidade: { color: "#E0E0E0", fontSize: 15, marginLeft: 10, flex: 1 },
  apiCredit: {
    color: "#444",
    fontSize: 11,
    marginTop: 30,
    fontStyle: "italic",
    lineHeight: 18,
    textAlign: "center",
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
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80";

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
