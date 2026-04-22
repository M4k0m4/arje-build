import React, { useState, useEffect, useRef } from 'react';
import CanvasMenu from '../components/CanvasMenu';
import PostreDrawer from '../components/PostreDrawer';
import type { MenuItemProps } from '../components/MenuItem';
import { useMenuStore } from '../store/useMenuStore';

import { exportCanvasToPNG } from '../lib/exportUtils';
import { Download, Trash2, GripVertical, ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableHojaTab({ id, isActive, onClick, onDelete }: { id: number, isActive: boolean, onClick: () => void, onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id.toString() });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`group flex items-center justify-between p-3.5 mb-2.5 border rounded-2xl text-sm font-bold transition-all duration-300 ${isActive ? 'bg-gradient-to-tr from-[#4A2675] to-[#6d41a3] border-transparent text-white shadow-[0_8px_20px_rgba(89,52,139,0.25)] scale-[1.03] ring-2 ring-purple-300/30 ring-offset-1' : 'bg-white border-gray-200/70 text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-[#59348b] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(89,52,139,0.08)]'}`}
    >
      <div className="flex items-center gap-2.5 flex-1 cursor-pointer" onClick={onClick}>
        <div {...attributes} {...listeners} className={`cursor-grab active:cursor-grabbing pr-1 -ml-1 flex-shrink-0 outline-none transition-colors ${isActive ? 'text-purple-300 hover:text-white' : 'text-gray-300 hover:text-gray-600'}`}>
           <GripVertical className="w-4 h-4" />
        </div>
        <span>Hoja {id}</span>
      </div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${isActive ? 'text-purple-200 hover:text-white hover:bg-white/20' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}
        title="Eliminar hoja"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Editor() {
  const { fetchCatalog } = useMenuStore();
  const [hojas, setHojas] = useState<Record<number, MenuItemProps[]>>(() => {
    const saved = localStorage.getItem('arje_editor_hojas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { 1: [] };
  });
  
  const [activeHojaId, setActiveHojaId] = useState<number>(() => {
    const saved = localStorage.getItem('arje_editor_active');
    return saved ? Number(saved) : 1;
  });
  
  const [hojasImages, setHojasImages] = useState<Record<number, Record<number, string>>>(() => {
    const saved = localStorage.getItem('arje_editor_images');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { 1: {} };
  });

  const [hojasOrder, setHojasOrder] = useState<number[]>(() => {
    const saved = localStorage.getItem('arje_editor_hojas_order');
    if (saved) { try { return JSON.parse(saved); } catch (e) {} }
    
    // Migration: extract keys from localStorage hojas if order doesn't exist
    const savedHojas = localStorage.getItem('arje_editor_hojas');
    if (savedHojas) {
        try { return Object.keys(JSON.parse(savedHojas)).map(Number); } catch(e){}
    }
    return [1];
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFondoOpen, setIsFondoOpen] = useState(false);
  const [zoom, setZoom] = useState(0.55);
  
  // Custom Zoom & Pan Physics
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Dynamic boundaries based on zoom
  useEffect(() => {
     setPan(p => {
        const maxX = 500 * zoom;
        const maxY = 650 * zoom;
        const bx = Math.max(-maxX, Math.min(maxX, p.x));
        const by = Math.max(-maxY, Math.min(maxY, p.y));
        return (p.x !== bx || p.y !== by) ? { x: bx, y: by } : p;
     });
  }, [zoom]);

  const handlePointerDown = (e: React.PointerEvent) => {
      const target = e.target as HTMLElement;
      // No panear si le dan clic a botones o inputs
      if (target.closest('button, input, textarea, [role="button"]')) return;
      
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDraggingCanvas) return;
      const rawX = e.clientX - dragStart.x;
      const rawY = e.clientY - dragStart.y;
      
      const maxX = 500 * zoom;
      const maxY = 650 * zoom;
      
      setPan({ 
         x: Math.max(-maxX, Math.min(maxX, rawX)), 
         y: Math.max(-maxY, Math.min(maxY, rawY)) 
      });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      setIsDraggingCanvas(false);
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Global style states
  const [backgroundUrl, setBackgroundUrl] = useState<string>(() => {
    return localStorage.getItem('arje_editor_bg') || '';
  });
  
  const [bgScale, setBgScale] = useState<number>(() => {
    const saved = localStorage.getItem('arje_editor_bg_scale');
    return saved ? Number(saved) : 100;
  });

  const [bgOffset, setBgOffset] = useState<{x: number, y: number}>(() => {
    try {
      const saved = localStorage.getItem('arje_editor_bg_offset');
      return saved ? JSON.parse(saved) : { x: 50, y: 50 };
    } catch { return { x: 50, y: 50 }; }
  });

  const [bgBlur, setBgBlur] = useState<number>(() => {
    const saved = localStorage.getItem('arje_editor_bg_blur');
    return saved ? Number(saved) : 0;
  });

  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('arje_editor_bg_opacity');
    return saved ? Number(saved) : 100;
  });

  const [isAjustesFondoOpen, setIsAjustesFondoOpen] = useState(false);

  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Auto-save to localStorage
  useEffect(() => {
    try { localStorage.setItem('arje_editor_hojas', JSON.stringify(hojas)); } catch (e) { console.error("Error saving hojas:", e); }
  }, [hojas]);

  useEffect(() => {
    try { localStorage.setItem('arje_editor_images', JSON.stringify(hojasImages)); } catch (e) { console.error("Error saving images limit:", e); }
  }, [hojasImages]);

  useEffect(() => {
    try { localStorage.setItem('arje_editor_active', String(activeHojaId)); } catch (e) {}
  }, [activeHojaId]);

  useEffect(() => {
    try {
      localStorage.setItem('arje_editor_bg', backgroundUrl);
    } catch (e) {
      console.warn("Storage quota exceeded for background image.");
      alert("⚠️ Tu imagen de fondo es gigante para la memoria rápida de tu navegador. El fondo ha sido cargado pero NO se quedará guardado si cierras la pestaña. Te recomiendo comprimirla primero en TinyPNG si deseas que se grabe de forma permanente.");
    }
  }, [backgroundUrl]);

  useEffect(() => {
    try { localStorage.setItem('arje_editor_bg_scale', String(bgScale)); } catch (e) {}
  }, [bgScale]);

  useEffect(() => {
    try { localStorage.setItem('arje_editor_bg_offset', JSON.stringify(bgOffset)); } catch (e) {}
  }, [bgOffset]);

  useEffect(() => {
    try { localStorage.setItem('arje_editor_bg_blur', String(bgBlur)); } catch (e) {}
  }, [bgBlur]);

  useEffect(() => {
    try { localStorage.setItem('arje_editor_bg_opacity', String(bgOpacity)); } catch (e) {}
  }, [bgOpacity]);

  useEffect(() => {
    try { localStorage.setItem('arje_editor_hojas_order', JSON.stringify(hojasOrder)); } catch (e) {}
  }, [hojasOrder]);

  const items = hojas[activeHojaId] || [];

  const setItems = (newItems: MenuItemProps[] | ((prev: MenuItemProps[]) => MenuItemProps[])) => {
    setHojas(prev => {
      const current = prev[activeHojaId] || [];
      const updated = typeof newItems === 'function' ? newItems(current) : newItems;
      return { ...prev, [activeHojaId]: updated };
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEndHojas = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setHojasOrder((items) => {
        const oldIndex = items.indexOf(Number(active.id));
        const newIndex = items.indexOf(Number(over.id));
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handleAddPostre = (item: Omit<MenuItemProps, 'id'>) => {
    const newItem: MenuItemProps = { ...item, id: crypto.randomUUID() };
    setItems(prev => [...prev, newItem]);
  };

  const handleExport = async () => {
    await exportCanvasToPNG();
  };

  return (
    <div className="flex w-full h-full relative overflow-hidden bg-[#e8e6eb]">
      {/* LEFT UNIFIED SIDEBAR (Master Panel) */}
      <aside className="w-80 bg-white/90 backdrop-blur-2xl border-r border-[#dcd7e3] flex flex-col z-20 shrink-0 shadow-[8px_0_30px_rgba(89,52,139,0.06)] relative">
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Section: Hojas */}
          <div className="p-6 font-bold flex justify-between items-center bg-white/60 sticky top-0 z-10 backdrop-blur-xl border-b border-gray-100/50">
            <span className="text-[0.70rem] uppercase tracking-widest text-[#59348b] font-black flex items-center gap-2 opacity-80">
              Gestor de Hojas
            </span>
            <button 
              onClick={() => {
                const nextId = hojasOrder.length > 0 ? Math.max(...hojasOrder) + 1 : 1;
                setHojas(prev => ({ ...prev, [nextId]: [] })); 
                setHojasImages(prev => ({ ...prev, [nextId]: {} }));
                setHojasOrder(prev => [...prev, nextId]);
                setActiveHojaId(nextId);
              }} 
              className="text-xs text-[#59348b] bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl font-black transition-all duration-300 hover:scale-[1.04] active:scale-95 shadow-sm border border-purple-100/50 flex items-center gap-1.5"
            >
              + Añadir
            </button>
          </div>
          
          <div className="px-5 pt-3 pb-6 space-y-1">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndHojas}>
              <SortableContext items={hojasOrder.map(String)} strategy={verticalListSortingStrategy}>
                {hojasOrder.map(hId => (
                  <SortableHojaTab 
                    key={hId} 
                    id={hId} 
                    isActive={hId === activeHojaId} 
                    onClick={() => setActiveHojaId(hId)}
                    onDelete={() => {
                       if (confirm(`¿Estás seguro de eliminar la Hoja ${hId}?`)) {
                          setHojasOrder(prev => prev.filter(id => id !== hId));
                          setHojas(prev => { const n = {...prev}; delete n[hId]; return n; });
                          setHojasImages(prev => { const n = {...prev}; delete n[hId]; return n; });
                          if (activeHojaId === hId) {
                             const remaining = hojasOrder.filter(id => id !== hId);
                             setActiveHojaId(remaining.length > 0 ? remaining[0] : 0);
                          }
                       }
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-1"></div>

          {/* Section: Custom Background Settings (Collapsible) */}
          <div className="mt-2">
            <button 
              onClick={() => setIsFondoOpen(!isFondoOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-gray-800 hover:bg-purple-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-pink-100 text-[#59348b]"><ImageIcon className="w-4 h-4"/></div>
                <span className="font-bold text-[0.95rem]">Fondo del Documento</span>
              </div>
              {isFondoOpen ? <ChevronDown className="w-5 h-5 text-gray-400"/> : <ChevronRight className="w-5 h-5 text-gray-400"/>}
            </button>
            
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isFondoOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-5 pt-1 space-y-5 bg-purple-50/20">
                <div className="flex flex-col gap-3">
                  <input 
                    type="file" 
                    ref={bgInputRef} 
                    onChange={handleBackgroundUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => bgInputRef.current?.click()}
                    className="w-full bg-white border border-gray-200/80 hover:border-purple-300 hover:bg-purple-50/30 text-gray-700 py-3 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] font-bold transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2"
                  >
                    Cargar Imagen de Fondo
                  </button>
                  {/* Controles de Fondo Glassmorphic Colapsables */}
                  {backgroundUrl && (
                    <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      
                      <button 
                         onClick={() => setIsAjustesFondoOpen(!isAjustesFondoOpen)} 
                         className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-[#f6f3f9] hover:bg-[#ebe4f3] text-[#59348b] text-sm font-bold transition-all duration-300 border border-purple-100 shadow-[0_2px_10px_rgba(89,52,139,0.06)]"
                      >
                         <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> Ajustes Avanzados</span>
                         <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAjustesFondoOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <div 
                         className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isAjustesFondoOpen ? 'max-h-[500px] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95 pointer-events-none'}`}
                      >
                        <div className="p-5 bg-white/50 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_8px_30px_rgba(89,52,139,0.08)] space-y-4 mb-2">
                           
                           {/* Zoom Slider */}
                           <div className="flex flex-col gap-1.5">
                              <label className="flex justify-between text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider"><span>Escala</span> <span className="text-[#59348b]">{bgScale}%</span></label>
                              <input type="range" min="20" max="300" value={bgScale} onChange={e => setBgScale(Number(e.target.value))} className="w-full accent-purple-600 h-1.5 bg-purple-100 rounded-full appearance-none cursor-pointer" />
                           </div>

                           {/* Horizontal Slider */}
                           <div className="flex flex-col gap-1.5">
                              <label className="flex justify-between text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider"><span>Horizontal</span> <span className="text-[#59348b]">{Math.round(bgOffset.x)}</span></label>
                              <input type="range" min="-100" max="200" value={Math.round(bgOffset.x)} onChange={e => setBgOffset(prev => ({ ...prev, x: Number(e.target.value) }))} className="w-full accent-purple-600 h-1.5 bg-purple-100 rounded-full appearance-none cursor-pointer" />
                           </div>

                           {/* Vertical Slider */}
                           <div className="flex flex-col gap-1.5">
                              <label className="flex justify-between text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider"><span>Vertical</span> <span className="text-[#59348b]">{Math.round(bgOffset.y)}</span></label>
                              <input type="range" min="-100" max="200" value={Math.round(bgOffset.y)} onChange={e => setBgOffset(prev => ({ ...prev, y: Number(e.target.value) }))} className="w-full accent-purple-600 h-1.5 bg-purple-100 rounded-full appearance-none cursor-pointer" />
                           </div>

                           {/* Blur Slider */}
                           <div className="flex flex-col gap-1.5">
                              <label className="flex justify-between text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider"><span>Desenfoque</span> <span className="text-[#59348b]">{bgBlur}px</span></label>
                              <input type="range" min="0" max="25" step="0.5" value={bgBlur} onChange={e => setBgBlur(Number(e.target.value))} className="w-full accent-purple-600 h-1.5 bg-purple-100 rounded-full appearance-none cursor-pointer" />
                           </div>

                           {/* Opacity Slider */}
                           <div className="flex flex-col gap-1.5">
                              <label className="flex justify-between text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider"><span>Opacidad</span> <span className="text-[#59348b]">{bgOpacity}%</span></label>
                              <input type="range" min="0" max="100" value={bgOpacity} onChange={e => setBgOpacity(Number(e.target.value))} className="w-full accent-purple-600 h-1.5 bg-purple-100 rounded-full appearance-none cursor-pointer" />
                           </div>
                           
                        </div>
                      </div>

                      <button 
                        onClick={() => { setBackgroundUrl(''); setBgScale(100); setBgOffset({x:50, y:50}); setBgBlur(0); setBgOpacity(100); setIsAjustesFondoOpen(false); }}
                        className="w-full border border-red-200 bg-red-50/80 hover:bg-red-100 text-red-600 py-3 rounded-2xl shadow-[0_2px_10px_rgba(220,38,38,0.05)] font-bold transition-all"
                      >
                        Remover Fondo
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-[0.70rem] text-gray-400 leading-relaxed font-medium">
                  El diseño del lado derecho tomará este fondo dinámicamente en todas las hojas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER IMMERSIVE WORKSPACE (Canvas) */}
      <section className="flex-1 flex flex-col min-w-0 relative">
        {/* FIXED HEADER */}
        <header className="w-full flex justify-between items-center p-6 lg:px-10 shrink-0 bg-[#e8e6eb]/80 backdrop-blur-xl z-30 border-b border-gray-300/40 shadow-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-gray-800 tracking-tight drop-shadow-sm">Hoja {activeHojaId}</h2>
              {items.length === 0 && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold animate-pulse">Lienzo Vacío</span>}
            </div>
            
            {/* Contextual Floating Actions */}
            <div className="flex gap-4">
              <button 
                onClick={handleExport}
                className="bg-white/90 backdrop-blur-md text-gray-700 hover:text-[#59348b] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-white hover:border-purple-200 px-5 py-2 rounded-2xl font-bold flex items-center gap-2 transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_8px_25px_rgba(89,52,139,0.15)] active:scale-95"
              >
                <Download className="w-4 h-4"/> Exportar Archivo
              </button>
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="bg-gradient-to-tr from-[#4A2675] to-[#6d41a3] text-white px-5 py-2 rounded-2xl shadow-[0_6px_20px_rgba(89,52,139,0.25)] hover:shadow-[0_10px_30px_rgba(89,52,139,0.4)] font-bold transition-all duration-300 hover:scale-[1.04] active:scale-95 flex items-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out"></div>
                <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg> 
                <span className="relative z-10">Añadir postre</span>
              </button>
            </div>
        </header>

        {/* SCROLLABLE INTERACTIVE VIEWPORT (Native Infinite Canvas) */}
        <div 
           className={`flex-1 w-full h-full overflow-hidden relative touch-none bg-[#e8e6eb] ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'}`}
           onPointerDown={handlePointerDown}
           onPointerMove={handlePointerMove}
           onPointerUp={handlePointerUp}
           onPointerCancel={handlePointerUp}
           onWheel={(e) => {
              if (e.ctrlKey || e.metaKey) {
                 const zoomDelta = e.deltaY > 0 ? -0.05 : 0.05;
                 setZoom(z => Math.max(0.55, Math.min(1.25, z + zoomDelta)));
              } else {
                 setPan(p => {
                    const nextX = p.x - e.deltaX;
                    const nextY = p.y - e.deltaY;
                    const maxX = 500 * zoom;
                    const maxY = 650 * zoom;
                    return {
                       x: Math.max(-maxX, Math.min(maxX, nextX)),
                       y: Math.max(-maxY, Math.min(maxY, nextY))
                    };
                 });
              }
           }}
        >
            
            {/* Zoom Controls */}
            <div className="absolute bottom-8 right-8 z-40 flex items-center gap-1 bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.1)] border border-white">
              <button onClick={() => setZoom(z => Math.max(0.55, z - 0.1))} className="p-2.5 hover:bg-purple-50 rounded-xl text-gray-500 hover:text-[#59348b] transition-colors active:scale-95">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4"/></svg>
              </button>
              <span className="text-[0.8rem] font-black w-14 text-center text-gray-700 font-sans tracking-tight cursor-pointer" onClick={() => { setZoom(0.55); setPan({x:0, y:0}); }} title="Centrar Lienzo">
                 {Math.round(zoom * 100)}%
              </span>
              <button onClick={() => setZoom(z => Math.min(1.25, z + 0.1))} className="p-2.5 hover:bg-purple-50 rounded-xl text-gray-500 hover:text-[#59348b] transition-colors active:scale-95">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>

            {/* The scaled and translated Canvas container */}
            <div 
              className="absolute top-1/2 left-1/2 origin-center transition-shadow duration-300"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                pointerEvents: isDraggingCanvas ? 'none' : 'auto'
              }}
            >
               <div className="shadow-[0_25px_60px_-10px_rgba(0,0,0,0.25)] ring-1 ring-black/5 rounded-sm">
                <CanvasMenu 
                  key={activeHojaId}
                  items={items} 
                  onChange={setItems} 
                  backgroundUrl={backgroundUrl}
                  bgScale={bgScale}
                  bgOffset={bgOffset}
                  bgBlur={bgBlur}
                  bgOpacity={bgOpacity}
                  onBgOffsetChange={setBgOffset}
                  images={hojasImages[activeHojaId] || {}}
                  onImagesChange={(newImages) => {
                     setHojasImages(prev => {
                        const current = prev[activeHojaId] || {};
                        const updated = typeof newImages === 'function' ? newImages(current) : newImages;
                        return { ...prev, [activeHojaId]: updated };
                     });
                  }}
                />
               </div>
            </div>
        </div>
      </section>

      {/* Floating Glass Drawer */}
      {isDrawerOpen && (
        <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsDrawerOpen(false)}>
            <div onClick={e => e.stopPropagation()} className="absolute inset-y-0 right-0 h-full shadow-[-15px_0_40px_rgba(0,0,0,0.15)] animate-in slide-in-from-right duration-300 ease-out">
               <PostreDrawer 
                 isOpen={isDrawerOpen} 
                 onClose={() => setIsDrawerOpen(false)} 
                 onAdd={handleAddPostre} 
               />
            </div>
        </div>
      )}
    </div>
  );
}
