import React from 'react';
import { Tool } from './Editor';
import { CheckIcon, XIcon } from './Icons';

interface ContextualToolbarProps {
  activeTool: Tool;
  cropRectActive: boolean;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
}

const ContextualToolbar: React.FC<ContextualToolbarProps> = ({ activeTool, cropRectActive, onApplyCrop, onCancelCrop }) => {
    if (activeTool !== 'crop' || !cropRectActive) {
        return null;
    }

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-secondary rounded-lg shadow-lg p-2 flex items-center space-x-2 z-10 border border-border">
            <span className="text-sm font-medium pr-2">Crop Image</span>
            <button onClick={onCancelCrop} title="Cancel Crop" className="p-2 rounded-md hover:bg-bkg transition-colors">
                <XIcon className="w-5 h-5 text-red-500" />
            </button>
            <button onClick={onApplyCrop} title="Apply Crop" className="p-2 rounded-md hover:bg-bkg transition-colors">
                <CheckIcon className="w-5 h-5 text-green-500" />
            </button>
        </div>
    );
};

export default ContextualToolbar;
