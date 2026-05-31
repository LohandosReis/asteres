import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

type Props = {
  imageUrl: string | null;
  filename?: string;
  style?: object;
};

export default function DownloadButton({
  imageUrl,
  filename = "asteres_nasa",
  style,
}: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  const handleDownload = async () => {
    if (!imageUrl || status === "loading" || status === "done") return;

    // Pede permissão de galeria
    const { status: permStatus } = await MediaLibrary.requestPermissionsAsync();
    if (permStatus !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à galeria para salvar imagens da NASA.",
        [{ text: "OK" }]
      );
      return;
    }

    setStatus("loading");
    try {
      const secureUrl = imageUrl.replace(/^http:\/\//i, "https://");
      const fileUri = FileSystem.Paths.join(
        FileSystem.Paths.cache,
        `${filename}_${Date.now()}.jpg`
      );

      // Baixa para cache temporário
      const { uri } = await FileSystem.downloadAsync(secureUrl, fileUri);

      // Salva na galeria
      await MediaLibrary.saveToLibraryAsync(uri);

      setStatus("done");
      Alert.alert(
        "✅ Salvo na galeria!",
        "A imagem oficial da NASA foi salva com sucesso."
      );
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      Alert.alert("Erro", "Não foi possível salvar a imagem. Tente novamente.");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const config = {
    idle:    { icon: "download-outline" as const, color: "#4DB6AC", label: "Salvar imagem" },
    loading: { icon: "download-outline" as const, color: "#888",    label: "Salvando..."   },
    done:    { icon: "checkmark-circle" as const, color: "#4CAF50", label: "Salvo!"        },
    error:   { icon: "alert-circle"    as const, color: "#EF5350", label: "Erro"           },
  };

  const { icon, color, label } = config[status];

  return (
    <TouchableOpacity
      style={[styles.btn, { borderColor: color + "66" }, style]}
      onPress={handleDownload}
      disabled={status === "loading"}
      activeOpacity={0.8}
    >
      {status === "loading" ? (
        <ActivityIndicator size={16} color="#4DB6AC" />
      ) : (
        <Ionicons name={icon} size={18} color={color} />
      )}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(77,182,172,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: { fontSize: 13, fontWeight: "bold" },
});