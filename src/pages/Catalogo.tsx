import { useState, useEffect } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import type { Tamano, Sabor } from '../store/useMenuStore';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import TamanoModal from '../components/TamanoModal';
import SaborModal from '../components/SaborModal';

export default function Catalogo() {
  const { tipos, tamanos, sabores, isLoadingCatalog, fetchCatalog, deleteTamano, deleteSabor } = useMenuStore();

  const [isTamanoModalOpen, setIsTamanoModalOpen] = useState(false);
  const [tamanoToEdit, setTamanoToEdit] = useState<Tamano | null>(null);

  const [isSaborModalOpen, setIsSaborModalOpen] = useState(false);
  const [saborToEdit, setSaborToEdit] = useState<Sabor | null>(null);

  const handleEditTamano = (tamano: Tamano) => {
    setTamanoToEdit(tamano);
    setIsTamanoModalOpen(true);
  };

  const handleNewTamano = () => {
    setTamanoToEdit(null);
    setIsTamanoModalOpen(true);
  };

  const handleDeleteTamano = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este tamaño? Esto podría afectar a los menús que lo utilizan.')) {
      await deleteTamano(id);
    }
  };

  const handleEditSabor = (sabor: Sabor) => {
    setSaborToEdit(sabor);
    setIsSaborModalOpen(true);
  };

  const handleNewSabor = () => {
    setSaborToEdit(null);
    setIsSaborModalOpen(true);
  };

  const handleDeleteSabor = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este sabor? Esto podría afectar a los menús que lo utilizan.')) {
      await deleteSabor(id);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  if (isLoadingCatalog) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col gap-8 overflow-y-auto w-full relative">
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgba(89,52,139,0.04)] border border-[#e5e1eb]">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Catálogo de Postres</h1>
          <p className="text-gray-500 mt-1 font-medium">Gestiona los tamaños, precios y sabores de tus productos.</p>
        </div>
        {/* Nuevo Elemento per-section now */}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10 w-full">
        {/* Tamaños y Precios */}
        <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#e5e1eb] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#e5e1eb] bg-white/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Tamaños y Precios</h2>
            <button onClick={handleNewTamano} className="flex items-center gap-1.5 bg-[#f6f5f8] hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
              <Plus className="w-4 h-4" strokeWidth={3} />
              Añadir Tamaño
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6f5f8] text-gray-600 sticky top-0">
                <tr>
                  <th className="px-5 py-3 font-medium">Tipo / Subtipo</th>
                  <th className="px-5 py-3 font-medium">Tamaño</th>
                  <th className="px-5 py-3 font-medium text-right">Precio</th>
                  <th className="px-5 py-3 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tamanos.map(tam => {
                  const tBase = tipos.find(x => x.id === tam.tipo_id);
                  return (
                    <tr key={tam.id} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-5 py-3">
                        <span className="font-medium text-gray-900 capitalize">{tBase?.nombre}</span>
                        {tam.subtipo && <span className="text-gray-500 ml-1 text-xs capitalize">({tam.subtipo.replace('_', ' ')})</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-700">{tam.nombre}</td>
                      <td className="px-5 py-3 text-right font-medium text-purple-700">${tam.precio}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditTamano(tam)} className="p-1.5 text-gray-400 hover:text-purple-600 rounded-md hover:bg-purple-100"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteTamano(tam.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sabores */}
        <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#e5e1eb] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#e5e1eb] bg-white/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Sabores Disponibles</h2>
            <button onClick={handleNewSabor} className="flex items-center gap-1.5 bg-[#f6f5f8] hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
              <Plus className="w-4 h-4" strokeWidth={3} />
              Añadir Sabor
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6f5f8] text-gray-600 sticky top-0">
                <tr>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 font-medium">Sabor</th>
                  <th className="px-5 py-3 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sabores.map(sabor => {
                  const tBase = tipos.find(x => x.id === sabor.tipo_id);
                  return (
                    <tr key={sabor.id} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-5 py-3">
                        <span className="font-medium text-gray-900 capitalize">{tBase?.nombre}</span>
                        {sabor.subtipo && <span className="text-gray-500 ml-1 text-xs capitalize">({sabor.subtipo.replace('_', ' ')})</span>}
                        {sabor.nivel && <span className="ml-2 inline-flex items-center px-2 text-[10px] bg-gray-100 text-gray-500 rounded-full font-bold uppercase tracking-wider">{sabor.nivel}</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-700 capitalize">{sabor.nombre}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditSabor(sabor)} className="p-1.5 text-gray-400 hover:text-purple-600 rounded-md hover:bg-purple-100"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteSabor(sabor.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <TamanoModal 
        isOpen={isTamanoModalOpen} 
        onClose={() => setIsTamanoModalOpen(false)} 
        tamano={tamanoToEdit} 
      />
      <SaborModal 
        isOpen={isSaborModalOpen} 
        onClose={() => setIsSaborModalOpen(false)} 
        sabor={saborToEdit} 
      />
    </div>
  );
}
