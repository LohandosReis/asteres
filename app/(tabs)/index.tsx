import { Link } from "expo-router";
import React from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Importando os ícones
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  // 1. CONFIGURAÇÃO DAS CATEGORIAS COM ÍCONES
  const categories = [
    {
      title: "Planetas",
      subtitle: "Os mundos do Sistema Solar",
      route: "/explore?filter=Planetas",
      icon: "planet",
      lib: "Ionicons",
    },
    {
      title: "Luas",
      subtitle: "Satélites e companheiros espaciais",
      route: "/explore?filter=Luas",
      icon: "moon",
      lib: "Ionicons",
    },
    {
      title: "Nebulosas",
      subtitle: "Berçários de estrelas distantes",
      route: "/explore?filter=Nebulosas",
      icon: "flare",
      lib: "MaterialCommunityIcons",
    },
    {
      title: "Galáxias",
      subtitle: "Imensas cidades de estrelas",
      route: "/explore?filter=Galaxias",
      icon: "orbit",
      lib: "MaterialCommunityIcons",
    },
    {
      title: "Constelações",
      subtitle: "Mapas estelares da antiguidade",
      route: "/explore?filter=Constelacoes",
      icon: "auto-fix",
      lib: "MaterialCommunityIcons",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* HEADER DA TELA */}
      <View style={styles.header}>
        <Text style={styles.title}>Asteres</Text>
        <Text style={styles.headerSubtitle}>Guia Definitivo do Cosmos</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeText}>O que vamos explorar hoje?</Text>

        {/* MAPEAMENTO DAS CATEGORIAS */}
        {categories.map((cat) => (
          <View key={cat.title} style={styles.section}>
            <Link href={cat.route as any} asChild>
              <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                {/* CONTAINER DO ÍCONE DE FUNDO */}
                <View style={styles.iconBackground}>
                  {cat.lib === "Ionicons" ? (
                    <Ionicons
                      name={cat.icon as any}
                      size={80}
                      color="rgba(77, 182, 172, 0.15)"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={80}
                      color="rgba(77, 182, 172, 0.15)"
                    />
                  )}
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.row}>
                    {/* MINI ÍCONE AO LADO DO TÍTULO */}
                    {cat.lib === "Ionicons" ? (
                      <Ionicons
                        name={cat.icon as any}
                        size={24}
                        color="#4DB6AC"
                        style={{ marginRight: 10 }}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name={cat.icon as any}
                        size={24}
                        color="#4DB6AC"
                        style={{ marginRight: 10 }}
                      />
                    )}
                    <Text style={styles.cardTitle}>{cat.title}</Text>
                  </View>

                  <Text style={styles.cardDescription}>{cat.subtitle}</Text>

                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Explorar Categoria</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color="#4DB6AC"
                      style={{ marginLeft: 5 }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          </View>
        ))}

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#05050A",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 20,
    backgroundColor: "#05050A",
  },
  title: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: "#4DB6AC",
    fontSize: 16,
    fontWeight: "500",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeText: {
    color: "#888",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 20,
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1A1A2E",
    borderRadius: 20,
    height: 140,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#222",
    justifyContent: "center",
  },
  iconBackground: {
    position: "absolute",
    right: -10,
    bottom: -10,
    transform: [{ rotate: "-15deg" }],
  },
  cardContent: {
    padding: 20,
    zIndex: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  cardDescription: {
    color: "#CCC",
    fontSize: 14,
    opacity: 0.8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(77, 182, 172, 0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "rgba(77, 182, 172, 0.3)",
  },
  badgeText: {
    color: "#4DB6AC",
    fontSize: 12,
    fontWeight: "bold",
  },
});
