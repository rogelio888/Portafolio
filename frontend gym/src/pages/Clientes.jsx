import { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Mail, Phone, MapPin, Fingerprint, CalendarDays } from 'lucide-react';
import ClientDetailsModal from '../components/ClientDetailsModal';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../data/db';

const Clientes = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClientId, setViewingClientId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const reload = () => setClients(getClientes());

  useEffect(() => {
    reload();
  }, []);

  const viewingClient = viewingClientId ? clients.find(c => c.id === viewingClientId) : null;

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if(window.confirm('¿Estás seguro de eliminar este cliente?')) {
      deleteCliente(id);
      reload();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingClient) {
      updateCliente(editingClient.id, formData);
    } else {
      createCliente(formData);
    }
    reload();
    setShowModal(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
            <Users className="text-blue-500" size={40} />
            Directorio de Clientes
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Gestione la información y contacto de los clientes</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] uppercase tracking-wide"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-xl mb-8 flex flex-col sm:flex-row gap-4 border border-[#2a2a2a]">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, código o teléfono..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#2a2a2a] text-white pl-12 pr-4 py-3 rounded-xl border border-[#333] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="bg-[#1e1e1e] rounded-2xl shadow-xl flex-1 overflow-hidden border border-[#2a2a2a] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2a2a2a] text-gray-400 text-xs uppercase tracking-widest">
                <th className="px-6 py-4 font-bold">Código</th>
                <th className="px-6 py-4 font-bold">Cliente</th>
                <th className="px-6 py-4 font-bold">Contacto</th>
                <th className="px-6 py-4 font-bold">Dirección</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-[#252525] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg font-mono font-bold border border-blue-500/20 flex items-center gap-2 w-fit">
                      <Fingerprint size={14} />
                      {client.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-bold text-lg">{client.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-300 flex items-center gap-2 text-sm"><Phone size={14} className="text-gray-500"/> {client.phone}</span>
                      <span className="text-gray-500 flex items-center gap-2 text-sm"><Mail size={14}/> {client.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 flex items-center gap-2 text-sm max-w-xs truncate"><MapPin size={14} className="text-gray-500 shrink-0"/> {client.address}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingClientId(client.id)}
                        className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors border border-transparent hover:border-emerald-400/30"
                        title="Ver Detalles y Calendario"
                      >
                        <CalendarDays size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(client)}
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors border border-transparent hover:border-blue-400/30"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/30"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClients.length === 0 && (
            <div className="p-12 text-center text-gray-500 font-medium">
              No se encontraron clientes que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] w-full max-w-md rounded-2xl shadow-2xl border border-[#333] overflow-hidden">
            <div className="bg-[#2a2a2a] p-6 border-b border-[#333]">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                {editingClient ? <Edit2 className="text-blue-500"/> : <Plus className="text-blue-500"/>}
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              {editingClient && (
                <p className="text-gray-400 mt-2 font-mono text-sm">CÓDIGO: {editingClient.code}</p>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#333] focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none transition-all font-medium"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Teléfono</label>
                  <input 
                    type="text" 
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Dirección</label>
                <textarea 
                  rows="2"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#333] focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none transition-all resize-none font-medium"
                ></textarea>
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
                  {editingClient ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ClientDetailsModal
        client={viewingClient}
        onClose={() => setViewingClientId(null)}
      />
    </div>
  );
};

export default Clientes;
