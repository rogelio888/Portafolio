import { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, Power, PowerOff, ShieldAlert } from 'lucide-react';
import { getMetodosPago, createMetodoPago, updateMetodoPago, toggleMetodoPago, deleteMetodoPago } from '../data/db';

const MetodosPago = () => {
  const [methods, setMethods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'other' });
  const [errorMsg, setErrorMsg] = useState('');

  const reload = () => setMethods(getMetodosPago());

  useEffect(() => {
    reload();
  }, []);

  const handleToggle = (id) => {
    toggleMetodoPago(id);
    reload();
  };

  const handleDelete = (id) => {
    const method = methods.find(m => m.id === id);
    if (method.transactionsCount > 0) {
      alert(`HU12: No se puede eliminar "${method.name}" porque tiene ${method.transactionsCount} transacciones asociadas.`);
      return;
    }

    if (window.confirm('¿Eliminar este método de pago?')) {
      deleteMetodoPago(id);
      reload();
    }
  };

  const handleOpenModal = (method = null) => {
    setErrorMsg('');
    if (method) {
      setEditingMethod(method);
      setFormData({ name: method.name, type: method.type });
    } else {
      setEditingMethod(null);
      setFormData({ name: '', type: 'other' });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingMethod) {
      updateMetodoPago(editingMethod.id, formData);
    } else {
      createMetodoPago(formData);
    }

    reload();
    setShowModal(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
            <CreditCard className="text-blue-500" size={40} />
            Tipos de Pago
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Gestione los métodos de cobro disponibles en Recepción (HU12)</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] uppercase tracking-wide"
        >
          <Plus size={20} />
          Nuevo Método
        </button>
      </div>

      <div className="bg-[#1e1e1e] p-4 rounded-xl border border-blue-500/30 flex items-start gap-4 mb-8 bg-blue-500/5">
        <ShieldAlert className="text-blue-400 shrink-0 mt-1" />
        <p className="text-sm text-blue-200">
          <strong>Administración Crítica:</strong> Apagar un método de pago aquí lo ocultará inmediatamente en la pantalla de Inscripciones. No se pueden eliminar métodos que ya tengan pagos registrados.
        </p>
      </div>

      {/* Grid de Metodos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map(method => (
          <div key={method.id} className={`bg-[#1e1e1e] border-2 rounded-2xl p-6 transition-all relative overflow-hidden group
            ${method.active ? 'border-[#333] hover:border-blue-500' : 'border-red-500/30 opacity-75 grayscale-[0.5]'}
          `}>
            {/* Status Indicator */}
            <div className={`absolute top-0 left-0 w-full h-1 ${method.active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-black text-white">{method.name}</h2>
              <button 
                onClick={() => handleToggle(method.id)}
                title={method.active ? "Deshabilitar" : "Habilitar"}
                className={`p-2 rounded-lg transition-colors border ${
                  method.active 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50' 
                    : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50'
                }`}
              >
                {method.active ? <Power size={20} /> : <PowerOff size={20} />}
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-gray-400 text-sm flex items-center justify-between">
                Estado: 
                <span className={`font-bold uppercase text-xs px-2 py-1 rounded ${method.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {method.active ? 'Activo' : 'Inactivo'}
                </span>
              </p>
              <p className="text-gray-400 text-sm flex items-center justify-between">
                Transacciones: 
                <span className="font-mono text-white font-bold">{method.transactionsCount}</span>
              </p>
            </div>

            <div className="flex gap-2 pt-4 border-t border-[#333]">
              <button 
                onClick={() => handleOpenModal(method)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-blue-500/20 text-gray-300 hover:text-blue-400 py-2 rounded-lg transition-colors text-sm font-bold"
              >
                <Edit2 size={16} /> Editar
              </button>
              <button 
                onClick={() => handleDelete(method.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-red-500/20 text-gray-300 hover:text-red-400 py-2 rounded-lg transition-colors text-sm font-bold"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] w-full max-w-md rounded-2xl shadow-2xl border border-[#333] overflow-hidden">
            <div className="bg-[#2a2a2a] p-6 border-b border-[#333]">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                {editingMethod ? <Edit2 className="text-blue-500"/> : <Plus className="text-blue-500"/>}
                {editingMethod ? 'Editar Método' : 'Nuevo Método'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Nombre del Método</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#333] focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none transition-all font-medium"
                  placeholder="Ej. Billetera Móvil"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#333] mt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#2a2a2a] hover:bg-gray-700 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider transition-colors text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
                >
                  {editingMethod ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetodosPago;
