import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, MessageCircle, Sparkles, Calculator, TrendingUp, Download, RotateCcw } from 'lucide-react';

// Mock useAiChat hook
const useAiChat = () => {
  type Message = {
    id: number;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
  };
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: any) => {
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Ciao! Sono Veritas AI. Hai scritto: "${message}". Sono qui per aiutarti con qualsiasi domanda!`,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const clearConversation = () => {
    setConversation([]);
  };

  const getSuggestions = (input: string) => {
    const suggestions = ['Chi sei?', 'Raccontami di te', 'Come funzioni?'];
    return suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase())).slice(0, 3);
  };

  return { conversation, isLoading, sendMessage, clearConversation, getSuggestions };
};

// Enhanced AI Chat Component
const VeritasChat = () => {
  const [message, setMessage] = useState('');
  const { conversation, isLoading, sendMessage, clearConversation, getSuggestions } = useAiChat();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    await sendMessage(message);
    setMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Chat Messages */}
      <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-900/30 rounded-2xl border border-violet-500/20">
        {conversation.length === 0 && (
          <div className="text-white/60 text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-light mb-2">Ciao! Sono Veritas, l'assistente IA di Giacomo.</p>
            <p className="font-light text-sm text-white/40">Prova a chiedermi "Chi sei?" o "Qual è il tuo scopo?"</p>
          </div>
        )}
        
        {conversation.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl font-light ${
              msg.type === 'user' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-gray-800/50 text-white/90 border border-white/10'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 text-white/90 px-4 py-2 rounded-2xl border border-white/10">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Suggestions */}
      {message.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {getSuggestions(message).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setMessage(suggestion)}
              className="px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 text-white/70 hover:text-white rounded-full text-sm transition-colors font-light border border-white/10 hover:border-white/20"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {/* Quick suggestions when empty */}
      {message.length === 0 && conversation.length === 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {['Chi sei?', 'Qual è il tuo scopo?', 'Ciao'].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setMessage(suggestion)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white/80 hover:text-white rounded-full text-sm transition-all font-light border border-purple-500/30 hover:border-purple-400/50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {/* Chat Input */}
      <form className="flex gap-3" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isLoading && message.trim()) {
                // Submit the form programmatically
                (e.target as HTMLInputElement).form?.requestSubmit();
              }
            }
          }}
          placeholder="Scrivi un messaggio a Veritas..."
          disabled={isLoading}
          className="flex-1 bg-gray-800/50 border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors font-light disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full transition-all transform hover:scale-110 active:scale-95 duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-purple-500/50"
        >
          <Send className="w-4 h-4" />
        </button>
        
        {conversation.length > 0 && (
          <button
            type="button"
            onClick={clearConversation}
            className="text-white/50 hover:text-white transition-colors px-3 py-3 rounded-full hover:bg-gray-800/50 border border-white/10 hover:border-white/20"
            title="Clear conversation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
};

// New Veritas Graphic Component
const VeritasGraphic = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [] = useState('sin(x)');
  const [] = useState('');
  const [] = useState('');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [gridVisible, setGridVisible] = useState(true);
  const [axesVisible, setAxesVisible] = useState(true);
  const [functions, setFunctions] = useState([
    { expr: 'sin(x)', color: '#8B5CF6', visible: true },
    { expr: '', color: '#06B6D4', visible: false },
    { expr: '', color: '#EF4444', visible: false }
  ]);

  // Safe math evaluation
  const evaluateFunction = (expr: string, x: number) => {
    try {
      // Replace common math functions and operators BEFORE substituting x
      let processedExpr = expr
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\bexp\b/g, 'Math.exp')
        .replace(/\bln\b/g, 'Math.log')
        .replace(/\blog\b/g, 'Math.log10')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bpi\b/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/\^/g, '**')  // Convert ^ to ** BEFORE substituting x
        .replace(/\bx\b/g, `(${x})`);  // Wrap x in parentheses for safety

      return eval(processedExpr);
    } catch (error) {
      return NaN;
    }
  };

  // Draw function on canvas
  const drawFunction = (ctx: CanvasRenderingContext2D, expr: string, color: string, width: number, height: number) => {
    if (!expr.trim()) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    let firstPoint = true;

    for (let px = 0; px <= width; px++) {
      const x = xMin + (px / width) * xRange;
      const y = evaluateFunction(expr, x);
      
      if (!isNaN(y) && isFinite(y)) {
        const py = height - ((y - yMin) / yRange) * height;
        
        if (py >= 0 && py <= height) {
          if (firstPoint) {
            ctx.moveTo(px, py);
            firstPoint = false;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          firstPoint = true;
        }
      } else {
        firstPoint = true;
      }
    }
    
    ctx.stroke();
  };

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!gridVisible) return;

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    // Vertical grid lines
    for (let i = Math.ceil(xMin); i <= Math.floor(xMax); i++) {
      const px = ((i - xMin) / xRange) * width;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = Math.ceil(yMin); i <= Math.floor(yMax); i++) {
      const py = height - ((i - yMin) / yRange) * height;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  };

  // Draw axes
  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!axesVisible) return;

    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    // Y-axis
    if (xMin <= 0 && xMax >= 0) {
      const px = ((-xMin) / xRange) * width;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }
    
    // X-axis
    if (yMin <= 0 && yMax >= 0) {
      const py = height - ((-yMin) / yRange) * height;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }
  };

  // Main render function
  const renderGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    drawGrid(ctx, width, height);
    
    // Draw axes
    drawAxes(ctx, width, height);

    // Draw functions
    functions.forEach(func => {
      if (func.visible && func.expr.trim()) {
        drawFunction(ctx, func.expr, func.color, width, height);
      }
    });
  };

  // Update function
  const updateFunction = (index: number, expr: string) => {
    const newFunctions = [...functions];
    newFunctions[index].expr = expr;
    newFunctions[index].visible = expr.trim().length > 0;
    setFunctions(newFunctions);
  };

  // Toggle function visibility
  const toggleFunction = (index: number) => {
    const newFunctions = [...functions];
    newFunctions[index].visible = !newFunctions[index].visible;
    setFunctions(newFunctions);
  };

  // Reset view
  const resetView = () => {
    setXMin(-10);
    setXMax(10);
    setYMin(-5);
    setYMax(5);
  };

  // Export as image
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'veritas-graph.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // Render graph when parameters change
  useEffect(() => {
    renderGraph();
  }, [functions, xMin, xMax, yMin, yMax, gridVisible, axesVisible]);

  return (
    <div className="space-y-6">
      {/* Function Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {functions.map((func, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFunction(index)}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  func.visible 
                    ? 'bg-white border-white' 
                    : 'border-white/50 hover:border-white'
                }`}
                style={{ backgroundColor: func.visible ? func.color : 'transparent' }}
              />
              <label className="text-sm font-medium text-white/90">
                f{index + 1}(x) =
              </label>
            </div>
            <input
              type="text"
              value={func.expr}
              onChange={(e) => updateFunction(index, e.target.value)}
              placeholder={`Funzione ${index + 1} (es: sin(x), x^2, exp(x))`}
              className="w-full bg-gray-800/50 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-400 transition-colors font-mono text-sm"
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-white/70">X:</label>
            <input
              type="number"
              value={xMin}
              onChange={(e) => setXMin(parseFloat(e.target.value) || -10)}
              className="w-20 bg-gray-800/50 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
            />
            <span className="text-white/50">to</span>
            <input
              type="number"
              value={xMax}
              onChange={(e) => setXMax(parseFloat(e.target.value) || 10)}
              className="w-20 bg-gray-800/50 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-white/70">Y:</label>
            <input
              type="number"
              value={yMin}
              onChange={(e) => setYMin(parseFloat(e.target.value) || -5)}
              className="w-20 bg-gray-800/50 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
            />
            <span className="text-white/50">to</span>
            <input
              type="number"
              value={yMax}
              onChange={(e) => setYMax(parseFloat(e.target.value) || 5)}
              className="w-20 bg-gray-800/50 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGridVisible(!gridVisible)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              gridVisible 
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' 
                : 'bg-gray-800/50 text-white/70 border border-white/20'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setAxesVisible(!axesVisible)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              axesVisible 
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' 
                : 'bg-gray-800/50 text-white/70 border border-white/20'
            }`}
          >
            Axes
          </button>
          <button
            onClick={resetView}
            className="px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 text-white/70 hover:text-white rounded-lg text-sm transition-all border border-white/20 hover:border-white/40 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            onClick={exportImage}
            className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white/80 hover:text-white rounded-lg text-sm transition-all border border-purple-500/30 hover:border-purple-400/50 flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-auto bg-gray-900/50 rounded-2xl border border-violet-500/20 shadow-lg"
        />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-white/70">
          Funzioni supportate: sin, cos, tan, exp, ln, log, sqrt, abs, pi, e, ^
        </div>
      </div>
    </div>
  );
};

// Main Enhanced AiChat Component
export const AiChat = () => {
  const [activeMode, setActiveMode] = useState('chat');

  return (
    <div className="group relative p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 backdrop-blur-md border border-violet-500/20 hover:border-violet-400/40 transition-all duration-700 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/5 via-purple-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
      
      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
            {activeMode === 'chat' ? <Bot className="w-6 h-6 text-white" /> : <Calculator className="w-6 h-6 text-white" />}
          </div>
          <h3 className="text-2xl font-medium text-white/95 group-hover:text-violet-300 transition-colors duration-500">
            Veritas AI {activeMode === 'chat' ? 'Chat' : 'Graphic'}
          </h3>
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block mr-1"></div>
            Online (v0.15)
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="relative flex gap-2 mb-6 p-1 bg-gray-800/50 rounded-2xl border border-white/10">
        <button
          onClick={() => setActiveMode('chat')}
          className={`relative flex-1 px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium ${
            activeMode === 'chat'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => setActiveMode('graphic')}
          className={`relative flex-1 px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium ${
            activeMode === 'graphic'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Graphic
        </button>
      </div>

      {/* Content */}
      <div className="relative">
        {activeMode === 'chat' ? <VeritasChat /> : <VeritasGraphic />}
      </div>
      
      {/* AI Info */}
      <div className="mt-6 text-xs text-white/40 text-center font-light">
        Veritas AI • Version Alpha 0.15 • Created by Giacomo Palmisani
      </div>
    </div>
  );
};

export default AiChat;