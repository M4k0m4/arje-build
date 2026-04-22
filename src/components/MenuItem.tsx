

export interface MenuItemProps {
  id: string;
  nombre: string;
  precio: number;
  tamano: string;
  porcion: string;
  sabores?: string[];
  colorTamano?: string;
  colorTitulos?: string;
  colorPrecios?: string;
}

export default function MenuItem({
  nombre,
  precio,

  porcion,
  sabores = [],
  colorTamano = 'var(--color-tamano)',
  colorTitulos = 'var(--color-titulos)',
  colorPrecios = 'var(--color-precios)'
}: MenuItemProps) {
  return (
    <div className="flex flex-col mb-4 break-inside-avoid">
      {/* Title & Price Row */}
      <div className="flex items-end w-full mt-2 gap-1.5">
        <h3 
          className="text-[1.10rem] font-black uppercase m-0 leading-[1.05] tracking-tight max-w-[75%]"
          style={{ color: colorTitulos }}
        >
          {nombre}
        </h3>
        
        {/* Dotted border filler with reliable gradient rendering for exports */}
        <div 
          className="flex-1 relative top-[-6px]"
          style={{
            backgroundImage: 'radial-gradient(circle, #9ca3af 1px, transparent 1px)',
            backgroundSize: '5px 5px',
            backgroundPosition: 'left center',
            backgroundRepeat: 'repeat-x',
            height: '5px'
          }}
        ></div>
        
        <span 
          className="text-[1.10rem] font-black tracking-tight whitespace-nowrap leading-[1.05]"
          style={{ color: colorPrecios }}
        >
          ${precio}
        </span>
      </div>

      {/* Size / Portion */}
      <div 
        className="text-[0.85rem] font-black mt-[1px] leading-tight tracking-widest uppercase"
        style={{ color: colorTamano }}
      >
        {porcion}
      </div>

      {/* Flavors List */}
      {sabores.length > 0 && (
        <ul className="mt-[2px] leading-[1.1] pl-0">
          {sabores.map((sabor, index) => (
            <li 
              key={index} 
              className="text-[0.73rem] font-semibold text-neutral-800 lowercase tracking-tight"
            >
              -{sabor}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
