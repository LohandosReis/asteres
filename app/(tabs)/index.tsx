import { Link } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Asteres</Text>
        <Text style={styles.subtitle}>Explore o universo na palma da mão</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* SEÇÃO DE PLANETAS */}
        <Text style={styles.sectionTitle}>Planetas</Text>

        <Link href="/astro/jupiter" asChild>
          <TouchableOpacity style={styles.card}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg",
              }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Júpiter</Text>
              <Text style={styles.cardSubtitle}>Planeta Gasoso</Text>
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/astro/terra" asChild>
          <TouchableOpacity style={styles.card}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg",
              }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Terra</Text>
              <Text style={styles.cardSubtitle}>Planeta Rochoso</Text>
            </View>
          </TouchableOpacity>
        </Link>

        {/* SEÇÃO DE GALÁXIAS E NEBULOSAS */}
        <Text style={styles.sectionTitle}>Galáxias e Nebulosas</Text>

        <Link href="/astro/andromeda" asChild>
          <TouchableOpacity style={styles.card}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg",
              }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Andrômeda</Text>
              <Text style={styles.cardSubtitle}>Galáxia Espiral</Text>
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/astro/orion" asChild>
          <TouchableOpacity style={styles.card}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg",
              }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Nebulosa de Órion</Text>
              <Text style={styles.cardSubtitle}>Berçário Estelar</Text>
            </View>
          </TouchableOpacity>
        </Link>

        {/* BOTÃO DO QUIZ CORRIGIDO */}
        <Link href="/quiz" asChild>
          <TouchableOpacity style={styles.quizCard}>
            <View style={styles.cardContent}>
              <Text style={styles.quizTitle}>🚀 Jogar Quiz Espacial</Text>
              <Text style={styles.quizSubtitle}>Teste seus conhecimentos!</Text>
            </View>
          </TouchableOpacity>
        </Link>

        {/* Espaço extra no final para conseguir rolar a tela tranquilamente */}
        <View style={styles.footerSpace} />
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
    paddingBottom: 10,
  },
  title: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#4DB6AC",
    fontSize: 16,
    marginTop: 5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#1A1A2E",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  cardImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 15,
    flex: 1,
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    color: "#888",
    fontSize: 14,
    marginTop: 4,
  },

  // Novos estilos limpos para não quebrar a Web
  quizCard: {
    backgroundColor: "#4DB6AC",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  quizTitle: {
    color: "#05050A",
    fontSize: 18,
    fontWeight: "bold",
  },
  quizSubtitle: {
    color: "#05050A",
    fontSize: 14,
    marginTop: 4,
  },
  footerSpace: {
    height: 40,
  },
});
