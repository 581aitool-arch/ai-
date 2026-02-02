import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Download, 
  Trash2, 
  UtensilsCrossed,
  Image as ImageIcon,
  Wind,
  X,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Plus,
  Camera
} from 'lucide-react';
import { STYLE_OPTIONS } from './constants';
import { FoodStyle, ProcessingImage } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [images, setImages] = useState<ProcessingImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<FoodStyle>(FoodStyle.FRESH_BRIGHT);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isKeyActive, setIsKeyActive] = useState<boolean | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = (import.meta as any).env.VITE_API_KEY;
    const isActive = !!(key && key !== 'undefined' && typeof key === 'string');
    setIsKeyActive(isActive);
    
    if (isActive === false) {
      const timer = setTimeout(() => setShowGuide(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const startOptimization = async () => {
    if (isKeyActive === false) {
      setShowGuide(true);
      return;
    }

    const pendingImages = images.filter(img => img.status === 'pending');
    if (pendingImages.length === 0) return;

    setIsProcessing(true);
    const style = STYLE_OPTIONS.find(s => s.id === selectedStyle);
    
    for (const img of pendingImages) {
      setImages(prev => prev.map(item => item.id === img.id ? { ...item, status: 'processing' as const } : item));

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
          throw new Error("Failed");
        }
      } catch (err) {
        setImages(prev => prev.map(item => 
          item.id === img.id ? { ...item, status: 'error', error: "處理失敗" } : item
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
              <UtensilsCrossed className="text-white w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 leading-none">GourmetAI</h1>
                {isKeyActive === true ? (
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-tight">
                    <ShieldCheck className="w-3 h-3" /> 連線正常
                  </span>
                ) : (
                  <button 
                    onClick={() => setShowGuide(true)}
                    className="flex items-center gap-1 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse"
                  >
                    <ShieldAlert className="w-3 h-3" /> 尚未設定
                  </button>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Smart Food Stylist</span>
            </div>
          </div>
        </div>
      </header>

      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-indigo-600 p-8 text-white relative">
              <button onClick={() => setShowGuide(false)} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-black mb-1">設定未完成</h2>
              <p className="text-indigo-100 text-xs">請確保您已在 GitHub 中正確設定 API_KEY</p>
            </div>
            <div className="p-6 space-y-5">
               <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-3">
                 <h3 className="font-black text-emerald-900 text-sm flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" /> 如何設定 API Key
                 </h3>
                 <p className="text-xs text-emerald-700 leading-relaxed">
                   1. 去 GitHub 頁面點 <b>Settings</b><br/>
                   2. 點左側 <b>Secrets and variables</b> -> <b>Actions</b><br/>
                   3. 新增 <b>New repository secret</b><br/>
                   4. Name 填 <b>API_KEY</b>，Value 貼上您的 Gemini 金鑰。
                 </p>
               </div>
               <button 
                onClick={() => setShowGuide(false)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg"
               >
                 我知道了
               </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mb-12">
        <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-50 bg-slate-50/30">
              <h2 className="font-bold flex items-center gap-2 text-slate-800 text-sm uppercase tracking-tight">
                <Sparkles className="w-4 h-4 text-indigo-500" /> 選擇修圖風格
              </h2>
            </div>
            <div className="p-5 space-y-3">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center gap-3 group ${
                    selectedStyle === style.id 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-transparent bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <img src={style.preview} alt={style.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="font-bold text-xs text-slate-900">{style.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{style.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-5">
            <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
              <Wind className="w-4 h-4 text-indigo-500" /> 補充修圖指令
            </h2>
            <textarea
              className="w-full h-24 p-4 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-300 resize-none"
              placeholder="例如：背景想要換成木頭材質..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </section>

          <button
            onClick={startOptimization}
            disabled={isProcessing || images.filter(img => img.status === 'pending').length === 0}
            className={`w-full py-5 px-6 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all ${
              isProcessing || images.filter(img => img.status === 'pending').length === 0
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95'
            }`}
          >
            {isProcessing ? "AI 魔法施展中..." : `生成優化照片 (${images.filter(img => img.status === 'pending').length})`}
          </button>
        </aside>

        <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
          {images.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 py-32 px-12 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer shadow-sm group"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*" className="hidden" />
              <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                <Plus className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">立即上傳您的美食照片</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">
                點擊此處選擇檔案，AI 將為您重塑專業背景。
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-4">
                <h3 className="font-black text-slate-800 text-lg">優化列表 ({images.length})</h3>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-black text-indigo-600 flex items-center gap-1.5 px-4 py-2 bg-indigo-50 rounded-full"
                >
                  <Plus className="w-3 h-3" /> 繼續添加
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*" className="hidden" />
              </div>

              {images.map((img) => (
                <div key={img.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row gap-8">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100">
                      <img src={img.originalUrl} alt="Original" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100">
                      {img.optimizedUrl ? (
                        <img src={img.optimizedUrl} alt="Optimized" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          {img.status === 'processing' ? (
                            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-300" />
                          )}
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            {img.status === 'processing' ? '正在處理...' : '等待中'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between md:w-40 py-2">
                    <button onClick={() => removeImage(img.id)} className="self-end p-2 text-slate-300 hover:text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {img.status === 'completed' && img.optimizedUrl && (
                      <button 
                        onClick={() => downloadImage(img.optimizedUrl!, img.id)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[12px] font-black"
                      >
                        <Download className="w-4 h-4 mr-2 inline" /> 下載
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;