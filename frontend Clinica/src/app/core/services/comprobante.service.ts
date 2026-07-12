import { Injectable, signal, inject } from '@angular/core';
import { DbService } from '../../services/db.service';
import { Comprobante } from '../models/clinica.model';
import { PacienteService } from './paciente.service';
import { MedicoService } from './medico.service';
import { EspecialidadService } from './especialidad.service';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {
  private readonly db = inject(DbService);
  private readonly pacienteService = inject(PacienteService);
  private readonly medicoService = inject(MedicoService);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly usuarioService = inject(UsuarioService);

  private readonly _comprobantes = signal<Comprobante[]>([]);
  public readonly comprobantes = this._comprobantes.asReadonly();

  constructor() {
    this.cargarDatos();
  }

  cargarDatos() {
    this._comprobantes.set(this.db.getComprobantes());
  }

  generarComprobante(citaId: number, pacienteId: number, medicoId: number, monto: number, metodoPago: 'Efectivo' | 'Tarjeta' | 'QR', cajeroId: number): Comprobante {
    const comprobante = this.db.generarComprobante(citaId, pacienteId, medicoId, monto, metodoPago, cajeroId);
    this.cargarDatos();
    return comprobante;
  }

  imprimirComprobante(comprobante: Comprobante) {
    const paciente = this.pacienteService.pacientes().find(p => p.id === comprobante.pacienteId);
    const medico = this.medicoService.medicos().find(m => m.id === comprobante.medicoId);
    const especialidad = medico ? this.especialidadService.especialidades().find(e => e.id === medico.especialidadId) : null;
    const cajero = this.usuarioService.usuarios().find(u => u.id === comprobante.cajeroId);

    const fecha = new Date(comprobante.fechaEmision);
    const fechaStr = fecha.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
    const horaStr = fecha.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Comprobante ${comprobante.numeroCorrelativo}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; padding: 2rem; color: #0f172a; background: white; }

          .recibo { max-width: 380px; margin: 0 auto; }

          .header { text-align: center; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 2px dashed #cbd5e1; }
          .logo { font-size: 1.5rem; font-weight: 800; color: #0b2545; margin-bottom: 0.25rem; }
          .subtitulo { font-size: 0.8rem; color: #64748b; }
          .direccion { font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem; }

          .correlativo { text-align: center; background: #f1f5f9; padding: 0.75rem; border-radius: 8px; margin-bottom: 1.5rem; }
          .correlativo strong { font-size: 1.1rem; color: #1e3a8a; letter-spacing: 0.05em; }
          .correlativo .fecha { font-size: 0.8rem; color: #64748b; margin-top: 0.25rem; }

          .seccion { margin-bottom: 1.25rem; }
          .seccion-titulo { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 700; margin-bottom: 0.5rem; }

          .fila { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 0.85rem; }
          .fila .etiqueta { color: #64748b; }
          .fila .valor { font-weight: 600; color: #0f172a; }

          .total { background: #0b2545; color: white; padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin: 1.5rem 0; }
          .total .etiqueta { font-size: 0.9rem; font-weight: 600; }
          .total .monto { font-size: 1.3rem; font-weight: 800; }

          .metodo-pago { text-align: center; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 1.5rem; }
          .metodo-pago .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
          .badge-efectivo { background: #dcfce7; color: #166534; }
          .badge-tarjeta { background: #dbeafe; color: #1e40af; }
          .badge-qr { background: #ede9fe; color: #5b21b6; }

          .footer { text-align: center; padding-top: 1.5rem; border-top: 2px dashed #cbd5e1; }
          .footer p { font-size: 0.75rem; color: #94a3b8; line-height: 1.5; }
          .footer .gracias { font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; }

          @media print {
            body { padding: 0; }
            @page { margin: 1cm; size: 80mm auto; }
          }
        </style>
      </head>
      <body>
        <div class="recibo">
          <div class="header">
            <div class="logo">+ Salud Integral</div>
            <div class="subtitulo">Clínica Médica Especializada</div>
            <div class="direccion">Av. Principal #123 · Tel: (591) 4-4567890<br>Cochabamba, Bolivia</div>
          </div>

          <div class="correlativo">
            <strong>${comprobante.numeroCorrelativo}</strong>
            <div class="fecha">${fechaStr} · ${horaStr}</div>
          </div>

          <div class="seccion">
            <div class="seccion-titulo">Datos del Paciente</div>
            <div class="fila">
              <span class="etiqueta">Nombre</span>
              <span class="valor">${paciente?.nombre || 'N/A'}</span>
            </div>
            <div class="fila">
              <span class="etiqueta">CI</span>
              <span class="valor">${paciente?.ci || 'N/A'}</span>
            </div>
          </div>

          <div class="seccion">
            <div class="seccion-titulo">Servicio</div>
            <div class="fila">
              <span class="etiqueta">Consulta con</span>
              <span class="valor">${medico?.nombre || 'N/A'}</span>
            </div>
            <div class="fila">
              <span class="etiqueta">Especialidad</span>
              <span class="valor">${especialidad?.nombre || 'General'}</span>
            </div>
          </div>

          <div class="total">
            <span class="etiqueta">TOTAL PAGADO</span>
            <span class="monto">${comprobante.monto.toFixed(2)} Bs.</span>
          </div>

          <div class="metodo-pago">
            <span class="badge badge-${comprobante.metodoPago.toLowerCase()}">${comprobante.metodoPago === 'QR' ? 'Transferencia / QR' : comprobante.metodoPago}</span>
          </div>

          <div class="seccion">
            <div class="seccion-titulo">Procesado por</div>
            <div class="fila">
              <span class="etiqueta">Cajero(a)</span>
              <span class="valor">${cajero?.nombre || 'Sistema'}</span>
            </div>
          </div>

          <div class="footer">
            <p class="gracias">¡Gracias por su confianza!</p>
            <p>Este comprobante es su respaldo de pago.<br>Consérvelo para cualquier consulta futura.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 500);
    }
  }
}
