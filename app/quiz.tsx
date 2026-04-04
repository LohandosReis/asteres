import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Nosso banco de perguntas
const perguntas = [
  {
    pergunta: "Qual é o maior planeta do Sistema Solar?",
    opcoes: ["Terra", "Júpiter", "Saturno", "Marte"],
    respostaCorreta: 1, // O índice da resposta certa (Júpiter está na posição 1, lembrando que começa do 0)
  },
  {
    pergunta: "Qual galáxia está em rota de colisão com a Via Láctea?",
    opcoes: ["Andrômeda", "Sombrero", "Olho Negro", "Triângulo"],
    respostaCorreta: 0,
  },
  {
    pergunta: "O que é uma Nebulosa?",
    opcoes: [
      "Um buraco negro",
      "Uma estrela morta",
      "Um berçário de estrelas",
      "Um cometa gigante",
    ],
    respostaCorreta: 2,
  },
];

export default function QuizScreen() {
  const router = useRouter();
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [pontuacao, setPontuacao] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const responder = (indexSelecionado: number) => {
    if (indexSelecionado === perguntas[perguntaAtual].respostaCorreta) {
      setPontuacao(pontuacao + 1);
    }

    const proximaPergunta = perguntaAtual + 1;
    if (proximaPergunta < perguntas.length) {
      setPerguntaAtual(proximaPergunta);
    } else {
      setMostrarResultado(true);
    }
  };

  const reiniciarQuiz = () => {
    setPerguntaAtual(0);
    setPontuacao(0);
    setMostrarResultado(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.backText}>Sair do Quiz</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {mostrarResultado ? (
          <View style={styles.resultBox}>
            <Ionicons
              name="trophy"
              size={80}
              color="#FFD700"
              style={styles.icon}
            />
            <Text style={styles.resultTitle}>Fim de Jogo!</Text>
            <Text style={styles.resultScore}>
              Você acertou {pontuacao} de {perguntas.length}
            </Text>
            <TouchableOpacity
              style={styles.restartButton}
              onPress={reiniciarQuiz}
            >
              <Text style={styles.restartButtonText}>Jogar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.quizBox}>
            <Text style={styles.counter}>
              Pergunta {perguntaAtual + 1} de {perguntas.length}
            </Text>
            <Text style={styles.question}>
              {perguntas[perguntaAtual].pergunta}
            </Text>

            {perguntas[perguntaAtual].opcoes.map((opcao, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => responder(index)}
              >
                <Text style={styles.optionText}>{opcao}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  header: { padding: 20, flexDirection: "row", alignItems: "center" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  backText: { color: "#FFF", fontSize: 16, marginLeft: 5 },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },

  quizBox: {
    backgroundColor: "#1A1A2E",
    padding: 25,
    borderRadius: 20,
    width: "100%",
  },
  counter: {
    color: "#4DB6AC",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 15,
  },
  question: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: "#252540",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: { color: "#FFF", fontSize: 16, textAlign: "center" },

  resultBox: {
    alignItems: "center",
    backgroundColor: "#1A1A2E",
    padding: 40,
    borderRadius: 20,
  },
  icon: { marginBottom: 20 },
  resultTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultScore: { color: "#4DB6AC", fontSize: 20, marginBottom: 30 },
  restartButton: {
    backgroundColor: "#4DB6AC",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  restartButtonText: { color: "#05050A", fontSize: 18, fontWeight: "bold" },
});
