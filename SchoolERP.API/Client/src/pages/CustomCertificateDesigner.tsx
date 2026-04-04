import { useState, useRef, useEffect } from 'react';
import { 
  Move, Type, Image as ImageIcon, Trash2, Layers, 
  Settings, Download, Plus, ChevronLeft, ChevronRight,
  Maximize2, MousePointer2, Save, FileText, User, Hash, Calendar, MapPin,
  ArrowUp, ArrowDown, Type as FontIcon, Palette, AlignLeft, AlignCenter, AlignRight,
  ShieldCheck, GraduationCap, Briefcase
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Element {
  id: string;
  type: 'text' | 'image' | 'field';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  fieldKey?: string;
  zIndex: number;
  opacity: number;
  textAlign: 'left' | 'center' | 'right';
  fontFamily?: string;
}

const AVAILABLE_FIELDS = [
  { key: '[Name]', label: 'Student Name', icon: User, group: 'Student' },
  { key: '[AdmissionNo]', label: 'Admission No', icon: Hash, group: 'Student' },
  { key: '[RollNo]', label: 'Roll Number', icon: Hash, group: 'Student' },
  { key: '[Class]', label: 'Class/Grade', icon: Layers, group: 'Academic' },
  { key: '[Section]', label: 'Section', icon: Layers, group: 'Academic' },
  { key: '[Session]', label: 'Academic Session', icon: Calendar, group: 'Academic' },
  { key: '[Address]', label: 'Student Address', icon: MapPin, group: 'Contact' },
  { key: '[Phone]', label: 'Phone Number', icon: MapPin, group: 'Contact' },
  { key: '[DOB]', label: 'Date of Birth', icon: Calendar, group: 'Student' },
  { key: '[Principal]', label: 'Principal Sig', icon: Briefcase, group: 'Signatures' },
];

const FONTS = [
  { name: 'Inter, sans-serif', label: 'Inter' },
  { name: 'serif', label: 'Serif' },
  { name: 'monospace', label: 'Monospace' },
  { name: "'Playfair Display', serif", label: 'Playfair' },
  { name: "'Dancing Script', cursive", label: 'Cursive' },
];

export default function CustomCertificateDesigner() {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(0.8);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sidebarTab, setSidebarTab] = useState<'elements' | 'layers' | 'settings'>('elements');

  // Load fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playfair+Display:wght@400;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const selectElement = (id: string | null) => {
    setSelectedId(id);
  };

  const addText = () => {
    const newEl: Element = {
      id: crypto.randomUUID(),
      type: 'text',
      x: 100,
      y: 100,
      content: 'New Text',
      fontSize: 24,
      fontWeight: '600',
      color: '#1e293b',
      zIndex: elements.length + 1,
      opacity: 1,
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif'
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const addField = (field: typeof AVAILABLE_FIELDS[0]) => {
    const newEl: Element = {
      id: crypto.randomUUID(),
      type: 'field',
      x: 150,
      y: 150,
      fieldKey: field.key,
      content: field.label,
      fontSize: 18,
      fontWeight: '700',
      color: '#1e293b',
      zIndex: elements.length + 1,
      opacity: 1,
      textAlign: 'left',
      fontFamily: 'Inter, sans-serif'
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const el = elements.find(item => item.id === id);
    if (!el) return;
    setSelectedId(id);
    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - canvasRect.left) / zoom - dragOffset.x);
    const y = Math.round((e.clientY - canvasRect.top) / zoom - dragOffset.y);
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, x, y } : el));
  };

  const handleMouseUp = () => setIsDragging(false);

  const updateElement = (id: string, patch: Partial<Element>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...patch } : el));
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    setElements(prev => {
        const sorted = [...prev].sort((a,b) => a.zIndex - b.zIndex);
        const idx = sorted.findIndex(e => e.id === id);
        if (direction === 'up' && idx < sorted.length - 1) {
            const next = sorted[idx+1];
            const currentZ = sorted[idx].zIndex;
            sorted[idx].zIndex = next.zIndex;
            next.zIndex = currentZ;
        } else if (direction === 'down' && idx > 0) {
            const prevEl = sorted[idx-1];
            const currentZ = sorted[idx].zIndex;
            sorted[idx].zIndex = prevEl.zIndex;
            prevEl.zIndex = currentZ;
        }
        return [...sorted];
    });
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBgImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);
  const sortedLayers = [...elements].sort((a,b) => b.zIndex - a.zIndex); // visually reverse for list

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden -m-8">
      {/* Sidebar Left: Tools */}
      <div className="w-[320px] bg-white border-r border-slate-200 flex flex-col shadow-2xl z-20 print:hidden">
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary-600" />
                Dizainr<span className="text-primary-600 text-[10px] ml-1 px-1.5 py-0.5 bg-primary-50 rounded-lg">PRO</span>
            </h2>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
              <button 
                onClick={() => setSidebarTab('elements')}
                className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", sidebarTab === 'elements' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-800")}
              >
                  Assets
              </button>
              <button 
                onClick={() => setSidebarTab('layers')}
                className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", sidebarTab === 'layers' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-800")}
              >
                  Layers
              </button>
              <button 
                onClick={() => setSidebarTab('settings')}
                className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", sidebarTab === 'settings' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-800")}
              >
                  Canvas
              </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6 custom-scrollbar pb-32">
          {sidebarTab === 'elements' && (
              <>
                {/* Background Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Template Base</label>
                        {bgImage && <button onClick={() => setBgImage(null)} className="text-[9px] font-bold text-red-500 hover:underline">Clear</button>}
                    </div>
                    <div className="relative group">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleBgUpload} accept="image/*" />
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-[28px] flex flex-col items-center justify-center gap-3 group-hover:border-primary-400 group-hover:bg-primary-50 transition-all duration-300">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary-500 group-hover:shadow-lg transition-all">
                             <ImageIcon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-500">Drop template image here</span>
                        <span className="text-[9px] text-slate-300 font-medium">PNG, JPG up to 10MB</span>
                    </div>
                    </div>
                </section>

                {/* Add elements */}
                <section className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Add New Assets</label>
                    <div className="grid grid-cols-2 gap-3">
                    <button onClick={addText} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-primary-500 rounded-[24px] transition-all gap-2 group hover:shadow-xl hover:shadow-primary-600/5">
                        <Type className="h-6 w-6 text-slate-400 group-hover:text-primary-600" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Text Box</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-primary-500 rounded-[24px] transition-all gap-2 group hover:shadow-xl hover:shadow-primary-600/5 opacity-50 cursor-not-allowed">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Decorative</span>
                    </button>
                    </div>
                </section>

                {/* Smart Fields */}
                <section className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Injection</label>
                    {['Student', 'Academic', 'Contact', 'Signatures'].map(group => (
                        <div key={group} className="space-y-1.5">
                            <span className="text-[9px] font-black text-slate-300 ml-1 mb-1 block uppercase">{group}</span>
                            <div className="grid grid-cols-1 gap-1.5">
                                {AVAILABLE_FIELDS.filter(f => f.group === group).map(f => {
                                    const Icon = f.icon;
                                    return (
                                        <button 
                                            key={f.key}
                                            onClick={() => addField(f)}
                                            className="flex items-center gap-3 p-3 bg-white border border-slate-100 hover:border-primary-500 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary-600/5 transition-all text-left group"
                                        >
                                            <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-slate-700 leading-none">{f.label}</p>
                                                <p className="text-[8px] font-mono text-slate-300 mt-1">{f.key}</p>
                                            </div>
                                            <Plus className="h-3 w-3 text-slate-200 group-hover:text-primary-500" />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </section>
              </>
          )}

          {sidebarTab === 'layers' && (
              <section className="space-y-2">
                 {sortedLayers.map((el, i) => (
                     <div 
                        key={el.id}
                        onClick={() => setSelectedId(el.id)}
                        className={cn(
                            "group p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer",
                            selectedId === el.id ? "bg-primary-50 border-primary-200" : "bg-white border-slate-100 hover:border-slate-300"
                        )}
                     >
                         <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            {el.type === 'field' ? <Hash className="h-4 w-4" /> : <Type className="h-4 w-4" />}
                         </div>
                         <div className="flex-1 min-w-0">
                             <p className="text-xs font-bold text-slate-700 truncate">{el.type === 'field' ? el.content : el.content || 'Empty Text'}</p>
                             <p className="text-[9px] text-slate-400 font-medium">Z-Index: {el.zIndex}</p>
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); moveLayer(el.id, 'up'); }} className="p-1 hover:bg-white rounded"><ArrowUp className="h-3 w-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); moveLayer(el.id, 'down'); }} className="p-1 hover:bg-white rounded"><ArrowDown className="h-3 w-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="p-1 hover:bg-red-50 text-red-500 rounded"><Trash2 className="h-3 w-3" /></button>
                         </div>
                     </div>
                 ))}
                 {elements.length === 0 && (
                     <div className="text-center py-10">
                         <Layers className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                         <p className="text-xs font-bold text-slate-400">No layers yet</p>
                     </div>
                 )}
              </section>
          )}

          {sidebarTab === 'settings' && (
              <section className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Canvas Presets</label>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            {w: 350, h: 500, label: 'Standard ID Card (Portrait)', icon: User}, 
                            {w: 500, h: 350, label: 'Standard ID Card (Landscape)', icon: User}, 
                            {w: 800, h: 600, label: 'A4 Certificate', icon: FileText},
                            {w: 1123, h: 794, label: 'Professional Award (A4 Landscape)', icon: GraduationCap}
                        ].map(opt => (
                            <button 
                                key={opt.label}
                                onClick={() => setCanvasSize({ width: opt.w, height: opt.h })}
                                className={cn(
                                    "p-4 rounded-2xl flex items-center gap-4 transition-all text-left",
                                    canvasSize.width === opt.w ? "bg-primary-600 text-white shadow-lg" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                <opt.icon className={cn("h-5 w-5", canvasSize.width === opt.w ? "text-white" : "text-slate-400")} />
                                <div>
                                    <p className="text-xs font-black">{opt.label}</p>
                                    <p className={cn("text-[9px] font-bold mt-0.5 opacity-60")}>{opt.w}px × {opt.h}px</p>
                                </div>
                            </button>
                        ))}
                    </div>
                  </div>
              </section>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md">
           <button className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary-600/40 transition-all hover:-translate-y-0.5 active:translate-y-0">
             <Save className="h-4 w-4" />
             Publish Template
           </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Toolbar */}
        <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 z-10 print:hidden">
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
               <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronLeft className="h-4 w-4 text-slate-600" /></button>
               <div className="px-5 flex items-center text-xs font-black text-slate-500 tabular-nums">{Math.round(zoom * 100)}%</div>
               <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronRight className="h-4 w-4 text-slate-600" /></button>
            </div>
            
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                 <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Status</p>
                 <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-600 uppercase">Live Designer</span>
                 </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="h-12 w-12 flex items-center justify-center bg-white border border-slate-200 rounded-[20px] hover:bg-slate-50 transition-all text-slate-600 shadow-sm">
                <Maximize2 className="h-5 w-5" />
             </button>
             <button className="flex items-center gap-3 px-8 py-3 bg-slate-900 border border-slate-800 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.15em] rounded-[20px] transition-all shadow-xl hover:shadow-2xl">
                <Download className="h-4 w-4" />
                Render & Save
             </button>
          </div>
        </div>

        {/* Canvas Workspace */}
        <div 
            className="flex-1 overflow-auto p-40 flex items-center justify-center bg-[#f8fafc] pattern-grid"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
          <div 
            ref={canvasRef}
            className="bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] relative transition-shadow duration-500 overflow-hidden"
            style={{ 
              width: canvasSize.width, 
              height: canvasSize.height,
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              backgroundImage: bgImage ? `url(${bgImage})` : 'none',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              borderRadius: '2px'
            }}
            onClick={() => selectElement(null)}
          >
            {!bgImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-5 pointer-events-none">
                    <GraduationCap className="h-48 w-48 text-slate-900" />
                    <p className="text-4xl font-black mt-4 uppercase tracking-[0.4em] text-slate-900">WORKSPACE</p>
                </div>
            )}
            
            {elements.map(el => (
              <div
                key={el.id}
                onMouseDown={(e) => handleMouseDown(e, el.id)}
                className={cn(
                  "absolute cursor-move select-none border-2 border-transparent hover:border-primary-400 group/el transition-colors",
                  selectedId === el.id && "border-primary-500 ring-2 ring-primary-500/10 z-[9999]! shadow-2xl"
                )}
                style={{
                  left: el.x,
                  top: el.y,
                  fontSize: el.fontSize,
                  fontWeight: el.fontWeight,
                  color: el.color,
                  zIndex: el.zIndex,
                  textAlign: el.textAlign,
                  fontFamily: el.fontFamily,
                  opacity: el.opacity,
                  whiteSpace: 'nowrap',
                  padding: '8px 12px',
                }}
              >
                {el.type === 'field' ? (
                    <span className="font-mono bg-primary-100/30 text-primary-900 px-2.5 py-1 rounded-lg border border-primary-200/50">
                        {el.fieldKey}
                    </span>
                ) : el.content}
                
                {selectedId === el.id && (
                  <>
                    <div className="absolute -top-3 -right-3 h-7 w-7 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary-600/30 ring-4 ring-white">
                        <Move className="h-3.5 w-3.5" />
                    </div>
                    {/* Visual drag guides */}
                    <div className="absolute -left-[2000px] right-[2000px] h-px bg-primary-500/20 top-1/2 -z-10 pointer-events-none" />
                    <div className="absolute -top-[2000px] bottom-[2000px] w-px bg-primary-500/20 left-1/2 -z-10 pointer-events-none" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Element Controls (Float Right Panel) */}
        {selectedElement && (
            <div className="absolute right-12 top-28 w-80 glass-panel p-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] z-30 animate-in slide-in-from-right-8 duration-500 rounded-[35px] border border-white/40 print:hidden">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                             <Settings className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Entity</h4>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Properties</p>
                        </div>
                    </div>
                    <button onClick={() => deleteElement(selectedElement.id)} className="h-10 w-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                             <FontIcon className="h-3 w-3 text-slate-300" />
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Typography</label>
                        </div>
                        
                        {selectedElement.type === 'text' && (
                            <input 
                                type="text" 
                                value={selectedElement.content}
                                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                                placeholder="Enter text..."
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                            />
                        )}

                        <select 
                            value={selectedElement.fontFamily}
                            onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white transition-all appearance-none"
                            style={{ fontFamily: selectedElement.fontFamily }}
                        >
                            {FONTS.map(f => (<option key={f.name} value={f.name} style={{ fontFamily: f.name }}>{f.label}</option>))}
                        </select>

                        <div className="grid grid-cols-2 gap-3">
                             <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <span className="text-[9px] text-slate-400 font-black uppercase block mb-1">Font Size</span>
                                <input 
                                    type="number" 
                                    value={selectedElement.fontSize}
                                    onChange={(e) => updateElement(selectedElement.id, { fontSize: +e.target.value })}
                                    className="w-full bg-transparent text-sm font-black text-slate-800 outline-none"
                                />
                             </div>
                             <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <span className="text-[9px] text-slate-400 font-black uppercase block mb-1">Weight</span>
                                <select 
                                    value={selectedElement.fontWeight}
                                    onChange={(e) => updateElement(selectedElement.id, { fontWeight: e.target.value })}
                                    className="w-full bg-transparent text-sm font-black text-slate-800 outline-none appearance-none"
                                >
                                    {[300, 400, 500, 600, 700, 800, 900].map(w => (
                                        <option key={w} value={w}>{w}</option>
                                    ))}
                                </select>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                             <Palette className="h-3 w-3 text-slate-300" />
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visuals</label>
                        </div>
                        <div className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <input 
                                type="color" 
                                value={selectedElement.color}
                                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                className="h-10 w-10 rounded-xl cursor-pointer border-none p-0 bg-transparent"
                            />
                            <div className="flex-1">
                                <span className="text-[9px] text-slate-400 font-black uppercase block">Hex Color</span>
                                <input 
                                    type="text" 
                                    value={selectedElement.color}
                                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                    className="w-full bg-transparent text-xs font-mono font-bold text-slate-700 outline-none"
                                />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] text-slate-400 font-black uppercase">Opacity</span>
                                <span className="text-[10px] font-black text-slate-800">{Math.round(selectedElement.opacity * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.05"
                                value={selectedElement.opacity}
                                onChange={(e) => updateElement(selectedElement.id, { opacity: +e.target.value })}
                                className="w-full accent-primary-600 h-1.5"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                         <div className="flex items-center gap-2 mb-1">
                             <AlignLeft className="h-3 w-3 text-slate-300" />
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alignment</label>
                         </div>
                         <div className="flex bg-slate-100 p-1.5 rounded-[20px] shadow-inner">
                            {[
                                {val: 'left', icon: AlignLeft}, 
                                {val: 'center', icon: AlignCenter}, 
                                {val: 'right', icon: AlignRight}
                            ].map(a => (
                                <button
                                    key={a.val}
                                    onClick={() => updateElement(selectedElement.id, { textAlign: a.val as any })}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-[15px] transition-all flex items-center justify-center",
                                        selectedElement.textAlign === a.val ? "bg-white text-primary-600 shadow-lg" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <a.icon className="h-4 w-4" />
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        )}

      </div>
      
      <style>{`
        .pattern-grid {
            background-image: 
                linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
            background-size: 40px 40px;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            box-shadow: 0 40px 100px -20px rgba(0,0,0,0.15);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
