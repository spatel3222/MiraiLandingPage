import React, { useState, useEffect } from 'react';
import { Eye, ExternalLink, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface LocalStorageKey {
  key: string;
  size: number;
  status: 'found' | 'missing';
  preview?: string;
}

const DataInspectorWidget: React.FC = () => {
  const [storageKeys, setStorageKeys] = useState<LocalStorageKey[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const inspectLocalStorage = () => {
    setIsRefreshing(true);
    
    const expectedKeys = [
      'moi-shopify-data',
      'moi-meta-data', 
      'moi-google-data',
      'moi-dashboard-data',
      'moi-server-topLevel',
      'moi-server-adset',
      'moi-pivot-data'
    ];
    
    const keyInfo: LocalStorageKey[] = expectedKeys.map(key => {
      const value = localStorage.getItem(key);
      return {
        key,
        size: value ? value.length : 0,
        status: value ? 'found' : 'missing',
        preview: value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : undefined
      };
    });
    
    setStorageKeys(keyInfo);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    inspectLocalStorage();
  }, []);

  const openFullInspector = () => {
    window.open('/data_inspector.html', '_blank');
  };

  const foundCount = storageKeys.filter(k => k.status === 'found').length;
  const totalCount = storageKeys.length;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-gray-600" />
          <h3 className="font-benton text-sm font-medium text-gray-800">
            Data Inspector
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded ${
            foundCount === totalCount ? 'bg-green-100 text-green-800' : 
            foundCount > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
          }`}>
            {foundCount}/{totalCount}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={inspectLocalStorage}
            disabled={isRefreshing}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openFullInspector}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="Open Full Inspector"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        {storageKeys.slice(0, 4).map((keyInfo) => (
          <div key={keyInfo.key} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {keyInfo.status === 'found' ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-600" />
              )}
              <span className="font-mono text-gray-700">
                {keyInfo.key.replace('moi-', '')}
              </span>
            </div>
            <span className="text-gray-500">
              {keyInfo.status === 'found' ? `${keyInfo.size}b` : 'missing'}
            </span>
          </div>
        ))}
        
        {storageKeys.length > 4 && (
          <div className="text-xs text-center text-gray-500 pt-1 border-t">
            + {storageKeys.length - 4} more keys...
          </div>
        )}
      </div>
      
      <button
        onClick={openFullInspector}
        className="w-full mt-3 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
      >
        Open Full Inspector
      </button>
    </div>
  );
};

export default DataInspectorWidget;