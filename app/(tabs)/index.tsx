import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const destaques = [
  { id: 'terra', nome: 'Terra', tipo: 'Planeta', imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg' },
  { id: 'marte', nome: 'Marte', tipo: 'Planeta', imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg' },
  { id: 'lua', nome: 'A Lua', tipo: 'Lua', imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg' },
  { id: 'saturno', nome: 'Saturno', tipo: 'Planeta', imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>Asteres</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planeta do Dia</Text>
          <TouchableOpacity 
            style={styles.planetOfDayCard}
            onPress={() => router.push('/astro/jupiter')}
          >
            <Image 
              style={styles.planetImage} 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg' }} 
            />
            <View style={styles.planetInfo}>
              <Text style={styles.planetName}>Júpiter</Text>
              <Text style={styles.planetDesc}>O maior planeta do nosso sistema solar. Tem tempestades gigantes!</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destaques</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={destaques}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.card}
                onPress={() => router.push(`/astro/${item.id}`)}
              >
                <Image style={styles.cardImage} source={{ uri: item.imagemUrl }} />
                <Text style={styles.cardTitle}>{item.nome}</Text>
                <Text style={styles.cardSubtitle}>{item.tipo}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05050A', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 30, marginTop: 10 },
  logo: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  section: { marginBottom: 35 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: '600', marginBottom: 15 },
  planetOfDayCard: { backgroundColor: '#1A1A2E', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center' },
  planetImage: { width: 70, height: 70, borderRadius: 35, marginRight: 15, backgroundColor: '#1A1A2E' },
  planetInfo: { flex: 1 },
  planetName: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  planetDesc: { color: '#A0A0B0', fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: '#1A1A2E', borderRadius: 15, padding: 15, marginRight: 15, alignItems: 'center', width: 130 },
  cardImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10, backgroundColor: '#1A1A2E' },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: '#4DB6AC', fontSize: 12, marginTop: 4 },
});