import { useState, useEffect, useRef } from 'react';
import {
  Building2, Phone, Mail, Globe, MapPin, Hash, DollarSign,
  Calendar, Save, Upload, X, CheckCircle, AlertCircle, Camera,
  GraduationCap, FileText, Clock, ChevronRight, Info
} from 'lucide-react';
import { organizationApi, OrganizationSettings as OrganizationSettingsData } from '../api/organizationApi';
import { useLocalization } from '../contexts/LocalizationContext';

type TabId = 'general' | 'contact' | 'formats' | 'localization';

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'general', label: 'General Info', icon: Building2 },
  { id: 'contact', label: 'Contact & Address', icon: Phone },
  { id: 'formats', label: 'Academic Formats', icon: FileText },
  { id: 'localization', label: 'Localization', icon: Globe },
];

const SCHOOL_TYPES = ['Co-Educational', 'Boys Only', 'Girls Only', 'Junior School', 'Senior Secondary'];
const BOARD_AFFILIATIONS = ['CBSE', 'ICSE', 'ISC', 'State Board', 'IB', 'Cambridge (IGCSE)', 'NIOS', 'Other'];
const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Dhaka',
  'Asia/Singapore', 'Europe/London', 'America/New_York', 'America/Los_Angeles',
];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MMM-YYYY'];
const CURRENCIES = [
  { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: '€', code: 'EUR', name: 'Euro' },
  { symbol: 'AED', code: 'AED', name: 'UAE Dirham' },
  { symbol: '৳', code: 'BDT', name: 'Bangladeshi Taka' },
];

export default function OrganizationSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [settings, setSettings] = useState<OrganizationSettingsData | null>(null);
  const [draft, setDraft] = useState<Partial<OrganizationSettingsData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshSettings } = useLocalization();

  useEffect(() => {
    organizationApi.getSettings()
      .then(data => {
        setSettings(data);
        setDraft(data);
        if (data.logoBase64) setLogoPreview(data.logoBase64);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const update = (key: keyof OrganizationSettingsData, value: any) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      showToast('error', 'Logo must be smaller than 500 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setLogoPreview(base64);
      update('logoBase64', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await organizationApi.updateSettings(draft);
      setSettings({ ...settings, ...draft } as OrganizationSettingsData);
      await refreshSettings();
      showToast('success', 'Organization settings saved successfully!');
    } catch (e: any) {
      showToast('error', e?.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const InputField = ({ label, value, onChange, placeholder, type = 'text', icon }: any) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">{icon}</div>}
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(type === 'number' ? (e.target.value ? parseInt(e.target.value) : null) : e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-sm text-slate-800 py-2.5 pr-4 ${icon ? 'pl-9' : 'pl-4'}`}
        />
      </div>
    </div>
  );

  const SelectField = ({ label, value, onChange, options, icon }: any) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">{icon}</div>}
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-sm text-slate-800 py-2.5 pr-4 appearance-none ${icon ? 'pl-9' : 'pl-4'}`}
        >
          <option value="">-- Select --</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 font-bold text-xs tracking-widest uppercase mb-1.5">
            <div className="p-1.5 bg-primary-100 rounded-lg"><Building2 className="h-3.5 w-3.5" /></div>
            <span>Organization</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Organization Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure your school's identity, contact info, and system preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-bold shadow-lg shadow-primary-500/25 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {saving
            ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save className="h-4 w-4" />}
          Save Settings
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            : <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />}
          {toast.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <nav className="glass-card p-2 space-y-0.5">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                </button>
              );
            })}
          </nav>

          {/* Logo Preview Card */}
          <div className="glass-card p-4 mt-4 text-center space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">School Logo</p>
            <div className="relative mx-auto h-24 w-24">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-24 w-24 rounded-2xl object-cover ring-2 ring-slate-100 shadow-md" />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-primary-500" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors"
                title="Upload logo"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            {logoPreview && (
              <button
                onClick={() => { setLogoPreview(null); update('logoBase64', ''); }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium mx-auto transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            )}
            <p className="text-[10px] text-slate-400">PNG or JPG, max 500 KB</p>
          </div>
        </div>

        {/* Main Content Panel */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6">

            {/* ─── GENERAL INFO ─── */}
            {activeTab === 'general' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Building2 className="h-5 w-5 text-primary-500" />
                  <h2 className="font-bold text-slate-800">General Information</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <InputField
                      label="School Name *"
                      value={draft.name}
                      onChange={(v: any) => update('name', v)}
                      placeholder="e.g. St. Xavier's High School"
                      icon={<GraduationCap className="h-4 w-4" />}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <InputField
                      label="School Tagline / Motto"
                      value={draft.tagline}
                      onChange={(v: any) => update('tagline', v)}
                      placeholder="e.g. Excellence in Education"
                    />
                  </div>
                  <InputField
                    label="Established Year"
                    value={draft.establishedYear}
                    onChange={(v: any) => update('establishedYear', v)}
                    placeholder="e.g. 1985"
                    type="number"
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  <SelectField
                    label="School Type"
                    value={draft.schoolType}
                    onChange={(v: string) => update('schoolType', v)}
                    options={SCHOOL_TYPES}
                    icon={<Building2 className="h-4 w-4" />}
                  />
                  <SelectField
                    label="Board Affiliation"
                    value={draft.boardAffiliation}
                    onChange={(v: string) => update('boardAffiliation', v)}
                    options={BOARD_AFFILIATIONS}
                    icon={<GraduationCap className="h-4 w-4" />}
                  />
                  <InputField
                    label="Affiliation Number"
                    value={draft.affiliationNo}
                    onChange={(v: any) => update('affiliationNo', v)}
                    placeholder="e.g. 2730087"
                    icon={<Hash className="h-4 w-4" />}
                  />
                </div>
              </div>
            )}

            {/* ─── CONTACT & ADDRESS ─── */}
            {activeTab === 'contact' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Phone className="h-5 w-5 text-primary-500" />
                  <h2 className="font-bold text-slate-800">Contact & Address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField
                    label="Primary Phone"
                    value={draft.phone}
                    onChange={(v: any) => update('phone', v)}
                    placeholder="e.g. +91 98765 43210"
                    icon={<Phone className="h-4 w-4" />}
                  />
                  <InputField
                    label="Alternate Phone"
                    value={draft.alternatePhone}
                    onChange={(v: any) => update('alternatePhone', v)}
                    placeholder="e.g. +91 11 2345 6789"
                    icon={<Phone className="h-4 w-4" />}
                  />
                  <InputField
                    label="Official Email"
                    value={draft.email}
                    onChange={(v: any) => update('email', v)}
                    placeholder="e.g. info@school.edu.in"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                  />
                  <InputField
                    label="Website"
                    value={draft.website}
                    onChange={(v: any) => update('website', v)}
                    placeholder="e.g. https://www.school.edu.in"
                    icon={<Globe className="h-4 w-4" />}
                  />
                </div>

                <div className="pt-2 border-t border-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Address</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <InputField
                        label="Street Address"
                        value={draft.address}
                        onChange={(v: any) => update('address', v)}
                        placeholder="Building / Street / Area"
                        icon={<MapPin className="h-4 w-4" />}
                      />
                    </div>
                    <InputField
                      label="City"
                      value={draft.city}
                      onChange={(v: any) => update('city', v)}
                      placeholder="e.g. Mumbai"
                    />
                    <InputField
                      label="State / Province"
                      value={draft.state}
                      onChange={(v: any) => update('state', v)}
                      placeholder="e.g. Maharashtra"
                    />
                    <InputField
                      label="Country"
                      value={draft.country}
                      onChange={(v: any) => update('country', v)}
                      placeholder="e.g. India"
                    />
                    <InputField
                      label="PIN / Postal Code"
                      value={draft.pinCode}
                      onChange={(v: any) => update('pinCode', v)}
                      placeholder="e.g. 400001"
                      icon={<Hash className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── ACADEMIC FORMATS ─── */}
            {activeTab === 'formats' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FileText className="h-5 w-5 text-primary-500" />
                  <h2 className="font-bold text-slate-800">Academic Format Settings</h2>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700">
                    These prefixes are used when auto-generating IDs and receipt numbers across the system.
                    Changing them won't affect existing records.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <InputField
                      label="Admission Number Prefix"
                      value={draft.admissionNoPrefix}
                      onChange={(v: any) => update('admissionNoPrefix', v)}
                      placeholder="e.g. ADM"
                      icon={<Hash className="h-4 w-4" />}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Preview:</span>
                      <span className="text-[11px] font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg">
                        {draft.admissionNoPrefix || 'ADM'}/2024-25/0001
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <InputField
                      label="Student ID Format"
                      value={draft.studentIdFormat}
                      onChange={(v: any) => update('studentIdFormat', v)}
                      placeholder="e.g. YYYY-NN"
                      icon={<Hash className="h-4 w-4" />}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Preview:</span>
                      <span className="text-[11px] font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg">
                        2024-0001
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <InputField
                      label="Fee Receipt Prefix"
                      value={draft.receiptPrefix}
                      onChange={(v: any) => update('receiptPrefix', v)}
                      placeholder="e.g. RCP"
                      icon={<FileText className="h-4 w-4" />}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Preview:</span>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                        {draft.receiptPrefix || 'RCP'}-20240001
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <InputField
                      label="Employee ID Prefix"
                      value={draft.employeeIdPrefix}
                      onChange={(v: any) => update('employeeIdPrefix', v)}
                      placeholder="e.g. EMP"
                      icon={<Hash className="h-4 w-4" />}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Preview:</span>
                      <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg">
                        {draft.employeeIdPrefix || 'EMP'}-0021
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── LOCALIZATION ─── */}
            {activeTab === 'localization' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Globe className="h-5 w-5 text-primary-500" />
                  <h2 className="font-bold text-slate-800">Localization & Regional Settings</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Currency */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Currency</label>
                    <div className="space-y-2">
                      {CURRENCIES.map(c => (
                        <label
                          key={c.code}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            draft.currencyCode === c.code
                              ? 'border-primary-400 bg-primary-50/70 shadow-sm'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="currency"
                            value={c.code}
                            checked={draft.currencyCode === c.code}
                            onChange={() => { update('currencyCode', c.code); update('currencySymbol', c.symbol); }}
                            className="accent-primary-600"
                          />
                          <span className="font-bold text-slate-700 w-8 text-center font-mono">{c.symbol}</span>
                          <span className="text-sm text-slate-600">{c.name}</span>
                          <span className="ml-auto text-[10px] text-slate-400 font-mono">{c.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Date Format */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Date Format
                      </label>
                      <div className="space-y-2">
                        {DATE_FORMATS.map(fmt => (
                          <label
                            key={fmt}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              draft.dateFormat === fmt
                                ? 'border-primary-400 bg-primary-50/70 shadow-sm'
                                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="dateFormat"
                              value={fmt}
                              checked={draft.dateFormat === fmt}
                              onChange={() => update('dateFormat', fmt)}
                              className="accent-primary-600"
                            />
                            <span className="font-mono text-sm text-slate-700">{fmt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Timezone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Timezone
                      </label>
                      <select
                        value={draft.timeZone || ''}
                        onChange={e => update('timeZone', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-sm text-slate-800 py-2.5 px-4"
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Save Bar */}
          <div className="glass-card px-6 py-4 flex items-center justify-between gap-4 border-t-2 border-primary-100">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Changes apply organization-wide after saving.
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-6 py-2 text-sm font-bold active:scale-95 transition-all disabled:opacity-70"
            >
              {saving
                ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Save className="h-4 w-4" />}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
