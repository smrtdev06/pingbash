import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

interface ChatRulesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: number | null;
  groupName?: string;
  initialRules?: string;
  isCreator?: boolean;
  onSave?: (rules: string) => void;
}

const ChatRulesPopup: React.FC<ChatRulesPopupProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName = "Group",
  initialRules = "",
  isCreator = false,
  onSave
}) => {
  const [rules, setRules] = useState(initialRules);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setRules(initialRules);
    setIsEditing(false);
  }, [initialRules, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSave) {
      onSave(rules);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setRules(initialRules);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Chat Rules - {groupName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FontAwesomeIcon icon={faClose} className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isCreator && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Group Rules
                </label>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit Rules
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <textarea
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter the chat rules for this group...&#10;&#10;Example:&#10;1. Be respectful to all members&#10;2. No spam or excessive posting&#10;3. Stay on topic&#10;4. No harassment or bullying&#10;5. Follow community guidelines"
                />
              ) : (
                <div className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 overflow-y-auto">
                  {rules ? (
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                      {rules}
                    </pre>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No rules have been set for this group yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {!isCreator && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Group Rules
              </h3>
              <div className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 overflow-y-auto">
                {rules ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                    {rules}
                  </pre>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No rules have been set for this group.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRulesPopup; 