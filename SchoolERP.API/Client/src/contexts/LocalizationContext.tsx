import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { organizationApi, OrganizationSettings } from '../api/organizationApi';

interface LocalizationContextType {
  settings: OrganizationSettings | null;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const token = localStorage.getItem('token');
    const organizationId = localStorage.getItem('organizationId');

    if (!token || !organizationId) {
      setLoading(false);
      return;
    }

    try {
      const data = await organizationApi.getSettings();
      setSettings(data);
    } catch (err: any) {
      // 401/404 are handled by apiClient interceptor
      if (err.response?.status !== 401 && err.response?.status !== 404) {
        console.error('Failed to fetch localization settings:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const formatCurrency = (amount: number) => {
    const symbol = settings?.currencySymbol || '₹';
    const code = settings?.currencyCode || 'INR';
    
    // We use Intl.NumberFormat for thousands separator
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);

    return `${symbol}${formatted}`;
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';

    const format = settings?.dateFormat || 'DD/MM/YYYY';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return format
      .replace('DD', day)
      .replace('MMM', monthNames[d.getMonth()])
      .replace('MM', month)
      .replace('YYYY', String(year));
  };

  return (
    <LocalizationContext.Provider value={{ 
      settings, 
      formatCurrency, 
      formatDate, 
      isLoading: loading,
      refreshSettings: fetchSettings 
    }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}
