import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Ferramentas do Firebase
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    limit,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { auth, db } from "../../services/firebaseConfig";

export default function SocialScreen() {
  // Autenticação e Perfil
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [dadosExtras, setDadosExtras] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  // Estados do Social
  const [ranking, setRanking] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<any[]>([]);
  const [desafiosRecebidos, setDesafiosRecebidos] = useState<any[]>([]);

  // 1. Monitor do Estado de Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuarioLogado(user);
      if (user) {
        // Carrega dados do usuário atual
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDadosExtras(docSnap.data());
        } else {
          // Se por acaso o documento não existir, cria um padrão para não quebrar
          const padrao = {
            nome: user.email?.split("@")[0],
            idade: "20",
            nivel: 1,
            xp: 0,
          };
          await setDoc(docRef, padrao);
          setDadosExtras(padrao);
        }
      }
      setCarregando(false);
    });
    return unsubscribe;
  }, []);

  // 2. Monitor do Ranking Global (Puxa os top 10 por Nível em tempo real)
  useEffect(() => {
    if (!usuarioLogado) return;

    const q = query(
      collection(db, "usuarios"),
      orderBy("nivel", "desc"),
      limit(10),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaRanking: any[] = [];
      snapshot.forEach((doc) => {
        listaRanking.push({ id: doc.id, ...doc.data() });
      });
      setRanking(listaRanking);
      setUsuariosFiltrados(listaRanking); // Inicializa a busca com o ranking
    });

    return unsubscribe;
  }, [usuarioLogado]);

  // 3. Monitor de Desafios em Tempo Real (Escuta se alguém te desafiou)
  useEffect(() => {
    if (!usuarioLogado) return;

    const q = query(
      collection(db, "desafios"),
      where("destinatarioId", "==", usuarioLogado.uid),
      where("status", "==", "pendente"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaDesafios: any[] = [];
      snapshot.forEach((doc) => {
        listaDesafios.push({ id: doc.id, ...doc.data() });
      });
      setDesafiosRecebidos(listaDesafios);
    });

    return unsubscribe;
  }, [usuarioLogado]);

  // --- FUNÇÃO DE BUSCA ---
  const filtrarUsuarios = (texto: string) => {
    setBusca(texto);
    if (texto === "") {
      setUsuariosFiltrados(ranking);
    } else {
      const filtrados = ranking.filter((user) =>
        user.nome.toLowerCase().includes(texto.toLowerCase()),
      );
      setUsuariosFiltrados(filtrados);
    }
  };

  // --- SISTEMA DE ENVIAR DESAFIO ---
  const enviarDesafio = async (
    adversarioId: string,
    adversarioNome: string,
  ) => {
    if (adversarioId === usuarioLogado.uid) {
      Alert.alert("Calma aí!", "Você não pode desafiar você mesmo.");
      return;
    }

    try {
      await addDoc(collection(db, "desafios"), {
        remetenteId: usuarioLogado.uid,
        remetenteNome: dadosExtras?.nome || "Inimigo Oculto",
        destinatarioId: adversarioId,
        destinatarioNome: adversarioNome,
        status: "pendente",
        dataEnvio: new Date().toISOString(),
      });
      Alert.alert(
        "Desafio Enviado! ⚔️",
        `Você desafiou ${adversarioNome}. Aguarde ele responder.`,
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar o desafio.");
    }
  };

  // --- SISTEMA DE RESPONDER DESAFIO (ACEITAR / RECUSAR) ---
  const responderDesafio = async (
    idDesafio: string,
    acao: "aceito" | "recusado",
  ) => {
    try {
      const docRef = doc(db, "desafios", idDesafio);
      await updateDoc(docRef, { status: acao });

      if (acao === "aceito") {
        Alert.alert(
          "Desafio Aceito!",
          "Prepare-se para a batalha! (Aqui você pode redirecionar para o seu jogo).",
        );
      } else {
        Alert.alert("Recusado", "Você recusou o desafio.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível responder ao desafio.");
    }
  };

  // --- SISTEMA DE CADASTRO/LOGIN ---
  const lidarComAutenticacao = async () => {
    if (email === "" || senha === "") {
      Alert.alert("Campos vazios", "Preencha e-mail e senha.");
      return;
    }
    if (!isLogin && (nome === "" || idade === "")) {
      Alert.alert("Campos vazios", "Preencha Nome e Idade.");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Senha fraca", "A senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    setCarregando(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, senha);
      } else {
        const credencial = await createUserWithEmailAndPassword(
          auth,
          email,
          senha,
        );
        await setDoc(doc(db, "usuarios", credencial.user.uid), {
          nome,
          idade,
          email,
          nivel: 1, // Todo mundo começa no nível 1
          xp: 0,
          dataCadastro: new Date().toISOString(),
        });
        Alert.alert("Sucesso!", "Perfil de Gladiador criado!");
      }
    } catch (error: any) {
      Alert.alert("Erro", "Verifique os dados informados.");
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color="#4DB6AC" />
      </SafeAreaView>
    );
  }

  // TELA DE LOGIN / CADASTRO
  if (!usuarioLogado) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Asteres Social ⚔️</Text>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isLogin ? "Faça seu Login" : "Crie seu Perfil"}
            </Text>
            {!isLogin && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Seu apelido"
                  placeholderTextColor="#888"
                  value={nome}
                  onChangeText={setNome}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Sua Idade"
                  placeholderTextColor="#888"
                  value={idade}
                  onChangeText={setIdade}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </>
            )}
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#888"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={lidarComAutenticacao}
            >
              <Text style={styles.buttonText}>
                {isLogin ? "Entrar na Arena" : "Salvar Perfil e Jogar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchButtonText}>
                {isLogin
                  ? "Novo por aqui? Crie sua conta."
                  : "Já tem conta? Login."}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // TELA SOCIAL PRINCIPAL (LOGADO)
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabeçalho do Usuário */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Gladiador: {dadosExtras?.nome}</Text>
          <Text style={styles.levelText}>Nível {dadosExtras?.nivel || 1}</Text>
        </View>

        {/* NOTIFICAÇÃO DE DESAFIOS RECEBIDOS (Aparece no topo se alguém te desafiar) */}
        {desafiosRecebidos.length > 0 && (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>⚠️ VOCÊ FOI DESAFIADO!</Text>
            {desafiosRecebidos.map((desafio) => (
              <View key={desafio.id} style={styles.alertActions}>
                <Text style={styles.alertText}>
                  **{desafio.remetenteNome}** te chamou pro duelo!
                </Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => responderDesafio(desafio.id, "aceito")}
                  >
                    <Text style={styles.btnAlertText}>Aceitar ⚔️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => responderDesafio(desafio.id, "recusado")}
                  >
                    <Text style={styles.btnAlertText}>Recusar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* CAMPO DE BUSCA */}
        <TextInput
          style={styles.searchBar}
          placeholder="🔍 Buscar jogador pelo nome..."
          placeholderTextColor="#888"
          value={busca}
          onChangeText={filtrarUsuarios}
        />

        {/* SEÇÃO RANKING / RESULTADOS */}
        <Text style={styles.sectionTitle}>
          {busca === ""
            ? "🏆 Ranking Global (Top 10)"
            : "👥 Jogadores Encontrados"}
        </Text>

        <ScrollView style={{ flex: 1, marginTop: 10 }}>
          {usuariosFiltrados.map((item, index) => (
            <View key={item.id} style={styles.playerCard}>
              <View style={styles.playerInfo}>
                {busca === "" && (
                  <Text style={styles.positionText}>#{index + 1}</Text>
                )}
                <View>
                  <Text style={styles.playerName}>
                    {item.nome} {item.id === usuarioLogado.uid && "(Você)"}
                  </Text>
                  <Text style={styles.playerLevel}>
                    Nível {item.nivel || 1} • {item.idade} anos
                  </Text>
                </View>
              </View>

              {/* Botão de Desafiar */}
              {item.id !== usuarioLogado.uid && (
                <TouchableOpacity
                  style={styles.challengeButton}
                  onPress={() => enviarDesafio(item.id, item.nome)}
                >
                  <Text style={styles.challengeButtonText}>Desafiar</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Botão Sair */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => signOut(auth)}
        >
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#05050A",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  center: { justifyContent: "center", alignItems: "center", flex: 1 },
  container: { flex: 1, padding: 20 },
  title: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: { width: "100%" },
  formTitle: { color: "#FFF", fontSize: 18, marginBottom: 15 },
  input: {
    backgroundColor: "#1A1A24",
    color: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4DB6AC",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#05050A", fontSize: 16, fontWeight: "bold" },
  switchButton: { marginTop: 15, alignItems: "center" },
  switchButtonText: { color: "#4DB6AC" },

  // Estilos do Modo Social
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  welcomeText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  levelText: { color: "#4DB6AC", fontSize: 16, fontWeight: "bold" },
  searchBar: {
    backgroundColor: "#1A1A24",
    color: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  sectionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  playerCard: {
    backgroundColor: "#1A1A24",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#2A2A35",
  },
  playerInfo: { flexDirection: "row", alignItems: "center", gap: 15 },
  positionText: {
    color: "#E0A96D",
    fontSize: 18,
    fontWeight: "bold",
    width: 30,
  },
  playerName: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  playerLevel: { color: "#888", fontSize: 13 },
  challengeButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  challengeButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 13 },

  // Caixa de Alerta de Desafio Recebido
  alertBox: {
    backgroundColor: "#1F1625",
    borderColor: "#FF5252",
    borderWidth: 1.5,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  alertTitle: {
    color: "#FF5252",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 5,
  },
  alertActions: { marginTop: 5 },
  alertText: { color: "#FFF", fontSize: 14 },
  acceptButton: {
    backgroundColor: "#4DB6AC",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  declineButton: {
    backgroundColor: "#333",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  btnAlertText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },

  logoutButton: {
    borderColor: "#FF5252",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  logoutButtonText: { color: "#FF5252", fontWeight: "bold" },
});
