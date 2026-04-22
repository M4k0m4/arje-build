import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';

interface CropModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (croppedImageBase64: string) => void;
}

// utility function to crop image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    if (!url.startsWith('blob:')) image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/webp', 0.9);
}

export default function CropModal({ isOpen, imageUrl, onClose, onSave }: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels as any);
      onSave(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 touch-none"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold">Ajustar Encuadre</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        <div 
          className="relative w-full h-[500px] bg-gray-900 select-none touch-none"
          onDragStart={(e) => e.preventDefault()}
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={327 / 265} // Exact aspect ratio of the ImageSlot
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="p-6 flex items-center justify-between bg-gray-50">
          <div className="flex-1 max-w-xs flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-purple-600/20 active:scale-95"
          >
            <Check className="w-4 h-4"/>
            Aplicar Recorte
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
