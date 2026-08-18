export interface Notification {
  id?: number;
  title: string;
  message: string;
  recipient: string;
  notification_type: string;
  status?: string;
  created_at?: string;
}