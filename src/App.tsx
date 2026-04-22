import { Routes, Route, NavLink } from 'react-router-dom';
import { Download, Save, Loader2 } from 'lucide-react';
import Editor from './pages/Editor';
import Catalogo from './pages/Catalogo';
import ImportExport from './pages/ImportExport';
import { exportAllHojasToPNG } from './lib/exportUtils';

// A placeholder for the save state
const isSaving = false;

function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f1eff4] font-sans text-gray-900 selection:bg-purple-200">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-[0_8px_30px_rgba(89,52,139,0.06)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/src/assets/logo-arje.png" alt="Arjé Logo" className="h-6 w-auto object-contain" />
            <div className="h-5 w-px bg-gray-300 rounded-full"></div>
            <span className="text-xs font-black tracking-widest uppercase text-[#59348b] pt-0.5 opacity-80">
              Editor de menús
            </span>
          </div>
          
          <nav className="flex items-center gap-4 text-sm font-medium">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `px-4 py-2 rounded-xl transition-all duration-300 font-bold ${isActive ? 'bg-gradient-to-r from-[#4A2675] to-[#59348b] text-white shadow-lg shadow-purple-900/20 scale-[1.02]' : 'text-gray-600 hover:bg-purple-50 hover:text-[#59348b]'}`
              }
            >
              Editor de menú
            </NavLink>
            <NavLink 
              to="/catalogo" 
              className={({ isActive }) => 
                `px-4 py-2 rounded-xl transition-all duration-300 font-bold ${isActive ? 'bg-gradient-to-r from-[#4A2675] to-[#59348b] text-white shadow-lg shadow-purple-900/20 scale-[1.02]' : 'text-gray-600 hover:bg-purple-50 hover:text-[#59348b]'}`
              }
            >
              Catálogo
            </NavLink>
            <NavLink 
              to="/import-export" 
              className={({ isActive }) => 
                `px-4 py-2 rounded-xl transition-all duration-300 font-bold ${isActive ? 'bg-gradient-to-r from-[#4A2675] to-[#59348b] text-white shadow-lg shadow-purple-900/20 scale-[1.02]' : 'text-gray-600 hover:bg-purple-50 hover:text-[#59348b]'}`
              }
            >
              Importar / Exportar
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mr-2">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardado</span>
              </>
            )}
          </div>
          
          <button 
            onClick={async (e) => {
              const prev = e.currentTarget.innerHTML;
              e.currentTarget.innerHTML = 'Exportando Lote...';
              await exportAllHojasToPNG();
              e.currentTarget.innerHTML = prev;
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#59348b] bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar PNG
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-68px)] overflow-hidden relative">
        <Routes>
          <Route path="/" element={<Editor />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/import-export" element={<ImportExport />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
