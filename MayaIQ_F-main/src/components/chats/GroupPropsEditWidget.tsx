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

      {/* Chat Container - Widget-style Preview */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-auto flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      >
        {/* Chat Dialog Preview - Centered like widget version */}
        <div
          ref={chatRef}
          className="shadow-2xl"
          style={config.sizeMode === "fixed" ? {
            width: `${config.width}px`,
            height: `${config.height}px`,
          } : {
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%"
          }}
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
        </div>

        {/* Subtle Info Text */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="text-center text-gray-400 dark:text-gray-600 text-sm">
            <p>Preview • Configure colors and settings in the left panel</p>
          </div>
        </div>
      </div>
    </div>
  );
};