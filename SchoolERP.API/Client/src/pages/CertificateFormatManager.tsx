import { useState, useEffect, useRef } from 'react';
import {
  Save, Award, Contact, FileText, GraduationCap,
  Check, Loader2, User, AlertCircle
} from 'lucide-react';
import { certificateFormatApi, CertificateFormatDto, SaveCertificateFormatDto } from '../api/certificateFormatApi';
import { organizationApi, OrganizationSettings } from '../api/organizationApi';

// ── Certificate type definitions ─────────────────────────────────────────────
const CERT_TYPES = [
  { id: 'ID_CARD_V',  label: 'ID Card – Vertical',         icon: Contact,       defaultPerPage: 4  as 1|2|4 },
  { id: 'ID_CARD_H',  label: 'ID Card – Horizontal',        icon: Contact,       defaultPerPage: 4  as 1|2|4 },
  { id: 'BONAFIDE',   label: 'Bonafide Certificate',         icon: FileText,      defaultPerPage: 1  as 1|2|4 },
  { id: 'CHARACTER',  label: 'Character Certificate',        icon: Award,         defaultPerPage: 1  as 1|2|4 },
  { id: 'LEAVING',    label: 'School Leaving Certificate',   icon: GraduationCap, defaultPerPage: 1  as 1|2|4 },
];

const PER_PAGE_OPTS = [
  { value: 1 as const, label: 'Full Page' },
  { value: 2 as const, label: 'Half Page' },
  { value: 4 as const, label: 'Quarter Page' },
];

function blankFormat(typeId: string): SaveCertificateFormatDto {
  const tpl = CERT_TYPES.find(t => t.id === typeId)!;
  return {
    templateId:   typeId,
    paperSize:    'A4',
    perPage:      tpl.defaultPerPage,
    primaryColor: '#4f46e5',
    showLogo:     true,
    showAddress:  true,
    showSeal:     true,
    logoScale:    1.0,
    headerText:   '',
    bodyText:     '',
    footerLeft:   '',
    footerRight:  '',
  };
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full py-2.5 px-3 rounded-xl border bg-white hover:bg-slate-50 transition-all"
    >
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className={`h-5 w-10 rounded-full p-0.5 transition-colors flex items-center ${value ? 'bg-primary-600' : 'bg-slate-200'}`}>
        <div className={`h-4 w-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
      </div>
    </button>
  );
}

// ── Mini document preview ─────────────────────────────────────────────────────
function DocPreview({ fmt, orgLogo, orgName }: { fmt: SaveCertificateFormatDto; orgLogo?: string; orgName?: string }) {
  const isCard = fmt.templateId.startsWith('ID_CARD');
  const logoH = Math.round(fmt.logoScale * 20); // scaled pixel height

  const CardContent = () => (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-lg ring-1 ring-black/10 flex flex-col ${
        fmt.templateId === 'ID_CARD_H' ? 'w-[172px] h-[108px]' : 'w-[108px] h-[172px]'
      }`}
    >
      {fmt.templateId === 'ID_CARD_H' ? (
        <>
          <div className="h-8 flex items-center gap-2 px-3 text-white" style={{ background: '#111827' }}>
            {fmt.showLogo && (
              orgLogo
                ? <img src={orgLogo} alt="logo" className="object-contain rounded" style={{ height: logoH, maxWidth: 24 }} />
                : <GraduationCap className="h-3 w-3 opacity-60" />
            )}
            <p className="text-[6px] font-black uppercase truncate">{orgName || 'School Name'}</p>
          </div>
          <div className="flex-1 flex gap-2 p-2 bg-white">
            <div className="h-14 w-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <User className="h-7 w-7 text-slate-300" />
            </div>
            <div className="flex-1">
              <p className="text-[7px] font-black text-slate-800">Student Name</p>
              <p className="text-[5px] text-slate-400 font-bold">{fmt.headerText || 'Enrollment Card'}</p>
              <div className="mt-1 space-y-0.5">
                {['Class', 'Valid'].map(l => (
                  <div key={l} className="flex gap-1">
                    <span className="text-[4px] text-slate-300 uppercase">{l}</span>
                    <span className="text-[4px] text-slate-600 font-bold">—</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="h-1.5" style={{ background: fmt.primaryColor }} />
        </>
      ) : (
        <>
          <div className="flex flex-col items-center pt-3 pb-2 text-white" style={{ background: fmt.primaryColor }}>
            {fmt.showLogo && (
              orgLogo
                ? <img src={orgLogo} alt="logo" className="object-contain rounded mb-0.5" style={{ height: logoH, maxWidth: 32 }} />
                : <GraduationCap className="opacity-70 mb-0.5" style={{ height: logoH }} />
            )}
            <p className="text-[5px] font-black uppercase text-center px-2 leading-tight opacity-90">{orgName || 'School Name'}</p>
          </div>
          <div className="flex-1 flex flex-col items-center px-2 pt-2 bg-white">
            <div className="h-10 w-10 rounded-lg bg-slate-100 border-2 border-white shadow flex items-center justify-center">
              <User className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-[6px] font-black text-slate-800 mt-1 uppercase">Student Name</p>
            <p className="text-[5px] font-bold px-1 py-0.5 rounded-full mt-0.5" style={{ color: fmt.primaryColor, background: `${fmt.primaryColor}20` }}>
              {fmt.headerText || 'STUDENT ID'}
            </p>
            <div className="w-full mt-1.5 space-y-0.5 border-t border-slate-100 pt-1.5">
              {['Adm No', 'Class', 'DOB'].map(l => (
                <div key={l} className="flex justify-between">
                  <span className="text-[4px] text-slate-400 uppercase">{l}</span>
                  <span className="text-[5px] text-slate-700 font-black">—</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-2 flex justify-between items-end bg-white">
            <div className="h-4 w-4 bg-slate-100 rounded" />
            <div className="text-right">
              <div className="h-px w-8 bg-slate-300 mb-0.5" />
              <p className="text-[4px] text-slate-400 uppercase">{fmt.footerRight || 'Principal'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const DocContent = () => (
    <div className="w-[150px] min-h-[210px] bg-white rounded-lg shadow-xl ring-1 ring-black/10 flex flex-col p-3 gap-2">
      <div className="border-b pb-2 flex items-start gap-1.5">
        {fmt.showLogo && (
          orgLogo
            ? <img src={orgLogo} alt="logo" className="object-contain rounded" style={{ height: logoH, maxWidth: 24 }} />
            : <GraduationCap className="shrink-0" style={{ height: logoH, color: fmt.primaryColor }} />
        )}
        <div>
          <p className="text-[6px] font-black leading-tight" style={{ color: fmt.primaryColor }}>{orgName || 'School Name'}</p>
          {fmt.showAddress && <p className="text-[4px] text-slate-400 mt-0.5">123 Main Street, City</p>}
        </div>
      </div>
      <p className="text-[7px] font-black text-slate-800 text-center underline underline-offset-2 uppercase">
        {fmt.headerText || fmt.templateId.replace(/_/g, ' ')}
      </p>
      <div className="flex-1 text-[5px] text-slate-500 leading-relaxed text-justify">
        {(fmt.bodyText || 'This is to certify that [Name] is a bonafide student of Class [Class] during [Session]...').slice(0, 160)}
      </div>
      <div className="border-t pt-1.5 flex justify-between items-end">
        <div>
          <div className="h-px w-10 bg-slate-300 mb-0.5" />
          <p className="text-[4px] text-slate-400 uppercase">{fmt.footerLeft || 'Class Teacher'}</p>
        </div>
        {fmt.showSeal && (
          <div className="h-6 w-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
            <p className="text-[4px] text-slate-300">SEAL</p>
          </div>
        )}
        <div className="text-right">
          <div className="h-px w-10 bg-slate-800 mb-0.5" />
          <p className="text-[4px] text-slate-700 uppercase">{fmt.footerRight || 'Principal'}</p>
        </div>
      </div>
    </div>
  );

  if (isCard) {
    if (fmt.perPage === 1) return <CardContent />;
    if (fmt.perPage === 2)
      return (
        <div className="flex flex-col items-center gap-2">
          <CardContent /><div className="border-t border-dashed border-slate-300 w-48" /><CardContent />
        </div>
      );
    return (
      <div className="grid grid-cols-2 gap-2">
        {[0,1,2,3].map(i => <CardContent key={i} />)}
      </div>
    );
  }

  if (fmt.perPage === 1) return <DocContent />;
  if (fmt.perPage === 2)
    return (
      <div className="flex flex-col items-center gap-2">
        <DocContent /><div className="border-t border-dashed border-slate-300 w-48" /><DocContent />
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-2">
      {[0,1,2,3].map(i => <DocContent key={i} />)}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CertificateFormatManager() {
  const [selectedTypeId, setSelectedTypeId] = useState('ID_CARD_V');
  const [savedMap, setSavedMap] = useState<Record<string, CertificateFormatDto>>({});
  const [fmt, setFmt] = useState<SaveCertificateFormatDto>(blankFormat('ID_CARD_V'));
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load org settings + all saved formats on mount
  useEffect(() => {
    Promise.all([
      organizationApi.getSettings(),
      certificateFormatApi.getAll().catch(() => [] as CertificateFormatDto[]),
    ]).then(([org, formats]) => {
      setOrgSettings(org);
      const map: Record<string, CertificateFormatDto> = {};
      formats.forEach(f => { map[f.templateId] = f; });
      setSavedMap(map);
      // Apply the first type
      const existing = map['ID_CARD_V'];
      setFmt(existing ? toSaveDto(existing) : blankFormat('ID_CARD_V'));
    }).finally(() => setLoading(false));
  }, []);

  // When user clicks a type tab
  const handleTypeChange = (typeId: string) => {
    setSelectedTypeId(typeId);
    const existing = savedMap[typeId];
    setFmt(existing ? toSaveDto(existing) : blankFormat(typeId));
    setSaveState('idle');
  };

  const update = (patch: Partial<SaveCertificateFormatDto>) => {
    setFmt(prev => ({ ...prev, ...patch }));
    setSaveState('idle');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await certificateFormatApi.save({ ...fmt, templateId: selectedTypeId });
      setSavedMap(prev => ({ ...prev, [selectedTypeId]: saved }));
      setSaveState('saved');
    } catch {
      setSaveState('error');
    } finally {
      setSaving(false);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  const currentType = CERT_TYPES.find(t => t.id === selectedTypeId)!;
  const isIDCard = selectedTypeId.startsWith('ID_CARD');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-primary-600" />
            Certificate Formats
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure design, text & layout for each certificate type. Saved to database per organisation.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg min-w-[150px] justify-center ${
            saveState === 'saved'  ? 'bg-emerald-500 text-white shadow-emerald-500/30' :
            saveState === 'error'  ? 'bg-red-500 text-white shadow-red-500/30' :
                                     'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/30'
          }`}
        >
          {saving         ? <Loader2 className="h-4 w-4 animate-spin" /> :
           saveState === 'saved'  ? <><Check className="h-4 w-4" /> Saved to DB</> :
           saveState === 'error'  ? <><AlertCircle className="h-4 w-4" /> Save Failed</> :
                                    <><Save className="h-4 w-4" /> Save Format</>}
        </button>
      </div>

      {/* Certificate Type Tab Bar */}
      <div className="glass-card p-1 shadow-lg inline-flex rounded-2xl gap-1 w-full overflow-x-auto">
        {CERT_TYPES.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => handleTypeChange(t.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 relative ${
                selectedTypeId === t.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t.label}
              {savedMap[t.id] && (
                <span className={`w-1.5 h-1.5 rounded-full ${selectedTypeId === t.id ? 'bg-white/60' : 'bg-emerald-400'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left Controls */}
        <div className="lg:col-span-3 space-y-5">

          {/* Print Layout */}
          <div className="glass-card p-5 space-y-5 shadow-lg">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Print Layout — {currentType.label}
            </h3>

            {/* Per Page Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Page Layout</label>
              <div className="grid grid-cols-3 gap-2">
                {PER_PAGE_OPTS.map(o => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => update({ perPage: o.value })}
                    className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                      fmt.perPage === o.value
                        ? 'bg-primary-600 border-primary-700 text-white shadow-lg'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`mx-auto mb-1.5 border-2 rounded ${
                      o.value === 1 ? 'w-5 h-7 border-current' :
                      o.value === 2 ? 'w-7 h-5 border-current grid grid-cols-2 gap-px p-0.5' :
                                      'w-7 h-7 border-current grid grid-cols-2 gap-px p-0.5'
                    }`}>
                      {o.value > 1 && [...Array(o.value)].map((_, i) => (
                        <div key={i} className="bg-current opacity-30 rounded-sm" />
                      ))}
                    </div>
                    {o.value === 1 ? 'Full Page' : o.value === 2 ? 'Half Page' : 'Quarter Page'}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Brand / Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={fmt.primaryColor}
                  onChange={e => update({ primaryColor: e.target.value })}
                  className="h-11 w-16 rounded-xl cursor-pointer border-2 border-slate-200 p-1"
                />
                <input
                  type="text"
                  value={fmt.primaryColor}
                  onChange={e => update({ primaryColor: e.target.value })}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Display toggles */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Display Options</label>
              <div className="space-y-1.5">
                <Toggle value={fmt.showLogo}    onChange={v => update({ showLogo: v })}    label="Show Organisation Logo" />
                <Toggle value={fmt.showAddress} onChange={v => update({ showAddress: v })} label="Show Address Line" />
                {!isIDCard && <Toggle value={fmt.showSeal} onChange={v => update({ showSeal: v })} label="Include Official Seal" />}
              </div>
            </div>

            {/* Logo Size — applied to the org logo */}
            {fmt.showLogo && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">Logo Size</label>
                  <span className="text-xs font-black text-slate-700">{Math.round(fmt.logoScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={200}
                  step={5}
                  value={Math.round(fmt.logoScale * 100)}
                  onChange={e => update({ logoScale: +e.target.value / 100 })}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>50%</span><span>100%</span><span>200%</span>
                </div>
                {/* Live logo preview */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {orgSettings?.logoBase64 ? (
                    <img
                      src={orgSettings.logoBase64}
                      alt="Org Logo"
                      className="object-contain rounded"
                      style={{ height: Math.round(fmt.logoScale * 40) }}
                    />
                  ) : (
                    <div className="flex items-center justify-center bg-slate-200 rounded" style={{ height: Math.round(fmt.logoScale * 40), width: Math.round(fmt.logoScale * 40) }}>
                      <GraduationCap className="text-slate-400" style={{ height: Math.round(fmt.logoScale * 24) }} />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-700">{orgSettings?.name || 'Organisation Name'}</p>
                    {!orgSettings?.logoBase64 && <p className="text-[10px] text-slate-400">No logo set — go to Organisation Settings</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Text Customization */}
          <div className="glass-card p-5 space-y-4 shadow-lg">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Text Customization</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">
                {isIDCard ? 'Card Sub-Label (badge text)' : 'Document Title / Header'}
              </label>
              <input
                type="text"
                value={fmt.headerText ?? ''}
                onChange={e => update({ headerText: e.target.value })}
                placeholder={isIDCard ? 'e.g. STUDENT IDENTITY CARD' : 'e.g. BONAFIDE CERTIFICATE'}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white outline-none transition-all"
              />
            </div>

            {!isIDCard && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">Body Content</label>
                  <span className="text-[10px] text-primary-600 font-bold bg-primary-50 px-2 py-1 rounded-full">
                    [Name]  [AdmissionNo]  [Class]  [Session]
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={fmt.bodyText ?? ''}
                  onChange={e => update({ bodyText: e.target.value })}
                  placeholder="Write the certificate body. Use [Name], [Class], [Session], [AdmissionNo] as smart placeholders..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white outline-none transition-all leading-relaxed resize-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {!isIDCard && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Footer Left</label>
                  <input
                    type="text"
                    value={fmt.footerLeft ?? ''}
                    onChange={e => update({ footerLeft: e.target.value })}
                    placeholder="Class Teacher"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white outline-none"
                  />
                </div>
              )}
              <div className={`space-y-1.5 ${isIDCard ? 'col-span-2' : ''}`}>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  {isIDCard ? 'Signature Authority' : 'Footer Right'}
                </label>
                <input
                  type="text"
                  value={fmt.footerRight ?? ''}
                  onChange={e => update({ footerRight: e.target.value })}
                  placeholder="Principal"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-4">
            <div className="glass-card p-6 shadow-xl flex flex-col gap-4 min-h-[520px]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Preview</h3>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary-50 text-primary-600">
                  A4 · {fmt.perPage}/page
                </span>
              </div>
              <div className="flex-1 bg-slate-100 rounded-2xl flex items-center justify-center p-4 min-h-[370px]">
                <DocPreview
                  fmt={fmt}
                  orgLogo={orgSettings?.logoBase64 ?? undefined}
                  orgName={orgSettings?.name ?? undefined}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center font-medium">
                {fmt.perPage} document{fmt.perPage > 1 ? 's' : ''} per A4 sheet when printing
              </p>
            </div>

            {/* Summary */}
            <div className="glass-card p-4 shadow-md">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Saved Format Summary</p>
              <div className="space-y-2">
                {[
                  { label: 'Type',     value: currentType.label },
                  { label: 'Per Page', value: `${fmt.perPage}` },
                  { label: 'Color',    value: fmt.primaryColor },
                  { label: 'Logo',     value: fmt.showLogo ? `Visible (${Math.round(fmt.logoScale * 100)}%)` : 'Hidden' },
                  { label: 'Seal',     value: fmt.showSeal ? 'Visible' : 'Hidden' },
                  { label: 'Saved',    value: savedMap[selectedTypeId]?.updatedAt
                    ? new Date(savedMap[selectedTypeId].updatedAt!).toLocaleString()
                    : 'Not yet saved' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">{r.label}</span>
                    <span className="text-slate-700 font-black truncate max-w-[130px] text-right">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────
function toSaveDto(d: CertificateFormatDto): SaveCertificateFormatDto {
  return {
    templateId:   d.templateId,
    paperSize:    d.paperSize,
    perPage:      d.perPage,
    primaryColor: d.primaryColor,
    showLogo:     d.showLogo,
    showAddress:  d.showAddress,
    showSeal:     d.showSeal,
    logoScale:    d.logoScale,
    headerText:   d.headerText,
    bodyText:     d.bodyText,
    footerLeft:   d.footerLeft,
    footerRight:  d.footerRight,
  };
}
