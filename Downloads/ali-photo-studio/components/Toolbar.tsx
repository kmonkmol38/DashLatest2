import React from 'react';
import { SelectIcon, PencilIcon, TextIcon, ImageIcon, CropIcon, RectangleIcon, EraserIcon } from './Icons';
import { Tool } from './Editor';

interface ToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  onAddImage: () => void;
}

const ToolButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ label, isActive, onClick, children }) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-3 rounded-lg transition-colors w-full flex justify-center ${isActive ? 'bg-primary text-white' : 'hover:bg-bkg'}`}
    aria-label={label}
    aria-pressed={isActive}
  >
    {children}
  </button>
);

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool, onAddImage }) => {
  return (
    <div className="w-16 bg-secondary border-r border-border flex flex-col items-center p-2 space-y-2">
      <ToolButton label="Select" isActive={activeTool === 'select'} onClick={() => setActiveTool('select')}>
        <SelectIcon className="w-6 h-6" />
      </ToolButton>
       <ToolButton label="Crop" isActive={activeTool === 'crop'} onClick={() => setActiveTool('crop')}>
        <CropIcon className="w-6 h-6" />
      </ToolButton>
      <div className="border-t border-border w-full my-1 opacity-50"></div>
      <ToolButton label="Pencil" isActive={activeTool === 'pencil'} onClick={() => setActiveTool('pencil')}>
        <PencilIcon className="w-6 h-6" />
      </ToolButton>
      <ToolButton label="Eraser" isActive={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')}>
        <EraserIcon className="w-6 h-6" />
      </ToolButton>
      <ToolButton label="Text" isActive={activeTool === 'text'} onClick={() => setActiveTool('text')}>
        <TextIcon className="w-6 h-6" />
      </ToolButton>
      <ToolButton label="Shape" isActive={activeTool === 'shape'} onClick={() => setActiveTool('shape')}>
        <RectangleIcon className="w-6 h-6" />
      </ToolButton>
      <ToolButton label="Add Image" isActive={false} onClick={onAddImage}>
        <ImageIcon className="w-6 h-6" />
      </ToolButton>
    </div>
  );
};

export default Toolbar;