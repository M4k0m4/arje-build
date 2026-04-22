
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react';

interface ImageSlotProps {
  slotId: number;
  imageUrl?: string | null;
  onUploadClick: (slotId: number) => void;
  onFileSelected?: (slotId: number, file: File) => void;
  onDoubleTap: (slotId: number) => void;
  onDelete: (slotId: number) => void;
}

export default function ImageSlot({ slotId, imageUrl, onUploadClick, onFileSelected, onDoubleTap, onDelete }: ImageSlotProps) {
  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && onFileSelected) {
      onFileSelected(slotId, e.target.files[0]);
    }
    e.target.value = '';
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden group bg-[#eae8ec] flex items-center justify-center transition-all"
      onDoubleClick={() => {
        if (imageUrl) onDoubleTap(slotId);
      }}
    >
      {imageUrl ? (
        <>
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
            <div className="flex gap-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <label 
                className="p-2.5 bg-white/90 rounded-full hover:bg-white text-gray-800 shadow-xl hover:scale-110 transition-all cursor-pointer"
                title="Cambiar imagen"
              >
                <input type="file" className="hidden" accept="image/*" onChange={handleLocalChange} />
                <ImageIcon className="w-5 h-5" />
              </label>
              <button 
                onClick={(e) => { e.stopPropagation(); onDoubleTap(slotId); }}
                className="p-2.5 bg-white/90 rounded-full hover:bg-white text-gray-800 shadow-xl hover:scale-110 transition-all"
                title="Ajustar encuadre"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(slotId); }}
                className="p-2.5 bg-red-500/90 rounded-full hover:bg-red-500 text-white shadow-xl hover:scale-110 transition-all"
                title="Eliminar foto"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <label className="flex flex-col items-center justify-center text-gray-400 group-hover:text-purple-500 cursor-pointer w-full h-full">
          <input type="file" className="hidden" accept="image/*" onChange={handleLocalChange} />
          <Camera className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-sm font-medium">Slot {slotId}</span>
        </label>
      )}
    </div>
  );
}
