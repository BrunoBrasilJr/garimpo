import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>DISCOS E DESCOBERTAS</Text>
        <Text accessibilityRole="header" style={styles.title}>Garimpo</Text>
        <Text style={styles.body}>Um novo lugar para encontrar sua próxima história em vinil.</Text>
        <Text style={styles.notice}>Em preparação. O catálogo estará disponível em breve.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f0e7' },
  content: { flex: 1, justifyContent: 'center', padding: 28, gap: 20 },
  eyebrow: { color: '#173c32', fontSize: 12, letterSpacing: 2, fontWeight: '700' },
  title: { color: '#173c32', fontSize: 56, fontWeight: '700' },
  body: { color: '#173c32', fontSize: 20, lineHeight: 30 },
  notice: { color: '#36594c', fontSize: 16, lineHeight: 24 }
});
