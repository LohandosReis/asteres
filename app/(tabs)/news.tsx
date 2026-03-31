import React from 'react';
import { FlatList, Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const noticiasData = [
  { id: '1', titulo: 'Nova lua descoberta orbitando Júpiter', data: 'Hoje', fonte: 'Space Daily', imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg' },
  { id: '2', titulo: 'Rover encontra vestígios de água em Marte', data: 'Ontem', fonte: 'Astro News', imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg' },
  { id: '3', titulo: 'Telescópio captura imagem inédita de Andrômeda', data: 'Há 3 dias', fonte: 'Galactic Times', imagemUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg' },
];

export default function NewsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notícias</Text>
        </View>

        <FlatList
          data={noticiasData}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.newsCard}>
              <Image source={{ uri: item.imagemUrl }} style={styles.newsImage} />
              <View style={styles.newsInfo}>
                <Text style={styles.newsTitle} numberOfLines={2}>{item.titulo}</Text>
                <View style={styles.newsMeta}>
                  <Text style={styles.newsSource}>{item.fonte}</Text>
                  <Text style={styles.newsDate}>{item.data}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05050A', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 20, marginTop: 10 },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  newsCard: { backgroundColor: '#1A1A2E', borderRadius: 15, overflow: 'hidden', marginBottom: 20 },
  newsImage: { width: '100%', height: 150, backgroundColor: '#2A2A3E' },
  newsInfo: { padding: 15 },
  newsTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 10, lineHeight: 24 },
  newsMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  newsSource: { color: '#4DB6AC', fontSize: 14, fontWeight: 'bold' },
  newsDate: { color: '#888', fontSize: 12 },
});