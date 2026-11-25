import { CheckCircle2, Calendar, ShieldCheck, HeartPulse, AlertCircle, Phone, MapPin, Share2, Dog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return [
    { token: "toby-99a1" },
    { token: "michi-44b2" },
    { token: "luna-77a8" },
    { token: "rocky-10x9" },
    { token: "demo-luna" },
    { token: "demo-rocky" },
    { token: "demo-mimi" },
    { token: "1" },
  ];
}

interface Props {
  params: Promise<{ token: string }>;
}

export default async function CarnetDigitalPublico({ params }: Props) {
  const { token } = await params;

  // Datos simulados de paciente para demostración del Carnet Digital Web
  const paciente = {
    nombre: "Luna",
    especie: "Canino",
    raza: "Golden Retriever",
    sexo: "Hembra (Esterilizada)",
    edad: "2 años y 4 meses",
    color: "Dorado claro",
    peso: "26.4 kg",
    microchip: "BO-9812400921",
    tutor: "María René Suárez",
    clinica: "Clínica Veterinaria Central",
    ciudad: "Santa Cruz de la Sierra",
    telefonoClinica: "77012345",
    alergias: "Sensible a penicilinas (reacción dérmica previa)",
    vacunas: [
      {
        nombre: "Vacuna Antirrábica",
        lote: "RB-2024-X",
        aplicada: "15/03/2026",
        proxima: "15/03/2027",
        veterinario: "Dr. Rodrigo Paz (SENASAG 4819)",
        estado: "VIGENTE",
      },
      {
        nombre: "Vacuna Séxtuple (DHPPI+L)",
        lote: "SX-9912",
        aplicada: "20/11/2025",
        proxima: "23/11/2026",
        veterinario: "Dr. Rodrigo Paz (SENASAG 4819)",
        estado: "PROXIMA_A_VENCER",
      },
      {
        nombre: "Tos de las Perreras (KC)",
        lote: "KC-4410",
        aplicada: "10/06/2026",
        proxima: "10/06/2027",
        veterinario: "Dra. Sofía Mendoza",
        estado: "VIGENTE",
      },
    ],
    desparasitaciones: [
      {
        producto: "Bravecto (Antipulgas y garrapatas)",
        fecha: "01/09/2026",
        proxima: "01/12/2026",
      },
      {
        producto: "Drontal Plus (Interna)",
        fecha: "15/10/2026",
        proxima: "15/01/2027",
      },
    ],
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 px-3.5 sm:px-4 space-y-4 sm:space-y-6">
      {/* Cabecera del Carnet */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-4 sm:p-6 text-primary-foreground shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-none text-[11px] sm:text-xs">
            Carnet Sanitario Oficial
          </Badge>
          <span className="text-[11px] sm:text-xs text-white/80 font-mono truncate">Token: {token}</span>
        </div>

        <div className="mt-4 flex items-center gap-3.5 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold shrink-0">
            <Dog className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{paciente.nombre}</h1>
            <p className="text-xs sm:text-sm text-white/90">
              {paciente.especie} · {paciente.raza} ({paciente.edad})
            </p>
            <p className="text-[11px] sm:text-xs text-white/70 mt-0.5">Tutor: {paciente.tutor}</p>
          </div>
        </div>

        {paciente.alergias && (
          <div className="mt-4 p-2.5 rounded-xl bg-red-500/30 border border-red-300/40 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            <span><strong>Alerta Médica:</strong> {paciente.alergias}</span>
          </div>
        )}
      </div>

      {/* Vacunas */}
      <Card className="shadow-xs border-border">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            Registro de Inmunizaciones (Vacunas)
          </CardTitle>
          <CardDescription className="text-xs">
            Trazabilidad de biológicos con lote y registro veterinario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
          {paciente.vacunas.map((vac) => (
            <div key={vac.nombre} className="p-3 sm:p-3.5 rounded-xl border border-border bg-card/60 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs sm:text-sm">{vac.nombre}</span>
                {vac.estado === "VIGENTE" ? (
                  <Badge variant="outline" className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Al día
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] sm:text-xs bg-amber-50 text-amber-700 border-amber-200 animate-pulse shrink-0">
                    <Calendar className="w-3 h-3 mr-1" /> Refuerzo en 3 días
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 text-xs text-muted-foreground gap-1">
                <div>Aplicada: <span className="font-medium text-foreground">{vac.aplicada}</span></div>
                <div>Próximo refuerzo: <span className="font-semibold text-foreground">{vac.proxima}</span></div>
                <div>Lote: <span className="font-mono text-foreground">{vac.lote}</span></div>
                <div className="truncate">{vac.veterinario}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Desparasitación */}
      <Card className="shadow-xs border-border">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-600 shrink-0" />
            Control Antiparasitario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 p-4 sm:p-6 pt-0">
          {paciente.desparasitaciones.map((des) => (
            <div key={des.producto} className="p-3 rounded-xl border border-border flex items-center justify-between text-xs gap-2">
              <div>
                <p className="font-semibold text-foreground">{des.producto}</p>
                <p className="text-muted-foreground text-[11px]">Última dosis: {des.fecha}</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[10px] sm:text-xs">
                Próxima: {des.proxima}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Botones Rápidos en Mobile */}
      <div className="flex flex-col sm:flex-row gap-2">
        <a 
          href={`https://wa.me/591${paciente.telefonoClinica}?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20carnet%20sanitario%20de%20mi%20mascota%20${paciente.nombre}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button className="w-full h-11 sm:h-10 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95 transition-transform">
            <Phone className="w-4 h-4" />
            Contactar a Clínica por WhatsApp
          </Button>
        </a>
      </div>

      {/* Pie de Página: Datos de la Clínica */}
      <div className="p-4 rounded-xl border border-border bg-muted/40 text-xs text-muted-foreground space-y-1.5 text-center">
        <p className="font-semibold text-foreground">{paciente.clinica} · {paciente.ciudad}</p>
        <p className="text-[11px]">
          Carnet digital emitido conforme a normas de bienestar animal y SENASAG Bolivia.
        </p>
      </div>
    </div>
  );
}
