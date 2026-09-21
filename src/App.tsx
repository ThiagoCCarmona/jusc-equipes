import React, { useState, useEffect, useRef } from 'react';
import { TeamProvider } from './context/TeamContext';
import { Header } from './components/Header';
import { PeopleSidebar } from './components/PeopleSidebar';
import { TeamBoard } from './components/TeamBoard';
import { X } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jusc_sidebar_width');
      return saved ? Math.max(300, Math.min(700, parseInt(saved, 10))) : 420;
    } catch {
      return 420;
    }
  });

  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Save width to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jusc_sidebar_width', sidebarWidth.toString());
    } catch {
      // ignore
    }
  }, [sidebarWidth]);

  // Handle Drag Resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(300, Math.min(700, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#08090d] text-gray-100 selection:bg-[#FFC700] selection:text-black overflow-hidden">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Workspace Container - Stretches 100% to the bottom of the window */}
      <div className="flex-1 flex w-full relative overflow-hidden">
        
        {/* Desktop Sidebar - Stretches 100% of height down to the bottom edge */}
        <div 
          className="hidden md:flex shrink-0 h-full overflow-hidden"
          style={{ width: `${sidebarWidth}px` }}
        >
          <PeopleSidebar width={sidebarWidth} />
        </div>

        {/* Resizable Divider Handle */}
        <div
          ref={resizeRef}
          onMouseDown={() => setIsResizing(true)}
          onDoubleClick={() => setSidebarWidth(420)}
          className={`hidden md:flex items-center justify-center w-2.5 hover:w-3.5 bg-[#0d0f18] hover:bg-[#FFC700]/40 transition-all cursor-col-resize group shrink-0 border-r border-gray-800 relative z-20 h-full select-none ${
            isResizing ? 'bg-[#FFC700]/50 w-3.5 ring-2 ring-[#FFC700]' : ''
          }`}
          title="Arraste para alterar a largura do Banco de Pessoas (clique duplo para redefinir)"
        >
          <div className="h-16 w-1 rounded-full bg-gray-700 group-hover:bg-[#FFC700] transition-colors flex items-center justify-center" />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-[99990] flex">
            <div
              className="fixed inset-0 bg-black/85 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            <div className="relative w-[380px] max-w-[90vw] bg-[#0d0f18] h-full shadow-2xl z-50 flex flex-col border-r-2 border-[#FFC700]/40">
              <div className="flex items-center justify-between p-3.5 border-b border-gray-800 bg-[#131622]">
                <span className="text-xs font-black text-[#FFC700] uppercase tracking-wider">
                  Banco de Pessoas JUSC
                </span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <PeopleSidebar />
              </div>
            </div>
          </div>
        )}

        {/* Teams Management Central Board - Scrolls independently */}
        <TeamBoard />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <TeamProvider>
      <AppContent />
    </TeamProvider>
  );
}
