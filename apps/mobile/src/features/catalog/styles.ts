import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  page: { gap: 20 }, title: { color: '#173c32', fontSize: 30, fontWeight: '700', flexShrink: 1 },
  heading: { color: '#173c32', fontSize: 24, fontWeight: '700', flexShrink: 1 }, subheading: { color: '#173c32', fontSize: 20, fontWeight: '700', flexShrink: 1 },
  text: { color: '#173c32', fontSize: 17, lineHeight: 26, flexShrink: 1 }, help: { color: '#405348', fontSize: 15, flexShrink: 1 },
  card: { backgroundColor: '#fcfaf4', padding: 18, borderRadius: 12, borderColor: '#a9b4a8', borderWidth: 1, gap: 14 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  button: { backgroundColor: '#173c32', padding: 14, minHeight: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  buttonText: { color: '#fffbed', fontSize: 17, fontWeight: '700', flexShrink: 1 }, secondary: { backgroundColor: '#e2e9d9' }, secondaryText: { color: '#173c32' },
  disabled: { opacity: 0.55 }, field: { gap: 8, marginVertical: 8 }, label: { color: '#173c32', fontSize: 17, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#758275', borderRadius: 7, padding: 12, minHeight: 50, color: '#173c32', backgroundColor: '#fff', fontSize: 17 },
  modal: { flex: 1, backgroundColor: '#fcfaf4', padding: 22, gap: 16 }, options: { gap: 8, paddingBottom: 24 },
  image: { width: 240, height: 240, maxWidth: '100%', alignSelf: 'center', borderRadius: 8 },
  alert: { color: '#8b221b', backgroundColor: '#fff2ed', padding: 14, fontSize: 17, lineHeight: 26 }, selected: { borderWidth: 3, borderColor: '#245b42' }
});
