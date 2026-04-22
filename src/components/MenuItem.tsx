import React from 'react';

export interface TextStyleOverride {
  text?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  fontFamily?: string;
}

export interface MenuItemOverrides {
  nombre?: TextStyleOverride;
  precio?: TextStyleOverride;
  porcion?: TextStyleOverride;
  sabores?: TextStyleOverride;
}

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
  overrides?: MenuItemOverrides;
  onDoubleClickElement?: (fieldId: keyof MenuItemOverrides, currentText: string, currentStyles: TextStyleOverride) => void;
}

export default function MenuItem({
  nombre,
  precio,
  porcion,
  sabores = [],
  colorTamano = 'var(--color-tamano)',
  colorTitulos = 'var(--color-titulos)',
  colorPrecios = 'var(--color-precios)',
  overrides = {},
  onDoubleClickElement
}: MenuItemProps) {
  
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const renderField = (
    fieldId: keyof MenuItemOverrides,
    defaultText: string,
    defaultColor: string,
    baseClasses: string,
    isBlock: boolean = false
  ) => {
    const override = overrides[fieldId] || {};
    const text = override.text !== undefined ? override.text : defaultText;
    
    const style: React.CSSProperties = {
      color: override.color || defaultColor,
      ...(override.fontSize ? { fontSize: override.fontSize } : {}),
      ...(override.fontWeight ? { fontWeight: override.fontWeight } : {}),
      ...(override.fontFamily ? { fontFamily: override.fontFamily } : {}),
    };

    const interactiveClasses = onDoubleClickElement ? 'cursor-pointer hover:ring-2 hover:ring-purple-400 hover:ring-offset-1 rounded-[2px] transition-all duration-200' : '';
    const Component = isBlock ? 'div' : 'span';

    return (
      <Component 
        className={`${baseClasses} ${interactiveClasses}`}
        style={style}
        onDoubleClick={(e) => {
          if (onDoubleClickElement) {
            e.stopPropagation();
            onDoubleClickElement(fieldId, text, {
              color: override.color || defaultColor,
              fontSize: override.fontSize || '',
              fontWeight: override.fontWeight || '',
              fontFamily: override.fontFamily || ''
            });
          }
        }}
      >
        {renderText(text)}
      </Component>
    );
  };

  const defaultSaboresText = sabores.map(s => `-${s}`).join('\n');

  return (
    <div className="flex flex-col mb-4 break-inside-avoid w-full">
      {/* Title & Price Row */}
      <div className="flex items-end w-full mt-2 gap-1.5">
        <div className="max-w-[75%] shrink-0">
          {renderField(
            'nombre', 
            nombre, 
            colorTitulos, 
            "text-[1.10rem] font-black uppercase m-0 leading-[1.05] tracking-tight block",
            true
          )}
        </div>
        
        {/* Dotted border filler */}
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
        
        <div className="shrink-0">
          {renderField(
            'precio', 
            `$${precio}`, 
            colorPrecios, 
            "text-[1.10rem] font-black tracking-tight whitespace-nowrap leading-[1.05] block",
            true
          )}
        </div>
      </div>

      {/* Size / Portion */}
      <div className="mt-[1px]">
        {renderField(
          'porcion', 
          porcion, 
          colorTamano, 
          "text-[0.85rem] font-black leading-tight tracking-widest uppercase block",
          true
        )}
      </div>

      {/* Flavors List */}
      {(sabores.length > 0 || overrides.sabores?.text) && (
        <div className="mt-[2px] pl-0">
          {renderField(
            'sabores', 
            defaultSaboresText, 
            '#262626', // text-neutral-800
            "text-[0.73rem] font-semibold lowercase tracking-tight block leading-[1.2]",
            true
          )}
        </div>
      )}
    </div>
  );
}
