import { Ionicons } from '@expo/vector-icons'; // Usando Ionicons para ícones melhores
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4DB6AC', // Cor de destaque (ciano/verde água)
        tabBarInactiveTintColor: '#888888', // Cor dos ícones inativos
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#0B0D17', // Fundo azul escuro/preto (Design Espacial)
          borderTopColor: '#1A1A2E', // Linha sutil na borda superior
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={28} name={focused ? 'planet' : 'planet-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={28} name={focused ? 'search' : 'search-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={28} name={focused ? 'help-circle' : 'help-circle-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'Notícias',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={28} name={focused ? 'newspaper' : 'newspaper-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}