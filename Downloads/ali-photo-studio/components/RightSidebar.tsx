import React, { useState } from 'react';
import { AdjustmentsIcon, EditIcon, LayoutIcon } from './Icons';
import { Properties, Adjustments, CustomFabricObject } from './types';
import PropertiesPanel from './PropertiesPanel';
import AdjustmentsPanel from './AdjustmentsPanel';

type Panel = 'layers' | 'properties' | 'adjustments';

interface RightSidebarProps {
    layersPanel: React.ReactNode;
    selectedObject: CustomFabricObject | null;
    onUpdateObject: (properties: Partial<Properties>) => void;
    adjustments: Adjustments;
    onAdjustmentsChange: (adjustments: Adjustments) => void;
    isImageSelected: boolean;
}

const TabButton: React.FC<{ label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} title={label} className={`flex-1 flex justify-center items-center p-2 border-b-2 transition-colors ${isActive ? 'text-primary border-primary' : 'text-content/60 border-transparent hover:bg-bkg'}`}>
        {icon}
    </button>
);


const RightSidebar: React.FC<RightSidebarProps> = ({ layersPanel, selectedObject, onUpdateObject, adjustments, onAdjustmentsChange, isImageSelected }) => {
    const [activePanel, setActivePanel] = useState<Panel>('layers');

    return (
        <div className="w-[300px] bg-secondary border-l border-border flex flex-col">
            <div className="flex items-center border-b border-border">
                <TabButton label="Layers" icon={<LayoutIcon className="w-5 h-5" />} isActive={activePanel === 'layers'} onClick={() => setActivePanel('layers')} />
                <TabButton label="Properties" icon={<EditIcon className="w-5 h-5" />} isActive={activePanel === 'properties'} onClick={() => setActivePanel('properties')} />
                <TabButton label="Adjustments" icon={<AdjustmentsIcon className="w-5 h-5" />} isActive={activePanel === 'adjustments'} onClick={() => setActivePanel('adjustments')} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                {activePanel === 'layers' && (
                    <>
                        <div className="p-3 border-b border-border">
                            <h2 className="text-md font-bold">Layers</h2>
                        </div>
                        {layersPanel}
                    </>
                )}
                {activePanel === 'properties' && <PropertiesPanel selectedObject={selectedObject} onUpdate={onUpdateObject} />}
                {activePanel === 'adjustments' && <AdjustmentsPanel adjustments={adjustments} onAdjustmentsChange={onAdjustmentsChange} disabled={!isImageSelected}/>}
            </div>
        </div>
    );
};

export default RightSidebar;