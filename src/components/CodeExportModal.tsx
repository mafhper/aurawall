import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { WallpaperConfig } from '../types';
import { generateReactCode, generateHtmlCssCode } from '../utils/codeGenerators';
import { useTranslation } from 'react-i18next';

interface CodeExportModalProps {
  svgContent: string; // The raw SVG string
  config: WallpaperConfig; // Config for generating other formats
  onClose: () => void;
}

const CodeExportModal: React.FC<CodeExportModalProps> = ({ svgContent, config, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'svg' | 'react' | 'html'>('svg');
  const [copied, setCopied] = useState(false);

  const code = React.useMemo(() => {
    switch (activeTab) {
      case 'svg':
        return svgContent;
      case 'react':
        return generateReactCode(config);
      case 'html':
        return generateHtmlCssCode(config);
      default:
        return '';
    }
  }, [activeTab, svgContent, config]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-3xl flex flex-col max-h-[85vh] shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Export Code</h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-4 gap-4">
          {(['svg', 'react', 'html'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-purple-500 text-purple-400' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Code View */}
        <div className="flex-1 overflow-auto bg-[#0d0d0d] p-4 relative font-mono text-xs text-zinc-300">
          <pre className="whitespace-pre-wrap break-all">{code}</pre>
          
          <button 
            onClick={handleCopy}
            className="absolute top-4 right-4 flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors shadow-lg"
          >
            {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
            <span>{copied ? t('copied') : t('copy_code')}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-900 rounded-b-2xl">
          <p className="text-xs text-zinc-500">
            {activeTab === 'svg' 
              ? "Raw SVG vector data. Perfect for Illustrator, Figma, or direct embedding."
              : "Optimized CSS-based implementation. Lightweight and performant for web backgrounds."}
          </p>
        </div>

      </div>
    </div>
  );
};

export default CodeExportModal;
