import React from 'react';
import { TrashIcon, LockIcon } from './Icons';
import { CustomFabricObject } from '../types';

interface LayersPanelProps {
  objects: CustomFabricObject[];
  selectedObjectId?: string;
  onSelectObject: (obj: CustomFabricObject) => void;
  onDeleteObject: (obj: CustomFabricObject) => void;
}

const getLayerName = (obj: CustomFabricObject): string => {
    if (obj.id === 'background-image') return 'Background';
    switch(obj.type) {
        case 'i-text': return 'Text Layer';
        case 'image': return 'Image Layer';
        case 'path': return 'Drawing';
        case 'rect': return 'Rectangle';
        default: return obj.type ? obj.type.charAt(0).toUpperCase() + obj.type.slice(1) : 'Object';
    }
}

const LayersPanel: React.FC<LayersPanelProps> = ({ objects, selectedObjectId, onSelectObject, onDeleteObject }) => {
  const reversedObjects = [...objects].reverse();

  return (
      <div className="flex-1 p-2 space-y-1 overflow-y-auto">
        {reversedObjects.length === 0 ? (
          <p className="text-sm text-content/60 text-center p-4">No layers present.</p>
        ) : (
          reversedObjects.map(obj => (
            <div
              key={obj.id}
              onClick={() => onSelectObject(obj)}
              className={`flex items-center justify-between p-2 rounded-md transition-colors ${obj.id !== 'background-image' ? 'cursor-pointer' : 'cursor-default'} ${selectedObjectId === obj.id ? 'bg-primary/30' : 'hover:bg-bkg'}`}
            >
              <span className="text-sm truncate flex items-center space-x-2">
                {obj.id === 'background-image' && <LockIcon className="w-4 h-4 text-content/50" />}
                <span>{getLayerName(obj)}</span>
              </span>
              {obj.id !== 'background-image' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteObject(obj);
                  }}
                  className="p-1 text-content/60 hover:text-red-500 rounded-full"
                  aria-label="Delete Layer"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
  );
};

export default LayersPanel;