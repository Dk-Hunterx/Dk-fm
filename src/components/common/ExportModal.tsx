import React, { useState } from 'react';
import { 
  Download, 
  X, 
  Terminal, 
  Check, 
  FolderArchive, 
  FileCode2, 
  Layers, 
  Sparkles, 
  ExternalLink,
  Laptop
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(label);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const setupCommands = `# 1. Extract the downloaded archive
unzip dk-fm-audio-app-source.zip -d dk-fm-app
cd dk-fm-app

# 2. Install all dependencies
npm install

# 3. Start local development server
npm run dev`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-slate-950 font-bold">
              <FolderArchive className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Export Source Code
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Ready to Run
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete self-contained project archive ready for local development.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Main Download Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
                <FileCode2 className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">dk-fm-audio-app-source.zip</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Includes all components, contexts, audio assets, styles, package.json & README.md
                </p>
              </div>
            </div>

            <a
              href="/dk-fm-audio-app-source.zip"
              download="dk-fm-audio-app-source.zip"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP Archive</span>
            </a>
          </div>

          {/* Local Run Guide */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-orange-400" />
                Quick Local Run Commands
              </span>
              <button
                onClick={() => copyToClipboard(setupCommands, 'commands')}
                className="text-xs text-slate-400 hover:text-orange-400 flex items-center gap-1.5 transition-colors"
              >
                {copiedCommand === 'commands' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <span>Copy Commands</span>
                )}
              </button>
            </div>
            
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono overflow-x-auto leading-relaxed">
              <code>{setupCommands}</code>
            </pre>
          </div>

          {/* Included Files Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1.5">
                <Laptop className="w-4 h-4 text-orange-400" />
                <span>Prerequisites</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li>Node.js 18.0+ or Node 20+ LTS</li>
                <li>npm, pnpm, yarn, or bun</li>
                <li>Any modern web browser</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>What's Inside</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li>34+ source files & full components</li>
                <li>All story images & cover artwork</li>
                <li>Audio player engine & IndexedDB cache</li>
                <li>Complete README.md with docs</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Ready to deploy on Vercel, Netlify, or local machine.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
