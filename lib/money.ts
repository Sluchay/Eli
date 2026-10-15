/**
 * Цена в базе хранится в копейках целым числом, а человек вводит рубли.
 * Здесь только перевод туда и обратно — чтобы эта арифметика не расползлась
 * по формам и нигде не потерялся множитель на 100.
 */

export function kopecksToInput(kopecks: number | null | undefined): string {
  if (kopecks === null || kopecks === undefined) return ''

  const rubles = kopecks / 100
  if (Number.isInteger(rubles)) return String(rubles)

  return rubles.toFixed(2).replace('.', ',')
}

export function inputToKopecks(value: string | null | undefined): number | null {
  if (!value) return null

  const normalized = value.trim().replace(/\s|\u00A0/g, '').replace(',', '.')
  if (normalized === '') return null

  const parsed = Number.parseFloat(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return null

  return Math.round(parsed * 100)
}
