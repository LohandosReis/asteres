import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

export function useOfflineCache() {

  // ── Salva dados de API no AsyncStorage com timestamp ─────────
  const salvarCache = async (chave: string, dados: any) => {
    const entry = { dados, timestamp: Date.now() };
    await AsyncStorage.setItem(`@cache_${chave}`, JSON.stringify(entry));
  };

  // ── Carrega do cache se ainda não expirou (24h) ───────────────
  const carregarCache = async <T>(chave: string): Promise<T | null> => {
    try {
      const raw = await AsyncStorage.getItem(`@cache_${chave}`);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (Date.now() - entry.timestamp > CACHE_EXPIRY) return null;
      return entry.dados as T;
    } catch {
      return null;
    }
  };

  // ── Faz download da imagem e salva localmente ─────────────────
  const cachearImagem = async (url: string, id: string): Promise<string> => {
    try {
      const localUri = FileSystem.Paths.join(FileSystem.Paths.document, `img_${id}.jpg`);
      const info = await FileSystem.getInfoAsync(localUri);
      if (info.exists) return localUri; // já está em cache
      const secureUrl = url.replace(/^http:\/\//i, "https://");
      const { uri } = await FileSystem.downloadAsync(secureUrl, localUri);
      return uri;
    } catch {
      return url; // se falhar, retorna URL original
    }
  };

  // ── Verifica se imagem já está cacheada ───────────────────────
  const getImagemCacheada = async (id: string): Promise<string | null> => {
    try {
      const localUri = FileSystem.Paths.join(FileSystem.Paths.document, `img_${id}.jpg`);
      const info = await FileSystem.getInfoAsync(localUri);
      return info.exists ? localUri : null;
    } catch {
      return null;
    }
  };

  // ── Informações sobre o cache de imagens ─────────────────────
  const infoCacheImagens = async () => {
    try {
      const directoryPath = FileSystem.Paths.join(FileSystem.Paths.document);
      const dir = await FileSystem.readDirectoryAsync(directoryPath);
      const imagens = dir.filter((f) => f.startsWith("img_"));
      let totalBytes = 0;
      for (const img of imagens) {
        const info = await FileSystem.getInfoAsync(
          FileSystem.Paths.join(FileSystem.Paths.document, img)
        );
        if (info.exists && (info as any).size) totalBytes += (info as any).size;
      }
      return {
        quantidade: imagens.length,
        tamanhoMB: (totalBytes / 1024 / 1024).toFixed(1),
      };
    } catch {
      return { quantidade: 0, tamanhoMB: "0" };
    }
  };

  // ── Limpa todo o cache ────────────────────────────────────────
  const limparCache = async () => {
    try {
      const directoryPath = FileSystem.Paths.join(FileSystem.Paths.document);
      const dir = await FileSystem.readDirectoryAsync(directoryPath);
      const imagens = dir.filter((f) => f.startsWith("img_"));
      await Promise.all(
        imagens.map((img) =>
          FileSystem.deleteAsync(FileSystem.Paths.join(FileSystem.Paths.document, img), {
            idempotent: true,
          })
        )
      );
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith("@cache_"));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (e) {
      console.error("Erro ao limpar cache:", e);
    }
  };

  return {
    salvarCache,
    carregarCache,
    cachearImagem,
    getImagemCacheada,
    infoCacheImagens,
    limparCache,
  };
}