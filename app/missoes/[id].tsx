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

// 1. BANCO DE DADOS EXPANDIDO COM VÍDEOS/DOCUMENTÁRIOS DO YOUTUBE
const missoesData: Record<string, any> = {
  apollo11: {
    nome: "Apollo 11",
    tipo: "Missão Tripulada",
    desc: "A histórica missão que realizou o maior feito tecnológico do século: pousar os primeiros humanos na Lua com segurança.",
    lancamento: "16 de Julho de 1969",
    objetivo: "Realizar um pouso lunar tripulado e retornar à Terra.",
    videoUrl: "https://www.youtube.com/watch?v=RMINSD7MmT4", // Vídeo original da restauração do pouso da NASA
    videoTitulo: "Pouso Lunar Original da Apollo 11 (NASA)",
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
    videoUrl: "https://www.youtube.com/watch?v=H7S86mZ71vI", // Documentário sobre a jornada da Voyager
    videoTitulo: "A Jornada Interestelar da Voyager (NASA/JPL)",
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
    videoUrl: "https://www.youtube.com/watch?v=CMLD0L_Z6g8", // Transmissão oficial do lançamento da Artemis I
    videoTitulo: "Lançamento Oficial Completo da Artemis I",
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
    videoUrl: "https://www.youtube.com/watch?v=p0Z3Lg_8Cis", // Documentário oficial dos 30 anos do Hubble
    videoTitulo: "Hubbel: 30 Anos de Revelações Cósmicas",
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
    videoUrl: "https://www.youtube.com/watch?v=1C_xu6fEcl0", // Lançamento e primeiras imagens explicadas pela NASA
    videoTitulo: "James Webb: O Início do Universo em Infravermelho",
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
    videoUrl: "https://www.youtube.com/watch?v=P4boyXQuUIw", // Animação icônica dos 7 minutos de terror do pouso
    videoTitulo: "Curiosity: Os 7 Minutos de Terror do Pouso em Marte",
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
    videoUrl: "https://www.youtube.com/watch?v=4czjS9h4Fpg", // Imagens e sons reais gravados durante o pouso
    videoTitulo: "Imagens e Sons Reais do Pouso da Perseverance",
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
    videoUrl: "https://www.youtube.com/watch?v=xrGAQCq9BMU", // Grande Final da Cassini mergulhando em Saturno
    videoTitulo: "O Grande Final da Missão Cassini em Saturno",
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
    videoUrl: "https://www.youtube.com/watch?v=dsI9gV7G_mQ", // Documentário sobre o histórico voo rasante por Plutão
    videoTitulo: "Plutão Revelado: O Voo Histórico da New Horizons",
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
    videoUrl: "https://www.youtube.com/watch?v=mYshZ9g5W3Q", // Documentário histórico de arquivo sobre a Skylab
    videoTitulo: "Skylab: A Primeira Estação Espacial da América (Arquivo)",
    curiosidades: [
      "Foi construída reaproveitando o terceiro estágio de um gigantesco foguete Saturno V.",
      "Abrigou três tripulações separadas de astronautas durante os anos de 1973 e 1974.",
      "Reentrou na atmosfera terrestre de forma descontrolada em 1979.",
    ],
  },
};

// IDS FIXOS DA NASA PARA A CAPA PRINCIPAL DE CADA UMA DAS 10 MISSÕES
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

export default function DetailMissoes() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Fallback seguro caso o ID não venha preenchido de início
  const item = missoesData[id as string] || missoesData.apollo11;

  // Função para abrir o documentário no navegador ou app do YouTube externo
  const handleOpenVideo = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Erro", "Não foi possível abrir este link de vídeo.");
    }
  };

  // Função para Baixar e Compartilhar Imagem (Corrigida com crases padrão)
  const handleDownloadImage = async (imgUrl: string | null) => {
    if (!imgUrl) return;
    setDownloading(true);

    try {
      const filename = imgUrl.split("/").pop() || "nasa_image.jpg";
      const fileUri = `${FileSystem.documentDirectory ?? ""}${filename}`; // Use fallback caso documentDirectory seja null

      const { uri } = await FileSystem.downloadAsync(imgUrl, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(
          "Erro",
          "O compartilhamento não está disponível neste dispositivo.",
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erro ao baixar",
        "Não foi possível processar o download desta imagem.",
      );
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchNasaData = async () => {
      setLoading(true);
      try {
        const currentId = (id as string) || "apollo11";
        const nasaId = NASA_FIXED_IDS[currentId];

        // 1. CARREGA IMAGEM DE CAPA PRINCIPAL (ID FIXO)
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
          }
        }

        // 2. BUSCA AUTOMÁTICA DE IMAGENS RELACIONADAS PARA A GALERIA
        const currentItem = missoesData[currentId] || missoesData.apollo11;
        const searchTerm = `${currentItem.nome}`;
        const searchUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchTerm)}&media_type=image`;

        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.collection.items.length > 0) {
          const urls: string[] = searchData.collection.items
            .slice(1, 7) // Pula a primeira para evitar duplicar com a foto da capa
            .map((item: any) => item.links?.[0]?.href)
            .filter((href: string | undefined) => href !== undefined)
            .map((href: string) => href.replace(/^http:\/\//i, "https://")); // Corrigido ://

          setGalleryImages(urls);
        }

        if (!nasaImage && searchData.collection.items.length > 0) {
          const fallbackThumb = searchData.collection.items[0].links?.[0]?.href;
          if (fallbackThumb)
            setNasaImage(fallbackThumb.replace(/^http:\/\//i, "https://"));
        }
      } catch (error) {
        console.error("Erro ao buscar dados da NASA:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNasaData();
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      {/* BOTÃO VOLTAR */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#FFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CONTAINER DA CAPA */}
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
              {/* BOTÃO DE DOWNLOAD DA CAPA */}
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownloadImage(nasaImage)}
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

          {/* NOVO: SEÇÃO DE VÍDEOS E DOCUMENTÁRIOS */}
          {item.videoUrl && (
            <View style={styles.videoSection}>
              <Text style={styles.sectionTitle}>Documentários e Mídia</Text>
              <TouchableOpacity
                style={styles.videoButton}
                onPress={() => handleOpenVideo(item.videoUrl)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="logo-youtube"
                  size={24}
                  color="#FF0000"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.videoButtonTitle}>
                    {item.videoTitulo}
                  </Text>
                  <Text style={styles.videoButtonSub}>
                    Toque para assistir no YouTube
                  </Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#4DB6AC" />
              </TouchableOpacity>
            </View>
          )}

          {/* FICHA TÉCNICA */}
          <Text style={styles.sectionTitle}>Ficha de Missão</Text>
          <Text style={styles.dadoTexto}>
            <Text style={styles.boldLabel}>Lançamento:</Text> {item.lancamento}
          </Text>
          <Text style={styles.dadoTexto}>
            <Text style={styles.boldLabel}>Objetivo Principal:</Text>{" "}
            {item.objetivo}
          </Text>

          {/* GALERIA DE ARQUIVOS RELACIONADOS */}
          {galleryImages.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Imagens Relacionadas</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.galleryScroll}
              >
                {galleryImages.map((imgUrl, idx) => (
                  <View key={idx} style={styles.galleryCard}>
                    <Image
                      source={{ uri: imgUrl }}
                      style={styles.galleryImage}
                    />
                    <TouchableOpacity
                      style={styles.galleryDownloadBtn}
                      onPress={() => handleDownloadImage(imgUrl)}
                    >
                      <Ionicons
                        name="download-outline"
                        size={14}
                        color="#FFF"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* MARCOS E CURIOSIDADES */}
          <Text style={styles.sectionTitle}>Marcos e Descobertas</Text>
          {item.curiosidades.map((c: string, i: number) => (
            <Text key={i} style={styles.curiosidade}>
              • {c}
            </Text>
          ))}

          <Text style={styles.apiCredit}>
            Arquivo NASA: {id?.toString().toUpperCase()} {"\n"}
            Carregamento dinâmico sincronizado com servidores da divisão de
            arquivos históricos.
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
  videoSection: {
    marginTop: 10,
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
  galleryScroll: { marginVertical: 10 },
  galleryCard: {
    width: 140,
    height: 100,
    marginRight: 12,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  galleryImage: { width: "100%", height: "100%" },
  galleryDownloadBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 14,
  },
});

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
