import React from 'react';
import { CustomFabricObject, Properties } from '../types';

interface PropertiesPanelProps {
    selectedObject: CustomFabricObject | null;
    onUpdate: (props: Partial<Properties>) => void;
}

const PropertyInput: React.FC<{ label: string; type?: string; value: number | undefined; onChange: (value: number) => void;}> = ({ label, type = 'number', value, onChange }) => (
    <div>
        <label className="text-sm font-medium text-content/80 block mb-1">{label}</label>
        <input
            type={type}
            value={value !== undefined ? Math.round(value) : ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-bkg border border-border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        />
    </div>
);

const ColorInput: React.FC<{ label: string; value: string | fabric.Pattern | fabric.Gradient | undefined; onChange: (value: string) => void; }> = ({ label, value, onChange }) => {
    const isStringValue = typeof value === 'string';

    return (
        <div>
            <label className="text-sm font-medium text-content/80 block mb-1">{label}</label>
            <div className="flex items-center space-x-2">
                 <input
                    type="color"
                    value={isStringValue ? value : '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={!isStringValue}
                    className="w-8 h-8 p-0 border-none rounded-md cursor-pointer bg-bkg disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ appearance: 'none', WebkitAppearance: 'none' }}
                />
                <input
                    type="text"
                    value={isStringValue ? value : 'Complex Fill'}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={!isStringValue}
                    className="w-full bg-bkg border border-border rounded-md px-2 py-1 text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
        </div>
    );
};


const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedObject, onUpdate }) => {
    
    const renderObjectProperties = () => {
        if (!selectedObject || selectedObject.id === 'background-image') {
            return <p className="text-sm text-content/60 text-center p-4">No object selected or properties are not editable.</p>;
        }

        const { type, left, top, width, height, scaleX, scaleY, fill, stroke, strokeWidth } = selectedObject;
        
        const displayWidth = (width ?? 0) * (scaleX ?? 1);
        const displayHeight = (height ?? 0) * (scaleY ?? 1);

        const handleWidthChange = (v: number) => {
            if (typeof width === 'number' && width > 0) {
                onUpdate({ scaleX: v / width });
            } else {
                onUpdate({ width: v, scaleX: 1 });
            }
        };
        
        const handleHeightChange = (v: number) => {
            if (typeof height === 'number' && height > 0) {
                onUpdate({ scaleY: v / height });
            } else {
                onUpdate({ height: v, scaleY: 1 });
            }
        };

        return (
            <>
                <div className="grid grid-cols-2 gap-2">
                    <PropertyInput label="Position X" value={left} onChange={(v) => onUpdate({ left: v })} />
                    <PropertyInput label="Position Y" value={top} onChange={(v) => onUpdate({ top: v })} />
                    <PropertyInput label="Width" value={displayWidth} onChange={handleWidthChange} />
                    <PropertyInput label="Height" value={displayHeight} onChange={handleHeightChange} />
                </div>
                {['rect', 'path', 'i-text'].includes(type || '') && (
                    <div className="pt-3 mt-3 border-t border-border space-y-3">
                        <ColorInput label="Fill Color" value={fill} onChange={(v) => onUpdate({ fill: v })} />
                    </div>
                )}
                 {['rect', 'path'].includes(type || '') && (
                    <div className="space-y-3">
                        <ColorInput label="Stroke Color" value={stroke} onChange={(v) => onUpdate({ stroke: v })} />
                         <PropertyInput label="Stroke Width" value={strokeWidth} onChange={(v) => onUpdate({ strokeWidth: v })} />
                    </div>
                )}
            </>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-border">
                <h2 className="text-md font-bold">Properties</h2>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {renderObjectProperties()}
            </div>
        </div>
    );
};

export default PropertiesPanel;