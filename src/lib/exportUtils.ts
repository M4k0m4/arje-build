import { exportMenuAsCanvas } from './exportMenuAsCanvas';

export async function exportCanvasToPNG() {
  try {
    const activeHojaStr = localStorage.getItem('arje_editor_active') || '1';
    const activeHojaId = Number(activeHojaStr);
    
    // Extraemos imágenes
    const imagesStr = localStorage.getItem('arje_editor_images');
    const imagesObj = imagesStr ? JSON.parse(imagesStr) : {};
    const currentImages = imagesObj[activeHojaId] || {};

    // Extraemos postres
    const hojasStr = localStorage.getItem('arje_editor_hojas');
    const hojasObj = hojasStr ? JSON.parse(hojasStr) : {};
    const currentItems = hojasObj[activeHojaId] || [];

    // Extraemos Config de Fondo
    const bgUrl = localStorage.getItem('arje_editor_bg') || undefined;
    const bgScaleItem = localStorage.getItem('arje_editor_bg_scale');
    const bgScale = bgScaleItem ? Number(bgScaleItem) : 100;
    
    let bgOffset = { x: 50, y: 50 };
    try {
      const savedOff = localStorage.getItem('arje_editor_bg_offset');
      if (savedOff) bgOffset = JSON.parse(savedOff);
    } catch (e) {}

    const bgBlurItem = localStorage.getItem('arje_editor_bg_blur');
    const bgBlur = bgBlurItem ? Number(bgBlurItem) : 0;

    const bgOpItem = localStorage.getItem('arje_editor_bg_opacity');
    const bgOpacity = bgOpItem ? Number(bgOpItem) : 100;

    const blob = await exportMenuAsCanvas(
      currentImages, 
      currentItems, 
      {}, 
      { backgroundUrl: bgUrl, bgScale, bgOffset, bgBlur, bgOpacity }
    );
    const dataUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const isoDate = new Date().toISOString().split('T')[0];
    link.download = `Menu-Arje-${isoDate}-TEST.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(dataUrl), 2000);
    return true;
  } catch(e: any) {
    console.error('Error al generar canvas directo:', e);
    alert('Error al exportar a canvas nativo: ' + (e?.message || e));
    return false;
  }
}

export async function exportAllHojasToPNG() {
  try {
    const hojasStr = localStorage.getItem('arje_editor_hojas');
    if (!hojasStr) return false;

    const imagesStr = localStorage.getItem('arje_editor_images');
    const orderStr = localStorage.getItem('arje_editor_hojas_order');
    
    const hojasObj = JSON.parse(hojasStr);
    const imagesObj = imagesStr ? JSON.parse(imagesStr) : {};
    const orderRaw = orderStr ? JSON.parse(orderStr) : Object.keys(hojasObj).map(Number);
    const hojasOrder = [...new Set(orderRaw)] as number[];

    // Extraemos Config de Fondo 
    const bgUrl = localStorage.getItem('arje_editor_bg') || undefined;
    const bgScaleItem = localStorage.getItem('arje_editor_bg_scale');
    const bgScale = bgScaleItem ? Number(bgScaleItem) : 100;
    
    let bgOffset = { x: 50, y: 50 };
    try {
      const savedOff = localStorage.getItem('arje_editor_bg_offset');
      if (savedOff) bgOffset = JSON.parse(savedOff);
    } catch (e) {}

    const bgBlurItem = localStorage.getItem('arje_editor_bg_blur');
    const bgBlur = bgBlurItem ? Number(bgBlurItem) : 0;

    const bgOpItem = localStorage.getItem('arje_editor_bg_opacity');
    const bgOpacity = bgOpItem ? Number(bgOpItem) : 100;

    for (let i = 0; i < hojasOrder.length; i++) {
        const hId = hojasOrder[i];
        const currentItems = hojasObj[hId] || [];
        const currentImages = imagesObj[hId] || {};

        const blob = await exportMenuAsCanvas(
          currentImages, 
          currentItems, 
          {}, 
          { backgroundUrl: bgUrl, bgScale, bgOffset, bgBlur, bgOpacity }
        );
        const dataUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        const isoDate = new Date().toISOString().split('T')[0];
        link.download = `Menu-Arje-${isoDate}-Hoja-${i+1}.png`; // Paginado formal
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(dataUrl), 2000);
        
        // Ligerísimo delay para evitar que el navegador lo marque como Pop-Up spam y lo bloqueé.
        await new Promise(r => setTimeout(r, 600));
    }
    return true;
  } catch(e: any) {
    console.error('Error al generar PDF multipagina:', e);
    alert('Error al exportar lote integral: ' + (e?.message || e));
    return false;
  }
}
