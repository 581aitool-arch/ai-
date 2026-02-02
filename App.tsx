
import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Download, 
  Trash2, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  UtensilsCrossed,
  Image as ImageIcon,
  History,
  Wind
} from 'lucide-react';
import { STYLE_OPTIONS } from './constants';
import { FoodStyle, ProcessingImage } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [images, setImages] = useState<ProcessingImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<FoodStyle>(FoodStyle.FRESH_BRIGHT);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fix: Explicitly type 'file' as File to avoid 'unknown' type error in URL.createObjectURL and readAsDataURL
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newImage: ProcessingImage = {
          id: Math.random().toString(36).substr(2, 9),
          originalUrl: URL.createObjectURL(file),
          base64: base64,
          status: 'pending'
        };
        setImages(prev => [newImage, ...prev]);
      };
      reader.readAsDataURL(file);
    });
    
    // 清除 input 以便重複上傳
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const startOptimization = async () => {
    const pendingImages = images.filter(img => img.status === 'pending');
    if (pendingImages.length === 0) return;

    setIsProcessing(true);
    const style = STYLE_OPTIONS.find(s => s.id === selectedStyle);
    
    // 逐一處理
    for (const img of pendingImages) {
      setImages(prev => prev.map(item => 
        item.id === img.id ? { ...item, status: 'processing' } : item
      ));

      try {
        const result = await geminiService.optimizeFoodImage(
          img.base64, 
          style?.prompt || "", 
          customPrompt
        );

        if (result) {
          setImages(prev => prev.map(item => 
            item.id === img.id ? { ...item, status: 'completed', optimizedUrl: result } : item
          ));
        } else {
          throw new Error("未能生成優化後的圖片");
        }
      } catch (err: any) {
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'error', error: err.message } : item
        ));
      }
    }
    setIsProcessing(false);
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `GourmetAI_${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <UtensilsCrossed className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">GourmetAI</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">智能菜單優化師</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`text-sm font-medium transition-colors ${activeTab === 'upload' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              工作台
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              我的作品箱
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar: Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold flex items-center gap-2 text-slate-800">
                <Sparkles className="w-4 h-4 text-indigo-500" /> 選擇優化風格
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 group ${
                    selectedStyle === style.id 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-transparent bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <img src={style.preview} alt={style.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-900">{style.name}</div>
                    <div className="text-xs text-slate-500">{style.description}</div>
                  </div>
                  {selectedStyle === style.id && (
                    <div className="bg-indigo-500 p-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Wind className="w-4 h-4 text-indigo-500" /> 額外修飾需求 (選填)
            </h2>
            <textarea
              className="w-full h-24 p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
              placeholder="例如：加上幾片檸檬、或者背景放一杯紅酒、加強牛排上的光澤感..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </section>

          <button
            onClick={startOptimization}
            disabled={isProcessing || images.filter(img => img.status === 'pending').length === 0}
            className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all ${
              isProcessing || images.filter(img => img.status === 'pending').length === 0
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                AI 優化中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                開始批量優化 ({images.filter(img => img.status === 'pending').length})
              </>
            )}
          </button>
        </aside>

        {/* Main Content: Upload & Results */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center group hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer relative overflow-hidden"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple 
              accept="image/*"
              className="hidden" 
            />
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-indigo-100 p-5 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">點擊或拖放照片至此</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                支援 JPG, PNG 格式，建議上傳清晰、食物比例較大、且光線均勻的照片。
              </p>
            </div>
            {/* Decorative BG pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Camera className="w-32 h-32" />
            </div>
          </div>

          {/* List of Images */}
          <div className="space-y-4">
            {images.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-3xl border border-slate-100">
                <div className="inline-block p-4 bg-slate-100 rounded-full mb-3">
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium">尚無待處理照片</p>
              </div>
            ) : (
              images.map((img) => (
                <div 
                  key={img.id} 
                  className={`bg-white rounded-3xl border p-4 transition-all ${
                    img.status === 'error' ? 'border-red-100 bg-red-50/30' : 
                    img.status === 'completed' ? 'border-green-100 shadow-md' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Previews */}
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-black/5">
                        <img src={img.originalUrl} alt="Original" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded-md font-bold uppercase tracking-wider">原始照片</div>
                      </div>
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-black/5 flex items-center justify-center">
                        {img.optimizedUrl ? (
                          <>
                            <img src={img.optimizedUrl} alt="Optimized" className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-indigo-600 text-[10px] text-white px-2 py-1 rounded-md font-bold uppercase tracking-wider shadow-lg">AI 優化後</div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 p-4 text-center">
                            {img.status === 'processing' ? (
                              <>
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-100 border-t-indigo-500 mb-2" />
                                <span className="text-xs font-bold text-indigo-500 animate-pulse">正在精修光影中...</span>
                              </>
                            ) : img.status === 'error' ? (
                              <>
                                <AlertCircle className="w-8 h-8 text-red-400 mb-1" />
                                <span className="text-xs font-bold text-red-500">處理失敗</span>
                                <p className="text-[10px] text-red-400">{img.error}</p>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-8 h-8 text-slate-200" />
                                <span className="text-xs font-medium text-slate-400 italic">待優化...</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Info & Actions */}
                    <div className="flex flex-col justify-between py-2 md:w-48">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                            img.status === 'completed' ? 'bg-green-100 text-green-700' :
                            img.status === 'processing' ? 'bg-indigo-100 text-indigo-700' :
                            img.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {img.status === 'completed' ? '完成' :
                             img.status === 'processing' ? '處理中' :
                             img.status === 'error' ? '錯誤' : '等待中'}
                          </span>
                          <button 
                            onClick={() => removeImage(img.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mb-1">ID: {img.id}</p>
                      </div>

                      <div className="space-y-2">
                        {img.status === 'completed' && img.optimizedUrl && (
                          <button 
                            onClick={() => downloadImage(img.optimizedUrl!, img.id)}
                            className="w-full py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                          >
                            <Download className="w-3 h-3" /> 下載存檔
                          </button>
                        )}
                        {img.status === 'error' && (
                          <button 
                             onClick={() => {
                               setImages(prev => prev.map(i => i.id === img.id ? {...i, status: 'pending'} : i));
                             }}
                             className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                          >
                             重試處理
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Floating Notice / Help */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="group relative">
          <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-3 pr-6">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Camera className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">完全免費</p>
              <p className="text-[10px] text-slate-500">透過 Google Gemini 驅動</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
