import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, X } from 'lucide-react';
import { AppPreferences } from '../types';

interface PreferencesMenuProps {
  onClose: () => void;
  preferences: AppPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<AppPreferences>>;
}

const PreferencesMenu: React.FC<PreferencesMenuProps> = ({ onClose, preferences, setPreferences }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Potentially save language preference to localStorage here
  };

  const handleFormatChange = (format: 'jpg' | 'png') => {
    setPreferences(prev => ({ ...prev, format }));
  };

  const handleQualityChange = (quality: number) => {
    setPreferences(prev => ({ ...prev, quality }));
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({ ...prev, filenamePrefix: e.target.value }));
  };

  const languages = [
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#18181b] w-full overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white tracking-wide">{t('preferences')}</h2>
        <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        
        {/* Export Settings Section */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2">
            {t('pref_export_title')}
          </label>
          
          <div className="bg-zinc-800/50 p-4 rounded-lg border border-white/5 space-y-4">
            
            {/* File Format */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                {t('pref_format')}
              </label>
              <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-700">
                <button
                  onClick={() => handleFormatChange('jpg')}
                  className={`flex-1 py-2 text-xs font-medium rounded transition-colors ${
                    preferences.format === 'jpg' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  JPG
                </button>
                <button
                  onClick={() => handleFormatChange('png')}
                  className={`flex-1 py-2 text-xs font-medium rounded transition-colors ${
                    preferences.format === 'png' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  PNG
                </button>
              </div>
            </div>

            {/* Quality Slider (JPG Only) */}
            {preferences.format === 'jpg' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between text-xs text-zinc-500 mb-2">
                  <span className="font-semibold uppercase tracking-wider">{t('pref_quality')}</span>
                  <span>{Math.round(preferences.quality * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={preferences.quality} 
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            )}

            {/* Filename Prefix */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                {t('pref_prefix')}
              </label>
              <input 
                type="text"
                value={preferences.filenamePrefix}
                onChange={handlePrefixChange}
                className="w-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-300 rounded-lg py-2 px-3 focus:outline-none focus:border-purple-500 placeholder-zinc-600"
                placeholder="Ex: MyWallpaper"
              />
            </div>

          </div>
        </div>

        <hr className="border-white/5" />

        {/* Language Selection */}
        <div className="bg-zinc-800/50 p-3 rounded-lg border border-white/5">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            {t('language')}
          </label>
          <div className="relative">
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="block w-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-300 rounded-lg py-2 px-3 pr-8 appearance-none focus:outline-none focus:border-purple-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesMenu;
