import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, CheckCircle, AlertTriangle, X } from 'lucide-react';
import type * as LogicTypes from '../types/logicConfiguration';

type ValidationError = LogicTypes.ValidationError;
type ValidationResult = LogicTypes.ValidationResult;
type LogicTemplateRow = LogicTypes.LogicTemplateRow;

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  errorContext?: ValidationError;
  suggestedFix?: string;
}

interface ValidationChatBotProps {
  validationResult: ValidationResult;
  templateRows: LogicTemplateRow[];
  onFixApplied: (updatedRows: LogicTemplateRow[]) => void;
  onClose: () => void;
}

export const ValidationChatBot: React.FC<ValidationChatBotProps> = ({
  validationResult,
  templateRows,
  onFixApplied,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(true); // Auto-open when errors exist
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentErrorIndex, setCurrentErrorIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && (validationResult.errors.length > 0 || validationResult.warnings.length > 0)) {
      initializeErrorResolution();
    }
  }, [isOpen, validationResult]);

  const initializeErrorResolution = () => {
    const totalErrors = validationResult.errors.length;
    const totalWarnings = validationResult.warnings.length;
    
    let welcomeContent = '';
    let errorContext = undefined;
    
    if (totalErrors > 0) {
      const currentError = validationResult.errors[currentErrorIndex];
      if (currentError) {
        welcomeContent = `🔍 **${totalErrors} errors found.** Let me help you fix them interactively.\n\n**Error #${currentErrorIndex + 1}:** ${currentError.message}\n\n*Row ${currentError.row}: ${currentError.field}*\n\nGive me more information about what this formula should accomplish.`;
        errorContext = currentError;
      }
    } else if (totalWarnings > 0) {
      welcomeContent = `⚠️ **${totalWarnings} warnings found.** These are suggestions for optimization.\n\nYour template can be applied as-is, but I can help you optimize these formulas for better performance and clarity.\n\nWould you like me to help improve any of these warnings?`;
    }
    
    // Fallback if no content was generated
    if (!welcomeContent) {
      welcomeContent = `✅ **Validation complete.** No issues found that require immediate attention.`;
    }
    
    const welcomeMessage: ChatMessage = {
      id: `welcome-${Date.now()}`,
      type: 'bot',
      content: welcomeContent,
      timestamp: new Date(),
      errorContext
    };

    setMessages([welcomeMessage]);
    setCurrentErrorIndex(0);
    setRetryCount(0);
  };

  const analyzeUserResponse = async (userResponse: string, error: ValidationError): Promise<string> => {
    // Simulate LLM analysis of user response to generate fix
    return new Promise((resolve) => {
      setTimeout(() => {
        // Extract field references from user response
        const fieldMatches = templateRows.map(row => row.fields).filter(field => 
          userResponse.toLowerCase().includes(field.toLowerCase()) ||
          field.toLowerCase().includes(userResponse.toLowerCase().split(' ')[0])
        );

        if (fieldMatches.length >= 2 && error.code === 'UNDEFINED_FIELD_REFERENCE') {
          const suggestedFormula = `${fieldMatches[0]} / ${fieldMatches[1]}`;
          resolve(`Based on your response, I suggest updating the formula to: **"${suggestedFormula}"**\n\nThis uses the exact field names from your template. Should I apply this fix?`);
        } else if (fieldMatches.length === 1) {
          resolve(`I found the field **"${fieldMatches[0]}"** in your template. Can you clarify what other field this should be calculated with?`);
        } else {
          resolve(`I understand you want to ${userResponse}. Looking at your template, here are the available fields:\n\n${templateRows.slice(0, 10).map(row => `• ${row.fields}`).join('\n')}\n\nWhich specific fields should be used in this calculation?`);
        }
      }, 500);
    });
  };

  const applyFix = (errorIndex: number, suggestedFix: string) => {
    const updatedRows = [...templateRows];
    const error = validationResult.errors[errorIndex];
    
    if (error.field === 'formula') {
      // Find the row and update the formula
      const targetRowIndex = error.row - 1;
      if (targetRowIndex >= 0 && targetRowIndex < updatedRows.length) {
        updatedRows[targetRowIndex].formula = suggestedFix;
        onFixApplied(updatedRows);
        
        // Move to next error
        moveToNextError();
      }
    }
  };

  const moveToNextError = () => {
    const nextIndex = currentErrorIndex + 1;
    
    if (nextIndex < validationResult.errors.length) {
      setCurrentErrorIndex(nextIndex);
      setRetryCount(0);
      
      const nextError = validationResult.errors[nextIndex];
      const nextMessage: ChatMessage = {
        id: `error-${nextIndex}-${Date.now()}`,
        type: 'bot',
        content: `✅ **Error #${currentErrorIndex + 1} fixed!**\n\n**Error #${nextIndex + 1}:** ${nextError.message}\n\n*Row ${nextError.row}: ${nextError.field}*\n\nWhat should this formula accomplish?`,
        timestamp: new Date(),
        errorContext: nextError
      };
      
      setMessages(prev => [...prev, nextMessage]);
    } else {
      // All errors resolved
      const completionMessage: ChatMessage = {
        id: `completion-${Date.now()}`,
        type: 'bot',
        content: `🎉 **All errors resolved!** Your template validation should now pass. You can close this chat and re-upload your template.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, completionMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsProcessing(true);

    try {
      const currentError = validationResult.errors[currentErrorIndex];
      if (!currentError && validationResult.warnings.length > 0) {
        // Handle warnings-only scenario
        const botResponse = `Thank you for your input! Since these are warnings (not errors), your template can be applied as-is. The warnings are suggestions for optimization, but they won't prevent your template from working.\n\nWould you like me to help optimize any specific formula, or would you prefer to apply the template as it is?`;
        
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: botResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsProcessing(false);
        return;
      }
      
      if (!currentError) {
        setIsProcessing(false);
        return;
      }
      
      const botResponse = await analyzeUserResponse(userInput.trim(), currentError);
      
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        suggestedFix: botResponse.includes('Should I apply this fix?') ? 
          botResponse.match(/\*\*"([^"]+)"\*\*/)?.[1] : undefined
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: 'Sorry, I had trouble analyzing your response. Could you please rephrase what you\'re trying to accomplish?',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsProcessing(false);
  };

  const handleApplyFix = (message: ChatMessage) => {
    if (message.suggestedFix) {
      applyFix(currentErrorIndex, message.suggestedFix);
      
      const confirmMessage: ChatMessage = {
        id: `confirm-${Date.now()}`,
        type: 'bot',
        content: `✅ **Fix applied:** "${message.suggestedFix}"`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmMessage]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-moi-charcoal text-white p-4 rounded-full shadow-lg hover:bg-moi-grey transition-colors z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-moi-charcoal text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span className="font-benton font-semibold">Validation Assistant</span>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            onClose();
          }}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-moi-charcoal text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                {message.type === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <div className="font-benton text-sm whitespace-pre-line">
                  {message.content}
                </div>
              </div>
              
              {message.suggestedFix && (
                <button
                  onClick={() => handleApplyFix(message)}
                  className="mt-2 w-full bg-green-600 text-white py-1 px-3 rounded text-xs hover:bg-green-700 transition-colors"
                >
                  Apply This Fix
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 animate-pulse" />
                <span className="font-benton text-sm text-gray-600">Analyzing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe what the formula should do..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-benton focus:outline-none focus:ring-2 focus:ring-moi-charcoal"
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isProcessing}
            className="p-2 bg-moi-charcoal text-white rounded-lg hover:bg-moi-grey transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationChatBot;