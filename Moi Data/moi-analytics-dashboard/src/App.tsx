import { useState, useEffect } from 'react';
import { Settings, MessageCircle, Download, X, Send } from 'lucide-react';
import KeyMetricsPanel from './components/KeyMetricsPanel';
import CampaignPerformanceTiers from './components/CampaignPerformanceTiers';
import UTMCampaignTable from './components/UTMCampaignTable';
import UploadModal from './components/UploadModal';
import ChatBot from './components/ChatBot';
import { processShopifyCSV } from './utils/csvProcessor';
import type { DashboardData } from './types';

function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load cached data on mount
  useEffect(() => {
    const cachedData = localStorage.getItem('moi-dashboard-data');
    const cachedTimestamp = localStorage.getItem('moi-dashboard-timestamp');
    
    if (cachedData && cachedTimestamp) {
      setDashboardData(JSON.parse(cachedData));
      setLastUpdated(cachedTimestamp);
    }
  }, []);

  const handleFileUpload = async (file: File, fileType: 'shopify' | 'meta' | 'google') => {
    if (fileType !== 'shopify') {
      alert('Currently only Shopify Export is supported. Meta Ads and Google Ads will be added in future updates.');
      return;
    }

    setIsLoading(true);
    try {
      const processedData = await processShopifyCSV(file);
      
      // Cache the data
      const timestamp = new Date().toISOString();
      localStorage.setItem('moi-dashboard-data', JSON.stringify(processedData));
      localStorage.setItem('moi-dashboard-timestamp', timestamp);
      
      setDashboardData(processedData);
      setLastUpdated(timestamp);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please check the format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataSync = () => {
    // This would check for data updates in a real implementation
    alert('Data already in sync. No updates needed.');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-moi-light px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-orpheus text-3xl font-bold text-moi-charcoal">
              MOI Analytics Dashboard
            </h1>
            <p className="font-benton text-sm text-moi-grey mt-1">
              Boutique Everyday Luxury - Marketing Intelligence
            </p>
            {lastUpdated && (
              <p className="font-benton text-xs text-moi-grey mt-1">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {dashboardData && (
              <button
                onClick={handleDataSync}
                className="flex items-center space-x-2 px-4 py-2 bg-moi-beige text-moi-charcoal rounded-lg hover:bg-moi-light transition-colors font-benton text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Sync Data</span>
              </button>
            )}
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 p-2 text-moi-grey hover:text-moi-charcoal transition-colors"
              title="Upload Data"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {dashboardData ? (
          <div className="space-y-8">
            {/* Key Metrics Panel */}
            <KeyMetricsPanel data={dashboardData} />
            
            {/* Campaign Performance Tiers */}
            <CampaignPerformanceTiers data={dashboardData} />
            
            {/* UTM Campaign Table */}
            <UTMCampaignTable data={dashboardData} />
          </div>
        ) : (
          <div className="space-y-8">
              {/* Key Metrics Preview */}
              <div className="bg-white rounded-lg border border-moi-light p-6">
                <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal mb-6">
                  Key Performance Metrics
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-moi-beige rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-benton text-sm text-moi-grey">Unique Campaigns</p>
                        <p className="font-benton text-2xl font-bold text-moi-charcoal">68</p>
                      </div>
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-moi-red text-xs">📊</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-moi-beige rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-benton text-sm text-moi-grey">Total Sessions</p>
                        <p className="font-benton text-2xl font-bold text-moi-charcoal">69K</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs">👥</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-moi-beige rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-benton text-sm text-moi-grey">Conversion Rate</p>
                        <p className="font-benton text-2xl font-bold text-moi-red">0.17%</p>
                      </div>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">🎯</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Performance Tiers Preview */}
              <div className="bg-white rounded-lg border border-moi-light p-6">
                <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal mb-6">
                  Campaign Performance Tiers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-center">
                    <h3 className="font-benton font-semibold text-green-800">Excellent</h3>
                    <p className="font-benton text-2xl font-bold text-green-800 mt-2">3</p>
                  </div>
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 text-center">
                    <h3 className="font-benton font-semibold text-yellow-800">Good</h3>
                    <p className="font-benton text-2xl font-bold text-yellow-800 mt-2">8</p>
                  </div>
                  <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4 text-center">
                    <h3 className="font-benton font-semibold text-orange-800">Average</h3>
                    <p className="font-benton text-2xl font-bold text-orange-800 mt-2">15</p>
                  </div>
                  <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 text-center">
                    <h3 className="font-benton font-semibold text-red-800">Poor</h3>
                    <p className="font-benton text-2xl font-bold text-red-800 mt-2">42</p>
                  </div>
                </div>
              </div>

              {/* Table Preview */}
              <div className="bg-white rounded-lg border border-moi-light p-6">
                <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal mb-6">
                  UTM Campaign Analysis Table
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-moi-beige">
                      <tr>
                        <th className="border border-moi-light px-4 py-3 text-left font-benton font-semibold text-moi-charcoal">UTM Campaign</th>
                        <th className="border border-moi-light px-4 py-3 text-left font-benton font-semibold text-moi-charcoal">Sessions</th>
                        <th className="border border-moi-light px-4 py-3 text-left font-benton font-semibold text-moi-charcoal">Conversion Rate</th>
                        <th className="border border-moi-light px-4 py-3 text-left font-benton font-semibold text-moi-charcoal">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-moi-light px-4 py-2 font-benton text-moi-charcoal">BOF | DPA</td>
                        <td className="border border-moi-light px-4 py-2 font-benton text-moi-charcoal">13,713</td>
                        <td className="border border-moi-light px-4 py-2 font-benton text-moi-red">0.13%</td>
                        <td className="border border-moi-light px-4 py-2">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium border border-red-300">Poor</span>
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-moi-light px-4 py-2 font-benton text-moi-charcoal">india-pmax-rings</td>
                        <td className="border border-moi-light px-4 py-2 font-benton text-moi-charcoal">2,035</td>
                        <td className="border border-moi-light px-4 py-2 font-benton text-green-600">1.13%</td>
                        <td className="border border-moi-light px-4 py-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium border border-green-300">Excellent</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
          isLoading={isLoading}
        />
      )}

      {/* ChatBot Toggle */}
      <button
        onClick={() => setShowChatBot(!showChatBot)}
        className="fixed bottom-6 right-6 bg-moi-charcoal text-white p-4 rounded-full shadow-lg hover:bg-moi-grey transition-colors z-50"
        title={dashboardData ? "Ask questions about your data" : "Preview MOI Analytics Assistant"}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* ChatBot */}
      {showChatBot && (
        <>
          {dashboardData ? (
            <ChatBot
              data={dashboardData}
              onClose={() => setShowChatBot(false)}
            />
          ) : (
            <div className="fixed bottom-6 right-20 w-96 h-96 bg-white rounded-lg shadow-2xl border border-moi-light flex flex-col z-50">
              <div className="flex items-center justify-between p-4 border-b border-moi-light bg-moi-beige rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-moi-red" />
                  <h3 className="font-benton font-medium text-moi-charcoal">MOI Analytics Assistant</h3>
                </div>
                <button
                  onClick={() => setShowChatBot(false)}
                  className="p-1 text-moi-grey hover:text-moi-charcoal transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="bg-moi-beige p-3 rounded-lg mb-4">
                  <p className="font-benton text-sm text-moi-charcoal">
                    Hi! I'm your MOI Analytics Assistant. Upload your data to start asking questions about your campaigns!
                  </p>
                </div>
              </div>
              
              <div className="p-4 border-t border-moi-light">
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Ask about your campaigns..." 
                    className="flex-1 px-3 py-2 border border-moi-light rounded-lg focus:outline-none focus:ring-2 focus:ring-moi-red text-sm font-benton" 
                    disabled
                  />
                  <button className="p-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moi-charcoal mx-auto mb-4"></div>
            <p className="font-benton text-moi-charcoal">Processing your data...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
