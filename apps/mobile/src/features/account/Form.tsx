import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MobileError, errorMessage } from './client';
export interface MobileField { name: string; label: string; value?: string; secret?: boolean; email?: boolean; optional?: boolean; newPassword?: boolean; numeric?: boolean }
export function AccountForm({ title, fields, submit, onSubmit, notify }: { title: string; fields: MobileField[]; submit: string; onSubmit: (values: Record<string, string>) => Promise<void>; notify: (value: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(field => [field.name, field.value ?? ''])));
  const [busy, setBusy] = useState(false), [errors, setErrors] = useState<Record<string, string[]>>({});
  const executing = useRef(false), inputs = useRef<Record<string, TextInput | null>>({});
  async function handle() {
    if (executing.current) return;
    executing.current = true; setBusy(true); setErrors({});
    try {
      for (const field of fields) {
        if (!field.optional && !values[field.name]?.trim()) throw new MobileError(422, { [field.name]: ['Preencha este campo.'] }, 'Confira os campos indicados.');
        if (field.newPassword) { const length = Array.from(values[field.name] ?? '').length; if (length < 15 || length > 128) throw new MobileError(422, { [field.name]: ['Use entre 15 e 128 caracteres.'] }, 'Use uma senha de 15 a 128 caracteres.'); }
      }
      await onSubmit(values);
    } catch (cause) {
      const next = cause instanceof MobileError ? cause.fields : {}; setErrors(next); notify(errorMessage(cause));
      const first = Object.keys(next)[0]; if (first) inputs.current[first]?.focus();
    } finally {
      setValues(current => Object.fromEntries(Object.entries(current).map(([name, value]) => [name, fields.find(field => field.name === name)?.secret ? '' : value])));
      executing.current = false; setBusy(false);
    }
  }
  return <View style={styles.card} accessibilityLabel={title}>
    <Text style={styles.heading} accessibilityRole="header">{title}</Text>
    {fields.map(field => <View key={field.name} style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>
      <TextInput ref={input => { inputs.current[field.name] = input; }} accessibilityLabel={field.label} accessibilityHint={errors[field.name]?.join(' ') ?? (field.newPassword ? 'De 15 a 128 caracteres.' : '')}
        style={[styles.input, errors[field.name] ? styles.invalid : null]} value={values[field.name] ?? ''} onChangeText={value => setValues(current => ({ ...current, [field.name]: value }))}
        secureTextEntry={field.secret ?? false} autoCapitalize={field.email || field.secret ? 'none' : 'sentences'} autoCorrect={!field.secret && !field.email}
        autoComplete={field.email ? 'email' : field.newPassword ? 'new-password' : field.secret ? 'off' : 'off'}
        keyboardType={field.email ? 'email-address' : field.numeric ? 'number-pad' : 'default'} editable={!busy} />
      {field.newPassword ? <Text style={styles.help}>De 15 a 128 caracteres. Uma frase longa também vale.</Text> : null}
      {errors[field.name] ? <Text style={styles.error}>{errors[field.name]?.join(' ')}</Text> : null}
    </View>)}
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} disabled={busy} style={[styles.button, busy ? styles.disabled : null]} onPress={() => { void handle(); }}><Text style={styles.buttonText}>{busy ? 'Aguarde…' : submit}</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#fcfaf4', borderColor: '#c9cbbd', borderWidth: 1, padding: 20, borderRadius: 16, gap: 20 },
  heading: { color: '#173c32', fontSize: 25, fontWeight: '700' }, field: { gap: 8 }, label: { color: '#173c32', fontSize: 16, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#829183', backgroundColor: '#fffef9', borderRadius: 8, padding: 12, fontSize: 17, color: '#173c32', minHeight: 50 },
  invalid: { borderColor: '#a0372a' }, help: { color: '#52624e', fontSize: 14 }, error: { color: '#752b21', fontSize: 15 },
  button: { backgroundColor: '#173c32', minHeight: 50, justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 8 },
  buttonText: { color: '#fffbed', fontSize: 17, fontWeight: '700' }, disabled: { opacity: .55 }
});
