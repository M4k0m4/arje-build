-- Archivo SQL para inicializar Supabase.
-- Ejecuta este código en el editor SQL de tu panel de control de Supabase.

-- 1. Tipos de postre
CREATE TABLE tipos_postre (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL CHECK (nombre IN ('pastel', 'mojadito', 'cheesecake', 'flan', 'gelatina', 'tarta')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tamaños
CREATE TABLE tamaños (
  id SERIAL PRIMARY KEY,
  tipo_id INTEGER REFERENCES tipos_postre(id) ON DELETE CASCADE,
  subtipo TEXT, -- 'mantequilla', 'tres_leches', 'frio', 'horneado' (nullable)
  nombre TEXT NOT NULL,
  porcion_descripcion TEXT,
  precio NUMERIC NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0
);

-- 3. Sabores
CREATE TABLE sabores (
  id SERIAL PRIMARY KEY,
  tipo_id INTEGER REFERENCES tipos_postre(id) ON DELETE CASCADE,
  subtipo TEXT,
  nombre TEXT NOT NULL,
  es_componente_gelatina BOOLEAN DEFAULT false,
  nivel TEXT, -- 'base' o 'final' (nullable)
  activo BOOLEAN DEFAULT true
);

-- 4. Postres Catalogo Generales (principalmente tartas)
CREATE TABLE postres_catalogo (
  id SERIAL PRIMARY KEY,
  tipo_id INTEGER REFERENCES tipos_postre(id) ON DELETE CASCADE,
  nombre_personalizado TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Fondos
CREATE TABLE fondos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  url TEXT,
  es_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Hojas del menú
CREATE TABLE hojas_menu (
  id SERIAL PRIMARY KEY,
  titulo TEXT DEFAULT 'Nueva Hoja',
  orden INTEGER DEFAULT 0,
  fondo_id INTEGER REFERENCES fondos(id) ON DELETE SET NULL,
  estilos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Postres en hoja (snapshot JSONB para inmunidad)
CREATE TABLE postres_en_hoja (
  id SERIAL PRIMARY KEY,
  hoja_id INTEGER REFERENCES hojas_menu(id) ON DELETE CASCADE,
  orden INTEGER DEFAULT 0,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Slots de Imagen
CREATE TABLE slots_imagen (
  id SERIAL PRIMARY KEY,
  hoja_id INTEGER REFERENCES hojas_menu(id) ON DELETE CASCADE,
  slot_numero INTEGER CHECK (slot_numero BETWEEN 1 AND 4),
  imagen_url TEXT,
  crop_data JSONB,
  historial JSONB[], -- max 3 elements
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(hoja_id, slot_numero)
);

-- 9. Estilos Globales
CREATE TABLE estilos_globales (
  id SERIAL PRIMARY KEY CHECK (id = 1),
  color_titulos TEXT DEFAULT '#000000',
  color_tamano TEXT DEFAULT '#800080',
  color_precios TEXT DEFAULT '#000000',
  fuente_titulos TEXT DEFAULT 'Inter',
  fuente_cuerpo TEXT DEFAULT 'Inter',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar acceso de solo lectura o escritura sin auth (HERRAMIENTA INTERNA).
-- Advertencia: Row Level Security esta habilitado y publico total.

ALTER TABLE tipos_postre ENABLE ROW LEVEL SECURITY;
ALTER TABLE tamaños ENABLE ROW LEVEL SECURITY;
ALTER TABLE sabores ENABLE ROW LEVEL SECURITY;
ALTER TABLE postres_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE fondos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hojas_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE postres_en_hoja ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots_imagen ENABLE ROW LEVEL SECURITY;
ALTER TABLE estilos_globales ENABLE ROW LEVEL SECURITY;

CREATE POLICY policy_public_tipos ON tipos_postre FOR ALL USING (true);
CREATE POLICY policy_public_tamanos ON tamaños FOR ALL USING (true);
CREATE POLICY policy_public_sabores ON sabores FOR ALL USING (true);
CREATE POLICY policy_public_catalogo ON postres_catalogo FOR ALL USING (true);
CREATE POLICY policy_public_fondos ON fondos FOR ALL USING (true);
CREATE POLICY policy_public_hojas ON hojas_menu FOR ALL USING (true);
CREATE POLICY policy_public_postres_hoja ON postres_en_hoja FOR ALL USING (true);
CREATE POLICY policy_public_slots ON slots_imagen FOR ALL USING (true);
CREATE POLICY policy_public_estilos ON estilos_globales FOR ALL USING (true);

-- Insertar valores inmutables basicos
INSERT INTO tipos_postre (nombre) VALUES 
('pastel'), ('mojadito'), ('cheesecake'), ('flan'), ('gelatina'), ('tarta');

INSERT INTO estilos_globales (id) VALUES (1) ON CONFLICT DO NOTHING;
