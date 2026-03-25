import React, { useState } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Nossas perguntas (podemos adicionar mais depois para chegar em 10)
const perguntasQuiz = [
  {
    pergunta: "Qual é o maior planeta do nosso sistema solar?",
    opcoes: ["Júpiter", "Marte", "Vênus", "Netuno"],
    respostaCerta: 0 // O índice da resposta certa (0 é Júpiter)
  },
  {
    pergunta: "Qual lua de Júpiter é coberta por uma crosta de gelo e pode ter um oceano por baixo?",
    opcoes: ["Titã", "A Lua", "Europa", "Io"],
    respostaCerta: 2
  },
  {
    pergunta: "Qual é a galáxia mais próxima da nossa Via Láctea?",
    opcoes: ["Sombrero", "Andrômeda", "Triângulo", "Cartwheel"],
    respostaCerta: 1
  }
];

export default function QuizScreen() {
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [pontuacao, setPontuacao] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null);

  const handleResponder = () => {
    if (opcaoSelecionada === null) return; // Não faz nada se não escolheu uma opção

    // Verifica se acertou
    if (opcaoSelecionada === perguntasQuiz[perguntaAtual].respostaCerta) {
      setPontuacao(pontuacao + 1);
    }

    // Passa para a próxima ou finaliza
    const proximaPergunta = perguntaAtual + 1;
    if (proximaPergunta < perguntasQuiz.length) {
      setPerguntaAtual(proximaPergunta);
      setOpcaoSelecionada(null); // Reseta a seleção para a próxima pergunta
    } else {
      setMostrarResultado(true);
    }
  };

  const reiniciarQuiz = () => {
    setPerguntaAtual(0);
    setPontuacao(0);
    setMostrarResultado(false);
    setOpcaoSelecionada(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {mostrarResultado ? (
          // --- TELA DE RESULTADO ---
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Quiz Concluído!</Text>
            <Text style={styles.scoreText}>{pontuacao} / {perguntasQuiz.length}</Text>
            <Text style={styles.scoreSubtext}>
              {Math.round((pontuacao / perguntasQuiz.length) * 100)}% de acerto
            </Text>
            
            <View style={styles.statsBox}>
              <Text style={styles.statCorrect}>Corretas: {pontuacao}</Text>
              <Text style={styles.statIncorrect}>Incorretas: {perguntasQuiz.length - pontuacao}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={reiniciarQuiz}>
              <Text style={styles.buttonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // --- TELA DA PERGUNTA ---
          <View style={styles.quizContainer}>
            <Text style={styles.questionCounter}>
              Pergunta {perguntaAtual + 1} de {perguntasQuiz.length}
            </Text>
            
            <Text style={styles.questionText}>
              {perguntasQuiz[perguntaAtual].pergunta}
            </Text>

            <View style={styles.optionsContainer}>
              {perguntasQuiz[perguntaAtual].opcoes.map((opcao, index) => {
                const letras = ['A.', 'B.', 'C.', 'D.'];
                const isSelected = opcaoSelecionada === index;

                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                    onPress={() => setOpcaoSelecionada(index)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      <Text style={styles.optionLetter}>{letras[index]} </Text>
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={[styles.button, opcaoSelecionada === null && styles.buttonDisabled]} 
              onPress={handleResponder}
              disabled={opcaoSelecionada === null}
            >
              <Text style={styles.buttonText}>Confirmar Resposta</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05050A', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  
  // Estilos do Quiz
  quizContainer: { flex: 1, justifyContent: 'center' },
  questionCounter: { color: '#4DB6AC', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  questionText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  optionsContainer: { marginBottom: 30 },
  optionButton: { backgroundColor: '#1A1A2E', padding: 20, borderRadius: 15, marginBottom: 15, borderWidth: 2, borderColor: 'transparent' },
  optionButtonSelected: { borderColor: '#4DB6AC', backgroundColor: '#111F2D' },
  optionText: { color: '#FFF', fontSize: 18 },
  optionTextSelected: { color: '#4DB6AC', fontWeight: 'bold' },
  optionLetter: { color: '#888', fontWeight: 'bold' },
  
  // Botão Padrão
  button: { backgroundColor: '#4DB6AC', padding: 18, borderRadius: 15, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#2A4D4A' },
  buttonText: { color: '#05050A', fontSize: 18, fontWeight: 'bold' },

  // Estilos do Resultado
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  scoreText: { color: '#4DB6AC', fontSize: 60, fontWeight: 'bold' },
  scoreSubtext: { color: '#888', fontSize: 20, marginBottom: 30 },
  statsBox: { backgroundColor: '#1A1A2E', padding: 20, borderRadius: 15, width: '100%', marginBottom: 30 },
  statCorrect: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  statIncorrect: { color: '#F44336', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});