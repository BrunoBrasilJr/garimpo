import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { File } from 'expo-file-system';
import { errorMessage } from '../account/client';
import type { MobileAccountClient } from '../account/client';
import { Button } from '../catalog/Controls';
import { styles as s } from '../catalog/styles';

const mimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
type EvidenceView = { id: string; source: string; mediaType: string };
export function MobileEvidence({ client, accountId, id, evidence, reload }: {
  client: MobileAccountClient; accountId: string; id: string; evidence: EvidenceView[]; reload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const operation = useRef<AbortController | null>(null);
  useEffect(() => () => operation.current?.abort(), []);
  const base = '/aftersales/' + id + '/evidence';
  const count = evidence.filter(item => item.source === 'CUSTOMER').length;

  async function run(work: (signal: AbortSignal) => Promise<void>) {
    if (operation.current) return;
    const controller = new AbortController(); operation.current = controller;
    setBusy(true); setError('');
    try { await work(controller.signal); }
    catch (cause) { if (!controller.signal.aborted) setError(errorMessage(cause)); }
    finally { operation.current = null; if (!controller.signal.aborted) setBusy(false); }
  }
  async function pick(signal: AbortSignal) {
    const selected = await launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: false, quality: 1 });
    const asset = selected.assets?.[0];
    if (!asset || signal.aborted) return;
    const source = Platform.OS === 'web' ? asset.file ?? await (await fetch(asset.uri, { signal })).blob() : new File(asset.uri);
    const mediaType = asset.mimeType || source.type;
    if (!mimeTypes.has(mediaType)) { setError('Selecione uma imagem JPEG, PNG ou WebP.'); return; }
    if ((asset.fileSize ?? source.size) > 5_000_000) { setError('A imagem deve ter no máximo 5 MB.'); return; }
    const body = await source.arrayBuffer();
    if (signal.aborted) return;
    await client.request(base, 'POST', body, true, { accountId, mediaType, signal });
    if (!signal.aborted) await reload();
  }
  async function show(imageId: string, signal: AbortSignal) {
    const blob = await client.request<Blob>(base + '/' + imageId, 'GET', undefined, true, { accountId, signal, responseBlob: true });
    if (signal.aborted) return;
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Missing evidence data.'));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    if (!signal.aborted) setPreview(url);
  }
  return <View style={s.card}>
    <Text allowFontScaling accessibilityRole="header" style={s.heading}>Evidências privadas</Text>
    <Text allowFontScaling style={s.text}>{count} de 5 imagens do cliente. JPEG, PNG ou WebP até 5 MB.</Text>
    {error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}</Text> : null}
    <Button title="Selecionar e enviar evidência" disabled={busy || count >= 5} onPress={() => { void run(pick); }} />
    {evidence.map((item, index) => <Button key={item.id} title={'Ver evidência ' + (index + 1)} secondary disabled={busy}
      onPress={() => { void run(signal => show(item.id, signal)); }} />)}
    {preview ? <><Image accessible accessibilityLabel="Evidência privada selecionada" source={{ uri: preview }} resizeMode="contain" style={{ width: '100%', height: 200 }} />
      <Button title="Fechar imagem" secondary onPress={() => setPreview('')} /></> : null}
  </View>;
}
