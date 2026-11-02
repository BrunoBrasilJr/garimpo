import { Text, TextInput, View } from 'react-native';
import { styles as s } from '../catalog/styles';
export function CartField({ label, value, change, disabled = false, numeric = false, maxLength }: { label: string; value: string; change: (value: string) => void; disabled?: boolean; numeric?: boolean; maxLength?: number }) {
  return <View style={s.field}><Text allowFontScaling style={s.label}>{label}</Text><TextInput accessibilityLabel={label} accessibilityState={{ disabled }} value={value} onChangeText={change} editable={!disabled} keyboardType={numeric ? 'number-pad' : 'default'} autoCapitalize="none" autoCorrect={false} allowFontScaling maxLength={maxLength} style={s.input} /></View>;
}
