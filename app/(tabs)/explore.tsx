import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


const astrosData = [
  { id: 'jupiter', nome: 'Júpiter', tipo: 'Planeta', cor: '#C88C51' },
  { id: 'tita', nome: 'Titã', tipo: 'Lua', cor: '#E2A74A' },
  { id: 'marte', nome: 'Marte', tipo: 'Planeta', cor: '#E24A4A' },
  { id: 'europa', nome: 'Europa', tipo: 'Lua', cor: '#A0D8E0' },
  { id: 'saturno', nome: 'Saturno', tipo: 'Planeta', cor: '#E2C24A' },
  { id: 'lua', nome: 'A Lua', tipo: 'Lua', cor: '#CCCCCC' },
  { id: 'andromeda', nome: 'Andrômeda', tipo: 'Galáxia', cor: '#9B59B6' },
];

const categorias = ['Todos', 'Planetas', 'Luas', 'Estruturas'];

export default function ExploreScreen() {
  const [pesquisa, setPesquisa] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const router = useRouter(); // <-- Inicializamos o router aqui!

  const astrosFiltrados = astrosData.filter((astro) => {
    const atendePesquisa = astro.nome.toLowerCase().includes(pesquisa.toLowerCase());
    const atendeCategoria = 
      categoriaAtiva === 'Todos' || 
      (categoriaAtiva === 'Estruturas' && astro.tipo === 'Galáxia') || 
      astro.tipo + 's' === categoriaAtiva; 

    return atendePesquisa && atendeCategoria;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <Text style={styles.title}>Explorar</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar astros..."
            placeholderTextColor="#888"
            value={pesquisa}
            onChangeText={setPesquisa}
          />
        </View>

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

        <FlatList
          data={astrosFiltrados}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            
           
            <TouchableOpacity 
              style={styles.astroCard}
              onPress={() => router.push(`/astro/${item.id}`)}
            >
              <View style={[styles.astroImage, { backgroundColor: item.cor }]} />
              <View style={styles.astroInfo}>
                <Text style={styles.astroName}>{item.nome}</Text>
                <Text style={styles.astroType}>{item.tipo}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#888" />
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
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 10, paddingHorizontal: 15, height: 50, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 16 },
  filtersContainer: { marginBottom: 20 },
  filterButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1A1A2E', marginRight: 10 },
  filterButtonActive: { backgroundColor: '#4DB6AC' },
  filterText: { color: '#888', fontWeight: '600' },
  filterTextActive: { color: '#05050A' },
  astroCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 15, padding: 15, marginBottom: 15 },
  astroImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  astroInfo: { flex: 1 },
  astroName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  astroType: { color: '#4DB6AC', fontSize: 14, marginTop: 2 },
});