import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const astrosBd = {
  'jupiter': {
    nome: 'Júpiter',
    tipo: 'Planeta',
    temperatura: '-108°C',
    diametro: '139.822 km',
    distancia: '778 milhões km',
    extra: '79 Luas',
    fatos: [
      'Júpiter é o maior planeta do nosso sistema solar.',
      'Sua Grande Mancha Vermelha é uma tempestade gigantesca maior que a Terra.',
      'Um dia em Júpiter dura apenas 10 horas.'
    ],
    cor: '#C88C51'
  },
  'lua': {
    nome: 'A Lua',
    tipo: 'Lua',
    temperatura: '-53°C',
    diametro: '3.474 km',
    distancia: '384.400 km',
    extra: 'Órbita: 27.3 dias',
    fatos: [
      'A Lua mostra sempre a mesma face para a Terra.',
      'Foi formada há cerca de 4,5 bilhões de anos.',
      'A Lua não possui atmosfera.'
    ],
    cor: '#CCCCCC'
  },
  'terra': {
    nome: 'Terra',
    tipo: 'Planeta',
    temperatura: '15°C',
    diametro: '12.742 km',
    distancia: '149.6 milhões km',
    extra: '1 Lua',
    fatos: [
      'É o único planeta conhecido a abrigar vida no universo.',
      'Cerca de 71% da superfície da Terra é coberta por água.',
      'A Terra não é uma esfera perfeita, é um esferoide oblato.'
    ],
    cor: '#4A90E2'
  },
  'marte': {
    nome: 'Marte',
    tipo: 'Planeta',
    temperatura: '-60°C',
    diametro: '6.779 km',
    distancia: '227.9 milhões km',
    extra: '2 Luas',
    fatos: [
      'Conhecido como o Planeta Vermelho devido ao óxido de ferro na superfície.',
      'Possui o maior vulcão do sistema solar, o Olympus Mons.',
      'Sua atmosfera é muito fina e composta principalmente de dióxido de carbono.'
    ],
    cor: '#E24A4A'
  },
  'saturno': {
    nome: 'Saturno',
    tipo: 'Planeta',
    temperatura: '-139°C',
    diametro: '116.460 km',
    distancia: '1.4 bilhão km',
    extra: '82 Luas',
    fatos: [
      'Famoso pelo seu complexo e brilhante sistema de anéis.',
      'É o planeta menos denso do sistema solar, flutuaria na água.',
      'Os anéis são feitos de pedaços de gelo e rocha.'
    ],
    cor: '#E2C24A'
  },
  'tita': {
    nome: 'Titã',
    tipo: 'Lua',
    temperatura: '-179°C',
    diametro: '5.149 km',
    distancia: '1.2 bilhão km',
    extra: 'Órbita Saturno',
    fatos: [
      'A maior lua de Saturno e a segunda maior do sistema solar.',
      'Única lua conhecida com uma atmosfera densa.',
      'Possui lagos e rios de metano e etano líquidos.'
    ],
    cor: '#E2A74A'
  },
  'europa': {
    nome: 'Europa',
    tipo: 'Lua',
    temperatura: '-160°C',
    diametro: '3.121 km',
    distancia: '628 milhões km',
    extra: 'Órbita Júpiter',
    fatos: [
      'Uma das quatro luas galileanas de Júpiter.',
      'Sua superfície é composta de gelo de água.',
      'Acredita-se que exista um oceano de água líquida sob a crosta de gelo.'
    ],
    cor: '#A0D8E0'
  },
  'andromeda': {
    nome: 'Andrômeda',
    tipo: 'Galáxia',
    temperatura: 'Variável',
    diametro: '220.000 anos-luz',
    distancia: '2.5 milhões anos-luz',
    extra: '1 Trilhão de estrelas',
    fatos: [
      'A galáxia espiral mais próxima da Via Láctea.',
      'Está em rota de colisão com a nossa galáxia.',
      'Pode ser vista a olho nu no céu noturno em locais escuros.'
    ],
    cor: '#9B59B6'
  }
};

export default function AstroDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const astro = astrosBd[id as keyof typeof astrosBd] || astrosBd['jupiter'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={[styles.planetImage, { backgroundColor: astro.cor }]} />
          <Text style={styles.planetTemperature}>{astro.temperatura}</Text>
          <Text style={styles.planetName}>{astro.nome}</Text>
          <Text style={styles.planetType}>{astro.tipo}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fatos Principais</Text>
          <View style={styles.factsGrid}>
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>Diâmetro</Text>
              <Text style={styles.factValue}>{astro.diametro}</Text>
            </View>
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>Distância</Text>
              <Text style={styles.factValue}>{astro.distancia}</Text>
            </View>
            <View style={styles.factCard}>
              <Text style={styles.factLabel}>Extra</Text>
              <Text style={styles.factValue}>{astro.extra}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição e Curiosidades</Text>
          <View style={styles.curiositiesBox}>
            {astro.fatos.map((fato, index) => (
              <View key={index} style={styles.curiosityItem}>
                <Ionicons name="ellipse" size={8} color="#4DB6AC" style={styles.bullet} />
                <Text style={styles.curiosityText}>{fato}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05050A', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#FFF', fontSize: 16, marginLeft: 5 },
  container: { flex: 1, paddingHorizontal: 20 },
  heroSection: { alignItems: 'center', marginBottom: 40, marginTop: 10 },
  planetImage: { width: 150, height: 150, borderRadius: 75, marginBottom: 20 },
  planetTemperature: { color: '#4DB6AC', fontSize: 24, fontWeight: 'bold' },
  planetName: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  planetType: { color: '#888', fontSize: 18, marginTop: 5 },
  section: { marginBottom: 30 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  factsGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  factCard: { backgroundColor: '#1A1A2E', padding: 15, borderRadius: 15, width: '48%', marginBottom: 15 },
  factLabel: { color: '#888', fontSize: 12, marginBottom: 5 },
  factValue: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  curiositiesBox: { backgroundColor: '#1A1A2E', padding: 20, borderRadius: 15 },
  curiosityItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  bullet: { marginTop: 6, marginRight: 10 },
  curiosityText: { color: '#FFF', fontSize: 14, lineHeight: 22, flex: 1 },
});