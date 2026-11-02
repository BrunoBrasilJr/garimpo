import type { Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
export async function seedCatalog(page: Page, origin: string, email: string, password: string) {
  await page.goto(origin + '/#/login'); const login = page.getByRole('form', { name: 'Bom te ver de novo' });
  await login.getByLabel('E-mail', { exact: true }).fill(email); await login.getByLabel('Senha', { exact: true }).fill(password); await login.getByRole('button').click();
  await page.getByRole('link', { name: 'Minha conta', exact: true }).waitFor();
  const marker = 'Garimpo ' + randomUUID(), png = Array.from(await sharp({ create: { width: 40, height: 40, channels: 3, background: '#e4a23b' } }).png().toBuffer());
  const result = await page.evaluate(async ({ marker, png, origin }) => {
    const proof = document.cookie.split('; ').find(item => item.startsWith('__Host-garimpo-csrf='))!.split('=')[1]!;
    async function call(path: string, method: string, body: unknown, binary = false) {
      const response = await fetch('/api/v1' + path, { method, credentials: 'include', headers: { 'X-CSRF-Token': proof, 'Content-Type': binary ? 'image/png' : 'application/json', 'Idempotency-Key': crypto.randomUUID() }, body: binary ? new Uint8Array(png) : JSON.stringify(body) });
      if (!response.ok) throw new Error('Synthetic setup rejected: ' + response.status);
      return response.json();
    }
    const artist = await call('/admin/catalog-metadata', 'POST', { type: 'artist', name: marker + ' principal' });
    const trackArtist = await call('/admin/catalog-metadata', 'POST', { type: 'artist', name: marker + ' convidado' });
    const genre = await call('/admin/catalog-metadata', 'POST', { type: 'genre', name: marker + ' jazz' });
    async function edition(title: string, editionYear: number | null, tracks: unknown[] = []) {
      const row = await call('/admin/editions', 'POST', { title, artistIds: [artist.id], genreIds: [genre.id], primaryGenreId: genre.id, format: 'LP', originalYear: 1975, editionYear, tracks });
      await call(`/admin/editions/${row.id}/images?description=Capa%20da%20edi%C3%A7%C3%A3o`, 'POST', null, true);
      await call('/admin/editions/' + row.id, 'PATCH', { active: true }); return row;
    }
    const main = await edition(marker + ' reedição', 2025, [{ position: 1, title: 'Canção do convidado', artistIds: [trackArtist.id], durationSeconds: 183, audioUrl: origin + '/missing-preview.wav' }, { position: 2, title: 'Faixa sem áudio', artistIds: [], audioUrl: null }]);
    await call(`/admin/editions/${main.id}/offers`, 'POST', { kind: 'NEW', priceCents: 12990, stockOnHand: 3, active: true });
    async function used(priceCents: number, discGrade: string, sleeveGrade: string, stockOnHand: number) {
      const row = await call(`/admin/editions/${main.id}/offers`, 'POST', { kind: 'USED', priceCents, stockOnHand, discGrade, sleeveGrade, particulars: 'Marcas próprias na capa; disco conferido.' });
      await call(`/admin/offers/${row.id}/images?description=Foto%20pr%C3%B3pria%20do%20usado`, 'POST', null, true);
      await call('/admin/offers/' + row.id, 'PATCH', { version: row.version, active: true }); return row;
    }
    await used(7500, 'VG+', 'NM', 1); await used(2500, 'G', 'P', 0);
    const old = await edition(marker + ' original', 1975), unknown = await edition(marker + ' ano desconhecido', null);
    const draft = await call('/admin/editions', 'POST', { title: marker + ' oculto', artistIds: [artist.id], genreIds: [genre.id], primaryGenreId: genre.id, format: 'LP' });
    return { main: main.id as string, mainTitle: main.title as string, unknown: unknown.id as string, old: old.id as string, draft: draft.id as string, artist: artist.name as string, trackArtist: trackArtist.name as string, genre: genre.name as string };
  }, { marker, png, origin });
  await page.getByRole('button', { name: 'Sair', exact: true }).click(); await page.getByRole('form', { name: 'Bom te ver de novo' }).waitFor();
  return { ...result, marker };
}
