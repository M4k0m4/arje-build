import React from 'react';
import ImageSlot from './ImageSlot';
import MenuItem from './MenuItem';
import type { MenuItemProps } from './MenuItem';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CropModal from './CropModal';
import TextEditorModal from './TextEditorModal';
import type { TextStyleOverride, MenuItemOverrides } from './MenuItem';
import logoArje from '../assets/logo-arje.png';
import logoWhats from '../assets/logo-whats.png';

interface CanvasMenuProps {
  id?: string;
  items: MenuItemProps[];
  onChange?: (items: MenuItemProps[]) => void;
  backgroundUrl?: string;
  bgScale?: number;
  bgOffset?: { x: number, y: number };
  bgBlur?: number;
  bgOpacity?: number;
  onBgOffsetChange?: React.Dispatch<React.SetStateAction<{ x: number, y: number }>>;
  images?: Record<number, string>;
  onImagesChange?: (images: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => void;
  colorTitulos?: string;
  colorTamano?: string;
  colorPrecios?: string;
}

function SortableMenuItem({ item, onDelete, onDoubleClickElement, colorTitulos, colorTamano, colorPrecios }: { item: MenuItemProps, onDelete: () => void, onDoubleClickElement?: (fieldId: keyof MenuItemOverrides, currentText: string, currentStyles: TextStyleOverride) => void, colorTitulos?: string, colorTamano?: string, colorPrecios?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="cursor-grab active:cursor-grabbing relative group outline-none"
    >
      {/* Visual cue for dragging only visible on hover */}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </div>
      {/* Delete button visible on hover */}
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"
        title="Eliminar postre"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <MenuItem 
        {...item} 
        colorTitulos={colorTitulos}
        colorTamano={colorTamano}
        colorPrecios={colorPrecios}
        onDoubleClickElement={onDoubleClickElement}
      />
    </div>
  );
}

export default function CanvasMenu({ 
  id = 'canvas-menu-export', 
  items, 
  onChange,
  backgroundUrl,
  bgScale = 100,
  bgOffset = { x: 50, y: 50 },
  bgBlur = 0,
  bgOpacity = 100,
  onBgOffsetChange,
  images: propImages,
  onImagesChange,
  colorTitulos,
  colorTamano,
  colorPrecios
}: CanvasMenuProps) {

  // Image Slots State
  const [localImages, setLocalImages] = React.useState<Record<number, string>>({});
  const images = propImages !== undefined ? propImages : localImages;
  const setImages = onImagesChange !== undefined ? (onImagesChange as React.Dispatch<React.SetStateAction<Record<number, string>>>) : setLocalImages;
  const [history, setHistory] = React.useState<Record<number, string[]>>({ 1:[], 2:[], 3:[], 4:[] });
  
  // Panning State
  const [isDraggingBg, setIsDraggingBg] = React.useState(false);
  const bgDragStart = React.useRef({ x: 0, y: 0 });

  // Crop Modal State
  const [cropSlot, setCropSlot] = React.useState<number | null>(null);
  const [cropOriginalUrl, setCropOriginalUrl] = React.useState<string>('');

  const [activeTextEdit, setActiveTextEdit] = React.useState<{
    itemId: string;
    fieldId: keyof MenuItemOverrides;
    currentText: string;
    currentStyles: TextStyleOverride;
  } | null>(null);

  const handleDoubleClickElement = (itemId: string, fieldId: keyof MenuItemOverrides, currentText: string, currentStyles: TextStyleOverride) => {
    setActiveTextEdit({ itemId, fieldId, currentText, currentStyles });
  };

  const handleSaveTextEdit = (newText: string, newStyles: TextStyleOverride) => {
    if (!activeTextEdit || !onChange) return;
    
    const newItems = items.map(item => {
      if (item.id === activeTextEdit.itemId) {
        return {
          ...item,
          overrides: {
            ...(item.overrides || {}),
            [activeTextEdit.fieldId]: {
              text: newText,
              ...newStyles
            }
          }
        };
      }
      return item;
    });
    
    onChange(newItems);
    setActiveTextEdit(null);
  };


  const handleFileSelected = (slot: number, file: File) => {
    const url = URL.createObjectURL(file);
    setCropOriginalUrl(url);
    setCropSlot(slot);
  };

  const commitCrop = (croppedUrl: string) => {
    if (!cropSlot) return;
    setImages(prev => {
       const old = prev[cropSlot];
       if (old) {
          setHistory(h => ({ ...h, [cropSlot]: [...h[cropSlot], old] }));
       }
       return { ...prev, [cropSlot]: croppedUrl };
    });
    setCropSlot(null);
    setCropOriginalUrl('');
  };

  const handleUndo = (slot: number) => {
     setHistory(h => {
        const hist = h[slot];
        if (hist.length > 0) {
           const prevImg = hist[hist.length - 1];
           setImages(img => ({ ...img, [slot]: prevImg }));
           return { ...h, [slot]: hist.slice(0, -1) };
        }
        return h;
     });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // allows clicking without drag initiating immediately
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onChange) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      
      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);
      
      onChange(newItems);
    }
  };
  
  return (
    <div 
      id={id}
      className="bg-[#f6f6f8] flex relative overflow-hidden shrink-0"
      style={{ 
        width: '816px', 
        height: '1056px'
      }}
    >
      <style>{`
        /* Fix for dom-to-image-more Tailwind phantom border bug */
        #${id} *:not(.keep-border) {
          border-color: transparent !important;
        }
      `}</style>

      {/* Left Column: Imágenes GRID */}
      <div className="w-[327px] shrink-0 h-full flex flex-col z-20 p-0 m-0 relative bg-[#eae8ec] -mr-[1px]">
        {[1, 2, 3, 4].map(slotNum => (
          <div key={slotNum} className="relative w-full h-[265px] shrink-0 -mb-[1px] z-10">
            <ImageSlot 
              slotId={slotNum} 
              imageUrl={images[slotNum]}

              onFileSelected={handleFileSelected}
              onDoubleTap={(s) => {
                 setCropSlot(s);
                 setCropOriginalUrl(images[s]);
              }}
              onDelete={(s) => {
                 setImages(prev => {
                   const n = {...prev};
                   delete n[s];
                   return n;
                 });
                 setHistory(h => {
                   const n = {...h};
                   n[s] = [];
                   return n;
                 });
              }}
            />
            {history[slotNum]?.length > 0 && (
              <button 
                onClick={() => handleUndo(slotNum)}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                title="Deshacer último cambio"
                style={{ zIndex: 20 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Right Column: Content */}
      <div className="w-[490px] shrink-0 h-full relative z-10 bg-[#f6f6f8] overflow-hidden ml-0">
        
          <div 
             className="absolute inset-0 pointer-events-none" 
             style={{ clipPath: 'inset(0 0 0 0)' }}
          >
            <div 
              className={`absolute -inset-[100px] z-0 touch-none ${backgroundUrl ? (isDraggingBg ? 'cursor-grabbing pointer-events-auto' : 'cursor-grab pointer-events-auto') : ''}`}
              style={{
                backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                backgroundSize: `${bgScale}%`,
                backgroundPosition: `${bgOffset.x}% ${bgOffset.y}%`,
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#f6f6f8',
                filter: `blur(${bgBlur}px)`,
                opacity: bgOpacity / 100
              }}
              onPointerDown={(e) => {
            if (!backgroundUrl || e.button !== 0) return;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            setIsDraggingBg(true);
            bgDragStart.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            if (!isDraggingBg || !onBgOffsetChange) return;
            const dx = e.clientX - bgDragStart.current.x;
            const dy = e.clientY - bgDragStart.current.y;
            bgDragStart.current = { x: e.clientX, y: e.clientY };
            onBgOffsetChange(prev => ({
                x: prev.x + (dx * 0.2), 
                y: prev.y + (dy * 0.1)
            }));
          }}
          onPointerUp={(e) => {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            setIsDraggingBg(false);
          }}
        />
        </div>

        {/* Floating Content Interface */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-between px-16 py-10">
          
          {/* Header - Logo */}
          <div className="w-full flex justify-center mb-6 pointer-events-auto">
            <img 
              src={logoArje} 
              alt="ARJÉ PASTELERÍA" 
              className="w-[85%] max-w-[240px] aspect-auto object-contain"
            />
          </div>
          
          {/* Postres List */}
          <div className="w-full flex-1 flex flex-col justify-center space-y-[0rem] pointer-events-auto">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <SortableMenuItem 
                    key={item.id} 
                    item={item} 
                    onDelete={() => onChange && onChange(items.filter(i => i.id !== item.id))}
                    colorTitulos={colorTitulos}
                    colorTamano={colorTamano}
                    colorPrecios={colorPrecios}
                    onDoubleClickElement={(fieldId, text, styles) => handleDoubleClickElement(item.id, fieldId, text, styles)}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {items.length === 0 && (
              <div className="flex-1 border-2 border-dashed border-purple-300 rounded-xl p-4 text-center flex items-center justify-center text-purple-600 bg-purple-50/50 backdrop-blur-sm">
                Lista vacía.<br/>Añade postres desde el catálogo a esta hoja.
              </div>
            )}
          </div>

          {/* Footer - Premium Contact Button */}
          <div className="w-full flex justify-center mt-8 z-10 pb-6 pointer-events-auto">
            <div className="keep-border border border-[#74439c] bg-gradient-to-r from-[#4A2675] to-[#59348b] text-white py-3.5 px-8 rounded-full flex items-center gap-5 shadow-[0_12px_25px_rgb(89,52,139,0.3)] transform transition hover:scale-105">
              {/* WhatsApp Icon */}
              <div className="keep-border w-10 h-10 flex items-center justify-center -ml-1">
                <img src={logoWhats} alt="WhatsApp" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.95rem] font-medium leading-tight text-[#d0c0e3] drop-shadow-sm">Ordena ahora</span>
                <span className="text-xl font-black leading-none tracking-wide text-white drop-shadow-sm font-sans mt-0.5 whitespace-nowrap">971 132 2041</span>
              </div>
            </div>
           </div>
        </div>
      </div>
      
      {cropSlot && cropOriginalUrl && (
        <CropModal 
          isOpen={true} 
          imageUrl={cropOriginalUrl} 
          onClose={() => setCropSlot(null)} 
          onSave={commitCrop} 
        />
      )}

      {activeTextEdit && (
        <TextEditorModal
          isOpen={!!activeTextEdit}
          fieldId={activeTextEdit.fieldId}
          initialText={activeTextEdit.currentText}
          initialStyles={activeTextEdit.currentStyles}
          onClose={() => setActiveTextEdit(null)}
          onSave={handleSaveTextEdit}
        />
      )}
    </div>
  );
}
