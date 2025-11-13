import React, { useState } from 'react';

interface NewCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (width: number, height: number) => void;
}

const NewCanvasModal: React.FC<NewCanvasModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (width > 0 && height > 0) {
      onCreate(width, height);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">Create New Canvas</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="canvas-width" className="text-sm font-medium text-content/80">Width (px)</label>
            <input
              type="number"
              id="canvas-width"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-full bg-bkg border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="canvas-height" className="text-sm font-medium text-content/80">Height (px)</label>
            <input
              type="number"
              id="canvas-height"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-full bg-bkg border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-bkg">Cancel</button>
          <button onClick={handleCreate} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover">Create</button>
        </div>
      </div>
    </div>
  );
};

export default NewCanvasModal;