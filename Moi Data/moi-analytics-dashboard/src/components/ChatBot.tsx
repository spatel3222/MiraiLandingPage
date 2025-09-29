import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import type { DashboardData, ChatMessage } from '../types';

interface Props {
  data: DashboardData;
  onClose: () => void;
}

const ChatBot: React.FC<Props> = ({ data, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your MOI Analytics Assistant. I can help you understand your marketing data. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Show top performing campaigns",
        "Which campaigns have low conversion rates?",
        "What's my overall performance summary?",
        "Which campaigns need optimization?"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // Top performing campaigns
    if (lowerQuery.includes('top') && (lowerQuery.includes('campaign') || lowerQuery.includes('perform'))) {
      const topCampaigns = data.campaigns
        .filter(c => c.qualityScore >= 60)
        .sort((a, b) => b.qualityScore - a.qualityScore)
        .slice(0, 5);

      if (topCampaigns.length === 0) {
        return "No campaigns currently meet the high-performance criteria (Quality Score ≥60). Focus on optimizing conversion rates and user engagement.";
      }

      const tableRows = topCampaigns.map(c => 
        `| ${c.utmCampaign} | ${formatNumber(c.totalSessions)} | ${c.checkoutRate}% | ${c.qualityScore}/100 |`
      ).join('\n');

      return `**Top Performing Campaigns:**\n\n| Campaign | Sessions | Conversion | Quality Score |\n|----------|----------|------------|---------------|\n${tableRows}\n\n**Key Insight:** ${topCampaigns[0].utmCampaign} is your star performer with ${topCampaigns[0].checkoutRate}% conversion rate.`;
    }

    // Low conversion campaigns
    if (lowerQuery.includes('low') && lowerQuery.includes('conversion')) {
      const lowConversionCampaigns = data.campaigns
        .filter(c => c.checkoutRate < 0.5 && c.totalSessions > 100)
        .sort((a, b) => b.totalSessions - a.totalSessions)
        .slice(0, 5);

      if (lowConversionCampaigns.length === 0) {
        return "Good news! No high-traffic campaigns have critically low conversion rates. Your optimization efforts are paying off.";
      }

      const tableRows = lowConversionCampaigns.map(c => 
        `| ${c.utmCampaign} | ${formatNumber(c.totalSessions)} | ${c.checkoutRate}% | Needs optimization |`
      ).join('\n');

      return `**Low Conversion Campaigns (High Traffic):**\n\n| Campaign | Sessions | Conversion | Status |\n|----------|----------|------------|--------|\n${tableRows}\n\n**Action:** These campaigns have good traffic but poor conversion. Focus on landing page optimization and user experience.`;
    }

    // Overall performance summary
    if (lowerQuery.includes('overall') || lowerQuery.includes('summary') || lowerQuery.includes('performance')) {
      const { keyMetrics } = data;
      const excellentCampaigns = data.campaigns.filter(c => c.performanceTier === 'excellent');
      const poorCampaigns = data.campaigns.filter(c => c.performanceTier === 'poor');

      return `**Overall Performance Summary:**\n\n| Metric | Value |\n|--------|-------|\n| Total Campaigns | ${keyMetrics.uniqueCampaigns} |\n| Total Sessions | ${formatNumber(keyMetrics.totalSessions)} |\n| Overall Conversion | ${keyMetrics.overallConversionRate}% |\n| Excellent Campaigns | ${excellentCampaigns.length} |\n| Need Optimization | ${poorCampaigns.length} |\n\n**Assessment:** ${keyMetrics.overallConversionRate < 1 ? 'Conversion rates need improvement' : 'Performance is solid'}. Focus on optimizing the ${poorCampaigns.length} underperforming campaigns.`;
    }

    // Campaigns needing optimization
    if (lowerQuery.includes('optimization') || lowerQuery.includes('optimize') || lowerQuery.includes('improve')) {
      const needOptimization = data.campaigns
        .filter(c => c.performanceTier === 'poor' || (c.performanceTier === 'average' && c.totalSessions > 100))
        .sort((a, b) => b.totalSessions - a.totalSessions)
        .slice(0, 5);

      if (needOptimization.length === 0) {
        return "Excellent! All your campaigns are performing well. Consider scaling your successful campaigns for growth.";
      }

      const tableRows = needOptimization.map(c => 
        `| ${c.utmCampaign} | ${formatNumber(c.totalSessions)} | ${c.checkoutRate}% | ${c.qualityScore}/100 |`
      ).join('\n');

      return `**Campaigns Needing Optimization:**\n\n| Campaign | Sessions | Conversion | Quality Score |\n|----------|----------|------------|---------------|\n${tableRows}\n\n**Priority:** Start with ${needOptimization[0].utmCampaign} - it has the most traffic but low performance.`;
    }

    // Campaign specific queries
    const mentionedCampaign = data.campaigns.find(c => 
      lowerQuery.includes(c.utmCampaign.toLowerCase())
    );

    if (mentionedCampaign) {
      return `**${mentionedCampaign.utmCampaign} Performance:**\n\n| Metric | Value |\n|--------|-------|\n| Sessions | ${formatNumber(mentionedCampaign.totalSessions)} |\n| Conversion Rate | ${mentionedCampaign.checkoutRate}% |\n| Cart Rate | ${mentionedCampaign.cartRate}% |\n| Quality Score | ${mentionedCampaign.qualityScore}/100 |\n| Performance Tier | ${mentionedCampaign.performanceTier} |\n\n**Recommendation:** ${mentionedCampaign.qualityScore >= 60 ? 'Great performance! Consider scaling this campaign.' : 'Focus on improving conversion and engagement metrics.'}`;
    }

    // Revenue related queries
    if (lowerQuery.includes('revenue') || lowerQuery.includes('money') || lowerQuery.includes('sales')) {
      return `**Revenue Insights:**\n\n| Metric | Value |\n|--------|-------|\n| Estimated Revenue | ₹${formatNumber(data.keyMetrics.totalRevenue)} |\n| Checkout Sessions | ${formatNumber(data.keyMetrics.totalCheckoutSessions)} |\n| Conversion Rate | ${data.keyMetrics.overallConversionRate}% |\n\n**Note:** Revenue is estimated based on checkout sessions. Connect actual sales data for precise tracking.`;
    }

    // Default response
    return "I can help you with:\n\n• **Campaign Performance** - Ask about top campaigns, conversion rates, or specific campaign names\n• **Optimization** - Which campaigns need improvement\n• **Revenue Insights** - Financial performance overview\n• **Traffic Analysis** - Session and user behavior data\n\nTry asking: \"Which campaigns have the best conversion rates?\"";
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate processing time
    setTimeout(() => {
      const botResponse = generateResponse(message);
      const suggestions = [
        "Show revenue breakdown",
        "Which campaigns convert best?",
        "Top 3 optimization priorities",
        "Traffic source analysis"
      ];

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        suggestions
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const formatMessageContent = (content: string) => {
    // Convert markdown-like formatting to JSX
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="font-semibold text-moi-charcoal mb-2">{line.slice(2, -2)}</div>;
      }
      if (line.startsWith('| ') && line.includes(' | ')) {
        // Table row
        const cells = line.split(' | ').map(cell => cell.replace(/^\||\|$/g, '').trim());
        return (
          <div key={index} className="flex border-b border-moi-light text-sm">
            {cells.map((cell, cellIndex) => (
              <div key={cellIndex} className={`px-2 py-1 ${cellIndex === 0 ? 'font-medium' : ''} flex-1`}>
                {cell}
              </div>
            ))}
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      return <div key={index} className="text-moi-grey">{line}</div>;
    });
  };

  return (
    <div className="fixed bottom-6 right-20 w-96 h-96 bg-white rounded-lg shadow-2xl border border-moi-light flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-moi-light bg-moi-beige rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-moi-red" />
          <h3 className="font-benton font-medium text-moi-charcoal">MOI Analytics Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-moi-grey hover:text-moi-charcoal transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-moi-charcoal text-white'
                  : 'bg-moi-beige text-moi-charcoal'
              }`}
            >
              <div className="font-benton text-sm">
                {message.type === 'bot' ? formatMessageContent(message.content) : message.content}
              </div>
              
              {message.suggestions && (
                <div className="mt-3 space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left p-2 text-xs bg-white rounded border border-moi-light hover:bg-moi-light transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-moi-beige text-moi-charcoal p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-moi-grey rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-moi-grey rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-moi-grey rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-moi-light">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            placeholder="Ask about your campaigns..."
            className="flex-1 px-3 py-2 border border-moi-light rounded-lg focus:outline-none focus:ring-2 focus:ring-moi-red focus:border-transparent font-benton text-sm"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            className="p-2 bg-moi-charcoal text-white rounded-lg hover:bg-moi-grey transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;