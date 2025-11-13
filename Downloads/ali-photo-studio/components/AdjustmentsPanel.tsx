import React from 'react';
import { Adjustments } from '../types';

interface AdjustmentsPanelProps {
    adjustments: Adjustments;
    onAdjustmentsChange: (adjustments: Adjustments) => void;
    disabled: boolean;
}

const Slider: React.FC<{ label: string, value: number, onChange: (value: number) => void, min: number, max: number, step: number, disabled: boolean }> = ({ label, value, onChange, min, max, step, disabled }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
            <label className="font-medium text-content/80">{label}</label>
            <span className="font-mono bg-bkg px-2 py-0.5 rounded text-content/90">{value.toFixed(2)}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-bkg rounded-lg appearance-none cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
        />
    </div>
);


const AdjustmentsPanel: React.FC<AdjustmentsPanelProps> = ({ adjustments, onAdjustmentsChange, disabled }) => {

    const handleReset = () => {
        onAdjustmentsChange({ brightness: 0, contrast: 0, saturation: 0 });
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-border flex justify-between items-center">
                <h2 className="text-md font-bold">Adjustments</h2>
                <button 
                    onClick={handleReset} 
                    disabled={disabled}
                    className="text-xs px-2 py-1 rounded bg-bkg hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Reset
                </button>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {disabled && (
                     <p className="text-sm text-content/60 text-center p-4">Select the main background image to enable adjustments.</p>
                )}
                <Slider 
                    label="Brightness" 
                    value={adjustments.brightness}
                    onChange={(v) => onAdjustmentsChange({...adjustments, brightness: v})}
                    min={-1} max={1} step={0.01}
                    disabled={disabled}
                />
                 <Slider 
                    label="Contrast" 
                    value={adjustments.contrast}
                    onChange={(v) => onAdjustmentsChange({...adjustments, contrast: v})}
                    min={-1} max={1} step={0.01}
                    disabled={disabled}
                />
                 <Slider 
                    label="Saturation" 
                    value={adjustments.saturation}
                    onChange={(v) => onAdjustmentsChange({...adjustments, saturation: v})}
                    min={-1} max={1} step={0.01}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default AdjustmentsPanel;
