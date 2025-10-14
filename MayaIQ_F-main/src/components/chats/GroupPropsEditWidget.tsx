import { useState, useRef, useEffect } from 'react';
import { ConfigPanel } from './ConfigPanel';
import ChatBox from './ChatBox';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  ALLOW_USER_MSG_STYLE, 
  BG_COLOR, 
  BORDER_COLOR, 
  CORNOR_RADIUS, 
  FONT_SIZE, 
  INPUT_BG_COLOR, 
  MSG_BG_COLOR, 
  MSG_COLOR, 
  MSG_DATE_COLOR, 
  OWNER_MSG_COLOR, 
  REPLY_MGS_COLOR, 
  ROUND_CORNORS, 
  SCROLLBAR_COLOR, 
  SHOW_USER_IMG, 
  TITLE_COLOR 
} from '@/resource/const/const';
import { MessageUnit } from '@/interface/chatInterface';

interface ChatWidgetConfig {
  sizeMode: 'fixed' | 'responsive';
  width: number;
  height: number;
  colors: {
    background: string;
    border: string;
    title: string;
    ownerMsg: string;
    msgBg: string;
    msgText: string;
    replyText: string;
    scrollbar: string;
    inputBg: string;
    inputText: string;
    dateText: string;
    innerBorder: string;
  };
  settings: {
    userImages: boolean;
    allowUserMessageStyles: boolean;
    customFontSize: boolean;
    fontSize: number;
    showTimestamp: boolean;
    showUrl: boolean;
    privateMessaging: boolean;
    roundCorners: boolean;
    cornerRadius: number;
    showChatRules: boolean;
  };
}

interface WidgetProps {
  groupName: string;
  groupConfig: ChatWidgetConfig | null;
  msgList: MessageUnit[] | null;
  onUpdatedConfig: (config: ChatWidgetConfig) => void;
}

export const GroupPropsEditWidget: React.FC<WidgetProps> = ({
  groupName,
  groupConfig,
  msgList,
  onUpdatedConfig
}) => {
  const [showConfig, setShowConfig] = useState(true);
  const [config, setConfig] = useState<ChatWidgetConfig>({
    sizeMode: 'fixed',
    width: 500,
    height: 400,
    colors: {
      background: BG_COLOR,
      border: BORDER_COLOR,
      title: TITLE_COLOR,
      ownerMsg: OWNER_MSG_COLOR,
      msgBg: MSG_BG_COLOR,
      replyText: REPLY_MGS_COLOR,
      msgText: MSG_COLOR,
      scrollbar: SCROLLBAR_COLOR,
      inputBg: INPUT_BG_COLOR,
      inputText: '#000000',
      dateText: MSG_DATE_COLOR,
      innerBorder: '#CC0000'
    },
    settings: {
      userImages: SHOW_USER_IMG,
      allowUserMessageStyles: ALLOW_USER_MSG_STYLE,
      customFontSize: false,
      fontSize: FONT_SIZE,
      showTimestamp: false,
      showUrl: false,
      privateMessaging: false,
      roundCorners: ROUND_CORNORS,
      cornerRadius: CORNOR_RADIUS,
      showChatRules: false
    }
  });

  const [chatPosition, setChatPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, chatX: 0, chatY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const chatRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update CSS variables when colors change
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(config.colors).forEach(([key, value]) => {
      // Convert hex to HSL
      const hex = value.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      const diff = max - min;
      
      let h = 0;
      if (diff !== 0) {
        if (max === rNorm) h = ((gNorm - bNorm) / diff) % 6;
        else if (max === gNorm) h = (bNorm - rNorm) / diff + 2;
        else h = (rNorm - gNorm) / diff + 4;
      }
      h = Math.round(h * 60);
      if (h < 0) h += 360;
      
      const l = (max + min) / 2;
      const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));
      
      const hslString = `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      
      const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--chat-${cssVarName}`, hslString);
    });
  }, [config.colors]);

  useEffect(() => {
    if (groupConfig) {
      setConfig(groupConfig)
    }
  }, [groupConfig])

  useEffect(() => {
    onUpdatedConfig(config);
  }, [config])


  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: config.width,
        height: config.height
      });
    } else if (containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - container.left - chatPosition.x;
      const offsetY = e.clientY - container.top - chatPosition.y;
      
      setDragStart({
        x: offsetX,
        y: offsetY,
        chatX: chatPosition.x,
        chatY: chatPosition.y
      });
      setIsDragging(true);
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min(
        e.clientX - container.left - dragStart.x, 
        container.width - config.width
      ));
      const newY = Math.max(0, Math.min(
        e.clientY - container.top - dragStart.y, 
        container.height - config.height
      ));
      setChatPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(500, resizeStart.width + deltaX);
      const newHeight = Math.max(400, resizeStart.height + deltaY);
      
      setConfig(prev => ({ ...prev, width: newWidth, height: newHeight }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, resizeStart, config.width, config.height]);

  return (
    <div className="flex bg-background border h-[calc(100%-150px)]">
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConfig(!showConfig)}
        className="absolute top-4 left-4 z-50"
      >
        {showConfig ? <ChevronLeft /> : <ChevronRight />}
      </Button>

      {/* Config Panel */}
      {showConfig && (
        <ConfigPanel
          config={config}
          onConfigChange={setConfig}
        />
      )}

      {/* Chat Container - Widget Style Preview */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-auto bg-gray-100"
        style={{ 
          background: '#f5f5f5',
        }}
      >
        {/* Demo Webpage Content */}
        <div className="absolute inset-0 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Website</h1>
            <p className="text-gray-600 mb-4">
              This is how the PingBash chat widget will appear on your website. 
              The chat button will be positioned in the bottom-right corner, and users can click it to open the chat dialog.
            </p>
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Sample Content</h2>
              <p className="text-gray-600">
                Your website content goes here. The chat widget floats above your content and can be positioned anywhere on the page.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Features</h2>
              <ul className="text-gray-600 space-y-2">
                <li>• Real-time messaging</li>
                <li>• Customizable colors and styles</li>
                <li>• Easy to integrate</li>
                <li>• Mobile responsive</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Widget Chat Button (Fixed Position - Bottom Right) */}
        <div 
          className="fixed"
          style={{
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
          }}
        >
          {/* Chat Button */}
          <button
            className="flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
            style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Widget Chat Dialog (Positioned above button) */}
        <div
          ref={chatRef}
          className={`fixed shadow-2xl ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={config.sizeMode == "fixed" ? {
            bottom: '100px',
            right: '20px',
            zIndex: 9998,
            userSelect: 'none'
          } : {
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "90%",
            maxWidth: "800px",
            maxHeight: "600px",
            zIndex: 9998,
            userSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
        >
          <ChatBox
            width={config.width}
            height={config.height}
            msgList={msgList}
            isResponsive={config.sizeMode === 'responsive'}
            colors={config.colors}
            settings={config.settings}
            groupName={groupName}
          />
          
          {/* Resize Handle */}
          {config.sizeMode === 'fixed' && (
            <div
              className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
              style={{
                background: 'linear-gradient(-45deg, transparent 0%, transparent 40%, #666 40%, #666 60%, transparent 60%)',
                backgroundSize: '4px 4px',
                zIndex: 10
              }}
            />
          )}
        </div>

        {/* Instructions Overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg pointer-events-none z-50">
          <p className="text-sm text-gray-700 text-center">
            <span className="font-semibold">Widget Preview:</span> Drag the chat dialog to reposition • 
            {config.sizeMode === 'fixed' && ' Resize from bottom-right corner'}
          </p>
        </div>
      </div>
    </div>
  );
};