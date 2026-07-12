// Fecha en formato YYYY-MM-DD según la zona horaria local del navegador.
// `Date.prototype.toISOString()` siempre devuelve la fecha en UTC, lo que
// desfasa la fecha "de hoy" en zonas horarias negativas (ej. Bolivia UTC-4)
// durante las últimas horas del día.
export function toLocalDateStr(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA');
}

// Fecha YYYY-MM-DD desplazada `offsetDays` días respecto a hoy (local).
// Usar siempre para datos sembrados que deban lucir "recientes" sin
// importar cuándo se abra la demo.
export function relDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toLocalDateStr(d);
}
