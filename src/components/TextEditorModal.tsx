import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Bold } from 'lucide-react';
import type { TextStyleOverride } from './MenuItem';

interface TextEditorModalProps {
  isOpen: boolean;
  fieldId: string;
  initialText: string;
  initialStyles: TextStyleOverride;
  onClose: () => void;
  onSave: (text: string, styles: TextStyleOverride) => void;
}

const FONTS = [
  { name: 'Predeterminada', value: '' },
  { name: 'Inter', value: '"Inter", sans-serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'Montserrat', value: '"Montserrat", sans-serif' },
  { name: 'Outfit', value: '"Outfit", sans-serif' },
  { name: 'Roboto', value: '"Roboto", sans-serif' },
  { name: 'Cormorant Garamond', value: '"Cormorant Garamond", serif' },
];

export default function TextEditorModal({
  isOpen,
  fieldId,
  initialText,
  initialStyles,
  onClose,
  onSave
}: TextEditorModalProps) {
  const [text, setText] = useState(initialText);
  const [color, setColor] = useState(initialStyles.color || '#000000');
  const [fontSize, setFontSize] = useState(initialStyles.fontSize ? parseFloat(initialStyles.fontSize) : 1);
  const [isBold, setIsBold] = useState(initialStyles.fontWeight === 'bold' || initialStyles.fontWeight === '900');
  const [fontFamily, setFontFamily] = useState(initialStyles.fontFamily || '');

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setColor(initialStyles.color || '#000000');
      setFontSize(initialStyles.fontSize ? parseFloat(initialStyles.fontSize) : (fieldId === 'precio' || fieldId === 'nombre' ? 1.1 : 0.85));
      setIsBold(initialStyles.fontWeight === 'bold' || initialStyles.fontWeight === '900' || fieldId === 'nombre' || fieldId === 'precio' || fieldId === 'porcion');
      setFontFamily(initialStyles.fontFamily || '');
    }
  }, [isOpen, initialText, initialStyles, fieldId]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(text, {
      color,
      fontSize: `${fontSize}rem`,
      fontWeight: isBold ? 'bold' : 'normal',
      fontFamily: fontFamily || undefined,
    });
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-800 capitalize">
            Editar {fieldId}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Text Content */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contenido</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none h-24"
              placeholder="Escribe el texto aquí..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Font Family */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tipografía</label>
              <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
              >
                {FONTS.map(f => (
                  <option key={f.name} value={f.value}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-sm font-mono text-gray-600">{color}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-6">
            {/* Font Size */}
            <div className="flex-1 space-y-2">
              <label className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span>Tamaño</span>
                <span className="text-purple-600">{fontSize.toFixed(2)}rem</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={fontSize}
                onChange={(e) => setFontSize(parseFloat(e.target.value))}
                className="w-full accent-purple-600 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Bold Toggle */}
            <button
              onClick={() => setIsBold(!isBold)}
              className={`p-3 rounded-xl border transition-all ${isBold ? 'bg-purple-100 border-purple-300 text-purple-700 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              title="Negritas"
            >
              <Bold className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-5 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95 flex justify-center items-center gap-2"
          >
            <Check className="w-4 h-4"/>
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
