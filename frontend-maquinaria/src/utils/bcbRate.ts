export interface BcbRateResult {
  rate: number;
  date: string;
  source: string;
}

/**
 * Fetches the official flexible USD/BOB exchange rate published by Banco Central de Bolivia (BCB)
 * from public zero-key JSON endpoints with fallback.
 */
export async function fetchOfficialBcbRate(): Promise<BcbRateResult> {
  try {
    const res = await fetch('https://apibcb.cucu.bo/api/v1/tc/oficial', {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const tco = data?.tc_oficial;
      const rate = Number(tco?.valor ?? tco?.venta ?? tco?.compra);
      if (Number.isFinite(rate) && rate > 0) {
        return {
          rate,
          date: typeof tco?.fecha === 'string' ? tco.fecha : new Date().toISOString().slice(0, 10),
          source: 'BCB (apibcb.cucu.bo)',
        };
      }
    }
  } catch {
    // Fall through to backup provider.
  }

  const backup = await fetch('https://bo.dolarapi.com/v1/dolares/oficial', {
    signal: AbortSignal.timeout(6000),
  });
  if (!backup.ok) {
    throw new Error(`No se pudo consultar el tipo de cambio oficial (HTTP ${backup.status}).`);
  }
  const backupData = await backup.json();
  const rate = Number(backupData?.venta ?? backupData?.compra);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('La respuesta oficial del tipo de cambio no contiene un valor válido.');
  }
  const rawDate = typeof backupData?.fechaActualizacion === 'string' ? backupData.fechaActualizacion : '';
  return {
    rate,
    date: rawDate ? rawDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    source: 'BCB (dolarapi.com)',
  };
}
