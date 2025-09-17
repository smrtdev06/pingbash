import React, { useState, useImperativeHandle, forwardRef } from "react";
import { Rnd } from "react-rnd";

export type ChatWidgetColors = {
  bgColor: string;
  headerColor: string;
  textColor: string;
  inputBgColor: string;
};

export interface ChatWidgetSize {
  width: number;
  height: number;
}

export interface ChattingViewEditWidgetProps {
  onColorsChange?: (colors: ChatWidgetColors) => void;
  onSizeChange?: (size: ChatWidgetSize) => void;
}

const ChattingViewEditWidget = forwardRef(({ onColorsChange, onSizeChange }: ChattingViewEditWidgetProps, ref) => {
  const [size, setSize] = useState<ChatWidgetSize>({ width: 378, height: 242 });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [bgColor, setBgColor] = useState("#CC0000");
  const [headerColor, setHeaderColor] = useState("#990000");
  const [textColor, setTextColor] = useState("#000000");
  const [inputBgColor, setInputBgColor] = useState("#FFFFFF");

  useImperativeHandle(ref, () => ({
    getColors: () => ({ bgColor, headerColor, textColor, inputBgColor }),
    getSize: () => size,
  }));

  const handleColorChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (onColorsChange) {
      onColorsChange({ bgColor, headerColor, textColor, inputBgColor });
    }
  };

  const handleSizeChange = (newSize: ChatWidgetSize) => {
    setSize(newSize);
    if (onSizeChange) {
      onSizeChange(newSize);
    }
  };

  return (
    <>
      <div className="p-4 space-y-2">
        <div className="flex flex-col gap-2 text-sm">
          <label>
            Background:
            <input type="color" value={bgColor} onChange={e => handleColorChange(setBgColor, e.target.value)} />
          </label>
          <label>
            Header:
            <input type="color" value={headerColor} onChange={e => handleColorChange(setHeaderColor, e.target.value)} />
          </label>
          <label>
            Text:
            <input type="color" value={textColor} onChange={e => handleColorChange(setTextColor, e.target.value)} />
          </label>
          <label>
            Input Background:
            <input type="color" value={inputBgColor} onChange={e => handleColorChange(setInputBgColor, e.target.value)} />
          </label>
        </div>
      </div>

      <Rnd
        size={size}
        position={position}
        onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
        onResizeStop={(e, direction, ref, delta, position) => {
          const newSize = { width: parseInt(ref.style.width), height: parseInt(ref.style.height) };
          handleSizeChange(newSize);
          setPosition(position);
        }}
        minWidth={200}
        minHeight={150}
        bounds="window"
        style={{ zIndex: 1000, position: 'fixed' }}
      >
        <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: bgColor, width: '100%', height: '100%' }}>
          <div className="flex flex-col h-full">
            <div className="p-2 text-sm flex justify-between items-center" style={{ backgroundColor: headerColor, color: textColor }}>
              <span>Chatango</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 bg-white text-sm" style={{ color: textColor }}>
              <p><strong>Apollo:</strong> The box is ideal for live video feeds...</p>
              <p><strong>Artemis:</strong> The group is highly scalable...</p>
              <p><strong>Athena:</strong> Click on 'More color controls'...</p>
              <p className="text-gray-600">Atlas: aaaaaaa...</p>
              <p><strong>Prometheus:</strong> Once it's set...</p>
            </div>
            <div className="p-2" style={{ backgroundColor: headerColor }}>
              <input type="text" className="w-full p-1 rounded" placeholder="Type here..." style={{ backgroundColor: inputBgColor, color: textColor }} />
            </div>
          </div>
        </div>
      </Rnd>
    </>
  );
});

export default ChattingViewEditWidget;
