'use client'
import React, { useState, useEffect } from 'react';

interface IpBan {
  id: number;
  group_id: number;
  user_id: number;
  ip_address: string;
  banned_by: number;
  banned_at: string;
  reason: string;
  banned_user_name?: string;
  banned_user_email?: string;
  banned_by_name?: string;
}

interface IpBansPopupProps {
  isOpen: boolean;
  ipBans: IpBan[];
  onClose: () => void;
  unbanIps: (ipAddresses: string[]) => void;
}

const IpBansPopup: React.FC<IpBansPopupProps> = ({ 
  isOpen, 
  ipBans,
  onClose,
  unbanIps
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIpBans, setFilteredIpBans] = useState<IpBan[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIpAddresses, setSelectedIpAddresses] = useState<Set<string>>(new Set());

  useEffect(() => {
    const filtered = ipBans.filter(ban =>
      ban.ip_address.includes(searchTerm) ||
      ban.banned_user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ban.banned_user_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIpBans(filtered);
  }, [searchTerm, ipBans]);

  useEffect(() => {
    setIsSelecting(false);
    setSelectedIpAddresses(new Set());
  }, [ipBans]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectToggle = () => {
    if (isSelecting) {
      setIsSelecting(false);
      setSelectedIpAddresses(new Set());
    } else {
      setIsSelecting(true);
    }
  };

  const handleCheckboxChange = (ipAddress: string) => {
    const newSelected = new Set(selectedIpAddresses);
    if (newSelected.has(ipAddress)) {
      newSelected.delete(ipAddress);
    } else {
      newSelected.add(ipAddress);
    }
    setSelectedIpAddresses(newSelected);
  };

  const handleUnban = () => {
    const selectedIps = Array.from(selectedIpAddresses);
    console.log(`Unbanning selected IPs: ${selectedIps}`);
    unbanIps(selectedIps);
    setIsSelecting(false);
    setSelectedIpAddresses(new Set());
  };

  const handleUnbanAll = () => {
    const allIps = ipBans.map(ban => ban.ip_address);
    console.log(`Unbanning all IPs: ${allIps}`);
    unbanIps(allIps);
  };

  const handleIndividualUnban = (ipAddress: string) => {
    console.log(`Unbanning individual IP: ${ipAddress}`);
    unbanIps([ipAddress]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    // Overlay background
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">IP Bans ({ipBans.length})</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Search and Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <input
              type="text"
              placeholder="Search by IP address, user name, or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSelectToggle}
                className={`px-4 py-2 rounded-md font-medium ${
                  isSelecting 
                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isSelecting ? 'Cancel Select' : 'Select Multiple'}
              </button>
            </div>
          </div>
        </div>

        {/* IP Bans list */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-4">
          {filteredIpBans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {ipBans.length === 0 ? 'No IP bans found.' : 'No IP bans match your search.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIpBans.map((ban, idx) => (
                <div
                  key={`${ban.ip_address}-${idx}`}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center flex-1">
                    {isSelecting && (
                      <input
                        type="checkbox"
                        className="mr-3 w-5 h-5"
                        checked={selectedIpAddresses.has(ban.ip_address)}
                        onChange={() => handleCheckboxChange(ban.ip_address)}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-lg font-semibold text-red-600">
                          {ban.ip_address}
                        </div>
                        <div className="text-sm text-gray-600">
                          User: {ban.banned_user_name || 'Unknown'} ({ban.banned_user_email || 'No email'})
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Banned by: {ban.banned_by_name || 'Unknown'} • {formatDate(ban.banned_at)}
                      </div>
                      {ban.reason && (
                        <div className="text-sm text-gray-600 mt-1">
                          Reason: {ban.reason}
                        </div>
                      )}
                    </div>
                  </div>
                  {!isSelecting && (
                    <button
                      onClick={() => handleIndividualUnban(ban.ip_address)}
                      className="ml-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Unban IP
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Buttons */}
        {ipBans.length > 0 && (
          <div className="flex justify-center space-x-4 p-4 border-t bg-gray-50">
            {isSelecting && selectedIpAddresses.size > 0 && (
              <button
                onClick={handleUnban}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
              >
                Unban Selected ({selectedIpAddresses.size})
              </button>
            )}
            <button
              onClick={handleUnbanAll}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
            >
              Unban All IPs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IpBansPopup; 