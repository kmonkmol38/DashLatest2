
import React from 'react';
import { Photo, PaperSettings } from '../types';
import { PAPER_SIZES } from '../constants';
import { UploadIcon, TrashIcon } from './Icons';

interface PrintSetupWizardProps {
  photos: Photo[];
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  paperSettings: PaperSettings;
  setPaperSettings: React.Dispatch<React.SetStateAction<PaperSettings>>;
  onGenerateLayout: () => void;
  isGenerating: boolean;
}

const PhotoConfigCard: React.FC<{ photo: Photo, onUpdate: (p: Photo) => void, onRemove: (id: string) => void }> = ({ photo, onUpdate, onRemove }) => {
  return (
    <div className="flex items-center space-x-3 p-2 bg-secondary/50 rounded-lg border border-border">
      <img src={photo.previewUrl} alt={photo.file.name} className="w-16 h-16 object-cover rounded-md" />
      <div className="flex-1 space-y-2">
        <p className="text-xs truncate font-medium text-content/80" title={photo.file.name}>{photo.file.name}</p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-content/60 block">Qty</label>
            <input
              type="number"
              min="1"
              value={photo.quantity}
              onChange={(e) => onUpdate({ ...photo, quantity: parseInt(e.target.value, 10) || 1 })}
              className="w-full bg-secondary border border-border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-content/60 block">W (mm)</label>
            <input
              type="number"
              min="1"
              value={photo.printWidthMm}
              onChange={(e) => onUpdate({ ...photo, printWidthMm: parseFloat(e.target.value) || 1 })}
              className="w-full bg-secondary border border-border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-content/60 block">H (mm)</label>
            <input
              type="number"
              min="1"
              value={photo.printHeightMm}
              onChange={(e) => onUpdate({ ...photo, printHeightMm: parseFloat(e.target.value) || 1 })}
              className="w-full bg-secondary border border-border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
      <button onClick={() => onRemove(photo.id)} className="p-2 text-content/60 hover:text-red-500 transition-colors">
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};


const PrintSetupWizard: React.FC<PrintSetupWizardProps> = ({ photos, setPhotos, paperSettings, setPaperSettings, onGenerateLayout, isGenerating }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // FIX: Explicitly typing `file` as `File` resolves TypeScript errors where `file` was incorrectly inferred as `unknown`.
    const newPhotos: Photo[] = Array.from(files).map((file: File) => ({
      id: `${file.name}-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      printWidthMm: 100,
      printHeightMm: 150,
      quantity: 1,
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  };
  
  const handleUpdatePhoto = (updatedPhoto: Photo) => {
    setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
  };
  
  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => {
        const photoToRemove = prev.find(p => p.id === id);
        if (photoToRemove) {
            URL.revokeObjectURL(photoToRemove.previewUrl);
        }
        return prev.filter(p => p.id !== id);
    });
  };

  const handlePaperSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSize = PAPER_SIZES.find(s => s.name === e.target.value) || PAPER_SIZES[0];
    setPaperSettings(prev => ({ ...prev, size: selectedSize }));
  };

  const handleOrientationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaperSettings(prev => ({ ...prev, orientation: e.target.value as 'portrait' | 'landscape' }));
  };
  
  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaperSettings(prev => ({ ...prev, marginMm: parseFloat(e.target.value) || 0 }));
  };

  return (
    <div className="w-full h-full bg-secondary border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold">Print Layout Setup</h2>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Paper Settings */}
        <div className="space-y-3">
          <h3 className="font-semibold text-content/90">1. Paper Settings</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="paper-size" className="text-sm font-medium text-content/80">Paper Size</label>
              <select id="paper-size" value={paperSettings.size.name} onChange={handlePaperSizeChange} className="mt-1 w-full bg-bkg border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                {PAPER_SIZES.map(size => <option key={size.name}>{size.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="orientation" className="text-sm font-medium text-content/80">Orientation</label>
              <select id="orientation" value={paperSettings.orientation} onChange={handleOrientationChange} className="mt-1 w-full bg-bkg border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>
           <div>
              <label htmlFor="margin" className="text-sm font-medium text-content/80">Margin (mm)</label>
              <input type="number" id="margin" value={paperSettings.marginMm} onChange={handleMarginChange} min="0" className="mt-1 w-full bg-bkg border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
        </div>

        {/* Photo Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-content/90">2. Photos</h3>
          <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-bkg border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
            <UploadIcon className="w-5 h-5 text-content/80" />
            <span className="text-sm font-medium">Add Photos</span>
          </button>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {photos.map(photo => <PhotoConfigCard key={photo.id} photo={photo} onUpdate={handleUpdatePhoto} onRemove={handleRemovePhoto} />)}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <button 
          onClick={onGenerateLayout} 
          disabled={photos.length === 0 || isGenerating}
          className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Layout'}
        </button>
      </div>
    </div>
  );
};

export default PrintSetupWizard;