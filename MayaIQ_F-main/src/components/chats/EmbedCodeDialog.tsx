import React from "react";
import { 
  faClose
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type EmbedCodeDialogProps = {
  embedCode: string;
  onClose: () => void;
};

const EmbedCodeDialog: React.FC<EmbedCodeDialogProps> = ({ embedCode, onClose }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      alert("Embed code copied!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 relative">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Embed Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faClose} className="text-[16px] text-[#8A8A8A]"/>
          </button>
        </div>

        {/* Code block */}
        <div className="bg-gray-100 rounded-md p-4 overflow-auto text-sm font-mono text-gray-800 border border-gray-300 max-h-60">
          <code>{embedCode}</code>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCopy}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Copy Embed Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmbedCodeDialog;
