// Fecha en formato YYYY-MM-DD según la zona horaria local del navegador.
// `Date.prototype.toISOString()` siempre devuelve la fecha en UTC, lo que
// desfasa la fecha "de hoy" en zonas horarias negativas (ej. Bolivia UTC-4)
// durante las últimas horas del día.
export function toLocalDateStr(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA');
}
