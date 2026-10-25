export interface AccessRequestAccepted { message: string }
export interface RestrictedMessage {
  id: string; type: string; status: 'PENDING' | 'FAILED' | 'DELIVERED'; attempts: number; deliveredAt: string | null;
  content: { recipient: string; purpose: string; link: string; expiresAt: string };
}
