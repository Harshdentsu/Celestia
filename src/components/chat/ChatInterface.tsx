import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useData } from '../../contexts/DataContext';
import { Send, Bot, User, Lightbulb } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sources?: Array<{
    type: string;
    id: string;
    content: string;
  }>;
}

interface ChatInterfaceProps {
  userRole?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userRole }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I can help you with SKU availability, claims status, and sales data. What would you like to know?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { searchSKU, searchClaims, searchSales, findSimilarQueries } = useData();

  const suggestedQueries = [
    "Show SKU availability in Chennai",
    "What's my claim status?",
    "Display sales data for this month",
    "Which products are low in stock?",
    "Show pending claims"
  ];

  const processQuery = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // SKU queries
    if (lowerQuery.includes('sku') || lowerQuery.includes('stock') || lowerQuery.includes('availability')) {
      const results = searchSKU(query);
      if (results.length > 0) {
        const topResults = results.slice(0, 5);
        return `Found ${results.length} SKUs matching your query:\n\n${topResults.map(sku => 
          `• ${sku.name} (${sku.id})\n  Stock: ${sku.stock} units\n  Location: ${sku.warehouse}, ${sku.zone}\n  Price: ₹${sku.price.toLocaleString()}`
        ).join('\n\n')}`;
      }
      return "No SKUs found matching your criteria. Please try a different search term.";
    }
    
    // Claims queries
    if (lowerQuery.includes('claim') || lowerQuery.includes('warranty') || lowerQuery.includes('return')) {
      const results = searchClaims(query);
      if (results.length > 0) {
        const topResults = results.slice(0, 5);
        return `Found ${results.length} claims:\n\n${topResults.map(claim => 
          `• Claim ${claim.id}\n  Dealer: ${claim.dealer_name}\n  Status: ${claim.status}\n  Amount: ₹${claim.amount.toLocaleString()}\n  Type: ${claim.type}`
        ).join('\n\n')}`;
      }
      return "No claims found matching your criteria.";
    }
    
    // Sales queries
    if (lowerQuery.includes('sales') || lowerQuery.includes('revenue') || lowerQuery.includes('performance')) {
      const results = searchSales(query);
      if (results.length > 0) {
        const topResults = results.slice(0, 5);
        const totalAmount = results.reduce((sum, sale) => sum + sale.amount, 0);
        return `Found ${results.length} sales records (Total: ₹${totalAmount.toLocaleString()}):\n\n${topResults.map(sale => 
          `• ${sale.sku_name}\n  Dealer: ${sale.dealer_name}\n  Quantity: ${sale.quantity}\n  Amount: ₹${sale.amount.toLocaleString()}\n  Date: ${sale.date}`
        ).join('\n\n')}`;
      }
      return "No sales data found matching your criteria.";
    }
    
    return "I can help you with SKU availability, claims status, and sales data. Please try asking about inventory, claims, or sales performance.";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputMessage }),
      });

      const data = await response.json();
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer,
        sender: 'bot',
        timestamp: new Date(),
        sources: data.sources
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    setInputMessage(query);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Chat Interface */}
      <div className="lg:col-span-3">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span>AI Assistant</span>
              <Badge variant="secondary">{userRole}</Badge>
            </CardTitle>
            <CardDescription>
              Ask me about SKU availability, claims, and sales data using natural language
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === 'bot' && <Bot className="w-4 h-4 mt-1 text-blue-600" />}
                      {message.sender === 'user' && <User className="w-4 h-4 mt-1" />}
                      <div className="whitespace-pre-line">
                        {message.content}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-sm font-semibold text-gray-600">Sources:</p>
                            <div className="space-y-2">
                              {message.sources.map((source, index) => (
                                <div key={index} className="text-sm text-gray-500">
                                  <span className="font-medium">{source.type.toUpperCase()}</span>
                                  <p className="text-xs mt-1">{source.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about SKU availability, claims, or sales..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Suggested Queries */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span>Suggested Queries</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full text-left justify-start h-auto p-3"
                onClick={() => handleSuggestedQuery(query)}
              >
                {query}
              </Button>
            ))}
          </CardContent>
        </Card>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              placeholder="Enter OpenAI API Key (optional)"
              className="text-xs"
            />
            <p className="text-xs text-gray-500 mt-2">
              Add your OpenAI API key for enhanced AI responses, or use local processing.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;
