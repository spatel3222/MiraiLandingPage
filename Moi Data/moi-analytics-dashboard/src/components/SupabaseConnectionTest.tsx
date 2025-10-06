import React, { useState, useEffect } from 'react';
import { SupabaseService, type SupabaseConnectionTest } from '../services/supabaseService';
import { supabaseConfig } from '../services/supabaseClient';

export const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<SupabaseConnectionTest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSchema, setShowSchema] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await SupabaseService.testConnection();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        connected: false,
        databaseExists: false,
        tablesCreated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    setIsLoading(false);
  };

  const createDefaultProject = async () => {
    setIsLoading(true);
    try {
      const result = await SupabaseService.createDefaultProject();
      if (result.success) {
        alert(`Default project created with ID: ${result.projectId}`);
        testConnection(); // Refresh status
      } else {
        alert(`Error creating project: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setIsLoading(false);
  };

  const copySchemaToClipboard = () => {
    navigator.clipboard.writeText(SupabaseService.getDatabaseSchema());
    alert('SQL schema copied to clipboard! Paste this into your Supabase SQL Editor.');
  };

  useEffect(() => {
    // Only test connection if Supabase is properly configured
    if (supabaseConfig.isConfigured) {
      testConnection();
    } else {
      setConnectionStatus({
        connected: false,
        databaseExists: false,
        tablesCreated: false,
        error: 'Supabase credentials not configured. Please update your .env.local file.'
      });
    }
  }, []);

  const getStatusColor = () => {
    if (!connectionStatus) return 'text-gray-500';
    if (connectionStatus.connected && connectionStatus.tablesCreated) return 'text-green-600';
    if (connectionStatus.connected) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (!connectionStatus) return '⏳';
    if (connectionStatus.connected && connectionStatus.tablesCreated) return '✅';
    if (connectionStatus.connected) return '⚠️';
    return '❌';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Supabase Connection Status</h2>
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {connectionStatus && (
        <div className={`text-lg font-medium ${getStatusColor()}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getStatusIcon()}</span>
            <span>
              {connectionStatus.connected && connectionStatus.tablesCreated
                ? 'Connected & Ready'
                : connectionStatus.connected
                ? 'Connected (Setup Required)'
                : 'Connection Failed'}
            </span>
          </div>

          {connectionStatus.error && (
            <div className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg">
              <strong>Error:</strong> {connectionStatus.error}
            </div>
          )}

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span>{connectionStatus.connected ? '✅' : '❌'}</span>
              <span>Database Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{connectionStatus.tablesCreated ? '✅' : '❌'}</span>
              <span>Tables Created</span>
            </div>
          </div>
        </div>
      )}

      {connectionStatus && connectionStatus.connected && !connectionStatus.tablesCreated && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">Setup Required</h3>
          <p className="text-yellow-700 mb-4">
            Your Supabase connection is working, but the database tables need to be created.
          </p>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowSchema(!showSchema)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              {showSchema ? 'Hide' : 'Show'} SQL Schema
            </button>
            
            <button
              onClick={copySchemaToClipboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Copy SQL to Clipboard
            </button>

            <button
              onClick={createDefaultProject}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Test Project Creation'}
            </button>
          </div>

          {showSchema && (
            <div className="mt-4">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                {SupabaseService.getDatabaseSchema()}
              </pre>
            </div>
          )}
        </div>
      )}

      {connectionStatus && connectionStatus.connected && connectionStatus.tablesCreated && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-bold text-green-800 mb-2">✅ Phase 1 Complete!</h3>
          <p className="text-green-700">
            Supabase connection is working and database tables are set up. Ready to proceed to Phase 2.
          </p>
        </div>
      )}

      {!connectionStatus?.connected && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">🔧 Supabase Configuration Required</h3>
          
          {/* Show current configuration status */}
          <div className="bg-white p-3 rounded border mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Current Configuration:</h4>
            <div className="space-y-1 text-sm font-mono">
              <div className="flex items-center gap-2">
                <span className={supabaseConfig.hasValidUrl ? '✅' : '❌'}></span>
                <span className="text-gray-600">VITE_SUPABASE_URL:</span>
                <span className={supabaseConfig.hasValidUrl ? 'text-green-600' : 'text-red-600'}>
                  {supabaseConfig.url || 'Not set'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={supabaseConfig.hasValidKey ? '✅' : '❌'}></span>
                <span className="text-gray-600">VITE_SUPABASE_ANON_KEY:</span>
                <span className={supabaseConfig.hasValidKey ? 'text-green-600' : 'text-red-600'}>
                  {supabaseConfig.keyPreview}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-red-700 space-y-2">
            <p><strong>To set up Supabase:</strong></p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                <strong>Create Supabase Project:</strong> Go to{' '}
                <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  app.supabase.com
                </a>{' '}
                and create a new project (it's free!)
              </li>
              <li>
                <strong>Get API Credentials:</strong> Go to Settings → API in your Supabase dashboard
              </li>
              <li>
                <strong>Copy Values:</strong> Copy the "Project URL" and "anon public" key
              </li>
              <li>
                <strong>Update .env.local:</strong> Replace the placeholder values in your{' '}
                <code className="bg-gray-100 px-1 rounded">.env.local</code> file:
                <div className="bg-gray-800 text-green-400 p-2 rounded mt-1 text-xs font-mono">
                  VITE_SUPABASE_URL=https://your-project-ref.supabase.co<br/>
                  VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
                </div>
              </li>
              <li>
                <strong>Restart:</strong> Restart the development server (<code className="bg-gray-100 px-1 rounded">npm run dev</code>)
              </li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> The connection test will automatically run once you've updated your credentials.
                You can also click "Test Connection" above to retry manually.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};