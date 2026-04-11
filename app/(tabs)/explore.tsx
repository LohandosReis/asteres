import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const allAstros = [
  // PLANETAS
  {
    id: "mercurio",
    nome: "Mercúrio",
    tipo: "Planeta",
    categoria: "planetas",
    icon: "planet",
  },
  {
    id: "venus",
    nome: "Vênus",
    tipo: "Planeta",
    categoria: "planetas",
    icon: "planet-outline",
  },
  {
    id: "terra",
    nome: "Terra",
    tipo: "Planeta",
    categoria: "planetas",
    icon: "earth",
  },
  {
    id: "marte",
    nome: "Marte",
    tipo: "Planeta",
    categoria: "planetas",
    icon: "planet",
  },
  {
    id: "jupiter",
    nome: "Júpiter",
    tipo: "Planeta",
    categoria: "planetas",
    icon: "blur-circular",
  },
  {
    id: "saturno",
    nome: "Saturno",
    tipo: "Planeta",
    categoria: "planetas",
    icon: "ring-superior",
  },
  {
    id: "urano",
    nome: "Urano",
    tipo: "Planeta",
    categoria: "planetas",
    icon: "planet-outline",
  },
  {
    id: "netuno",
    nome: "Netuno",
    tipo: "Planeta",
    categoria: "planetas",
    icon: "water-outline",
  },

  // LUAS
  { id: "lua", nome: "Lua", tipo: "Satélite", categoria: "luas", icon: "moon" },
  {
    id: "fobos",
    nome: "Fobos",
    tipo: "Satélite",
    categoria: "luas",
    icon: "moon-outline",
  },
  {
    id: "deimos",
    nome: "Deimos",
    tipo: "Satélite",
    categoria: "luas",
    icon: "moon-outline",
  },
  {
    id: "io",
    nome: "Io",
    tipo: "Satélite",
    categoria: "luas",
    icon: "flame-outline",
  },
  {
    id: "europa",
    nome: "Europa",
    tipo: "Satélite",
    categoria: "luas",
    icon: "snow-outline",
  },
  {
    id: "ganimedes",
    nome: "Ganimedes",
    tipo: "Satélite",
    categoria: "luas",
    icon: "planet-outline",
  },
  {
    id: "calisto",
    nome: "Calisto",
    tipo: "Satélite",
    categoria: "luas",
    icon: "planet-outline",
  },
  {
    id: "tita",
    nome: "Titã",
    tipo: "Satélite",
    categoria: "luas",
    icon: "cloud-outline",
  },
  {
    id: "encelado",
    nome: "Encélado",
    tipo: "Satélite",
    categoria: "luas",
    icon: "water-outline",
  },
  {
    id: "mimas",
    nome: "Mimas",
    tipo: "Satélite",
    categoria: "luas",
    icon: "moon-outline",
  },
  {
    id: "dione",
    nome: "Dione",
    tipo: "Satélite",
    categoria: "luas",
    icon: "moon-outline",
  },
  {
    id: "reia",
    nome: "Reia",
    tipo: "Satélite",
    categoria: "luas",
    icon: "moon-outline",
  },
  {
    id: "tetis",
    nome: "Tétis",
    tipo: "Satélite",
    categoria: "luas",
    icon: "moon-outline",
  },
  {
    id: "miranda",
    nome: "Miranda",
    tipo: "Satélite",
    categoria: "luas",
    icon: "moon-outline",
  },
  {
    id: "ariel",
    nome: "Ariel",
    tipo: "Satélite",
    categoria: "luas",
    icon: "moon-outline",
  },
  {
    id: "titania",
    nome: "Titânia",
    tipo: "Satélite",
    categoria: "luas",
    icon: "moon-outline",
  },
  {
    id: "tritao",
    nome: "Tritão",
    tipo: "Satélite",
    categoria: "luas",
    icon: "snow-outline",
  },

  // NEBULOSAS
  {
    id: "orion",
    nome: "Nebulosa de Órion",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "flare",
  },
  {
    id: "carina",
    nome: "Nebulosa de Carina",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "auto-fix",
  },
  {
    id: "eagle",
    nome: "Nebulosa da Águia",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "feather",
  },
  {
    id: "crab",
    nome: "Nebulosa do Caranguejo",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "crane",
  },
  {
    id: "ring",
    nome: "Nebulosa do Anel",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "circle-outline",
  },
  {
    id: "helix",
    nome: "Nebulosa da Hélice",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "eye-outline",
  },
  {
    id: "horsehead",
    nome: "Nebulosa Cabeça de Cavalo",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "chess-knight",
  },
  {
    id: "lagoon",
    nome: "Nebulosa da Lagoa",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "waves",
  },
  {
    id: "butterfly",
    nome: "Nebulosa da Borboleta",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "butterfly",
  },
  {
    id: "veil",
    nome: "Nebulosa do Véu",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "blur",
  },
  {
    id: "trifid",
    nome: "Nebulosa Trífida",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "clover",
  },
  {
    id: "rosette",
    nome: "Nebulosa da Roseta",
    tipo: "Nebulosa",
    categoria: "nebulosas",
    icon: "flower-outline",
  },

  // GALÁXIAS
  {
    id: "andromeda",
    nome: "Andrômeda",
    tipo: "Galáxia",
    categoria: "galaxias",
    icon: "sync",
  },
  {
    id: "vialactea",
    nome: "Via Láctea",
    tipo: "Galáxia",
    categoria: "galaxias",
    icon: "milky-way",
  },
  {
    id: "sombrero",
    nome: "Sombrero (M104)",
    tipo: "Galáxia",
    categoria: "galaxias",
    icon: "orbit",
  },
  {
    id: "redemoinho",
    nome: "Redemoinho (M51)",
    tipo: "Galáxia",
    categoria: "galaxias",
    icon: "rotate-3d-variant",
  },
  {
    id: "triangulo",
    nome: "Triângulo (M33)",
    tipo: "Galáxia",
    categoria: "galaxias",
    icon: "triangle-outline",
  },
  {
    id: "centauroA",
    nome: "Centaurus A",
    tipo: "Galáxia",
    categoria: "galaxias",
    icon: "radioactive",
  },
  {
    id: "magalhaesgr",
    nome: "Grande Nuvem de Magalhães",
    tipo: "Galáxia",
    categoria: "galaxias",
    icon: "cloud-outline",
  },
  {
    id: "magalhaespq",
    nome: "Pequena Nuvem de Magalhães",
    tipo: "Galáxia",
    categoria: "galaxias",
    icon: "cloud-outline",
  },
  {
    id: "m87",
    nome: "Galáxia M87",
    tipo: "Galáxia",
    categoria: "galaxias",
    icon: "circle-double",
  },
  {
    id: "pinwheel",
    nome: "Pinwheel (M101)",
    tipo: "Galáxia",
    categoria: "galaxias",
    icon: "pinwheel-outline",
  },

  // CONSTELAÇÕES
  {
    id: "cruzeiro",
    nome: "Cruzeiro do Sul",
    tipo: "Constelação",
    categoria: "constelacoes",
    icon: "star-outline",
  },
];

export default function ExploreScreen() {
  const params = useLocalSearchParams();
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (params.filter) {
      setFilter(params.filter as string);
    }
  }, [params.filter]);

  const filteredData = allAstros.filter((item) => {
    const matchesFilter =
      filter === "Todos" || item.categoria === filter.toLowerCase();
    const matchesSearch = item.nome
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const categories = [
    "Todos",
    "Planetas",
    "Luas",
    "Nebulosas",
    "Galaxias",
    "Constelacoes",
  ];

  const renderAstroIcon = (iconName: string, category: string) => {
    if (category === "planetas" || category === "luas") {
      return <Ionicons name={iconName as any} size={30} color="#4DB6AC" />;
    }
    return (
      <MaterialCommunityIcons
        name={iconName as any}
        size={30}
        color="#4DB6AC"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Explorar</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar no universo..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={{ height: 50, marginBottom: 15 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, filter === cat && styles.catBtnActive]}
              onPress={() => setFilter(cat)}
            >
              <Text
                style={[
                  styles.catBtnText,
                  filter === cat && styles.catBtnTextActive,
                ]}
              >
                {cat === "Galaxias"
                  ? "Galáxias"
                  : cat === "Constelacoes"
                    ? "Constelações"
                    : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => `${item.categoria}-${item.id}`}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Link href={`/${item.categoria}/${item.id}` as any} asChild>
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={styles.iconContainer}>
                {renderAstroIcon(item.icon, item.categoria)}
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.nome}</Text>
                <Text style={styles.cardSubtitle}>{item.tipo}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4DB6AC" />
            </TouchableOpacity>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05050A",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#1A1A2E",
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  searchInput: { color: "#FFF", marginLeft: 10, flex: 1, fontSize: 16 },
  catContainer: { paddingRight: 20 },
  catBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#1A1A2E",
    marginRight: 10,
    height: 40,
    justifyContent: "center",
  },
  catBtnActive: { backgroundColor: "#4DB6AC" },
  catBtnText: { color: "#888", fontWeight: "600" },
  catBtnTextActive: { color: "#05050A" },
  card: {
    backgroundColor: "#1A1A2E",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 12,
    backgroundColor: "rgba(77, 182, 172, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { flex: 1, marginLeft: 15 },
  cardTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  cardSubtitle: { color: "#4DB6AC", fontSize: 13, marginTop: 2 },
});
