import apiClient from './apiClient';

export interface CertificateFormatDto {
  id: string;
  templateId: string;
  paperSize: 'A4' | 'A5' | 'IDENTITY';
  perPage: 1 | 2 | 4;
  primaryColor: string;
  showLogo: boolean;
  showAddress: boolean;
  showSeal: boolean;
  logoScale: number;   // 0.5 – 2.0, applies to org logo
  headerText?: string;
  bodyText?: string;
  footerLeft?: string;
  footerRight?: string;
  updatedAt?: string;
}

export type SaveCertificateFormatDto = Omit<CertificateFormatDto, 'id' | 'updatedAt'>;

const BASE = '/api/certificate-formats';

export const certificateFormatApi = {
  /** Load all formats saved for this organisation */
  getAll: () =>
    apiClient.get<CertificateFormatDto[]>(BASE).then(r => r.data),

  getByTemplate: (templateId: string) =>
    apiClient.get<CertificateFormatDto>(`${BASE}/${templateId}`).then(r => r.data),

  save: (dto: SaveCertificateFormatDto) =>
    apiClient.post<CertificateFormatDto>(`${BASE}/save`, dto).then(r => r.data),
};
