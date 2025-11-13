
import React, { useState, useCallback, useEffect } from 'react';
import type { Photo, PaperSettings, PrintPage, PlacedPhoto } from './types';
import { PAPER_SIZES } from './constants';
import PrintSetupWizard from './components/PrintSetupWizard';
import LayoutPreview from './components/LayoutPreview';
import Editor from './components/Editor';
import { SunIcon, MoonIcon, EditIcon, LayoutIcon } from './components/Icons';

type Theme = 'light' | 'dark';
type View = 'editor' | 'print';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [view, setView] = useState<View>('editor');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [paperSettings, setPaperSettings] = useState<PaperSettings>({
    size: PAPER_SIZES[0],
    orientation: 'portrait',
    marginMm: 5,
  });
  const [layoutPages, setLayoutPages] = useState<PrintPage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const calculateLayout = useCallback(() => {
    setIsGenerating(true);
    setLayoutPages([]);

    setTimeout(() => {
        const { size, orientation, marginMm } = paperSettings;
        const paperWidth = orientation === 'portrait' ? size.widthMm : size.heightMm;
        const paperHeight = orientation === 'portrait' ? size.heightMm : size.widthMm;
        const gapMm = 3;

        // FIX: Corrected the type of `photosToPlace` to `Photo[]` and adjusted the object creation.
        // The previous `Omit<...>` type caused properties to be lost, leading to a type error when creating `PlacedPhoto`.
        // The object creation logic was also fixed to ensure `id` is uniquely overridden for each photo copy.
        const photosToPlace: Photo[] = [];
        photos.forEach(photo => {
            for (let i = 0; i < photo.quantity; i++) {
                photosToPlace.push({
                    ...photo,
                    id: `${photo.id}-${i}`,
                });
            }
        });
        
        const pages: PrintPage[] = [];
        let currentPhotos = [...photosToPlace];

        while (currentPhotos.length > 0) {
            const newPage: PrintPage = { photos: [] };
            let x = marginMm;
            let y = marginMm;
            let rowHeight = 0;

            const remainingPhotos = [];

            for (const photo of currentPhotos) {
                if (y + photo.printHeightMm > paperHeight - marginMm) {
                    remainingPhotos.push(photo);
                    continue;
                }

                if (x + photo.printWidthMm > paperWidth - marginMm) {
                    x = marginMm;
                    y += rowHeight + gapMm;
                    rowHeight = 0;
                    
                    if (y + photo.printHeightMm > paperHeight - marginMm) {
                        remainingPhotos.push(photo);
                        continue;
                    }
                }
                
                const placedPhoto: PlacedPhoto = { ...photo, x, y };
                newPage.photos.push(placedPhoto);
                
                x += photo.printWidthMm + gapMm;
                rowHeight = Math.max(rowHeight, photo.printHeightMm);
            }
            pages.push(newPage);
            currentPhotos = remainingPhotos;
        }

        setLayoutPages(pages);
        setIsGenerating(false);
    }, 500); // Simulate processing time
  }, [photos, paperSettings]);

  return (
    <div className="h-screen w-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-border">
            <div className="flex items-center space-x-2">
                <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-10h4v2h-4v-2zm-2 4h8v2H8v-2zm2-8h4v2h-4V6z"/></svg>
                <h1 className="text-xl font-bold">ALI's Photo Studio</h1>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-bkg p-1 rounded-lg border border-border">
                <button onClick={() => setView('editor')} className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-md transition-colors ${view === 'editor' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}>
                    <EditIcon className="w-4 h-4" />
                    <span>Editor</span>
                </button>
                <button onClick={() => setView('print')} className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-md transition-colors ${view === 'print' ? 'bg-primary text-white' : 'hover:bg-secondary'}`}>
                    <LayoutIcon className="w-4 h-4" />
                    <span>Print Layout</span>
                </button>
            </div>
            
            <div className="flex items-center space-x-4">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-secondary">
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
            {view === 'print' ? (
                <>
                    <div className="flex-1 overflow-hidden">
                        <LayoutPreview pages={layoutPages} paperSettings={paperSettings} />
                    </div>
                    <aside className="w-[380px] flex-shrink-0 overflow-hidden">
                        <PrintSetupWizard
                        photos={photos}
                        setPhotos={setPhotos}
                        paperSettings={paperSettings}
                        setPaperSettings={setPaperSettings}
                        onGenerateLayout={calculateLayout}
                        isGenerating={isGenerating}
                        />
                    </aside>
                </>
            ) : (
                <Editor />
            )}
        </main>
    </div>
  );
};

export default App;
