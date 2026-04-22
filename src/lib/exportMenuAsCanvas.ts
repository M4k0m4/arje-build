import type { MenuItemProps } from '../components/MenuItem';
import logoArje from '../assets/logo-arje.png';
import logoWhats from '../assets/logo-whats.png';

// exportMenuAsCanvas.ts
export async function exportMenuAsCanvas(
  images: Record<number, string>, // blob: URLs de las 4 imágenes
  items: MenuItemProps[],
  styles: { colorTitulos?: string, colorTamano?: string, colorPrecios?: string } = {},
  bgConfig: { backgroundUrl?: string, bgScale?: number, bgOffset?: { x: number, y: number }, bgBlur?: number, bgOpacity?: number } = {}
): Promise<Blob> {
  const SCALE = 3;
  const W = 816 * SCALE;   // 2448px
  const H = 1056 * SCALE;  // 3168px

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error("No se pudo iniciar el contexto del Canvas 2D");

  // 1. Fondo general de la sección derecha
  ctx.fillStyle = '#f6f6f8';
  ctx.fillRect(0, 0, W, H);

  // 2. Columna izquierda: 4 imágenes
  const COL_W = 326 * SCALE; // exact 978px
  const CELL_H = 264 * SCALE; // exact 792px

  for (let i = 1; i <= 4; i++) {
    const y = (i - 1) * CELL_H;
    
    // Rellenamos el fondo gris de la celda de cada foto
    ctx.fillStyle = '#eae8ec';
    ctx.fillRect(0, y, COL_W, CELL_H);

    // Dibujamos la foto encima si existe
    if (images[i]) {
       try {
         const img = await loadImage(images[i]);
         drawCover(ctx, img, 0, y, COL_W, CELL_H);
       } catch (error) {
         console.warn(`No se pudo cargar la imagen del slot ${i}:`, error);
       }
    }
  }

  // -------------------------------------------------------------
  // FASE 3: UI DERECHA (Logo, Postres, Botón CTA)
  // -------------------------------------------------------------
  const RIGHT_X = 326 * SCALE;
  const RIGHT_W = 490 * SCALE;
  const PADDING_X = 64 * SCALE; // px-16
  const AVAIL_W = RIGHT_W - (PADDING_X * 2);
  const CONTENT_X = RIGHT_X + PADDING_X;

  // Dibujar Background Custom sobre el área blanca (si existe)
  if (bgConfig.backgroundUrl) {
      try {
         const bgImg = await loadImage(bgConfig.backgroundUrl);
         
         // Equivale a background-size: X%
         const scaleFactor = (bgConfig.bgScale !== undefined ? bgConfig.bgScale : 100) / 100;
         const I_W = RIGHT_W * scaleFactor;
         const I_H = bgImg.naturalHeight * (I_W / bgImg.naturalWidth);
         
         // Equivale a background-position: X% Y%
         const ox = bgConfig.bgOffset ? bgConfig.bgOffset.x : 50;
         const oy = bgConfig.bgOffset ? bgConfig.bgOffset.y : 50;
         
         const drawX = RIGHT_X + (RIGHT_W - I_W) * (ox / 100);
         const drawY = (H - I_H) * (oy / 100);

         ctx.save();
         // Recortar dibujo estricto a zona derecha
         ctx.beginPath();
         ctx.rect(RIGHT_X, 0, RIGHT_W, H);
         ctx.clip();
         
         // Aplicar filtro de Desenfoque
         if (bgConfig.bgBlur && bgConfig.bgBlur > 0) {
            ctx.filter = `blur(${bgConfig.bgBlur * SCALE}px)`;
         }

         // Aplicar Opacidad
         if (bgConfig.bgOpacity !== undefined && bgConfig.bgOpacity !== null) {
            ctx.globalAlpha = bgConfig.bgOpacity / 100;
         }

         ctx.drawImage(bgImg, drawX, drawY, I_W, I_H);
         
         ctx.globalAlpha = 1.0; // Reset
         ctx.filter = "none";
         ctx.restore();
      } catch (e) { 
         console.warn("Fondo fallido o inexistente", e); 
      }
  }

  // 1. Dibujar Logo Superior
  try {
     const logoImg = await loadImage(logoArje);
     const maxLogoW = 240 * SCALE;
     const logoW = Math.min(RIGHT_W * 0.85, maxLogoW);
     const logoH = logoImg.naturalHeight * (logoW / logoImg.naturalWidth);
     const logoX = RIGHT_X + (RIGHT_W - logoW) / 2;
     ctx.drawImage(logoImg, logoX, 40 * SCALE, logoW, logoH);
  } catch(e) { console.warn("No logo found"); }

  // 2. Loop de Textos (Postres)
  // Calculamos la Y inicial para que quede "centrado" visualmente en el espacio restante.
  let currentY = 320 * SCALE; // Fixed start to mimic the DOM flex center roughly.
  if (items.length <= 3) currentY = 400 * SCALE; 
  if (items.length >= 5) currentY = 260 * SCALE;

  ctx.textBaseline = 'bottom';
  const cTitulos = styles.colorTitulos || '#000000';
  const cTamano  = styles.colorTamano || '#59348b';
  const cPrecios = styles.colorPrecios || '#000000';

  items.forEach((item) => {
      // Nombre y Precio
      const titleFont = `900 ${14.4 * SCALE}px Montserrat`;
      ctx.font = titleFont;
      ctx.fillStyle = cTitulos;
      
      const priceText = `$${item.precio}`;
      const priceMetrics = ctx.measureText(priceText);
      const priceW = priceMetrics.width;

      const titleMaxW = AVAIL_W * 0.70; // max-w-[70%]
      const lines = wrapTextLines(ctx, item.nombre.toUpperCase(), titleMaxW);
      
      // Dibujar lineas de titulo
      const lineHeight = 16 * SCALE; // leading-[1.1]
      lines.forEach((line, idx) => {
          ctx.fillText(line, CONTENT_X, currentY);
          
          if (idx === lines.length - 1) {
              // En la última línea del título, dibujamos los PUNTITOS y el PRECIO
              const lineMetrics = ctx.measureText(line);
              const dotStartX = CONTENT_X + lineMetrics.width + (8 * SCALE);
              const dotEndX = CONTENT_X + AVAIL_W - priceW - (8 * SCALE);
              
              ctx.fillStyle = cPrecios;
              ctx.fillText(priceText, CONTENT_X + AVAIL_W - priceW, currentY);

              // Dibujar punteado
              if (dotEndX > dotStartX) {
                  ctx.beginPath();
                  ctx.setLineDash([2 * SCALE, 4 * SCALE]); // dots manuales
                  // Alinear el punteado ligeramente arriba de la base del texto
                  const dotY = currentY - (3 * SCALE);
                  ctx.moveTo(dotStartX, dotY);
                  ctx.lineTo(dotEndX, dotY);
                  ctx.lineWidth = 1.5 * SCALE;
                  ctx.strokeStyle = '#9ca3af'; // gray-400
                  ctx.stroke();
                  ctx.setLineDash([]); // Reset
              }
          }
          currentY += lineHeight;
      });

      // Dibujar Tamaño / Porción (Morado)
      if (item.tamano || item.porcion) {
          currentY += 2 * SCALE;
          ctx.font = `800 ${10.4 * SCALE}px Montserrat`; // 0.65rem
          ctx.fillStyle = cTamano;
          const subtitulo = [item.tamano, item.porcion].filter(Boolean).join(' ').toUpperCase();
          ctx.fillText(subtitulo, CONTENT_X, currentY);
          currentY += 12 * SCALE;
      }

      // Dibujar Sabores
      if (item.sabores && item.sabores.length > 0) {
          ctx.font = `600 ${11.2 * SCALE}px Montserrat`; // 0.70rem
          ctx.fillStyle = '#000000'; // black text
          item.sabores.forEach((sabor: string) => {
              if (!sabor.trim()) return;
              const text = `-${sabor}`;
              const sLines = wrapTextLines(ctx, text, AVAIL_W);
              sLines.forEach(sl => {
                  ctx.fillText(sl, CONTENT_X, currentY);
                  currentY += 13.5 * SCALE;
              });
          });
      }

      // Espaciado final del item
      currentY += 16 * SCALE; // mb-4
  });

  // 3. Dibujar Botón WhatsApp "Ordena Ahora"
  const pillW = 220 * SCALE;
  const pillH = 50 * SCALE;
  const pillX = RIGHT_X + (RIGHT_W - pillW) / 2;
  const pillY = H - (90 * SCALE); // fixed at bottom
  
  // Dibujar Fondo del botón (Gradiente)
  const grad = ctx.createLinearGradient(pillX, 0, pillX + pillW, 0);
  grad.addColorStop(0, '#4A2675');
  grad.addColorStop(1, '#59348b');
  
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 25 * SCALE);
  ctx.fillStyle = grad;
  ctx.fill();

  // Texto del Botón
  ctx.fillStyle = '#d0c0e3';
  ctx.font = `500 ${14 * SCALE}px Montserrat`;
  ctx.textBaseline = 'top';
  ctx.fillText("Ordena ahora", pillX + 60 * SCALE, pillY + 10 * SCALE);

  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${20 * SCALE}px Montserrat`;
  ctx.fillText("971 132 2041", pillX + 60 * SCALE, pillY + 26 * SCALE);

  // Intentar cargar logo whats
  try {
     const whatsImg = await loadImage(logoWhats);
     ctx.drawImage(whatsImg, pillX + 16 * SCALE, pillY + 10 * SCALE, 30 * SCALE, 30 * SCALE);
  } catch(e) {}


  // Retornamos el blob compilado en vez de usar librerías DOM
  return new Promise((res, rej) => {
      canvas.toBlob((blob) => {
          if (blob) res(blob);
          else rej(new Error("Error serializando el PNG final"));
      }, 'image/png', 1.0);
  });
}

// -------------------------------------------------------------
// Helpers Matemáticos Puros (SIN CSS)
// -------------------------------------------------------------

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = w / h;

  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

  if (imgRatio > boxRatio) {
    // La imagen natural es más ancha que su caja destino --> Recortamos los lados
    sw = img.naturalHeight * boxRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    // La imagen natural es más alta que su caja destino --> Recortamos arriba y abajo
    sh = img.naturalWidth / boxRatio;
    sy = (img.naturalHeight - sh) / 2;
  }

  // Renderizado final geométrico directo (x, y, ancho, alto)
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    // Allow reading Blobs / cross-origin
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = () => rej(new Error(`Failed to load image at path: ${src.substring(0,30)}...`));
    img.src = src;
  });
}

// Wrapper utility for multiline texts in Canvas
function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
