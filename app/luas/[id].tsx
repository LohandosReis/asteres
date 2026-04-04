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

// BANCO DE DADOS DAS LUAS MAIS IMPORTANTES
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

export default function LuaDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [nasaImage, setNasaImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // SUA KEY DA NASA
  const NASA_API_KEY = "cpbdC3dZ268gOVortguzZgqUfbKGDodrnV4rYO68";

  const item = luasData[id as string] || luasData.lua;

  useEffect(() => {
    const fetchNasaImage = async () => {
      setLoading(true);
      try {
        // 1. MAPEAMENTO DE BUSCA PARA LUAS
        const searchTerms: Record<string, string> = {
          lua: "Earth moon full globe high resolution",
          fobos: "Phobos moon Mars high resolution",
          europa: "Europa moon Jupiter global view",
          ganimedes: "Ganymede moon Jupiter global",
          tita: "Titan moon Saturn Cassini global",
          encelado: "Enceladus moon Saturn Cassini global",
          tritao: "Triton moon Neptune Voyager 2",
        };

        const searchTerm = searchTerms[id as string] || `${id} moon`;

        // 2. URL DE BUSCA
        const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(
          searchTerm,
        )}&media_type=image`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.collection.items.length > 0) {
          // 3. SELEÇÃO DA IMAGEM
          const items = data.collection.items;

          // Filtro simples para garantir que a imagem contenha menção à lua
          const bestImage =
            items.find(
              (i: any) =>
                i.data[0].description?.toLowerCase().includes("moon") ||
                i.data[0].title?.toLowerCase().includes("moon"),
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

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Sobre este Mundo</Text>
          <Text style={styles.desc}>{item.desc}</Text>

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
});
