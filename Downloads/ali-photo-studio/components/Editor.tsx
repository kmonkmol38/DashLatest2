import React, { useState, useRef, useEffect, useCallback } from 'react';
import Toolbar from './Toolbar';
import LayersPanel from './LayersPanel';
import TopMenuBar from './TopMenuBar';
import RightSidebar from './RightSidebar';
import NewCanvasModal from './NewCanvasModal';
import ContextualToolbar from './ContextualToolbar';
import { Adjustments, Properties, CustomFabricObject } from '../types';

export type Tool = 'select' | 'pencil' | 'text' | 'crop' | 'shape' | 'eraser';

const generateId = () => `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: number;
  return (...args: Parameters<F>): void => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), waitFor);
  };
};

const Editor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const layerFileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [objects, setObjects] = useState<CustomFabricObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<CustomFabricObject | null>(null);
  const [properties, setProperties] = useState<Properties>({});
  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });
  const [isNewCanvasModalOpen, setIsNewCanvasModalOpen] = useState(false);

  // History state
  const history = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isStateUpdating = useRef(false);

  // Refs for drawing tools
  const isDrawing = useRef(false);
  const drawingOrig = useRef({ x: 0, y: 0 });
  const drawingRect = useRef<fabric.Rect | null>(null);
  const [cropRect, setCropRect] = useState<fabric.Rect | null>(null);
  

  const updateObjectsList = useCallback(() => {
    if (fabricCanvasRef.current) {
      setObjects(fabricCanvasRef.current.getObjects() as CustomFabricObject[]);
    }
  }, []);

  const updateProperties = useCallback((obj: fabric.Object | null) => {
    if (obj) {
      setProperties({
        left: obj.left,
        top: obj.top,
        width: obj.width && obj.scaleX ? obj.width * obj.scaleX : undefined,
        height: obj.height && obj.scaleY ? obj.height * obj.scaleY : undefined,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
      });
      setSelectedObject(obj as CustomFabricObject);
    } else {
      setProperties({});
      setSelectedObject(null);
    }
  }, []);

  const updateHistoryButtons = useCallback(() => {
    setCanUndo(historyIndex.current > 0);
    setCanRedo(historyIndex.current < history.current.length - 1);
  }, []);

  const saveState = useCallback(() => {
    if (isStateUpdating.current || !fabricCanvasRef.current) return;
    const canvasState = JSON.stringify(fabricCanvasRef.current.toJSON(['id']));
    
    if (historyIndex.current < history.current.length - 1) {
      history.current = history.current.slice(0, historyIndex.current + 1);
    }
    
    history.current.push(canvasState);
    historyIndex.current = history.current.length - 1;
    
    updateHistoryButtons();
  }, [updateHistoryButtons]);
  
  const debouncedSaveState = useCallback(debounce(saveState, 300), [saveState]);

  const loadState = useCallback((state: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    isStateUpdating.current = true;
    canvas.loadFromJSON(state, () => {
      canvas.renderAll();
      isStateUpdating.current = false;
      updateObjectsList();
    });
  }, [updateObjectsList]);

  const handleUndo = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      loadState(history.current[historyIndex.current]);
      updateHistoryButtons();
    }
  }, [loadState, updateHistoryButtons]);
  
  const handleRedo = useCallback(() => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      loadState(history.current[historyIndex.current]);
      updateHistoryButtons();
    }
  }, [loadState, updateHistoryButtons]);
  
  const openImage = useCallback((imageUrl: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    fabric.Image.fromURL(imageUrl, (img: fabric.Image) => {
      canvas.clear();
      canvas.setWidth(img.width || 500);
      canvas.setHeight(img.height || 500);
      
      (img as CustomFabricObject).id = 'background-image';
      img.set({ selectable: false, evented: false, left: 0, top: 0 });
      canvas.add(img);
      img.sendToBack();

      setAdjustments({ brightness: 0, contrast: 0, saturation: 0 });
      updateObjectsList();
      canvas.renderAll();

      history.current = [];
      historyIndex.current = -1;
      saveState();
    }, { crossOrigin: 'anonymous' });
  }, [updateObjectsList, saveState]);
  
  const createNewCanvas = (width: number, height: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    canvas.clear();
    canvas.setWidth(width);
    canvas.setHeight(height);
    
    const background = new fabric.Rect({
      width: width, height: height, fill: '#ffffff',
      selectable: false, evented: false,
    });
    (background as CustomFabricObject).id = 'background-image';
    canvas.add(background);
    background.sendToBack();

    history.current = [];
    historyIndex.current = -1;
    saveState();

    setAdjustments({ brightness: 0, contrast: 0, saturation: 0 });
    updateObjectsList();
    canvas.renderAll();
  };

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const containerEl = canvasContainerRef.current;
    if (!canvasEl || !containerEl) return;

    // Make resize controls visible
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = '#00a8ff';
    fabric.Object.prototype.cornerStyle = 'circle';
    fabric.Object.prototype.borderColor = '#00a8ff';
    fabric.Object.prototype.cornerSize = 10;
    
    const canvas = new fabric.Canvas(canvasEl);
    fabricCanvasRef.current = canvas;

    const resizeCanvas = () => {
      if (!canvas.getObjects().some(o => (o as CustomFabricObject).id === 'background-image')) {
        canvas.setWidth(containerEl.clientWidth);
        canvas.setHeight(containerEl.clientHeight);
        canvas.renderAll();
      }
    };
    resizeCanvas();
    createNewCanvas(containerEl.clientWidth - 2, containerEl.clientHeight - 2); // Start with a default canvas

    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(containerEl);
    
    const updateSelection = (e: fabric.IEvent) => updateProperties(e.target || canvas.getActiveObject());
    
    canvas.on('selection:created', updateSelection);
    canvas.on('selection:updated', updateSelection);
    canvas.on('selection:cleared', () => updateProperties(null));
    canvas.on('object:modified', (e: fabric.IEvent) => updateProperties(e.target));
    
    const statefulActionCallback = () => debouncedSaveState();
    canvas.on('object:added', statefulActionCallback);
    canvas.on('object:removed', statefulActionCallback);
    canvas.on('object:modified', statefulActionCallback);
    canvas.on('path:created', statefulActionCallback);
    
    return () => {
      ro.disconnect();
      canvas.dispose();
      fabricCanvasRef.current = null;
    }
  }, [updateObjectsList, updateProperties, debouncedSaveState]);

    const handleApplyCrop = useCallback(() => {
        const canvas = fabricCanvasRef.current;
        if (!cropRect || !canvas) return;

        const cropArea = cropRect.getBoundingRect();

        if (cropArea.width > 0 && cropArea.height > 0) {
            // FIX: Hide the crop rectangle before generating the data URL to prevent it from being part of the cropped image.
            cropRect.visible = false;
            canvas.renderAll();

            const croppedDataUrl = canvas.toDataURL({
                left: cropArea.left,
                top: cropArea.top,
                width: cropArea.width,
                height: cropArea.height
            });
            
            // openImage will clear the canvas, which will remove the (now invisible) cropRect.
            openImage(croppedDataUrl);
        } else {
            // If width/height is 0, just clean up manually.
            canvas.remove(cropRect);
        }
        
        setCropRect(null);
        setActiveTool('select');
    }, [cropRect, openImage]);

    const handleCancelCrop = useCallback(() => {
        if (cropRect && fabricCanvasRef.current) {
            fabricCanvasRef.current.remove(cropRect);
            setCropRect(null);
        }
    }, [cropRect]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const onMouseDown = (o: fabric.IEvent) => {
      const pointer = canvas.getPointer(o.e);
      isDrawing.current = true;
      drawingOrig.current = { x: pointer.x, y: pointer.y };
      
      if (activeTool === 'text' && !o.target) {
        isDrawing.current = false;
        const text = new fabric.IText('Your Text Here', { left: pointer.x, top: pointer.y, fill: '#000', fontSize: 24 });
        ((text as unknown) as CustomFabricObject).id = generateId();
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
      } else if (activeTool === 'shape') {
        const rect = new fabric.Rect({ left: pointer.x, top: pointer.y, width: 0, height: 0, fill: 'transparent', stroke: '#000', strokeWidth: 2, selectable: false, evented: false });
        drawingRect.current = rect;
        canvas.add(rect);
      } else if (activeTool === 'crop') {
        handleCancelCrop(); // Remove old crop rect if any
        const rect = new fabric.Rect({ left: pointer.x, top: pointer.y, width: 0, height: 0, fill: 'rgba(0,0,0,0.3)', stroke: '#00a8ff', strokeDashArray: [5, 5], strokeWidth: 2, selectable: false, evented: false });
        drawingRect.current = rect;
        canvas.add(rect);
      }
    };

    const onMouseMove = (o: fabric.IEvent) => {
      if (!isDrawing.current || !drawingRect.current) return;
      const pointer = canvas.getPointer(o.e);
      
      let left = drawingOrig.current.x, top = drawingOrig.current.y, width = pointer.x - drawingOrig.current.x, height = pointer.y - drawingOrig.current.y;
      if (width < 0) { left = pointer.x; width = Math.abs(width); }
      if (height < 0) { top = pointer.y; height = Math.abs(height); }

      drawingRect.current!.set({ left, top, width, height });
      canvas.renderAll();
    };

    const onMouseUp = () => {
      isDrawing.current = false;
      if (activeTool === 'shape' && drawingRect.current) {
        const finalRect = drawingRect.current;
        (finalRect as CustomFabricObject).id = generateId();
        finalRect.set({ fill: 'rgba(0,0,0,0.3)', evented: true, selectable: true });
        canvas.setActiveObject(finalRect);
        setActiveTool('select');
      } else if (activeTool === 'crop' && drawingRect.current) {
        const rect = drawingRect.current;
        rect.set({ selectable: true, evented: true });
        setCropRect(rect);
      }
      drawingRect.current = null;
      canvas.renderAll();
    };

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);

    return () => {
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');
    }
  }, [activeTool, handleCancelCrop]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const isDrawingTool = activeTool === 'pencil' || activeTool === 'eraser';
    canvas.isDrawingMode = isDrawingTool;
    canvas.selection = activeTool === 'select';
    
    canvas.forEachObject(obj => {
      const isBackground = (obj as CustomFabricObject).id === 'background-image';
      const isCropRectangle = obj === cropRect;
      obj.selectable = (activeTool === 'select' && !isBackground) || isCropRectangle;
      obj.evented = (activeTool === 'select' && !isBackground) || isCropRectangle;
    });

    if(activeTool !== 'crop' && cropRect) {
        handleCancelCrop();
    }

    if (activeTool === 'pencil') {
      canvas.freeDrawingBrush.color = '#000000';
      canvas.freeDrawingBrush.width = 5;
      canvas.freeDrawingBrush.globalCompositeOperation = 'source-over';
    } else if (activeTool === 'eraser') {
      canvas.freeDrawingBrush.width = 20;
      canvas.freeDrawingBrush.globalCompositeOperation = 'destination-out';
    }
  }, [activeTool, cropRect, handleCancelCrop]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const targetImage = canvas.getObjects().find(obj => (obj as CustomFabricObject).id === 'background-image') as fabric.Image;
    if (targetImage && targetImage.type === 'image') {
      targetImage.filters = [];
      if (adjustments.brightness !== 0) targetImage.filters.push(new fabric.Image.filters.Brightness({ brightness: adjustments.brightness }));
      if (adjustments.contrast !== 0) targetImage.filters.push(new fabric.Image.filters.Contrast({ contrast: adjustments.contrast }));
      if (adjustments.saturation !== 0) targetImage.filters.push(new fabric.Image.filters.Saturation({ saturation: adjustments.saturation }));
      targetImage.applyFilters();
      canvas.renderAll();
    }
  }, [adjustments]);
  
  const handleDeleteSelection = useCallback(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      canvas.getActiveObjects().forEach(obj => {
          if ((obj as CustomFabricObject).id !== 'background-image') {
              canvas.remove(obj);
          }
      });
      canvas.discardActiveObject();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            handleDeleteSelection();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelection]);

  const handleSelectObject = (obj: CustomFabricObject) => {
    if (obj.id === 'background-image' || !obj.selectable) return;
    fabricCanvasRef.current?.setActiveObject(obj);
    fabricCanvasRef.current?.renderAll();
  };

  const handleDeleteObject = (obj: CustomFabricObject) => {
    if (obj.id === 'background-image') return;
    fabricCanvasRef.current?.remove(obj);
    fabricCanvasRef.current?.discardActiveObject();
  };

  const handleUpdateObjectProperties = useCallback((props: Partial<Properties>) => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      activeObject.set(props as any);
      canvas?.renderAll();
      updateProperties(activeObject);
      debouncedSaveState();
    }
  }, [updateProperties, debouncedSaveState]);
  
  const handleAddImageAsLayer = useCallback((imageUrl: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    fabric.Image.fromURL(imageUrl, (image: fabric.Image) => {
      image.scaleToWidth(200);
      (image as CustomFabricObject).id = generateId();
      canvas.add(image);
      canvas.centerObject(image);
      canvas.setActiveObject(image);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  }, []);

  const handleLayerFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                handleAddImageAsLayer(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    }
    if(event.target) event.target.value = ''; // Reset input
  }, [handleAddImageAsLayer]);

  const triggerAddImageLayer = () => {
    layerFileInputRef.current?.click();
  };


  const isImageLoaded = objects.some(obj => obj.id === 'background-image');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <input type="file" accept="image/*" ref={layerFileInputRef} onChange={handleLayerFileChange} className="hidden" />
      <NewCanvasModal 
        isOpen={isNewCanvasModalOpen} 
        onClose={() => setIsNewCanvasModalOpen(false)}
        onCreate={createNewCanvas}
      />
      <TopMenuBar 
        onOpenImage={openImage} 
        onAddImageLayer={triggerAddImageLayer}
        onNewCanvas={() => setIsNewCanvasModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar 
          activeTool={activeTool} 
          setActiveTool={setActiveTool}
          onAddImage={triggerAddImageLayer}
        />
        <main ref={canvasContainerRef} className="flex-1 h-full bg-bkg overflow-auto flex items-center justify-center relative">
          <ContextualToolbar 
            activeTool={activeTool}
            cropRectActive={!!cropRect}
            onApplyCrop={handleApplyCrop}
            onCancelCrop={handleCancelCrop}
          />
          <canvas ref={canvasRef} />
        </main>
        <RightSidebar
          layersPanel={
            <LayersPanel 
              objects={objects} 
              selectedObjectId={selectedObject?.id}
              onSelectObject={handleSelectObject}
              onDeleteObject={handleDeleteObject}
            />
          }
          selectedObject={selectedObject}
          onUpdateObject={handleUpdateObjectProperties}
          adjustments={adjustments}
          onAdjustmentsChange={setAdjustments}
          isImageSelected={isImageLoaded}
        />
      </div>
    </div>
  );
};

export default Editor;