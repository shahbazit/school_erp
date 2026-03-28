import apiClient from './apiClient';

export interface CommunicationLog {
  id: string;
  title: string;
  message: string;
  channel: 0 | 1 | 2; // SMS = 0, Email = 1, PushNotification = 2
  recipientType?: string;
  recipientsCount: number;
  status: string;
  sentAt: string;
}

export const communicationApi = {
  getLogs: () => apiClient.get<CommunicationLog[]>('/crm/communications'),
  sendBroadcast: (data: { title: string; message: string; channel: number; recipientType?: string }) => 
    apiClient.post<CommunicationLog>('/crm/communications', data)
};
