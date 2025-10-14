'use client'

import React, { useEffect, useRef } from 'react';
import { MessageUnit } from '@/interface/chatInterface';
import { SERVER_URL } from '@/resource/const/const';
import { chatDate } from '@/resource/utils/helpers';

interface WidgetPreviewProps {
  width: number;
  height: number;
  groupName: string;
  msgList: MessageUnit[] | null;
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
    customFontSize: boolean;
    fontSize: number;
    showTimestamp: boolean;
    showUrl: boolean;
    privateMessaging: boolean;
    roundCorners: boolean;
    cornerRadius: number;
  };
  sizeMode: 'fixed' | 'responsive';
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({
  width,
  height,
  groupName,
  msgList,
  colors,
  settings,
  sizeMode
}) => {
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [msgList]);

  const renderMessage = (message: MessageUnit, idx: number) => {
    const avatarUrl = message?.sender_avatar 
      ? `${SERVER_URL}/uploads/users/${message.sender_avatar}` 
      : null;
    
    const senderName = message.sender_name || 'Anonymous';
    const sendTime = message.Send_Time || new Date().toISOString();
    
    return (
      <div key={idx} className="pingbash-message" data-message-id={message.Id}>
        <div className="pingbash-message-content">
          {settings.userImages && avatarUrl && (
            <img 
              src={avatarUrl} 
              alt={senderName} 
              className="pingbash-message-avatar"
            />
          )}
          <div className="pingbash-message-body">
            <div className="pingbash-message-header">
              <span className="pingbash-message-sender" style={{ color: colors.msgText }}>
                {senderName}
              </span>
              <span className="pingbash-message-time" style={{ color: colors.dateText }}>
                {chatDate(sendTime)}
              </span>
            </div>
            <div 
              className="pingbash-message-text" 
              style={{ 
                color: colors.msgText,
                fontSize: settings.customFontSize ? `${settings.fontSize}px` : '14px'
              }}
            >
              {message.Content}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const containerStyle = {
    width: sizeMode === 'fixed' ? `${width}px` : '100%',
    height: sizeMode === 'fixed' ? `${height}px` : '100%',
    maxWidth: '100%',
    maxHeight: '100%'
  };

  const borderRadius = settings.roundCorners ? `${settings.cornerRadius}px` : '4px';

  return (
    <div 
      className="pingbash-preview-container" 
      style={containerStyle}
    >
      <style jsx>{`
        .pingbash-preview-container {
          display: flex;
          flex-direction: column;
          background: ${colors.background};
          border: 1px solid ${colors.border};
          border-radius: ${borderRadius};
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }

        .pingbash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid ${colors.border};
          background: ${colors.background};
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }

        .pingbash-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pingbash-logo {
          width: 28px;
          height: 22px;
          display: block;
        }

        .pingbash-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pingbash-online-users-container,
        .pingbash-hamburger-container {
          position: relative;
        }

        .pingbash-online-users-icon,
        .pingbash-hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: ${colors.title};
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .pingbash-online-users-icon:hover,
        .pingbash-hamburger-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .pingbash-online-count-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 4px;
          border-radius: 10px;
          min-width: 16px;
          text-align: center;
        }

        .pingbash-messages-area {
          flex: 1;
          overflow-y: auto;
          background: ${colors.msgBg};
          padding: 16px;
        }

        .pingbash-messages-area::-webkit-scrollbar {
          width: 6px;
        }

        .pingbash-messages-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .pingbash-messages-area::-webkit-scrollbar-thumb {
          background: ${colors.scrollbar};
          border-radius: 3px;
        }

        .pingbash-messages-area::-webkit-scrollbar-thumb:hover {
          background: ${colors.scrollbar}dd;
        }

        .pingbash-message {
          margin-bottom: 16px;
        }

        .pingbash-message-content {
          display: flex;
          gap: 12px;
        }

        .pingbash-message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .pingbash-message-body {
          flex: 1;
          min-width: 0;
        }

        .pingbash-message-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .pingbash-message-sender {
          font-weight: 600;
          font-size: 14px;
        }

        .pingbash-message-time {
          font-size: 12px;
          opacity: 0.7;
        }

        .pingbash-message-text {
          word-wrap: break-word;
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .pingbash-bottom-bar {
          border-top: 1px solid ${colors.border};
          background: ${colors.background};
          padding: 12px 16px;
        }

        .pingbash-bar-left {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .pingbash-media-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: ${colors.title};
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .pingbash-media-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .pingbash-input-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pingbash-input-row {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          background: ${colors.inputBg};
          border: 1px solid ${colors.border};
          border-radius: 24px;
          padding: 8px 16px;
        }

        .pingbash-message-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          color: ${colors.inputText};
        }

        .pingbash-message-input::placeholder {
          color: ${colors.inputText};
          opacity: 0.5;
        }

        .pingbash-send-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .pingbash-send-btn:hover {
          opacity: 0.9;
        }

        .pingbash-send-icon {
          width: 16px;
          height: 16px;
        }
      `}</style>

      {/* Header */}
      <nav className="pingbash-header">
        <div className="pingbash-header-left">
          <img 
            className="pingbash-logo" 
            src="https://pingbash.com/logo-orange.png" 
            alt="Pingbash"
          />
        </div>
        <div className="pingbash-header-right">
          <div className="pingbash-online-users-container">
            <div className="pingbash-online-users-icon" title="Online Users">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14M6,6C7.11,6 8,6.89 8,8C8,9.11 7.11,10 6,10C4.89,10 4,9.11 4,8C4,6.89 4.89,6 6,6M6,12C8.67,12 12,13.34 12,16V18H0V16C0,13.34 3.33,12 6,12Z"/>
              </svg>
              <span className="pingbash-online-count-badge">0</span>
            </div>
          </div>
          <div className="pingbash-hamburger-container">
            <button className="pingbash-hamburger-btn" title="Menu">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Messages Area */}
      <article className="pingbash-messages-area" ref={messagesRef}>
        {msgList && msgList.length > 0 ? (
          msgList.map((message, idx) => renderMessage(message, idx))
        ) : (
          <div style={{ textAlign: 'center', color: colors.msgText, opacity: 0.5, padding: '40px 20px' }}>
            <p>No messages yet</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>Preview of your chat widget</p>
          </div>
        )}
      </article>

      {/* Bottom Bar */}
      <nav className="pingbash-bottom-bar">
        <div className="pingbash-bar-left">
          <button className="pingbash-media-btn" title="Send image">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
            </svg>
          </button>
          <button className="pingbash-media-btn" title="Attach file">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z"/>
            </svg>
          </button>
          <button className="pingbash-media-btn" title="Add emoji">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.514,2,12,2z M8.5,9C9.328,9,10,9.672,10,10.5 S9.328,12,8.5,12S7,11.328,7,10.5S7.672,9,8.5,9z M12,18c-4,0-5-3-5-3h10C17,15,16,18,12,18z M15.5,12C14.672,12,14,11.328,14,10.5 S14.672,9,15.5,9S17,9.672,17,10.5S16.328,12,15.5,12z"/>
            </svg>
          </button>
          <button className="pingbash-media-btn" title="Sound settings">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
            </svg>
          </button>
        </div>
        <div className="pingbash-input-wrapper">
          <div className="pingbash-input-row">
            <input 
              type="text" 
              className="pingbash-message-input" 
              placeholder="Write a message"
              disabled
            />
            <button className="pingbash-send-btn" disabled>
              <span className="pingbash-send-text">Send</span>
              <svg className="pingbash-send-icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default WidgetPreview;

