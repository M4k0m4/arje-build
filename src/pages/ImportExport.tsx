import React, { useRef } from 'react';
import { UploadCloud, DownloadCloud } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ImportExport() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const ws_data = [
      ["No. Hoja", "Categoría Base", "Título (Tamaño)", "Descripción (Porción)", "Precio", "Sabores"],
      [1, "Pastel", "Pastel Mediano", "Para 20 a 25 R.", 740, "chocolate relleno de fresa con queso, vainilla con durazno"],
      [1, "Mojadito", "Mojadito Individual", "Individual", 60, "fresa, tropical (piña con coco)"],
      [2, "Gelatina", "Gelatina de Mazapán con Chocolate", "Rosca de 2 Litros", 260, ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // Set auto width for columns
    ws['!cols'] = [{wch: 10}, {wch: 18}, {wch: 35}, {wch: 25}, {wch: 10}, {wch: 60}];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu_Arje");
    XLSX.writeFile(wb, "Plantilla_Arje_Menu.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          alert("El archivo está vacío.");
          return;
        }

        const newHojas: Record<number, any[]> = {};
        const newHojasOrder = new Set<number>();

        data.forEach((row: any) => {
          // Normalize column names
          const keys = Object.keys(row);
          const hojaNum = parseInt(row[keys.find(k => k.toLowerCase().includes('hoja')) || ''] || 1, 10);
          const categoria = row[keys.find(k => k.toLowerCase().includes('categor')) || ''] || '';
          const titulo = row[keys.find(k => k.toLowerCase().includes('título') || k.toLowerCase().includes('tamaño')) || ''] || '';
          const porcion = row[keys.find(k => k.toLowerCase().includes('descripción') || k.toLowerCase().includes('porción')) || ''] || '';
          const precio = parseFloat(row[keys.find(k => k.toLowerCase().includes('precio')) || ''] || 0);
          
          const saboresCell = row[keys.find(k => k.toLowerCase().includes('sabores')) || ''] || '';
          const saboresList = saboresCell ? saboresCell.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [];

          if (!titulo) return; // Skip invalid rows

          if (!newHojas[hojaNum]) newHojas[hojaNum] = [];
          newHojasOrder.add(hojaNum);

          newHojas[hojaNum].push({
            id: `excel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nombre: titulo.toUpperCase(),
            precio: isNaN(precio) ? 0 : precio,
            tamano: categoria,
            porcion: porcion,
            sabores: saboresList
          });
        });

        // Save to LocalStorage replacing everything securely
        localStorage.setItem('arje_editor_hojas', JSON.stringify(newHojas));
        localStorage.setItem('arje_editor_hojas_order', JSON.stringify(Array.from(newHojasOrder).sort((a,b) => a-b)));
        // Refresh images store keys
        const existImagesStr = localStorage.getItem('arje_editor_images');
        const currentImages = existImagesStr ? JSON.parse(existImagesStr) : {};
        // Make sure all new hojas have an image slot record to avoid crash
        Object.keys(newHojas).forEach(hId => {
           if (!currentImages[hId]) currentImages[hId] = {};
        });
        localStorage.setItem('arje_editor_images', JSON.stringify(currentImages));

        alert("¡Éxito! El menú se ha cargado a la perfección. Ve a la pestaña 'Editor de menú' para ver los resultados.");
      } catch (error) {
        console.error(error);
        alert("Ocurrió un error leyendo el archivo Excel. Asegúrate de usar la plantilla correcta.");
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-8 h-full mx-auto flex flex-col gap-6 items-center justify-center w-full relative">
      <div className="text-center mb-8 bg-white/60 backdrop-blur-xl py-8 px-12 rounded-[2rem] shadow-[0_8px_30px_rgba(89,52,139,0.04)] border border-white/50">
        <h1 className="text-3xl font-black mb-2 text-gray-800 tracking-tight">Importar / Exportar Datos</h1>
        <p className="text-gray-500 font-medium">Maneja el catálogo de postres mediante archivos de Excel (.xlsx)</p>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full max-w-5xl relative z-10">
        {/* Importar */}
        <div className="bg-white/80 backdrop-blur-md border text-center border-[#e5e1eb] rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-10 flex flex-col items-center gap-4 hover:border-purple-300 hover:shadow-[0_8px_30px_rgba(89,52,139,0.12)] transition-all duration-300 cursor-pointer group hover:-translate-y-1">
          <div className="bg-purple-100 p-5 rounded-2xl text-[#59348b] group-hover:bg-[#59348b] group-hover:text-white transition-colors duration-300 shadow-sm">
            <UploadCloud size={36} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Importar catálogo</h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">Sube un archivo de excel con la lista de postres para alimentar la base de datos de Supabase de manera estructurada.</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-[#4A2675] to-[#59348b] text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 w-full transition-all duration-300 active:scale-95"
          >
            Subir Archivo de Menú
          </button>
          <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileUpload} 
             accept=".xlsx, .xls" 
             className="hidden" 
          />
        </div>

        {/* Exportar */}
        <div className="bg-white/80 backdrop-blur-md border text-center border-[#e5e1eb] rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-10 flex flex-col items-center gap-4 hover:border-green-300 hover:shadow-[0_8px_30px_rgba(34,197,94,0.12)] transition-all duration-300 cursor-pointer group hover:-translate-y-1">
          <div className="bg-green-100 p-5 rounded-2xl text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300 shadow-sm">
            <DownloadCloud size={36} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Descargar Plantilla</h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">Descarga el layout exacto de Excel (`Plantilla_Arje_Menu.xlsx`) para compartirlo o rellenarlo sin errores de estructura.</p>
          <button 
            onClick={downloadTemplate}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 hover:shadow-green-900/40 w-full transition-all duration-300 active:scale-95"
          >
            Descargar archivo Excel
          </button>
        </div>
      </div>
    </div>
  );
}
