/**
 * Generador de enlaces de WhatsApp para comunicación ágil con tutores de mascotas.
 * Funciona sin costos de API (Modo Básico / Manual) abriendo WhatsApp Web o App.
 */

export interface MensajeRecordatorioVacuna {
  telefonoTutor: string;
  nombreTutor: string;
  nombreMascota: string;
  tipoVacuna: string;
  fechaProgramada: string;
  nombreClinica: string;
  tokenCarnet?: string;
}

export interface MensajePostTratamiento {
  telefonoTutor: string;
  nombreTutor: string;
  nombreMascota: string;
  procedimiento: string;
  nombreClinica: string;
}

/**
 * Limpia y normaliza el número de teléfono con el código de país de Bolivia (+591)
 */
export function normalizarTelefonoBolivia(telefono: string): string {
  const soloNumeros = telefono.replace(/\D/g, "");
  if (soloNumeros.startsWith("591")) {
    return soloNumeros;
  }
  return `591${soloNumeros}`;
}

/**
 * Genera el enlace de WhatsApp para recordatorio de vacunación/desparasitación
 */
export function generarEnlaceRecordatorioVacuna(
  data: MensajeRecordatorioVacuna,
  origin: string = "http://localhost:3000"
): string {
  const telefono = normalizarTelefonoBolivia(data.telefonoTutor);
  const linkCarnet = data.tokenCarnet ? `\n\n*Carnet digital:* ${origin}/carnet/${data.tokenCarnet}` : "";

  const mensaje = `Hola *${data.nombreTutor}*, le saludamos de la clínica veterinaria *${data.nombreClinica}*.\n\nLe recordamos que a su paciente *${data.nombreMascota}* le corresponde su *${data.tipoVacuna}* en fecha *${data.fechaProgramada}*.\n\nPrevenir es cuidar su salud. ¿Desea reservar un horario para su atención?${linkCarnet}`;

  return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Genera el enlace para seguimiento post-tratamiento o post-quirúrgico
 */
export function generarEnlacePostTratamiento(data: MensajePostTratamiento): string {
  const telefono = normalizarTelefonoBolivia(data.telefonoTutor);

  const mensaje = `Hola *${data.nombreTutor}*, desde *${data.nombreClinica}* realizamos el seguimiento a la recuperación de *${data.nombreMascota}* luego de su atención por *${data.procedimiento}*.\n\n¿Cómo evoluciona su apetito y ánimo? Quedamos atentos a cualquier consulta.`;

  return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
}
