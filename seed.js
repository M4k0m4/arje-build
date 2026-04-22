import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Iniciando seeder...');
  
  const { data: tipos, error: e1 } = await supabase.from('tipos_postre').select('id, nombre');
  if (e1) { console.error('Error fetching tipos', e1); return; }

  const tipo_map = tipos.reduce((acc, t) => ({...acc, [t.nombre]: t.id}), {});

  const tamanosToInsert = [
    // Mantequilla
    { tipo_id: tipo_map['pastel'], subtipo: 'mantequilla', nombre: 'Rebanada', porcion_descripcion: 'Individual', precio: 50, orden: 1 },
    { tipo_id: tipo_map['pastel'], subtipo: 'mantequilla', nombre: 'Mini', porcion_descripcion: '2 px', precio: 95, orden: 2 },
    { tipo_id: tipo_map['pastel'], subtipo: 'mantequilla', nombre: 'Petite', porcion_descripcion: '4 px', precio: 150, orden: 3 },
    { tipo_id: tipo_map['pastel'], subtipo: 'mantequilla', nombre: 'Familiar', porcion_descripcion: '6 - 8 px', precio: 280, orden: 4 },
    { tipo_id: tipo_map['pastel'], subtipo: 'mantequilla', nombre: 'Cuarto', porcion_descripcion: '12 - 16 px', precio: 480, orden: 5 },
    { tipo_id: tipo_map['pastel'], subtipo: 'mantequilla', nombre: 'Mediano', porcion_descripcion: '20 - 25 px', precio: 740, orden: 6 },
    // Tres Leches
    { tipo_id: tipo_map['pastel'], subtipo: 'tres_leches', nombre: 'Mini', porcion_descripcion: '2 px', precio: 95, orden: 1 },
    { tipo_id: tipo_map['pastel'], subtipo: 'tres_leches', nombre: 'Petite', porcion_descripcion: '4 px', precio: 160, orden: 2 },
    { tipo_id: tipo_map['pastel'], subtipo: 'tres_leches', nombre: 'Familiar', porcion_descripcion: '6 - 8 px', precio: 295, orden: 3 },
    { tipo_id: tipo_map['pastel'], subtipo: 'tres_leches', nombre: 'Cuarto', porcion_descripcion: '12 - 16 px', precio: 495, orden: 4 },
    { tipo_id: tipo_map['pastel'], subtipo: 'tres_leches', nombre: 'Mediano', porcion_descripcion: '20 - 25 px', precio: 780, orden: 5 },
    // Mojadito
    { tipo_id: tipo_map['mojadito'], subtipo: null, nombre: 'Mojadito', porcion_descripcion: 'Individual', precio: 60, orden: 1 },
    // Cheesecake Frío
    { tipo_id: tipo_map['cheesecake'], subtipo: 'frio', nombre: 'Individual', porcion_descripcion: 'Individual', precio: 45, orden: 1 },
    { tipo_id: tipo_map['cheesecake'], subtipo: 'frio', nombre: 'Familiar', porcion_descripcion: '6 - 8 px', precio: 270, orden: 2 },
    { tipo_id: tipo_map['cheesecake'], subtipo: 'frio', nombre: 'Cuarto', porcion_descripcion: '12 - 16 px', precio: 435, orden: 3 },
    // Cheesecake Horneado
    { tipo_id: tipo_map['cheesecake'], subtipo: 'horneado', nombre: 'Rebanada', porcion_descripcion: 'Individual', precio: 55, orden: 1 },
    { tipo_id: tipo_map['cheesecake'], subtipo: 'horneado', nombre: 'Petite', porcion_descripcion: '4 px', precio: 95, orden: 2 },
    { tipo_id: tipo_map['cheesecake'], subtipo: 'horneado', nombre: 'Familiar en forma de corazón', porcion_descripcion: '6 - 8 px', precio: 300, orden: 3 },
    { tipo_id: tipo_map['cheesecake'], subtipo: 'horneado', nombre: 'Cuarto', porcion_descripcion: '12 - 16 px', precio: 525, orden: 4 },
    // Flan
    { tipo_id: tipo_map['flan'], subtipo: null, nombre: 'Rebanada', porcion_descripcion: 'Individual', precio: 50, orden: 1 },
    { tipo_id: tipo_map['flan'], subtipo: null, nombre: 'Familiar', porcion_descripcion: '6 - 8 px', precio: 260, orden: 2 },
    // Gelatina
    { tipo_id: tipo_map['gelatina'], subtipo: null, nombre: 'Individual', porcion_descripcion: 'Individuales', precio: 20, orden: 1 },
    { tipo_id: tipo_map['gelatina'], subtipo: null, nombre: '2 litros', porcion_descripcion: 'De 2L', precio: 260, orden: 2 },
  ];

  const saboresToInsert = [
    // Sabores pastel mantequilla
    { tipo_id: tipo_map['pastel'], subtipo: 'mantequilla', nombre: 'vainilla' },
    { tipo_id: tipo_map['pastel'], subtipo: 'mantequilla', nombre: 'chocolate' },
    { tipo_id: tipo_map['pastel'], subtipo: 'mantequilla', nombre: 'red velvet' },
    { tipo_id: tipo_map['pastel'], subtipo: 'mantequilla', nombre: 'zanahoria' },
    // Sabores pastel tres leches
    { tipo_id: tipo_map['pastel'], subtipo: 'tres_leches', nombre: 'vainilla' },
    { tipo_id: tipo_map['pastel'], subtipo: 'tres_leches', nombre: 'chocolate' },
    { tipo_id: tipo_map['pastel'], subtipo: 'tres_leches', nombre: 'moka' },
    // Sabores mojadito
    { tipo_id: tipo_map['mojadito'], subtipo: null, nombre: 'vainilla', nivel: 'base' },
    { tipo_id: tipo_map['mojadito'], subtipo: null, nombre: 'chocolate', nivel: 'base' },
    { tipo_id: tipo_map['mojadito'], subtipo: null, nombre: 'moka', nivel: 'base' },
    { tipo_id: tipo_map['mojadito'], subtipo: null, nombre: 'fresa', nivel: 'final' },
    { tipo_id: tipo_map['mojadito'], subtipo: null, nombre: 'tropical (piña con coco)', nivel: 'final' },
    { tipo_id: tipo_map['mojadito'], subtipo: null, nombre: 'zarzamora', nivel: 'final' },
    { tipo_id: tipo_map['mojadito'], subtipo: null, nombre: 'tortuga (Nutella, cajeta y nuez)', nivel: 'final' },
    // Sabores cheesecake frio
    { tipo_id: tipo_map['cheesecake'], subtipo: 'frio', nombre: 'oreo con nutella' },
    { tipo_id: tipo_map['cheesecake'], subtipo: 'frio', nombre: 'mango' },
    { tipo_id: tipo_map['cheesecake'], subtipo: 'frio', nombre: 'fresa' },
    { tipo_id: tipo_map['cheesecake'], subtipo: 'frio', nombre: 'zarzamora' },
    // Sabores cheesecake horneado
    { tipo_id: tipo_map['cheesecake'], subtipo: 'horneado', nombre: 'fresa' },
    { tipo_id: tipo_map['cheesecake'], subtipo: 'horneado', nombre: 'zarzamora' },
    { tipo_id: tipo_map['cheesecake'], subtipo: 'horneado', nombre: 'fresa y zarzamora' },
    { tipo_id: tipo_map['cheesecake'], subtipo: 'horneado', nombre: 'tortuga' },
    // Sabores gelatina (componentes)
    { tipo_id: tipo_map['gelatina'], subtipo: null, nombre: 'Rompope con Durazno', es_componente_gelatina: true },
    { tipo_id: tipo_map['gelatina'], subtipo: null, nombre: 'Mazapán', es_componente_gelatina: true },
    { tipo_id: tipo_map['gelatina'], subtipo: null, nombre: 'Mazapán con chocolate', es_componente_gelatina: true },
    { tipo_id: tipo_map['gelatina'], subtipo: null, nombre: 'Mosaico tres leches', es_componente_gelatina: true },
    { tipo_id: tipo_map['gelatina'], subtipo: null, nombre: 'Piña colada', es_componente_gelatina: true },
  ];

  const { error: e2 } = await supabase.from('tamaños').upsert(tamanosToInsert, { onConflict: 'id' }).select();
  if (e2) console.error('Error insertando tamaños', e2);
  else console.log('Tamaños insertados!');

  const { error: e3 } = await supabase.from('sabores').upsert(saboresToInsert, { onConflict: 'id' }).select();
  if (e3) console.error('Error insertando sabores', e3);
  else console.log('Sabores insertados!');
}

main();
