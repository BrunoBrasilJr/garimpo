import { useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Button } from './Controls';
import { styles as s } from './styles';

export function AudioPreview({ url, title, close }: { url: string; title: string; close: () => void }) {
  const player = useAudioPlayer({ uri: url }, { updateInterval: 500, downloadFirst: false }), status = useAudioPlayerStatus(player);
  const [failed, setFailed] = useState(false);
  useEffect(() => { const subscription = AppState.addEventListener('change', value => { if (value !== 'active') { try { player.pause(); } catch { setFailed(true); } } }); return () => subscription.remove(); }, [player]);
  const error = failed || Boolean(status.error) || status.playbackState === 'error';
  return <View style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.subheading}>Prévia de {title}</Text>
    {error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>Não foi possível reproduzir esta prévia. O catálogo continua disponível.</Text> : <>
      <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>{status.playing ? 'Reproduzindo' : status.isLoaded ? 'Pronta para ouvir' : 'Carregando prévia…'}</Text>
      <Text allowFontScaling style={s.help}>{Math.floor(status.currentTime)} de {Math.floor(status.duration)} segundos</Text>
      <Button title={status.playing ? 'Pausar prévia' : 'Reproduzir prévia'} disabled={!status.isLoaded} onPress={() => {
        try { if (status.playing) player.pause(); else { if (status.didJustFinish) void player.seekTo(0).then(() => player.play()).catch(() => setFailed(true)); else player.play(); } }
        catch { setFailed(true); }
      }} />
    </>}
    <Button title="Fechar prévia" onPress={close} secondary />
  </View>;
}
