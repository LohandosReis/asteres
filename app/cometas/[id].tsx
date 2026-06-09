import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getWikipediaSummary } from "../../services/contentHelpers";

interface ArticleLink {
  title: string;
  url: string;
}

interface CometInfo {
  nome: string;
  tipo: string;
  desc: string;
  orbita: string;
  tamanho: string;
  constituicao: string;
  descoberta: string;
  descobridor: string;
  periodo: string;
  perihelio: string;
  magnitude: string;
  curiosidades: string[];
  articleLinks: ArticleLink[];
}

const cometasData: Record<string, CometInfo> = {
  halley: {
    nome: "Cometa Halley",
    tipo: "Cometa Periódico",
    desc: "Talvez o cometa mais famoso do mundo, visível a olho nu a cada 75-76 anos.",
    orbita:
      "Elíptica e retrógrada, com passagem pela órbita terrestre a cada volta.",
    tamanho: "Núcleo estimado em cerca de 11 km de diâmetro.",
    constituicao:
      "Gelo de água, dióxido de carbono, monóxido de carbono, metano, amônia e poeira.",
    descoberta:
      "Registrado por Edmond Halley e identificado como periódico em 1758.",
    descobridor: "Edmond Halley.",
    periodo: "75-76 anos",
    perihelio: "0,59 UA",
    magnitude: "Até cerca de +2 na sua última passagem.",
    curiosidades: [
      "Foi o primeiro cometa cujo retorno foi previsto com sucesso.",
      "A cada ciclo, perde massa e se torna menos ativo ao longo de milênios.",
    ],
    articleLinks: [
      {
        title: "Halley's Comet - Wikipedia",
        url: "https://en.wikipedia.org/wiki/Halley%27s_Comet",
      },
      {
        title: "Halley Comet - NASA",
        url: "https://solarsystem.nasa.gov/asteroids-comets-and-meteors/comets/1p-halley/overview/",
      },
    ],
  },
  halebopp: {
    nome: "Cometa Hale-Bopp",
    tipo: "Cometa de Longo Período",
    desc: "Um dos cometas mais observados do século XX, visível a olho nu por impressionantes 18 meses.",
    orbita:
      "Altamente elíptica, com período orbital estimado em cerca de 2.533 anos.",
    tamanho: "Núcleo estimado em 60 km de diâmetro.",
    constituicao: "Rico em gelo, poeira e silicatos.",
    descoberta: "Descoberto em 1995 por Alan Hale e Thomas Bopp.",
    descobridor: "Alan Hale e Thomas Bopp.",
    periodo: "~2.533 anos",
    perihelio: "0,914 UA",
    magnitude: "Chegou a brilho de aproximadamente -1.",
    curiosidades: [
      "Permaneceu visível a olho nu por muito mais tempo do que a maioria dos cometas.",
      "Sua cauda brilhante foi um dos grandes espetáculos de 1997.",
    ],
    articleLinks: [
      {
        title: "Hale-Bopp - Wikipedia",
        url: "https://en.wikipedia.org/wiki/C/1995_O1_(Hale%E2%80%93Bopp)",
      },
      {
        title: "Hale-Bopp - NASA",
        url: "https://solarsystem.nasa.gov/asteroids-comets-and-meteors/comets/in-depth/comet-hale-bopp/",
      },
    ],
  },
  neowise: {
    nome: "Cometa NEOWISE",
    tipo: "Cometa de Longo Período",
    desc: "Descoberto em 2020 pelo telescópio NEOWISE, tornou-se um espetáculo visível a olho nu.",
    orbita: "Quase parabólica, com período estimado em milhares de anos.",
    tamanho: "Núcleo estimado em cerca de 5 km de diâmetro.",
    constituicao: "Mistura de poeira e gelo com uma coma brilhante.",
    descoberta: "Detectado em março de 2020 pelo telescópio espacial NEOWISE.",
    descobridor: "Telescópio espacial NEOWISE.",
    periodo: "Muito longo, provavelmente milhares de anos.",
    perihelio: "0,29 UA",
    magnitude: "Chegou a aproximadamente +1.",
    curiosidades: [
      "Foi o cometa mais brilhante a olho nu desde Hale-Bopp.",
      "Astronautas a bordo da ISS também capturaram imagens impressionantes.",
    ],
    articleLinks: [
      {
        title: "NEOWISE - Wikipedia",
        url: "https://en.wikipedia.org/wiki/C/2020_F3_(NEOWISE)",
      },
      {
        title: "NEOWISE - NASA",
        url: "https://www.nasa.gov/feature/jpl/neowise-s-comet-discovered-look-closer",
      },
    ],
  },
  encke: {
    nome: "Cometa Encke",
    tipo: "Cometa Periódico de Curto Período",
    desc: "Retorna à vizinhança da Terra a cada 3,3 anos, um dos períodos mais curtos entre cometas.",
    orbita: "Elíptica compacta com periélio próximo de Mercúrio.",
    tamanho: "Núcleo com cerca de 4,8 km de diâmetro.",
    constituicao: "Composto de gelo, poeira e compostos voláteis.",
    descoberta: "Identificado por Johann Franz Encke em 1819.",
    descobridor: "Johann Franz Encke.",
    periodo: "3,3 anos",
    perihelio: "0,33 UA",
    magnitude: "Normalmente alcança magnitude +7 próximo ao periélio.",
    curiosidades: [
      "Está ligado à chuva de meteoros Táuridas.",
      "Mantém atividade mesmo em distâncias relativamente próximas ao Sol.",
    ],
    articleLinks: [
      {
        title: "Encke's Comet - Wikipedia",
        url: "https://en.wikipedia.org/wiki/2P/Encke",
      },
      {
        title: "Encke Comet - NASA",
        url: "https://solarsystem.nasa.gov/asteroids-comets-and-meteors/comets/in-depth/comet-encke/overview/",
      },
    ],
  },
  swifttuttle: {
    nome: "Cometa Swift-Tuttle",
    tipo: "Cometa de Longo Período",
    desc: "O maior cometa periódico conhecido, responsável pela chuva de meteoros Perseidas.",
    orbita: "Altamente elíptica, com período orbital de 133 anos.",
    tamanho: "Núcleo de aproximadamente 26 km de diâmetro.",
    constituicao: "Gelo misturado com poeira e grãos de silicato.",
    descoberta: "Descoberto em 1862 por Lewis Swift e Horace Tuttle.",
    descobridor: "Lewis Swift e Horace Tuttle.",
    periodo: "133 anos",
    perihelio: "0,96 UA",
    magnitude: "Chega a aproximadamente magnitude +3.",
    curiosidades: [
      "O cometa cria a chuva de meteoros Perseidas todo agosto.",
      "É considerado o maior cometa periódico que se aproxima da Terra.",
    ],
    articleLinks: [
      {
        title: "Swift-Tuttle - Wikipedia",
        url: "https://en.wikipedia.org/wiki/109P/Swift%E2%80%93Tuttle",
      },
      {
        title: "Swift-Tuttle - NASA",
        url: "https://solarsystem.nasa.gov/asteroids-comets-and-meteors/comets/in-depth/comet-swift-tuttle/overview/",
      },
    ],
  },
  ison: {
    nome: "Cometa ISON",
    tipo: "Cometa Sungrazing",
    desc: "Descoberto em 2012, ficou famoso como candidato a cometa do século antes de se fragmentar.",
    orbita:
      "Trajetória quase parabólica e extremante inclinada ao redor do Sol.",
    tamanho: "Núcleo estimado em 2 km antes da fragmentação.",
    constituicao: "Rico em gelo, poeira e compostos voláteis.",
    descoberta: "Detectado por Vitali Nevski e Artyom Novichonok em 2012.",
    descobridor: "Vitali Nevski e Artyom Novichonok.",
    periodo: "Provavelmente mais de 3.000 anos, ou em trajetória de ejeção.",
    perihelio: "0,012 UA",
    magnitude: "Atingiu cerca de magnitude -2 antes de se fragmentar.",
    curiosidades: [
      "Foi apelidado de 'cometa do século' antes de perder brilho no periélio.",
      "A sua fragmentação foi amplamente documentada por telescópios terrestres.",
    ],
    articleLinks: [
      {
        title: "ISON - Wikipedia",
        url: "https://en.wikipedia.org/wiki/C/2012_S1_(ISON)",
      },
      {
        title: "ISON - NASA",
        url: "https://solarsystem.nasa.gov/asteroids-comets-and-meteors/comets/in-depth/comet-ison/overview/",
      },
    ],
  },
  lovejoy: {
    nome: "Cometa Lovejoy",
    tipo: "Cometa Sungrazing",
    desc: "Descoberto por Terry Lovejoy, conhecido por sobreviver a passagens próximas ao Sol.",
    orbita: "Elíptica de várias décadas, dependendo do exemplar.",
    tamanho: "Estimado em 1,5 a 2 km de núcleo.",
    constituicao: "Gelo, poeira e compostos como cianeto.",
    descoberta: "Vários cometas Lovejoy foram descobertos desde 2007.",
    descobridor: "Terry Lovejoy.",
    periodo: "Alguns anos a milhares de anos, de acordo com cada cometa.",
    perihelio: "Normalmente entre 0,7 e 0,8 UA.",
    magnitude: "Algumas aparições atingiram magnitude +3.",
    curiosidades: [
      "O Cometa Lovejoy de 2011 sobreviveu à passagem próxima ao Sol.",
      "Sua coma verde brilhante foi causada por carbono diatômico e cianeto.",
    ],
    articleLinks: [
      {
        title: "Lovejoy - Wikipedia",
        url: "https://en.wikipedia.org/wiki/Terry_Lovejoy",
      },
      {
        title: "Comet Lovejoy - ESA",
        url: "https://www.esa.int/Science_Exploration/Space_Science/Comet_Lovejoy",
      },
    ],
  },
  shoemakerlevy9: {
    nome: "Cometa Shoemaker-Levy 9",
    tipo: "Cometa Fragmentado",
    desc: "Ficou famoso por colidir com Júpiter em 1994 após ser quebrado pela gravidade do planeta.",
    orbita:
      "Originalmente entrava no Sistema Solar interno antes de ser capturado por Júpiter.",
    tamanho:
      "O conjunto de fragmentos se estendia por centenas de milhares de quilômetros.",
    constituicao:
      "Núcleo gelado e poeirento que se fragmentou em dezenas de pedaços.",
    descoberta:
      "Detectado em 1993 por Carolyn e Eugene Shoemaker e David Levy.",
    descobridor: "Carolyn Shoemaker, Eugene Shoemaker e David Levy.",
    periodo: "Capturado por Júpiter e destruído em 1994.",
    perihelio: "Originalmente em torno de 4,6 UA antes da captura.",
    magnitude: "Fragmentos visíveis com telescópios amadores em 1994.",
    curiosidades: [
      "O impacto deixou cicatrizes atmosféricas visíveis em Júpiter por semanas.",
      "Foi a primeira observação direta de um impacto de cometa em um planeta.",
    ],
    articleLinks: [
      {
        title: "Shoemaker-Levy 9 - Wikipedia",
        url: "https://en.wikipedia.org/wiki/Comet_Shoemaker%E2%80%93Levy_9",
      },
      {
        title: "Shoemaker-Levy 9 - NASA",
        url: "https://solarsystem.nasa.gov/news/291/intense-impact-of-shoemaker-levy-9-on-jupiter/",
      },
    ],
  },
  churyumovgerasimenko: {
    nome: "Cometa 67P/Churyumov-Gerasimenko",
    tipo: "Cometa Periódico",
    desc: "O alvo da missão Rosetta, que orbitou o cometa e pousou sua sonda Philae em 2014.",
    orbita: "Elíptica com período orbital de 6,45 anos.",
    tamanho: "Núcleo bilobado com aproximadamente 4,3 km de extensão.",
    constituicao:
      "Mistura de gelo de água, dióxido de carbono, monóxido de carbono e poeira orgânica.",
    descoberta: "Descoberto em 1969 por Klim Churyumov e Svetlana Gerasimenko.",
    descobridor: "Klim Churyumov e Svetlana Gerasimenko.",
    periodo: "6,45 anos",
    perihelio: "1,24 UA",
    magnitude: "Variou entre magnitude 12 e 20, exigindo telescópios.",
    curiosidades: [
      "A sonda Philae foi o primeiro pouso controlado em um cometa.",
      "Seu formato bilobado se tornou icônico nas imagens da Rosetta.",
    ],
    articleLinks: [
      {
        title: "67P/Churyumov-Gerasimenko - Wikipedia",
        url: "https://en.wikipedia.org/wiki/67P/Churyumov%E2%80%93Gerasimenko",
      },
      {
        title: "Rosetta Mission - ESA",
        url: "https://www.esa.int/Science_Exploration/Space_Science/Rosetta",
      },
    ],
  },
  hyakutake: {
    nome: "Cometa Hyakutake",
    tipo: "Cometa de Longo Período",
    desc: "Passou muito perto da Terra em 1996 e foi notável por sua cauda muito longa.",
    orbita:
      "Altamente elíptica, com período estimado em dezenas de milhares de anos.",
    tamanho: "Núcleo de cerca de 15 km de comprimento.",
    constituicao: "Rico em gelo e poeira com uma cauda de íons notável.",
    descoberta: "Descoberto em 1996 por Yuji Hyakutake.",
    descobridor: "Yuji Hyakutake.",
    periodo: "~70.000 anos",
    perihelio: "0,23 UA",
    magnitude: "Alcançou magnitude 0 e foi claramente visível a olho nu.",
    curiosidades: [
      "Sua cauda de íons se estendia por mais de 100 milhões de quilômetros.",
      "Foi um dos grandes cometas observados na década de 1990.",
    ],
    articleLinks: [
      {
        title: "Hyakutake - Wikipedia",
        url: "https://en.wikipedia.org/wiki/Comet_Hyakutake",
      },
      {
        title: "Comet Hyakutake - NASA",
        url: "https://www.nasa.gov/mission_pages/asteroids/news/asteroid20120410.html",
      },
    ],
  },
};

const validateUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) {
      return true;
    }
    const fallbackResponse = await fetch(url, { method: "GET" });
    return fallbackResponse.ok;
  } catch {
    return false;
  }
};

const fetchWikipediaArticleUrl = async (
  query: string,
): Promise<string | null> => {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(
      query,
    )}&srlimit=1`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    const page = data?.query?.search?.[0];
    if (page?.title) {
      return `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`;
    }
  } catch {
    return null;
  }

  return null;
};

const resolveArticleLinks = async (
  comet: CometInfo,
): Promise<ArticleLink[]> => {
  const verifiedLinks: ArticleLink[] = [];

  for (const link of comet.articleLinks) {
    if (await validateUrl(link.url)) {
      verifiedLinks.push(link);
    }
  }

  if (verifiedLinks.length > 0) {
    return verifiedLinks;
  }

  const wikiUrl = await fetchWikipediaArticleUrl(comet.nome);
  if (wikiUrl) {
    return [{ title: `${comet.nome} - Wikipedia`, url: wikiUrl }];
  }

  return comet.articleLinks;
};

export default function DetailCometas() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const comet = cometasData[id as string] || cometasData.halley;
  const [articleLinks, setArticleLinks] = useState<ArticleLink[]>(
    comet.articleLinks,
  );
  const [wiki, setWiki] = useState<any | null>(null);

  useEffect(() => {
    let active = true;

    const validate = async () => {
      const resolved = await resolveArticleLinks(comet);
      if (active) {
        setArticleLinks(resolved);
      }
      try {
        const w = await getWikipediaSummary(comet.nome);
        if (active && w) setWiki(w);
      } catch {}
    };

    validate();

    return () => {
      active = false;
    };
  }, [id]);

  const handleOpenUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch {
      console.warn("Não foi possível abrir o link:", url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#FFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name={"shooting-star" as any}
            size={90}
            color="#4DB6AC"
          />
          <Text style={styles.title}>{comet.nome}</Text>
          <Text style={styles.subtitle}>{comet.tipo}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <Text style={styles.desc}>{comet.desc}</Text>

          <Text style={styles.sectionTitle}>Dados do Cometa</Text>
          <Text style={styles.dataText}>
            <Text style={styles.boldLabel}>Descoberto:</Text> {comet.descoberta}
          </Text>
          <Text style={styles.dataText}>
            <Text style={styles.boldLabel}>Descobridor:</Text>{" "}
            {comet.descobridor}
          </Text>
          <Text style={styles.dataText}>
            <Text style={styles.boldLabel}>Período Orbital:</Text>{" "}
            {comet.periodo}
          </Text>
          <Text style={styles.dataText}>
            <Text style={styles.boldLabel}>Periélio:</Text> {comet.perihelio}
          </Text>
          <Text style={styles.dataText}>
            <Text style={styles.boldLabel}>Mag. Visual:</Text> {comet.magnitude}
          </Text>

          <Text style={styles.sectionTitle}>Características</Text>
          <Text style={styles.dataText}>
            <Text style={styles.boldLabel}>Órbita:</Text> {comet.orbita}
          </Text>
          <Text style={styles.dataText}>
            <Text style={styles.boldLabel}>Tamanho:</Text> {comet.tamanho}
          </Text>
          <Text style={styles.dataText}>
            <Text style={styles.boldLabel}>Composição:</Text>{" "}
            {comet.constituicao}
          </Text>

          <Text style={styles.sectionTitle}>Curiosidades</Text>
          {comet.curiosidades.map((item, index) => (
            <Text key={index} style={styles.curiosity}>
              • {item}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Artigos Recomendados</Text>
          {articleLinks.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={styles.articleButton}
              onPress={() => void handleOpenUrl(link.url)}
              activeOpacity={0.8}
            >
              <View style={styles.articleText}>
                <Text style={styles.articleTitle}>{link.title}</Text>
                <Text style={styles.articleSub}>Abrir artigo externo</Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#4DB6AC" />
            </TouchableOpacity>
          ))}

          {wiki ? (
            <>
              <Text style={styles.sectionTitle}>Mais Detalhes (Wikipedia)</Text>
              <Text style={styles.dataText}>{wiki.description}</Text>
              <Text style={styles.desc}>{wiki.extract}</Text>
              <TouchableOpacity
                style={[styles.articleButton, { marginTop: 10 }]}
                onPress={() => void handleOpenUrl(wiki.pageUrl)}
              >
                <View style={styles.articleText}>
                  <Text style={styles.articleTitle}>
                    Abrir página na Wikipedia
                  </Text>
                  <Text style={styles.articleSub}>Fonte externa</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#4DB6AC" />
              </TouchableOpacity>
            </>
          ) : null}

          <Text style={styles.footerText}>
            Conteúdo enriquecido com artigos e fontes de sites confiáveis da
            internet.
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
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 10,
    borderRadius: 30,
  },
  header: {
    alignItems: "center",
    paddingTop: 110,
    paddingBottom: 32,
    backgroundColor: "#071A21",
  },
  title: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 18,
    textAlign: "center",
  },
  subtitle: {
    color: "#4DB6AC",
    fontSize: 18,
    marginTop: 6,
    textAlign: "center",
  },
  content: { padding: 20 },
  sectionTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },
  desc: { color: "#CCC", fontSize: 16, lineHeight: 26 },
  dataText: { color: "#E0E0E0", fontSize: 15, marginBottom: 8, lineHeight: 24 },
  boldLabel: { color: "#4DB6AC", fontWeight: "700" },
  curiosity: {
    color: "#E0E0E0",
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 22,
  },
  articleButton: {
    backgroundColor: "#0C1D22",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  articleText: { flex: 1, paddingRight: 10 },
  articleTitle: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  articleSub: { color: "#A0A0A0", fontSize: 13, marginTop: 4 },
  footerText: { color: "#606060", fontSize: 12, marginTop: 24, lineHeight: 18 },
});
