import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export interface PostreTipo {
  id: number;
  nombre: string;
}

export interface Tamano {
  id: number;
  tipo_id: number;
  subtipo: string | null;
  nombre: string;
  porcion_descripcion: string;
  precio: number;
  activo: boolean;
  orden: number;
}

export interface Sabor {
  id: number;
  tipo_id: number;
  subtipo: string | null;
  nombre: string;
  es_componente_gelatina: boolean;
  nivel: string | null;
  activo: boolean;
}

export interface PostreCatalogo {
  id: number;
  tipo_id: number;
  nombre_personalizado: string | null;
  activo: boolean;
}

interface MenuState {
  tipos: PostreTipo[];
  tamanos: Tamano[];
  sabores: Sabor[];
  postresCatalogo: PostreCatalogo[];
  isLoadingCatalog: boolean;
  
  fetchCatalog: () => Promise<void>;
  
  addTamano: (tamano: Omit<Tamano, 'id'>) => Promise<void>;
  updateTamano: (id: number, tamano: Partial<Tamano>) => Promise<void>;
  deleteTamano: (id: number) => Promise<void>;
  
  addSabor: (sabor: Omit<Sabor, 'id'>) => Promise<void>;
  updateSabor: (id: number, sabor: Partial<Sabor>) => Promise<void>;
  deleteSabor: (id: number) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set) => ({
  tipos: [],
  tamanos: [],
  sabores: [],
  postresCatalogo: [],
  isLoadingCatalog: false,

  fetchCatalog: async () => {
    set({ isLoadingCatalog: true });
    
    const [
      { data: tipos },
      { data: tamanos },
      { data: sabores },
      { data: postresCatalogo }
    ] = await Promise.all([
      supabase.from('tipos_postre').select('*').order('id'),
      supabase.from('tamaños').select('*').order('orden'),
      supabase.from('sabores').select('*').order('id'),
      supabase.from('postres_catalogo').select('*').order('id'),
    ]);

    set({ 
      tipos: tipos || [], 
      tamanos: tamanos || [], 
      sabores: sabores || [], 
      postresCatalogo: postresCatalogo || [],
      isLoadingCatalog: false 
    });
  },

  addTamano: async (tamano) => {
    const { error } = await supabase.from('tamaños').insert(tamano);
    if (error) console.error("Error adding tamano:", error);
    else await useMenuStore.getState().fetchCatalog();
  },
  updateTamano: async (id, tamano) => {
    const { error } = await supabase.from('tamaños').update(tamano).eq('id', id);
    if (error) console.error("Error updating tamano:", error);
    else await useMenuStore.getState().fetchCatalog();
  },
  deleteTamano: async (id) => {
    const { error } = await supabase.from('tamaños').delete().eq('id', id);
    if (error) console.error("Error deleting tamano:", error);
    else await useMenuStore.getState().fetchCatalog();
  },
  
  addSabor: async (sabor) => {
    const { error } = await supabase.from('sabores').insert(sabor);
    if (error) console.error("Error adding sabor:", error);
    else await useMenuStore.getState().fetchCatalog();
  },
  updateSabor: async (id, sabor) => {
    const { error } = await supabase.from('sabores').update(sabor).eq('id', id);
    if (error) console.error("Error updating sabor:", error);
    else await useMenuStore.getState().fetchCatalog();
  },
  deleteSabor: async (id) => {
    const { error } = await supabase.from('sabores').delete().eq('id', id);
    if (error) console.error("Error deleting sabor:", error);
    else await useMenuStore.getState().fetchCatalog();
  }
}));
