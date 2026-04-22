import { useState } from 'react';
import { X } from 'lucide-react';
import { useMenuStore } from '../store/useMenuStore';
import type { MenuItemProps } from './MenuItem';

interface PostreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: MenuItemProps) => void;
}

export default function PostreDrawer({ isOpen, onClose, onAdd }: PostreDrawerProps) {
  const { tipos, tamanos, sabores } = useMenuStore();
  const [selectedTipoId, setSelectedTipoId] = useState<number | null>(null);
  
  // Specific states for the configurator
  const [selectedSubtipo, setSelectedSubtipo] = useState<string>('');
  const [selectedTamanoId, setSelectedTamanoId] = useState<number | null>(null);
  const [selectedSaboresIds, setSelectedSaboresIds] = useState<number[]>([]);
  const [rellenoBase, setRellenoBase] = useState('');
  const [rellenoSec, setRellenoSec] = useState('');
  
  const [pastelConfigs, setPastelConfigs] = useState<{panId: number, panNombre: string, rellenoBase: string, rellenoSec: string}[]>([]);
  const [currentPanId, setCurrentPanId] = useState<string>('');

  if (!isOpen) return null;

  const tipo = tipos.find(t => t.id === selectedTipoId);

  // Computed data based on selection
  const availableSubtipos = Array.from(new Set(
    tamanos.filter(t => t.tipo_id === selectedTipoId && t.subtipo).map(t => t.subtipo)
  ));

  const availableTamanos = tamanos.filter(t => 
    t.tipo_id === selectedTipoId && 
    (tipo?.nombre === 'pastel' || tipo?.nombre === 'cheesecake' ? t.subtipo === selectedSubtipo : true)
  );

  const isFlan = tipo?.nombre === 'flan';
  const isGelatina = tipo?.nombre === 'gelatina';
  const isMojadito = tipo?.nombre === 'mojadito';

  const availableSabores = sabores.filter(s => {
    if (s.tipo_id !== selectedTipoId) return false;
    if (isGelatina) return s.es_componente_gelatina;
    if (isMojadito) return true; // Handling level selection later
    if (tipo?.nombre === 'pastel' || tipo?.nombre === 'cheesecake') return s.subtipo === selectedSubtipo;
    return true;
  });

  const handleAdd = () => {
    if (!tipo || !selectedTamanoId) return;
    
    const tamano = tamanos.find(t => t.id === selectedTamanoId);
    if (!tamano) return;

    let finalName = tipo.nombre.toUpperCase();
    const finalSabores: string[] = [];
    let finalSubtitle = '';
    
    const isFlan = tipo.nombre === 'flan';
    const isGelatina = tipo.nombre === 'gelatina';
    const isMojadito = tipo.nombre === 'mojadito';
    const upperTamano = tamano.nombre.toUpperCase();
    const rawPorcion = tamano.porcion_descripcion.toUpperCase();
    
    // Helper to format portions typical of this project
    const normPorcion = rawPorcion.replace('PX', 'R.').replace('-', 'A').trim();

    if (isGelatina) {
      const selected = sabores.filter(s => selectedSaboresIds.includes(s.id));
      if (selected.length > 0) {
        selected.forEach(s => {
          onAdd({
            id: crypto.randomUUID(),
            nombre: `GELATINA DE ${s.nombre}`.toUpperCase(),
            precio: tamano.precio,
            tamano: upperTamano,
            porcion: `${upperTamano === '2 LITROS' ? 'ROSCA DE ' : ''}${upperTamano}`,
            sabores: []
          });
        });
      } else {
        onAdd({
          id: crypto.randomUUID(),
          nombre: "GELATINA",
          precio: tamano.precio,
          tamano: upperTamano,
          porcion: `${upperTamano === '2 LITROS' ? 'ROSCA DE ' : ''}${upperTamano}`,
          sabores: []
        });
      }
      
      setSelectedTipoId(null);
      setSelectedSubtipo('');
      setSelectedTamanoId(null);
      setSelectedSaboresIds([]);
      setPastelConfigs([]);
      setCurrentPanId('');
      setRellenoBase('');
      setRellenoSec('');
      onClose();
      return;
    } else if (isFlan) {
      finalName = `FLAN NAPOLITANO`;
      finalSubtitle = `${upperTamano.includes('CORAZÓN') ? 'CORAZÓN ' : ''}PARA ${normPorcion}`;
    } else if (tipo.nombre === 'cheesecake') {
      finalName = `CHEESECAKE ${selectedSubtipo.toUpperCase()}`;
      const selected = sabores.filter(s => selectedSaboresIds.includes(s.id));
      
      if (rawPorcion.includes('INDIVIDUAL')) finalSubtitle = 'INDIVIDUAL';
      else finalSubtitle = `${upperTamano} PARA ${normPorcion}`;
      
      selected.forEach(s => finalSabores.push(s.nombre.toLowerCase()));
    } else if (tipo.nombre === 'pastel') {
      finalName = `PASTEL ${upperTamano === 'CUARTO' ? 'DE CUARTO' : upperTamano}`;
      if (rawPorcion.includes('INDIVIDUAL')) finalSubtitle = 'INDIVIDUAL';
      else finalSubtitle = `PARA ${normPorcion}`;
      
      pastelConfigs.forEach(conf => {
          let desc = conf.panNombre.toLowerCase();
          if (selectedSubtipo === 'tres_leches') desc = `tres leches ${desc}`;
          
          if (conf.rellenoBase && conf.rellenoSec) desc += ` relleno de ${conf.rellenoSec} con ${conf.rellenoBase}`;
          else if (conf.rellenoSec || conf.rellenoBase) desc += ` relleno de ${conf.rellenoSec || conf.rellenoBase}`;
          
          finalSabores.push(desc);
      });
    } else if (isMojadito) {
       finalName = `MOJADITO`;
       finalSubtitle = `INDIVIDUAL`;
       const selected = sabores.filter(s => selectedSaboresIds.includes(s.id) && s.nivel === 'final');
       selected.forEach(s => finalSabores.push(s.nombre.toLowerCase()));
    } else {
       // fallback generic
       finalName = tipo.nombre.toUpperCase();
       finalSubtitle = normPorcion;
       const selected = sabores.filter(s => selectedSaboresIds.includes(s.id));
       selected.forEach(s => finalSabores.push(s.nombre.toLowerCase()));
    }

    onAdd({
      id: crypto.randomUUID(),
      nombre: finalName,
      precio: tamano.precio,
      tamano: upperTamano,
      porcion: finalSubtitle,
      sabores: finalSabores
    });
    
    // Reset and close
    setSelectedTipoId(null);
    setSelectedSubtipo('');
    setSelectedTamanoId(null);
    setSelectedSaboresIds([]);
    setPastelConfigs([]);
    setCurrentPanId('');
    setRellenoBase('');
    setRellenoSec('');
    onClose();
  };

  const isReady = selectedTipoId && selectedTamanoId && (isFlan || (tipo?.nombre === 'pastel' ? pastelConfigs.length > 0 : selectedSaboresIds.length > 0));

  return (
    <div className="absolute inset-y-0 right-0 w-[400px] bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50 transform transition-transform duration-300">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-lg text-gray-800">Agregar Postre</h3>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">1. Seleccionar Tipo</label>
          <div className="grid grid-cols-2 gap-2">
            {tipos.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTipoId(t.id);
                  setSelectedSubtipo('');
                  setSelectedTamanoId(null);
                  setSelectedSaboresIds([]);
                  setPastelConfigs([]);
                }}
                className={`py-2 px-3 border rounded text-sm text-center capitalize transition-colors ${selectedTipoId === t.id ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold' : 'border-gray-200 hover:border-purple-300 text-gray-600'}`}
              >
                {t.nombre}
              </button>
            ))}
          </div>
        </div>

        {tipo && availableSubtipos.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtipo (obligatorio)</label>
            <select 
              value={selectedSubtipo}
              onChange={(e) => {
                setSelectedSubtipo(e.target.value);
                setSelectedTamanoId(null);
                setSelectedSaboresIds([]);
                setPastelConfigs([]);
              }}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-purple-500 focus:border-purple-500 capitalize"
            >
              <option value="">Selecciona uno...</option>
              {availableSubtipos.map(sub => (
                <option key={sub || 'empty'} value={sub || ''}>{sub?.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        )}

        {tipo && (!availableSubtipos.length || selectedSubtipo) && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño / Porción</label>
              <div className="space-y-2">
                {availableTamanos.map(tam => (
                  <label key={tam.id} className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${selectedTamanoId === tam.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="tamano" 
                      checked={selectedTamanoId === tam.id}
                      onChange={() => setSelectedTamanoId(tam.id)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{tam.nombre}</div>
                      <div className="text-xs text-gray-500">{tam.porcion_descripcion}</div>
                    </div>
                    <div className="font-semibold text-purple-700">${tam.precio}</div>
                  </label>
                ))}
              </div>
            </div>

            {!isFlan && tipo?.nombre !== 'pastel' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sabores / Componentes
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {availableSabores.map(sabor => {
                    const isSelected = selectedSaboresIds.includes(sabor.id);
                    return (
                      <label key={sabor.id} className={`flex items-center gap-3 p-2 border rounded cursor-pointer transition-colors ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedSaboresIds(prev => [...prev, sabor.id]);
                            else setSelectedSaboresIds(prev => prev.filter(id => id !== sabor.id));
                          }}
                          className="text-purple-600 focus:ring-purple-500 rounded"
                        />
                        <span className="text-sm font-medium capitalize text-gray-800">
                          {sabor.nombre}
                          {isMojadito && sabor.nivel && <span className="ml-2 text-[10px] text-gray-500 uppercase">({sabor.nivel})</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {tipo?.nombre === 'pastel' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Composiciones del Pastel</label>
                
                {pastelConfigs.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {pastelConfigs.map((conf, idx) => (
                      <div key={idx} className="bg-purple-50 p-2 rounded flex justify-between items-center text-sm border border-purple-100">
                        <div>
                          <span className="font-semibold text-purple-900 capitalize">{conf.panNombre}</span>
                          {(conf.rellenoBase || conf.rellenoSec) && (
                            <span className="text-purple-700 ml-1">
                              (relleno de {conf.rellenoSec} {conf.rellenoBase && conf.rellenoSec ? 'con' : ''} {conf.rellenoBase})
                            </span>
                          )}
                        </div>
                        <button onClick={() => setPastelConfigs(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-1">
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sabor del Pan</label>
                    <select 
                      value={currentPanId}
                      onChange={e => setCurrentPanId(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-purple-500 focus:border-purple-500 capitalize bg-white"
                    >
                      <option value="">Selecciona un pan...</option>
                      {availableSabores.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Base (Ej. Queso)</label>
                      <input 
                        type="text" 
                        value={rellenoBase}
                        onChange={e => setRellenoBase(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-purple-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Ingrediente (Ej. Fresa)</label>
                      <input 
                        type="text" 
                        value={rellenoSec}
                        onChange={e => setRellenoSec(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-purple-500 bg-white"
                      />
                    </div>
                  </div>
                  
                  <button 
                    disabled={!currentPanId}
                    onClick={() => {
                      const pan = availableSabores.find(s => s.id.toString() === currentPanId);
                      if (pan) {
                        setPastelConfigs(prev => [...prev, {
                          panId: pan.id,
                          panNombre: pan.nombre,
                          rellenoBase: rellenoBase.trim(),
                          rellenoSec: rellenoSec.trim()
                        }]);
                        setCurrentPanId('');
                        setRellenoBase('');
                        setRellenoSec('');
                      }
                    }}
                    className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Añadir Composición
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button 
          disabled={!isReady}
          onClick={handleAdd}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors text-center"
        >
          Agregar al menú
        </button>
      </div>
    </div>
  );
}
