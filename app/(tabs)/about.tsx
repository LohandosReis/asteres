import { Ionicons } from "@expo/vector-icons";
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

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sobre o Asteres</Text>
        </View>

        <View style={styles.content}>
          <Image
            source={require("../../assets/images/logo-asteres.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Asteres</Text>
          <Text style={styles.version}>Versão 1.0.0</Text>

          <Text style={styles.description}>
            O Asteres é o seu guia de bolso para explorar o universo. Descubra
            planetas, luas e galáxias com imagens reais e dados astronômicos
            precisos.
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="rocket" size={24} color="#4DB6AC" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Missão</Text>
                <Text style={styles.infoDesc}>
                  Tornar o espaço acessível a todos através da tecnologia.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="code-slash" size={24} color="#4DB6AC" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Desenvolvimento</Text>
                <Text style={styles.infoDesc}>
                  Aplicativo construído com React Native e Expo Router.
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Avaliar o Aplicativo</Text>
          </TouchableOpacity>
        </View>
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
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10, marginTop: 10 },
  title: { color: "#FFF", fontSize: 28, fontWeight: "bold" },
  content: { padding: 20, alignItems: "center" },
  logoImage: { width: 100, height: 100, borderRadius: 25, marginBottom: 15 },
  appName: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  version: { color: "#888", fontSize: 14, marginBottom: 20 },
  description: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: "#1A1A2E",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    marginBottom: 30,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoTextContainer: { marginLeft: 15, flex: 1 },
  infoTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  infoDesc: { color: "#888", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#2A2A3E", marginVertical: 15 },
  button: {
    backgroundColor: "#4DB6AC",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#05050A", fontSize: 16, fontWeight: "bold" },
});
