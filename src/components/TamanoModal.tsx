import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMenuStore } from '../store/useMenuStore';
import type { Tamano } from '../store/useMenuStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tamano?: Tamano | null;
}

export default function TamanoModal({ isOpen, onClose, tamano }: Props) {
  const { tipos, addTamano, updateTamano } = useMenuStore();
  const [formData, setFormData] = useState({
    tipo_id: '',
    subtipo: '',
    nombre: '',
    porcion_descripcion: '',
    precio: '',
    orden: '0',
    activo: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tamano) {
      setFormData({
        tipo_id: tamano.tipo_id.toString(),
        subtipo: tamano.subtipo || '',
        nombre: tamano.nombre,
        porcion_descripcion: tamano.porcion_descripcion || '',
        precio: tamano.precio.toString(),
        orden: (tamano.orden || 0).toString(),
        activo: tamano.activo
      });
    } else {
      setFormData({
        tipo_id: tipos.length > 0 ? tipos[0].id.toString() : '',
        subtipo: '',
        nombre: '',
        porcion_descripcion: '',
        precio: '',
        orden: '0',
        activo: true
      });
    }
  }, [tamano, tipos, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tipo_id || !formData.nombre || !formData.precio) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        tipo_id: parseInt(formData.tipo_id),
        subtipo: formData.subtipo || null,
        nombre: formData.nombre,
        porcion_descripcion: formData.porcion_descripcion || '',
        precio: parseFloat(formData.precio),
        orden: parseInt(formData.orden) || 0,
        activo: formData.activo
      };

      if (tamano) {
        await updateTamano(tamano.id, payload);
      } else {
        await addTamano(payload);
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10 w-full shrink-0">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            {tamano ? 'Editar Tamaño' : 'Nuevo Tamaño'}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 w-full">
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 h-full w-full">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Tipo de Postre *</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#59348b] focus:ring-2 focus:ring-[#59348b]/20 transition-all outline-none text-gray-800 capitalize shadow-sm"
                  value={formData.tipo_id}
                  onChange={e => setFormData({...formData, tipo_id: e.target.value})}
                >
                  {!formData.tipo_id && <option value="">Selecciona...</option>}
                  {tipos.map(t => (
                    <option key={t.id} value={t.id} className="capitalize">{t.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Subtipo (Opc.)</label>
                <input 
                  type="text"
                  placeholder="Ej. mantequilla, frio"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#59348b] focus:ring-2 focus:ring-[#59348b]/20 transition-all outline-none text-gray-800 shadow-sm"
                  value={formData.subtipo}
                  onChange={e => setFormData({...formData, subtipo: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Nombre del Tamaño *</label>
              <input 
                required
                type="text"
                placeholder="Ej. Pequeño, 6-8 personas"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#59348b] focus:ring-2 focus:ring-[#59348b]/20 transition-all outline-none text-gray-800 shadow-sm"
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Descripción (Opcional)</label>
              <input 
                type="text"
                placeholder="Ej. Rinde aprox 6 a 8 rebanadas."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#59348b] focus:ring-2 focus:ring-[#59348b]/20 transition-all outline-none text-gray-800 shadow-sm"
                value={formData.porcion_descripcion}
                onChange={e => setFormData({...formData, porcion_descripcion: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Precio *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#59348b] focus:ring-2 focus:ring-[#59348b]/20 transition-all outline-none text-gray-800 shadow-sm font-mono"
                    value={formData.precio}
                    onChange={e => setFormData({...formData, precio: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Orden (Lista)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#59348b] focus:ring-2 focus:ring-[#59348b]/20 transition-all outline-none text-gray-800 shadow-sm font-mono"
                  value={formData.orden}
                  onChange={e => setFormData({...formData, orden: e.target.value})}
                />
              </div>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer mt-2 w-fit group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.activo ? 'bg-[#59348b] border-[#59348b]' : 'bg-white border-gray-300 group-hover:border-[#59348b]'}`}>
                {formData.activo && <X className="w-3.5 h-3.5 text-white" style={{rotate: '45deg'}} />}
              </div>
              <input 
                type="checkbox" 
                className="hidden"
                checked={formData.activo}
                onChange={e => setFormData({...formData, activo: e.target.checked})}
              />
              <span className="text-sm font-bold text-gray-700 select-none">Activo / Visible en App</span>
            </label>

            <footer className="mt-4 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-[#4A2675] to-[#59348b] hover:from-[#3d1f60] hover:to-[#4A2675] text-white rounded-xl font-bold transition-all shadow-[0_4px_15px_rgba(89,52,139,0.25)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Tamaño'}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
