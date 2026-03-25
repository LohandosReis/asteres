import React, { useState } from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Categorias de notícias baseadas no wireframe
const categorias = ['Todas', 'Astronomia', 'Tecnologia', 'Descobertas', 'Missões'];

// Dados das notícias copiados exatamente do seu PDF (Página 6)
const noticiasData = [
  {
    id: '1',
    titulo: 'James Webb Telescope Captures Stunning Distant Galaxy',
    data: '14 de Março, 2022',
    categoria: 'Astronomia',
    descricao: "NASA's Webb reveals an ancient galaxy billions of light-years away.",
    corImagem: '#9B59B6', // Roxo (Galáxia)
  },
  {
    id: '2',
    titulo: 'Artemis I Successfully Launches to the Moon',
    data: '16 de Novembro, 2022',
    categoria: 'Missões',
    descricao: "NASA's Artemis I begins its journey back to the lunar surface.",
    corImagem: '#E67E22', // Laranja (Foguetão/Fogo)
  },
  {
    id: '3',
    titulo: 'Hubble Observes Powerful Supernova Blast',
    data: '5 de Fevereiro, 2022',
    categoria: 'Descobertas',
    descricao: 'Hubble spots a spectacular supernova in a distant galaxy.',
    corImagem: '#F1C40F', // Amarelo (Explosão)
  },
  {
    id: '4',
    titulo: "Water Ice Discovered Under Mars' Surface",
    data: '22 de Janeiro, 2022',
    categoria: 'Tecnologia',
    descricao: 'New radar data reveals large ice deposits beneath Martian soil.',
    corImagem: '#3498DB', // Azul (Gelo/Água)
  },
];

export default function NewsScreen() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');

  // Filtra as notícias com base na aba selecionada
  const noticiasFiltradas = categoriaAtiva === 'Todas' 
    ? noticiasData 
    : noticiasData.filter(noticia => noticia.categoria === categoriaAtiva);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <Text style={styles.pageTitle}>Notícias</Text>

        {/* Filtros de Categoria */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categorias}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.filterButton, categoriaAtiva === item && styles.filterButtonActive]}
                onPress={() => setCategoriaAtiva(item)}
              >
                <Text style={[styles.filterText, categoriaAtiva === item && styles.filterTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Lista de Notícias */}
        <FlatList
          data={noticiasFiltradas}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.newsCard}>
              {/* Quadrado simulando a imagem da notícia */}
              <View style={[styles.newsImage, { backgroundColor: item.corImagem }]} />
              
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle} numberOfLines={2}>{item.titulo}</Text>
                
                <View style={styles.newsMeta}>
                  <Text style={styles.newsDate}>{item.data}</Text>
                  <Text style={styles.newsCategory}>{item.categoria}</Text>
                </View>
                
                <Text style={styles.newsDescription} numberOfLines={2}>{item.descricao}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05050A',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  filtersContainer: {
    marginBottom: 25,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterButtonActive: {
    borderBottomColor: '#4DB6AC', // Linha ciano embaixo da aba ativa (estilo do wireframe)
  },
  filterText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#4DB6AC',
  },
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  newsImage: {
    width: 100,
    height: '100%',
  },
  newsContent: {
    flex: 1,
    padding: 15,
  },
  newsTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  newsDate: {
    color: '#888',
    fontSize: 12,
  },
  newsCategory: {
    color: '#4DB6AC',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newsDescription: {
    color: '#A0A0B0',
    fontSize: 13,
    lineHeight: 18,
  },
});