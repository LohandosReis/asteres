import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const fallbackImageUrl =
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80";

interface MissionInfo {
  nome: string;
  tipo: string;
  desc: string;
  lancamento: string;
  objetivo: string;
  videoLinks: { title: string; url: string }[];
  gallery: string[];
  curiosidades: string[];
}

const missoesData: Record<string, MissionInfo> = {
  apollo11: {
    nome: "Apollo 11",
    tipo: "Missão Tripulada",
    desc: "A histórica missão que realizou o maior feito tecnológico do século: pousar os primeiros humanos na Lua com segurança.",
    lancamento: "16 de Julho de 1969",
    objetivo: "Realizar um pouso lunar tripulado e retornar à Terra.",
    videoLinks: [
      {
        title: "Pouso Lunar Apollo 11 (NASA)",
        url: "https://www.youtube.com/watch?v=RMINSD7MmT4",
      },
      {
        title: "Documentário Apollo 11 - NASA",
        url: "https://www.youtube.com/watch?v=E3w-6zFBl0A",
      },
    ],
    gallery: [
      "https://images-assets.nasa.gov/image/as11-40-5875/as11-40-5875~orig.jpg",
      "https://images-assets.nasa.gov/image/as11-44-6554/as11-44-6554~orig.jpg",
      "https://images-assets.nasa.gov/image/as11-40-5874/as11-40-5874~orig.jpg",
    ],
    curiosidades: [
      "Neil Armstrong e Buzz Aldrin caminharam na superfície da Lua por quase três horas.",
      "Eles coletaram mais de 21 kg de material lunar para análise.",
      "A transmissão ao vivo foi assistida por cerca de 650 milhões de pessoas.",
    ],
  },
  voyager1: {
    nome: "Voyager 1",
    tipo: "Sonda Interplanetária",
    desc: "A sonda espacial mais distante da Terra, cruzando as fronteiras do nosso Sistema Solar rumo ao desconhecido espaço interestelar.",
    lancamento: "5 de Setembro de 1977",
    objetivo:
      "Explorar os sistemas de Júpiter e Saturno e seus respectivos anéis e luas.",
    videoLinks: [
      {
        title: "A Jornada Interestelar da Voyager",
        url: "https://www.youtube.com/watch?v=H7S86mZ71vI",
      },
      {
        title: "Documentário Voyager 1 - NASA",
        url: "https://www.youtube.com/watch?v=EepXbmc6s6w",
      },
    ],
    gallery: [
      "https://images-assets.nasa.gov/image/PIA23884/PIA23884~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA08531/PIA08531~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA05227/PIA05227~orig.jpg",
    ],
    curiosidades: [
      "Carrega o icônico 'Golden Record', um disco contendo sons e imagens da Terra.",
      "Descobriu vulcões ativos na lua Io de Júpiter.",
      "Entrou oficialmente no espaço interestelar em agosto de 2012.",
    ],
  },
  artemis1: {
    nome: "Artemis I",
    tipo: "Missão Não-Tripulada",
    desc: "O primeiro voo integrado do programa Artemis da NASA, pavimentando o caminho para o retorno da humanidade à Lua.",
    lancamento: "16 de Novembro de 2022",
    objetivo:
      "Testar o megafoguete SLS e a espaçonave Orion em órbita lunar profunda.",
    videoLinks: [
      {
        title: "Lançamento Oficial da Artemis I",
        url: "https://www.youtube.com/watch?v=CMLD0L_Z6g8",
      },
      {
        title: "Resumo da Missão Artemis I",
        url: "https://www.youtube.com/watch?v=qK6FpKxY4xQ",
      },
    ],
    gallery: [
      "https://images-assets.nasa.gov/image/KSC-20221116-PH-NASA01_0114/KSC-20221116-PH-NASA01_0114~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA25582/PIA25582~orig.jpg",
      "https://images-assets.nasa.gov/image/KSC-20221116-PH-NASA01_0091/KSC-20221116-PH-NASA01_0091~orig.jpg",
    ],
    curiosidades: [
      "A cápsula Orion viajou mais longe do que qualquer nave para humanos já foi.",
      "Levou manequins equipados com sensores para medir níveis de radiação.",
      "Validou com sucesso o escudo térmico mais rápido e quente da história no retorno.",
    ],
  },
  hubble: {
    nome: "Telescópio Hubble",
    tipo: "Observatório Espacial",
    desc: "O revolucionário telescópio orbital que mudou nossa compreensão do universo ao capturar imagens incrivelmente profundas do cosmos.",
    lancamento: "24 de Abril de 1990",
    objetivo:
      "Observar o universo na luz visível, ultravioleta e infravermelha próxima sem a distorção da atmosfera.",
    videoLinks: [
      {
        title: "Hubble: 30 Anos de Revelações Cósmicas",
        url: "https://www.youtube.com/watch?v=p0Z3Lg_8Cis",
      },
      {
        title: "Documentário Hubble",
        url: "https://www.youtube.com/watch?v=Gvpsj_yyAwY",
      },
    ],
    gallery: [
      "https://images-assets.nasa.gov/image/PIA03173/PIA03173~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA15570/PIA15570~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg",
    ],
    curiosidades: [
      "Ajudou a determinar a idade do universo com mais precisão (cerca de 13,8 bilhões de anos).",
      "Mostrou que a expansão do universo está se acelerando devido à energia escura.",
      "Já realizou mais de 1,5 milhão de observações ao longo de sua vida útil.",
    ],
  },
  jameswebb: {
    nome: "James Webb (JWST)",
    tipo: "Observatório Espacial",
    desc: "O telescópio espacial mais poderoso já construído, projetado para espiar o início dos tempos e desvendar a formação das primeiras galáxias.",
    lancamento: "25 de Dezembro de 2021",
    objetivo:
      "Investigar a luz das primeiras estrelas e galáxias e estudar a atmosfera de exoplanetas.",
    videoLinks: [
      {
        title: "James Webb: O Início do Universo em Infravermelho",
        url: "https://www.youtube.com/watch?v=1C_xu6fEcl0",
      },
      {
        title: "Documentário JWST",
        url: "https://www.youtube.com/watch?v=4kZV7E6P4p0",
      },
    ],
    gallery: [
      "https://images-assets.nasa.gov/image/GSFC_20220712_JWST_pages_000002/GSFC_20220712_JWST_pages_000002~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA23647/PIA23647~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA23495/PIA23495~orig.jpg",
    ],
    curiosidades: [
      "Seu espelho banhado a ouro possui 6,5 metros de diâmetro.",
      "Opera no ponto de Lagrange L2, a 1,5 milhão de quilômetros da Terra.",
      "Consegue enxergar através de densas nuvens de poeira cósmica usando infravermelho.",
    ],
  },
  curiosity: {
    nome: "Curiosity Rover",
    tipo: "Exploração de Superfície",
    desc: "O jipe robótico do tamanho de um carro que explora a Cratera Gale em Marte, buscando pistas de habitabilidade antiga.",
    lancamento: "26 de Novembro de 2011",
    objetivo:
      "Investigar se Marte já teve condições ambientais favoráveis para a vida microbiana.",
    videoLinks: [
      {
        title: "Curiosity: Os 7 Minutos de Terror do Pouso em Marte",
        url: "https://www.youtube.com/watch?v=P4boyXQuUIw",
      },
      {
        title: "Missão Curiosity",
        url: "https://www.youtube.com/watch?v=Wb48Qpj5-v0",
      },
    ],
    gallery: [
      "https://images-assets.nasa.gov/image/PIA19803/PIA19803~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA20237/PIA20237~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA16945/PIA16945~orig.jpg",
    ],
    curiosidades: [
      "Pousou em Marte usando um sistema revolucionário de 'Guindaste Espacial' (Sky Crane).",
      "Descobriu evidências definitivas de antigos lagos de água líquida no passado de Marte.",
      "Possui um laser capaz de vaporizar rochas para analisar sua composição.",
    ],
  },
  perseverance: {
    nome: "Perseverance",
    tipo: "Exploração de Superfície",
    desc: "O rover mais sofisticado da NASA enviado a Marte para buscar sinais de vida microbiana antiga e coletar amostras de solo.",
    lancamento: "30 de Julho de 2020",
    objetivo:
      "Explorar a Cratera Jezero, buscar bioassinaturas e armazenar tubos de amostras para retorno futuro.",
    videoLinks: [
      {
        title: "Imagens e Sons Reais do Pouso da Perseverance",
        url: "https://www.youtube.com/watch?v=4czjS9h4Fpg",
      },
      {
        title: "Missão Perseverance",
        url: "https://www.youtube.com/watch?v=iXkzY6h7VnI",
      },
    ],
    gallery: [
      "https://images-assets.nasa.gov/image/PIA24424/PIA24424~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA24435/PIA24435~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA24481/PIA24481~orig.jpg",
    ],
    curiosidades: [
      "Levou consigo o Ingenuity, o primeiro helicóptero a voar em outro planeta.",
      "Possui um instrumento (MOXIE) que gera oxigênio a partir da atmosfera de CO2 de Marte.",
      "Equipado com 23 câmeras e dois microfones que gravaram os sons do planeta vermelho.",
    ],
  },
  cassini: {
    nome: "Cassini-Huygens",
    tipo: "Sonda Interplanetária",
    desc: "A espetacular missão conjunta que orbitou Saturno por mais de uma década, revelando os segredos de seus anéis e luas misteriosas.",
    lancamento: "15 de Outubro de 1997",
    objetivo:
      "Estudar o planeta Saturno, seus anéis, sua magnetosfera e pousar uma sonda na lua Titã.",
    videoLinks: [
      {
        title: "O Grande Final da Missão Cassini em Saturno",
        url: "https://www.youtube.com/watch?v=xrGAQCq9BMU",
      },
      {
        title: "Documentário Cassini",
        url: "https://www.youtube.com/watch?v=2bG-WMJ9YUw",
      },
    ],
    gallery: [
      "https://images-assets.nasa.gov/image/PIA03883/PIA03883~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA13616/PIA13616~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA17172/PIA17172~orig.jpg",
    ],
    curiosidades: [
      "A sonda Huygens fez um pouso histórico na superfície congelada de Titã em 2005.",
      "Descobriu oceanos globais de água líquida sob a crosta de gelo da lua Encélado.",
      "Foi destruída intencionalmente na atmosfera de Saturno em 2017 para proteger as luas.",
    ],
  },
  newhorizons: {
    nome: "New Horizons",
    tipo: "Sonda Interplanetária",
    desc: "A veloz sonda espacial que realizou o primeiro sobrevoo da história pelo planeta anão Plutão, revelando um mundo ativo e surpreendente.",
    lancamento: "19 de Janeiro de 2006",
    objetivo:
      "Explorar Plutão, suas luas e os objetos congelados localizados no Cinturão de Kuiper.",
    videoLinks: [
      {
        title: "Plutão Revelado: O Voo Histórico da New Horizons",
        url: "https://www.youtube.com/watch?v=dsI9gV7G_mQ",
      },
      {
        title: "Documentário New Horizons",
        url: "https://www.youtube.com/watch?v=KZf-8yM8JfI",
      },
    ],
    gallery: [
      "https://images-assets.nasa.gov/image/PIA19931/PIA19931~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA20211/PIA20211~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA20672/PIA20672~orig.jpg",
    ],
    curiosidades: [
      "Descobriu uma gigantesca planície de gelo de nitrogênio em formato de coração em Plutão.",
      "Viajou por mais de 9 anos e 4,8 bilhões de quilômetros até chegar ao alvo principal.",
      "Em 2019, fotografou o objeto Arrokoth, o corpo celeste mais distante já explorado por uma nave.",
    ],
  },
  skylab: {
    nome: "Skylab",
    tipo: "Estação Espacial",
    desc: "A primeira estação espacial dos Estados Unidos, que provou que os seres humanos podiam viver e trabalhar no espaço por longos períodos.",
    lancamento: "14 de Maio de 1973",
    objetivo:
      "Estudar os efeitos da microgravidade nos humanos e realizar observações solares avançadas.",
    videoLinks: [
      {
        title: "Skylab: A Primeira Estação Espacial da América",
        url: "https://www.youtube.com/watch?v=mYshZ9g5W3Q",
      },
      {
        title: "Documentário Skylab",
        url: "https://www.youtube.com/watch?v=UZiVXpws4aA",
      },
    ],
    gallery: [
      "https://images-assets.nasa.gov/image/GPN-2000-001055/GPN-2000-001055~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA02869/PIA02869~orig.jpg",
      "https://images-assets.nasa.gov/image/PIA02095/PIA02095~orig.jpg",
    ],
    curiosidades: [
      "Foi construída reaproveitando o terceiro estágio de um gigantesco foguete Saturno V.",
      "Abrigou três tripulações separadas de astronautas durante os anos de 1973 e 1974.",
      "Reentrou na atmosfera terrestre de forma descontrolada em 1979.",
    ],
  },
};

const NASA_FIXED_IDS: Record<string, string> = {
  apollo11: "as11-40-5875",
  voyager1: "PIA23884",
  artemis1: "KSC-20221116-PH-NASA01_0114",
  hubble: "hubble-captures-vibrant-nebula-in-nearby-galaxy_34293026604_o",
  jameswebb: "GSFC_20220712_JWST_pages_000002",
  curiosity: "PIA19803",
  perseverance: "PIA24424",
  cassini: "PIA03883",
  newhorizons: "PIA19931",
  skylab: "GPN-2000-001055",
};

const missionArticleLinks: Record<string, string> = {
  apollo11: "https://www.nasa.gov/mission_pages/apollo/apollo11.html",
  voyager1: "https://www.nasa.gov/mission_pages/voyager/index.html",
  artemis1: "https://www.nasa.gov/artemis-1",
  hubble: "https://www.nasa.gov/mission_pages/hubble/main/index.html",
  jameswebb: "https://www.nasa.gov/mission_pages/webb/main/index.html",
  curiosity: "https://mars.nasa.gov/msl/home/",
  perseverance: "https://mars.nasa.gov/mars2020/",
  cassini: "https://www.nasa.gov/mission_pages/cassini/main/index.html",
  newhorizons: "https://www.nasa.gov/mission_pages/newhorizons/main/index.html",
  skylab: "https://www.nasa.gov/mission_pages/skylab/main/index.html",
};

const missionSearchTerms: Record<string, string> = {
  apollo11: "Apollo 11 moon landing",
  voyager1: "Voyager 1 Jupiter Saturn mission",
  artemis1: "Artemis I Orion capsule launch",
  hubble: "Hubble Space Telescope deep field",
  jameswebb: "James Webb Space Telescope first images",
  curiosity: "Curiosity rover Mars Gale Crater",
  perseverance: "Perseverance rover Mars Jezero Crater",
  cassini: "Cassini Saturn rings Enceladus",
  newhorizons: "New Horizons Pluto Kuiper belt",
  skylab: "Skylab space station Earth orbit",
};

const normalizeUrl = (url: string): string =>
  url.trim().replace(/^http:\/\//i, "https://");

const isValidImageUrl = (url: unknown): url is string =>
  typeof url === "string" &&
  /^https?:\/\//i.test(url) &&
  /\.(jpg|jpeg|png|webp)$/i.test(url);

const extractArticleImages = (html: string): string[] => {
  const imageUrls = new Set<string>();
  const addUrl = (url: string) => {
    const normalized = normalizeUrl(url);
    if (
      isValidImageUrl(normalized) &&
      /nasa\.gov|images-assets\.nasa\.gov|mars\.nasa\.gov/i.test(normalized)
    ) {
      imageUrls.add(normalized);
    }
  };

  const ogImage = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  )?.[1];
  if (ogImage) addUrl(ogImage);

  const twitterImage = html.match(
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  )?.[1];
  if (twitterImage) addUrl(twitterImage);

  Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)).forEach(
    (match) => {
      addUrl(match[1]);
    },
  );

  return Array.from(imageUrls).slice(0, 3);
};

const fetchNasaAssetImages = async (nasaId: string): Promise<string[]> => {
  const response = await fetch(`https://images-api.nasa.gov/asset/${nasaId}`);
  const json = await response.json();
  const items = Array.isArray(json.collection?.items)
    ? json.collection.items
    : [];

  return Array.from(
    new Set<string>(
      items
        .map((item: any) => item.href)
        .filter(isValidImageUrl)
        .map(normalizeUrl),
    ),
  ).slice(0, 3);
};

const fetchNasaSearchImages = async (
  query: string,
  missionIdentifiers: string[],
): Promise<string[]> => {
  const response = await fetch(
    `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`,
  );
  const json = await response.json();
  const items = Array.isArray(json.collection?.items)
    ? json.collection.items
    : [];

  return Array.from(
    new Set<string>(
      items
        .filter((item: any) => {
          const metadata = item.data?.[0] ?? {};
          const title = String(metadata.title ?? "").toLowerCase();
          const desc = String(metadata.description ?? "").toLowerCase();
          const nasaId = String(metadata.nasa_id ?? "").toLowerCase();
          const keywords = Array.isArray(metadata.keywords)
            ? metadata.keywords.join(" ").toLowerCase()
            : String(metadata.keywords ?? "").toLowerCase();

          return missionIdentifiers.some(
            (identifier) =>
              title.includes(identifier) ||
              desc.includes(identifier) ||
              nasaId.includes(identifier) ||
              keywords.includes(identifier),
          );
        })
        .map((item: any) => item.links?.[0]?.href)
        .filter(isValidImageUrl)
        .map(normalizeUrl),
    ),
  ).slice(0, 3);
};

export default function DetailMissoes() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const defaultMissionId = "apollo11";
  const currentId = (id as string) || defaultMissionId;
  const item = missoesData[currentId] || missoesData[defaultMissionId];

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(encodeURI(url));
    } catch (error) {
      console.error("Erro ao abrir link:", error);
      Alert.alert("Erro", "Não foi possível abrir este link.");
    }
  };

  const downloadImage = async (imgUrl: string | null) => {
    if (!imgUrl) return;
    setDownloading(true);

    try {
      const filename = imgUrl.split("/").pop() || "nasa_image.jpg";
      const fileSystemDirectory =
        (FileSystem as any).documentDirectory ||
        (FileSystem as any).Paths?.document?.uri ||
        "";
      const fileUri = `${fileSystemDirectory}${filename}`;
      const { uri } = await FileSystem.downloadAsync(imgUrl, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(
          "Erro",
          "Compartilhamento não disponível neste dispositivo.",
        );
      }
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
      Alert.alert("Erro ao baixar", "Não foi possível baixar esta imagem.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      const missionGallery = item.gallery
        .map(normalizeUrl)
        .filter(isValidImageUrl);
      let selectedImages = Array.from(new Set(missionGallery)).slice(0, 3);

      try {
        const nasaId = NASA_FIXED_IDS[currentId];
        if (nasaId && selectedImages.length < 3) {
          const assetImages = await fetchNasaAssetImages(nasaId);
          selectedImages = Array.from(
            new Set([...selectedImages, ...assetImages]),
          ).slice(0, 3);
        }

        if (selectedImages.length < 3) {
          const articleUrl = missionArticleLinks[currentId];
          if (articleUrl) {
            try {
              const articleResponse = await fetch(articleUrl);
              const articleHtml = await articleResponse.text();
              const articleImages = extractArticleImages(articleHtml).filter(
                (url) => !selectedImages.includes(url),
              );
              selectedImages = Array.from(
                new Set([...selectedImages, ...articleImages]),
              ).slice(0, 3);
            } catch (error) {
              console.warn("Falha ao extrair imagens do artigo:", error);
            }
          }
        }

        if (selectedImages.length < 3) {
          const searchTerm = missionSearchTerms[currentId] || item.nome;
          const identifiers = [
            item.nome.toLowerCase(),
            currentId.toLowerCase(),
            NASA_FIXED_IDS[currentId]?.toLowerCase() ?? "",
          ].filter(Boolean);
          const searchImages = await fetchNasaSearchImages(
            searchTerm,
            identifiers,
          );
          selectedImages = Array.from(
            new Set([...selectedImages, ...searchImages]),
          ).slice(0, 3);
        }
      } catch (error) {
        console.error("Erro ao carregar imagens da missão:", error);
      } finally {
        setGalleryImages(selectedImages);
        setNasaImage(selectedImages[0] || fallbackImageUrl);
        setActiveSlide(0);
        setLoading(false);
      }
    };

    loadImages();
  }, [currentId, item]);

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
            <>
              <SafeNasaImage uri={nasaImage} style={styles.image} />
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => downloadImage(nasaImage)}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="download-outline" size={22} color="#FFF" />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.nome}</Text>
          <Text style={styles.subtitle}>{item.tipo}</Text>

          <View style={styles.nasaBadge}>
            <Text style={styles.nasaBadgeText}>IMAGEM HISTÓRICA NASA</Text>
          </View>

          <Text style={styles.desc}>{item.desc}</Text>

          {missionArticleLinks[currentId] && (
            <TouchableOpacity
              style={styles.articleButton}
              onPress={() => openUrl(missionArticleLinks[currentId])}
              activeOpacity={0.8}
            >
              <View style={styles.articleButtonTextContainer}>
                <Text style={styles.articleButtonTitle}>
                  Leia o artigo oficial da NASA sobre esta missão
                </Text>
                <Text style={styles.articleButtonSub}>
                  Página oficial com dados e imagens da missão
                </Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#4DB6AC" />
            </TouchableOpacity>
          )}

          {item.videoLinks?.length > 0 && (
            <View style={styles.videoSection}>
              <Text style={styles.sectionTitle}>Documentários e Vídeos</Text>
              {item.videoLinks.map((video, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.videoButton}
                  onPress={() => openUrl(video.url)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="logo-youtube"
                    size={22}
                    color="#FF0000"
                    style={styles.videoIcon}
                  />
                  <View style={styles.videoTextContainer}>
                    <Text style={styles.videoButtonTitle}>{video.title}</Text>
                    <Text style={styles.videoButtonSub} numberOfLines={2}>
                      Toque para assistir no YouTube
                    </Text>
                  </View>
                  <Ionicons name="open-outline" size={18} color="#4DB6AC" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>Ficha de Missão</Text>
          <Text style={styles.dadoTexto}>
            <Text style={styles.boldLabel}>Lançamento:</Text> {item.lancamento}
          </Text>
          <Text style={styles.dadoTexto}>
            <Text style={styles.boldLabel}>Objetivo Principal:</Text>{" "}
            {item.objetivo}
          </Text>

          {galleryImages.length > 0 && (
            <View style={styles.sliderContainer}>
              <Text style={styles.sectionTitle}>Galeria da Missão</Text>
              <ScrollView
                horizontal
                pagingEnabled
                snapToInterval={width}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                style={styles.carouselScroll}
                onMomentumScrollEnd={(event) => {
                  setActiveSlide(
                    Math.round(event.nativeEvent.contentOffset.x / width),
                  );
                }}
              >
                {galleryImages.map((imgUrl, idx) => (
                  <View key={idx} style={[styles.carouselCard, { width }]}>
                    <Image
                      source={{ uri: imgUrl }}
                      style={styles.carouselImage}
                    />
                    <TouchableOpacity
                      style={styles.carouselDownloadBtn}
                      onPress={() => downloadImage(imgUrl)}
                    >
                      <Ionicons
                        name="download-outline"
                        size={16}
                        color="#FFF"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.dotsContainer}>
                {galleryImages.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === activeSlide && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Marcos e Descobertas</Text>
          {item.curiosidades.map((curiosidade, index) => (
            <Text key={index} style={styles.curiosidade}>
              • {curiosidade}
            </Text>
          ))}

          <Text style={styles.apiCredit}>
            Arquivo NASA: {currentId?.toString().toUpperCase()} {"\n"}
            Conteúdo vinculado à missão e imagens preferenciais da NASA.
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
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  downloadButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(77, 182, 172, 0.85)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
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
  sectionTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 12,
  },
  videoSection: { marginTop: 10 },
  articleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#13212F",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 172, 0.25)",
  },
  articleButtonTextContainer: { flex: 1 },
  articleButtonTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  articleButtonSub: {
    color: "#BBC5D1",
    fontSize: 13,
  },
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
  },
  videoButtonTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  videoButtonSub: { color: "#BBB", fontSize: 13, marginTop: 4 },
  videoIcon: { marginRight: 12 },
  videoTextContainer: { flex: 1 },
  dadoTexto: {
    color: "#E0E0E0",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  boldLabel: { color: "#4DB6AC", fontWeight: "bold" },
  curiosidade: { color: "#E0E0E0", fontSize: 15, marginBottom: 8 },
  apiCredit: {
    color: "#444",
    fontSize: 11,
    marginTop: 30,
    fontStyle: "italic",
    lineHeight: 18,
  },
  sliderContainer: { marginTop: 20 },
  carouselScroll: { marginBottom: 10 },
  carouselCard: {
    height: 240,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  carouselImage: { width: "100%", height: "100%" },
  carouselDownloadBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "#4DB6AC",
  },
});

const SafeNasaImage = ({ uri, style }: { uri: string | null; style: any }) => {
  const [imageError, setImageError] = useState(false);
  const validUri =
    uri && isValidImageUrl(uri) ? normalizeUrl(uri) : fallbackImageUrl;
  return (
    <Image
      source={{ uri: imageError ? fallbackImageUrl : validUri }}
      style={style}
      resizeMode="cover"
      onError={() => setImageError(true)}
    />
  );
};
