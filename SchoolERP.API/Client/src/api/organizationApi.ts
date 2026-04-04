import apiClient from './apiClient';

export interface OrganizationSettings {
  id: string;
  name: string;
  tagline?: string;
  establishedYear?: number;
  schoolType?: string;
  boardAffiliation?: string;
  affiliationNo?: string;
  logoBase64?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  admissionNoPrefix?: string;
  studentIdFormat?: string;
  receiptPrefix?: string;
  employeeIdPrefix?: string;
  currencySymbol?: string;
  currencyCode?: string;
  dateFormat?: string;
  timeZone?: string;
}

export const organizationApi = {
  getSettings: async (): Promise<OrganizationSettings> => {
    const res = await apiClient.get('/organization/settings');
    return res.data;
  },

  updateSettings: async (data: Partial<OrganizationSettings>): Promise<{ message: string }> => {
    const res = await apiClient.post('/organization/settings/update', data);
    return res.data;
  },
};
