import{a as u}from"./chunk-MF4HTQZ4.js";import{a as v}from"./chunk-KYO7I57J.js";import{a as h}from"./chunk-5ZZ5EBR3.js";import{a as f}from"./chunk-DOAMBBB2.js";import{c as g}from"./chunk-X3ZBUHLM.js";import{I as p,N as t,da as b}from"./chunk-SZFTM4OC.js";var y=class c{db=t(g);pacienteService=t(h);medicoService=t(u);especialidadService=t(v);usuarioService=t(f);_comprobantes=b([]);comprobantes=this._comprobantes.asReadonly();constructor(){this.cargarDatos()}cargarDatos(){this._comprobantes.set(this.db.getComprobantes())}generarComprobante(e,i,r,d,l,s){let m=this.db.generarComprobante(e,i,r,d,l,s);return this.cargarDatos(),m}imprimirComprobante(e){let i=this.pacienteService.pacientes().find(a=>a.id===e.pacienteId),r=this.medicoService.medicos().find(a=>a.id===e.medicoId),d=r?this.especialidadService.especialidades().find(a=>a.id===r.especialidadId):null,l=this.usuarioService.usuarios().find(a=>a.id===e.cajeroId),s=new Date(e.fechaEmision),m=s.toLocaleDateString("es-BO",{year:"numeric",month:"long",day:"numeric"}),w=s.toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"}),x=`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Comprobante ${e.numeroCorrelativo}</title>
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
            <div class="subtitulo">Cl\xEDnica M\xE9dica Especializada</div>
            <div class="direccion">Av. Principal #123 \xB7 Tel: (591) 4-4567890<br>Cochabamba, Bolivia</div>
          </div>

          <div class="correlativo">
            <strong>${e.numeroCorrelativo}</strong>
            <div class="fecha">${m} \xB7 ${w}</div>
          </div>

          <div class="seccion">
            <div class="seccion-titulo">Datos del Paciente</div>
            <div class="fila">
              <span class="etiqueta">Nombre</span>
              <span class="valor">${i?.nombre||"N/A"}</span>
            </div>
            <div class="fila">
              <span class="etiqueta">CI</span>
              <span class="valor">${i?.ci||"N/A"}</span>
            </div>
          </div>

          <div class="seccion">
            <div class="seccion-titulo">Servicio</div>
            <div class="fila">
              <span class="etiqueta">Consulta con</span>
              <span class="valor">${r?.nombre||"N/A"}</span>
            </div>
            <div class="fila">
              <span class="etiqueta">Especialidad</span>
              <span class="valor">${d?.nombre||"General"}</span>
            </div>
          </div>

          <div class="total">
            <span class="etiqueta">TOTAL PAGADO</span>
            <span class="monto">${e.monto.toFixed(2)} Bs.</span>
          </div>

          <div class="metodo-pago">
            <span class="badge badge-${e.metodoPago.toLowerCase()}">${e.metodoPago==="QR"?"Transferencia / QR":e.metodoPago}</span>
          </div>

          <div class="seccion">
            <div class="seccion-titulo">Procesado por</div>
            <div class="fila">
              <span class="etiqueta">Cajero(a)</span>
              <span class="valor">${l?.nombre||"Sistema"}</span>
            </div>
          </div>

          <div class="footer">
            <p class="gracias">\xA1Gracias por su confianza!</p>
            <p>Este comprobante es su respaldo de pago.<br>Cons\xE9rvelo para cualquier consulta futura.</p>
          </div>
        </div>
      </body>
      </html>
    `,o=document.createElement("iframe");o.style.position="fixed",o.style.right="0",o.style.bottom="0",o.style.width="0",o.style.height="0",o.style.border="none",document.body.appendChild(o);let n=o.contentDocument||o.contentWindow?.document;n&&(n.open(),n.write(x),n.close(),setTimeout(()=>{o.contentWindow?.print(),setTimeout(()=>document.body.removeChild(o),1e3)},500))}static \u0275fac=function(i){return new(i||c)};static \u0275prov=p({token:c,factory:c.\u0275fac,providedIn:"root"})};export{y as a};
