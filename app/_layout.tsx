import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      {/* O Stack reconhece automaticamente as outras pastas se elas estiverem na raiz de 'app' */}
    </Stack>
  );
}
