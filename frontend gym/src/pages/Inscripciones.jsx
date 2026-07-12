import { useState, useEffect } from 'react';
import { UserPlus, Calendar as CalendarIcon, Clock, CreditCard, ChevronRight, CheckCircle2, AlertTriangle, QrCode, Banknote, Loader2, Landmark } from 'lucide-react';
import { getClientes, getPlanes, getMetodosPago, crearInscripcion } from '../data/db';

const Inscripciones = () => {
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Estados de pago
  const [activeMethods, setActiveMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [isProcessingQR, setIsProcessingQR] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const activePlanes = planes.filter(p => p.isActive);
  const selectedPlan = activePlanes.find(p => p.id === Number(selectedPlanId));
  const clientData = clientes.find(c => c.id === Number(selectedClient));
  const selectedMethod = activeMethods.find(m => m.id === Number(selectedMethodId));

  useEffect(() => {
    setClientes(getClientes());
    setPlanes(getPlanes());

    const methods = getMetodosPago().filter(m => m.active);
    setActiveMethods(methods);
    if (methods.length > 0) {
      setSelectedMethodId(methods[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      const today = new Date();
      setStartDate(today.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }));

      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + selectedPlan.days);
      setEndDate(futureDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }));
    } else {
      setStartDate('');
      setEndDate('');
    }
  }, [selectedPlan]);

  const confirmarInscripcion = () => {
    crearInscripcion({
      clienteId: Number(selectedClient),
      planId: Number(selectedPlanId),
      metodoPagoId: Number(selectedMethodId),
    });
    setIsProcessingQR(false);
    setIsSuccess(true);
  };

  const handleInscribir = () => {
    if (!selectedClient || !selectedPlanId || !selectedMethodId) return;

    if (selectedMethod?.type === 'qr') {
      // Simulación de API Banco Económico
      setIsProcessingQR(true);
      setTimeout(confirmarInscripcion, 5000); // Simula 5 segundos de espera para que el cliente pague
    } else {
      confirmarInscripcion(); // Inscripción y pago directo
    }
  };

  const handleNewInscription = () => {
    setSelectedClient('');
    setSelectedPlanId('');
    setIsSuccess(false);
    setIsProcessingQR(false);
    setClientes(getClientes());
    if (activeMethods.length > 0) {
      setSelectedMethodId(activeMethods[0].id);
    }
  };

  const getMethodIcon = (type, isSelected) => {
    const color = isSelected ? (type === 'cash' ? 'text-amber-500' : 'text-blue-500') : 'text-gray-400';
    if (type === 'cash') return <Banknote size={32} className={color} />;
    if (type === 'qr') return <QrCode size={32} className={color} />;
    if (type === 'transfer') return <Landmark size={32} className={color} />;
    return <CreditCard size={32} className={color} />;
  };

  const selectedMethodName = selectedMethod?.name || 'Pago';

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      {/* Cabecera */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <UserPlus className="text-blue-500" size={32} />
          <h1 className="text-3xl font-black text-white uppercase tracking-wider">
            Inscripciones y Cobro
          </h1>
        </div>
        <p className="text-gray-400 font-medium">Asigna planes a los clientes y procesa su pago inmediatamente</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* COLUMNA IZQUIERDA: Formulario de Selección */}
        <div className="flex-1 space-y-6 h-fit">
          <div className="bg-[#1e1e1e] border-t-4 border-blue-600 rounded-xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Selección de Datos
            </h2>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                  Buscar Cliente Registrado
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  disabled={isSuccess || isProcessingQR}
                  className="bg-[#2a2a2a] border-2 border-transparent focus:border-blue-500 text-white px-4 py-4 rounded-lg outline-none transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="">-- Seleccione un cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                  Plan de Membresía a Adquirir
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {activePlanes.map(plan => (
                    <label
                      key={plan.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${selectedPlanId === String(plan.id)
                          ? 'bg-blue-600/10 border-blue-500'
                          : 'bg-[#2a2a2a] border-transparent hover:border-[#444]'
                        }
                        ${(isSuccess || isProcessingQR) ? 'opacity-50 pointer-events-none' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="plan"
                          value={plan.id}
                          checked={selectedPlanId === String(plan.id)}
                          onChange={(e) => setSelectedPlanId(e.target.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                        />
                        <span className="font-bold text-white tracking-wide">{plan.name}</span>
                      </div>
                      <span className="font-black text-blue-400">Bs. {plan.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Selector de Método de Pago */}
          <div className="bg-[#1e1e1e] border-t-4 border-amber-500 rounded-xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6 flex items-center gap-2">
              <span className="bg-amber-500 text-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">2</span>
              Método de Pago
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {activeMethods.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-red-400 bg-red-500/10 rounded-lg border border-red-500/30">
                  No hay métodos de pago habilitados. Configure uno en Administración.
                </div>
              ) : (
                activeMethods.map(method => {
                  const isSelected = Number(selectedMethodId) === method.id;
                  const colorClass = method.type === 'cash' ? 'amber-500' : 'blue-500';
                  return (
                    <label key={method.id} className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected ? `bg-${colorClass}/10 border-${colorClass}` : 'bg-[#2a2a2a] border-transparent hover:border-[#444]'}
                      ${(isSuccess || isProcessingQR) ? 'opacity-50 pointer-events-none' : ''}`
                    }>
                      <input type="radio" name="payment" value={method.id} checked={isSelected} onChange={() => setSelectedMethodId(method.id)} className="sr-only" />
                      {getMethodIcon(method.type, isSelected)}
                      <span className={`font-bold uppercase tracking-wide text-center leading-tight ${isSelected ? `text-${colorClass}` : 'text-gray-400'}`}>
                        {method.name}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Resumen y Generación */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-[#151515] border-2 border-[#2a2a2a] rounded-xl overflow-hidden sticky top-28">
            <div className="bg-[#1a1a1a] p-6 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <span className="bg-emerald-500 text-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">3</span>
                Ticket Final
              </h2>
            </div>

            <div className="p-6">
              {!selectedClient || !selectedPlanId ? (
                <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-3">
                  <CreditCard size={48} className="opacity-20" />
                  <p>Seleccione cliente, plan y método de pago.</p>
                </div>
              ) : (
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  {/* Fechas Calculadas */}
                  <div className="space-y-4 mb-6 pb-6 border-b border-[#2a2a2a]">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-gray-400">
                        <CalendarIcon size={16} className="text-emerald-500" />
                        <span className="text-sm font-semibold uppercase">Inicio</span>
                      </div>
                      <span className="text-white font-medium">{startDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={16} className="text-red-500" />
                        <span className="text-sm font-semibold uppercase">Vencimiento</span>
                      </div>
                      <span className="text-white font-bold">{endDate}</span>
                    </div>
                  </div>

                  {/* Total y Botón */}
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-gray-400 font-bold uppercase tracking-wide">Total a Pagar</span>
                    <span className="text-3xl font-black text-white">Bs. {selectedPlan?.price}</span>
                  </div>

                  {!isSuccess && !isProcessingQR && (
                    <button
                      onClick={handleInscribir}
                      disabled={activeMethods.length === 0}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {selectedMethod?.type === 'qr' ? 'Generar QR de Cobro' : 'Cobrar e Inscribir'}
                      <ChevronRight size={20} />
                    </button>
                  )}

                  {/* Simulación QR */}
                  {isProcessingQR && (
                    <div className="space-y-4 animate-[scaleIn_0.3s_ease-out] text-center p-4 bg-[#1a1a1a] border border-[#333] rounded-lg">
                      <p className="text-blue-400 font-bold text-sm uppercase tracking-wide">Escanea para pagar</p>

                      {/* Imagen falsa de QR */}
                      <div className="w-48 h-48 bg-white mx-auto p-2 rounded-lg relative overflow-hidden">
                        <div className="w-full h-full border-4 border-black border-dashed opacity-50 flex items-center justify-center">
                           <QrCode size={64} className="text-black opacity-20" />
                        </div>
                        {/* Línea de escaneo animada */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-500 opacity-50 animate-[scan_2s_ease-in-out_infinite]"></div>
                      </div>

                      <div className="flex items-center justify-center gap-3 text-amber-500 mt-4">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-sm font-semibold">Esperando API Banco Económico...</span>
                      </div>
                    </div>
                  )}

                  {/* Éxito */}
                  {isSuccess && (
                    <div className="space-y-4 animate-[scaleIn_0.3s_ease-out]">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 text-center shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                        <CheckCircle2 className="text-emerald-500 mx-auto mb-3" size={48} />
                        <p className="text-emerald-400 font-black text-xl mb-1 uppercase tracking-wider">¡Inscripción Activa!</p>
                        <p className="text-gray-400 text-sm">El pago por {selectedMethodName} fue procesado exitosamente.</p>
                      </div>

                      <button
                        onClick={handleNewInscription}
                        className="w-full py-3 border-2 border-[#333] hover:bg-[#2a2a2a] text-gray-300 font-bold uppercase tracking-wide rounded-lg transition-all text-sm"
                      >
                        Nueva Inscripción
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Inscripciones;
