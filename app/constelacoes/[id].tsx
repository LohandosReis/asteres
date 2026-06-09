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

const constData: Record<string, any> = {
  aries: {
    nome: "Áries",
    tipo: "Constelação do Zodíaco",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/5/54/Aries_IAU.svg",
    desc: "Áries é associada ao carneiro e marca o início da primavera no zodíaco tropical.",
    descoberta:
      "Conhecida desde a antiguidade (astronomia mesopotâmica e grega)",
    proposito:
      "Utilizada historicamente para navegação e marcação de épocas agrícolas; presença em mitos de liderança e coragem.",
    curiosidades: [
      "Pequena e discreta no céu noturno moderno.",
      "Contém estrelas variáveis e pequenos aglomerados.",
    ],
  },
  touro: {
    nome: "Touro",
    tipo: "Constelação do Zodíaco",
    imagem:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Taurus_IAU.svg",
    desc: "Representa o touro; inclui o aglomerado das Plêiades e a brilhante estrela Aldebarã.",
    descoberta: "Reconhecida desde civilizações antigas (Mesopotâmia, Egito)",
    proposito:
      "Serviu como referência para calendários e para navegação noturna; associado a fertilidade em mitos.",
    curiosidades: [
      "A estrela Aldebarã é um gigante vermelho visível a olho nu.",
      "As Plêiades (M45) são um alvo popular para observação amadora.",
    ],
  },
  gemeos: {
    nome: "Gêmeos",
    tipo: "Constelação do Zodíaco",
    imagem:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Gemini_IAU.svg",
    desc: "Representa os gêmeos Castor e Pólux; contém estrelas brilhantes que formam o par central.",
    descoberta: "Conhecida desde a antiguidade (constelações clássicas gregas)",
    proposito:
      "Usada para orientação celeste e enredos mitológicos; útil para identificar regiões próximas da Via Láctea.",
    curiosidades: [
      "Pólux e Castor têm histórias mitológicas distintas e são facilmente identificáveis.",
    ],
  },
  cancer: {
    nome: "Câncer",
    tipo: "Constelação do Zodíaco",
    imagem:
      "https://upload.wikimedia.org/wikipedia/commons/e/e1/Cancer_IAU.svg",
    desc: "Contém o aglomerado aberto Praesepe (M44), também chamado de 'Coração de Câncer'.",
    descoberta: "Usada desde a antiguidade como referência astronômica",
    proposito:
      "Ajudava na marcação de estações e na orientação; possui importância cultural em mitos.",
    curiosidades: [
      "Praesepe é visível como uma mancha nebulosa a olho nu em céus escuros.",
    ],
  },
  leao: {
    nome: "Leão",
    tipo: "Constelação do Zodíaco",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/0/04/Leo_IAU.svg",
    desc: "Leão é uma constelação proeminente com a brilhante estrela Régulo.",
    descoberta: "Referenciada já por astrônomos babilônicos e gregos",
    proposito:
      "Serviu como marco para calendários sazonais e figura mitológica em várias culturas.",
    curiosidades: ["Régulo é uma estrela múltipla situada no peito do leão."],
  },
  virgem: {
    nome: "Virgem",
    tipo: "Constelação do Zodíaco",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/4/46/Virgo_IAU.svg",
    desc: "Uma grande constelação que abriga a brilhante estrela Spica e extensos aglomerados de galáxias.",
    descoberta: "Conhecida desde antigas tradições astronômicas",
    proposito:
      "Importante na história da astronomia para localizar aglomerados de galáxias; associada a mitos agrícolas.",
    curiosidades: ["Spica é uma estrela gigante azul e muito luminosa."],
  },
  libra: {
    nome: "Libra",
    tipo: "Constelação do Zodíaco",
    imagem: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Libra_IAU.svg",
    desc: "Representa a balança; é discreta entre Virgem e Escorpião.",
    descoberta: "Registrada nas tradições clássicas da antiguidade",
    proposito: "Simbolizava justiça e equilíbrio em mitologias e calendários.",
    curiosidades: ["Era parte de Escorpião em tradições mais antigas."],
  },
  escorpiao: {
    nome: "Escorpião",
    tipo: "Constelação do Zodíaco",
    imagem:
      "https://upload.wikimedia.org/wikipedia/commons/5/50/Scorpius_IAU.svg",
    desc: "Uma constelação reconhecível com a brilhante estrela Antares.",
    descoberta: "Conhecida desde civilizações antigas (Mesopotâmia, Grécia)",
    proposito:
      "Usada para navegação e calendários; forte presença em mitos como antagonista de Oríon.",
    curiosidades: [
      "Antares é uma supergigante vermelha comparável em brilho a Marte.",
    ],
  },
  sagitario: {
    nome: "Sagitário",
    tipo: "Constelação do Zodíaco",
    imagem:
      "https://upload.wikimedia.org/wikipedia/commons/7/7a/Sagittarius_IAU.svg",
    desc: "Representada pelo arqueiro; aponta em direção ao centro da Via Láctea.",
    descoberta:
      "Registrada desde a antiguidade como região rica em objetos celestes",
    proposito:
      "Referência para estudos do centro galáctico e objetos de céu profundo.",
    curiosidades: [
      "A região contém o centro galáctico e muitas nebulosas visíveis.",
    ],
  },
  capricornio: {
    nome: "Capricórnio",
    tipo: "Constelação do Zodíaco",
    imagem:
      "https://upload.wikimedia.org/wikipedia/commons/2/2d/Capricornus_IAU.svg",
    desc: "Capricórnio tem forma sutil e raízes em mitos antigos.",
    descoberta: "Conhecida nas tradições antigas do zodíaco",
    proposito:
      "Associada a ciclos sazonais e figuras mitológicas marinhas/agrícolas.",
    curiosidades: [
      "Era representada como uma criatura metade cabra, metade peixe.",
    ],
  },
  aquario: {
    nome: "Aquário",
    tipo: "Constelação do Zodíaco",
    imagem:
      "https://upload.wikimedia.org/wikipedia/commons/7/76/Aquarius_IAU.svg",
    desc: "Aquário é uma constelação extensa associada ao aguadeiro.",
    descoberta: "Constelação reconhecida em tradições antigas",
    proposito:
      "Relacionado a mitos de água e estações; usado para identificar chuva de meteoros em alguns casos.",
    curiosidades: ["Associada a várias lendas sobre portadores de água."],
  },
  peixes: {
    nome: "Peixes",
    tipo: "Constelação do Zodíaco",
    imagem:
      "https://upload.wikimedia.org/wikipedia/commons/5/55/Pisces_IAU.svg",
    desc: "Representa dois peixes ligados por uma corda; rica em história mitológica.",
    descoberta: "Parte do zodíaco tradicional desde a antiguidade",
    proposito:
      "Usada em calendário e mitologia; orientação celeste em épocas antigas.",
    curiosidades: [
      "É uma constelação extensa com estrelas de brilho moderado.",
    ],
  },
};

export default function ConstDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // SUA KEY DA NASA
  const NASA_API_KEY = "cpbdC3dZ268gOVortguzZgqUfbKGDodrnV4rYO68";

  const item = constData[id as string] || constData.cruzeiro;
  const [wiki, setWiki] = useState<any | null>(null);

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
    (async () => {
      try {
        const likedState = await isLiked("constelacao", id as string);
        setLiked(likedState);
      } catch {}
      try {
        const w = await getWikipediaSummary(item.nome);
        if (w) {
          setWiki(w);
          if (w.thumbnail) {
            setNasaImage(w.thumbnail);
          }
        }
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
      const fileUri = (FileSystem as any).cacheDirectory + `${id}.jpg`;
      const { uri } = await FileSystem.downloadAsync(nasaImage, fileUri);
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Sucesso", "Imagem salva na galeria.");
    } catch (e) {
      Alert.alert("Erro", "Falha ao baixar a imagem.");
    }
  };

  const handleToggleLike = async () => {
    try {
      const newState = await toggleLike("constelacao", id as string, {
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

          <Text style={styles.desc}>{item.desc}</Text>

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
              <Text style={styles.sectionTitle}>História e Astronomia</Text>
              {item.curiosidades.map((c: string, i: number) => (
                <Text key={i} style={styles.curiosidade}>
                  ★ {c}
                </Text>
              ))}
            </>
          )}

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
  dataText: { color: "#E0E0E0", fontSize: 15, marginBottom: 8 },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#0C1D22",
    borderRadius: 10,
  },
  actionText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
});
