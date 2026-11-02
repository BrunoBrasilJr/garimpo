import { useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { styles as s } from './styles';
export function Button({ title, onPress, disabled = false, secondary = false }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.button, secondary ? s.secondary : null, disabled ? s.disabled : null]}><Text allowFontScaling style={[s.buttonText, secondary ? s.secondaryText : null]}>{title}</Text></Pressable>;
}
export function Field({ label, value, change, numeric = false, maxLength }: { label: string; value: string; change: (value: string) => void; numeric?: boolean; maxLength?: number }) {
  return <View style={s.field}><Text allowFontScaling style={s.label}>{label}</Text><TextInput accessibilityLabel={label} style={s.input} value={value} onChangeText={change}
    keyboardType={numeric ? 'decimal-pad' : 'default'} maxLength={maxLength} autoCapitalize="none" autoCorrect={!numeric} allowFontScaling /></View>;
}
export function Choice({ label, value, options, change }: { label: string; value: string; options: { value: string; label: string }[]; change: (value: string) => void }) {
  const [open, setOpen] = useState(false), [search, setSearch] = useState('');
  const selected = options.find(option => option.value === value)?.label ?? 'Todos', matches = options.filter(option => option.label.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
  return <View style={s.field}><Text allowFontScaling style={s.label}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${selected}`} accessibilityHint="Abre a lista de opções" accessibilityState={{ expanded: open }} onPress={() => { setOpen(true); setSearch(''); }} style={[s.button, s.secondary]}><Text allowFontScaling style={[s.buttonText, s.secondaryText]}>{selected}</Text></Pressable>
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}><SafeAreaView style={s.modal} accessibilityViewIsModal>
      <Text allowFontScaling accessibilityRole="header" style={s.heading}>{label}</Text><Field label="Pesquisar opções" value={search} change={setSearch} />
      <Button title="Fechar opções" onPress={() => setOpen(false)} secondary />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.options}>
        {[{ value: '', label: 'Todos' }, ...matches.slice(0, 60)].map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: option.value === value }} onPress={() => { change(option.value); setOpen(false); }} style={[s.button, s.secondary]}><Text allowFontScaling style={[s.buttonText, s.secondaryText]}>{option.label}</Text></Pressable>)}
        {matches.length > 60 ? <Text allowFontScaling style={s.help}>Mostrando 60 opções. Refine a pesquisa para encontrar as demais.</Text> : null}
        {!matches.length ? <Text allowFontScaling style={s.text}>Nenhuma opção encontrada.</Text> : null}
      </ScrollView>
    </SafeAreaView></Modal>
  </View>;
}
