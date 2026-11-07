import type { Locator } from '@playwright/test';

/** Selected opaque text on solid backgrounds, not a complete accessibility audit. */
export async function textContrast(locator: Locator) {
  const values = await locator.evaluate(element => {
    const style = getComputedStyle(element);
    let background = 'rgb(255, 255, 255)';
    for (let current: Element | null = element; current; current = current.parentElement) {
      const candidate = getComputedStyle(current).backgroundColor;
      const parts = candidate.match(/[\d.]+/g)?.map(Number) ?? [];
      if (parts.length === 3 || parts[3] === 1) { background = candidate; break; }
      if (parts[3] && parts[3] !== 0) throw new Error('Translucent background needs manual compositing.');
    }
    return { foreground: style.color, background, size: parseFloat(style.fontSize), weight: parseInt(style.fontWeight, 10) };
  });
  const luminance = (color: string) => {
    const parts = color.match(/[\d.]+/g)?.map(Number) ?? [];
    if (parts.length < 3 || parts.length > 3 && parts[3] !== 1) throw new Error('Opaque RGB text required.');
    const linear = parts.slice(0, 3).map(value => { const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4; });
    return linear[0]! * .2126 + linear[1]! * .7152 + linear[2]! * .0722;
  };
  const first = luminance(values.foreground), second = luminance(values.background);
  return { ...values, ratio: (Math.max(first, second) + .05) / (Math.min(first, second) + .05),
    minimum: values.size >= 24 || values.size >= 18.6667 && values.weight >= 700 ? 3 : 4.5 };
}
