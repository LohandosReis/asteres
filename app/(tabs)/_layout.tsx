import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4DB6AC",
        tabBarInactiveTintColor: "#888888",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#0B0D17",
          borderTopColor: "#1A1A2E",
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10, // levemente menor para caber 5 abas
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={26}
              name={focused ? "planet" : "planet-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={26}
              name={focused ? "search" : "search-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="quiz"
        options={{
          title: "Quiz",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={26}
              name={focused ? "help-circle" : "help-circle-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="apod"
        options={{
          title: "Hoje",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={26}
              name={focused ? "telescope" : "telescope-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="news"
        options={{
          title: "Notícias",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={26}
              name={focused ? "newspaper" : "newspaper-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
