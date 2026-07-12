import { useState, useEffect } from 'react';
import { Dumbbell, Plus, Edit2, CheckCircle2, XCircle, Power } from 'lucide-react';
import { getPlanes, createPlan, updatePlan, togglePlanStatus } from '../data/db';

const Membresias = () => {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    days: '',
    features: '' // Lo manejaremos como string separado por comas
  });

  const reload = () => setPlans(getPlanes());

  useEffect(() => {
    reload();
  }, []);

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price,
        days: plan.days,
        features: plan.features ? plan.features.join(', ') : ''
      });
    } else {
      setEditingPlan(null);
      setFormData({ name: '', price: '', days: '', features: '' });
    }
    setShowModal(true);
  };

  const handleToggleStatus = (id) => {
    togglePlanStatus(id);
    reload();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedFeatures = formData.features.split(',').map(f => f.trim()).filter(f => f);
    const payload = { name: formData.name, price: Number(formData.price), days: Number(formData.days), features: parsedFeatures };

    if (editingPlan) {
      updatePlan(editingPlan.id, payload);
    } else {
      createPlan(payload);
    }
    reload();
    setShowModal(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Dumbbell className="text-blue-500" size={32} />
            <h1 className="text-3xl font-black text-white uppercase tracking-wider">
              Planes de Membresía
            </h1>
          </div>
          <p className="text-gray-400 font-medium">Gestiona los precios y servicios ofrecidos al público</p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wide transition-all shadow-lg hover:-translate-y-0.5 shrink-0"
        >
          <Plus size={20} />
          Nuevo Plan
        </button>
      </div>

      {/* Grid de Tarjetas de Precios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden group
              ${plan.isActive 
                ? 'bg-[#1e1e1e] border-[#333] hover:border-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:-translate-y-1' 
                : 'bg-[#151515] border-[#222] opacity-75 grayscale-[50%]'
              }`}
          >
            {/* Banner de Inactivo */}
            {!plan.isActive && (
              <div className="absolute top-4 right-[-35px] bg-red-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-10 rotate-45 z-10 shadow-lg">
                Inactivo
              </div>
            )}

            <div className="p-8">
              <h3 className={`text-xl font-black uppercase tracking-wide mb-2 ${plan.isActive ? 'text-white' : 'text-gray-500'}`}>
                {plan.name}
              </h3>
              <div className="flex items-end gap-1 mb-6">
                <span className={`text-4xl font-black ${plan.isActive ? 'text-blue-500' : 'text-gray-600'}`}>
                  {plan.price}
                </span>
                <span className="text-gray-400 font-bold mb-1">Bs.</span>
              </div>
              
              <div className="bg-[#111] rounded-lg p-3 mb-6 border border-[#2a2a2a] flex justify-between items-center">
                <span className="text-gray-400 text-sm font-semibold uppercase">Duración</span>
                <span className={`font-bold ${plan.isActive ? 'text-white' : 'text-gray-500'}`}>{plan.days} Días</span>
              </div>

              <div className="space-y-3 mb-8 min-h-[120px]">
                {plan.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className={plan.isActive ? 'text-emerald-500 shrink-0 mt-0.5' : 'text-gray-600 shrink-0 mt-0.5'} />
                    <span className={`text-sm ${plan.isActive ? 'text-gray-300' : 'text-gray-500'}`}>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Botones de Acción (Footer de la Tarjeta) */}
              <div className="pt-6 border-t border-[#333] flex items-center justify-between gap-3">
                <button 
                  onClick={() => handleOpenModal(plan)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold uppercase text-xs transition-colors border
                    ${plan.isActive 
                      ? 'bg-[#2a2a2a] text-blue-400 hover:bg-blue-500 hover:text-white border-transparent' 
                      : 'bg-[#1a1a1a] text-gray-500 border-[#333] hover:text-white'
                    }`}
                >
                  <Edit2 size={16} />
                  Editar
                </button>
                
                <button 
                  onClick={() => handleToggleStatus(plan.id)}
                  title={plan.isActive ? 'Desactivar Plan' : 'Activar Plan'}
                  className={`p-2.5 rounded-lg border transition-colors
                    ${plan.isActive 
                      ? 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-red-500 hover:text-red-500' 
                      : 'bg-[#1a1a1a] border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                    }`}
                >
                  <Power size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1e1e1e] w-full max-w-md rounded-lg border-t-4 border-blue-600 shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-black uppercase text-white tracking-wide mb-6">
                {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Nombre del Plan *
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-[#2a2a2a] border-2 border-transparent focus:border-blue-500 focus:bg-[#1e1e1e] text-white px-4 py-3 rounded-lg outline-none transition-all font-medium"
                    placeholder="Ej. Plan Semestral"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      Precio (Bs.) *
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="bg-[#2a2a2a] border-2 border-transparent focus:border-blue-500 focus:bg-[#1e1e1e] text-white px-4 py-3 rounded-lg outline-none transition-all font-medium font-mono text-lg"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      Duración (Días) *
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.days}
                      onChange={(e) => setFormData({...formData, days: e.target.value})}
                      className="bg-[#2a2a2a] border-2 border-transparent focus:border-blue-500 focus:bg-[#1e1e1e] text-white px-4 py-3 rounded-lg outline-none transition-all font-medium font-mono text-lg"
                      placeholder="30"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex justify-between">
                    <span>Beneficios Incluidos</span>
                    <span className="text-gray-500 lowercase normal-case font-normal">(separados por comas)</span>
                  </label>
                  <textarea 
                    value={formData.features}
                    onChange={(e) => setFormData({...formData, features: e.target.value})}
                    className="bg-[#2a2a2a] border-2 border-transparent focus:border-blue-500 focus:bg-[#1e1e1e] text-white px-4 py-3 rounded-lg outline-none transition-all font-medium resize-none h-24"
                    placeholder="Ej. Acceso total, Sauna, Toalla gratis"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-[#333]">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-lg font-bold text-gray-400 bg-[#2a2a2a] hover:bg-[#333] hover:text-white border-2 border-[#333] transition-colors uppercase text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors uppercase text-sm"
                  >
                    Guardar Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membresias;
