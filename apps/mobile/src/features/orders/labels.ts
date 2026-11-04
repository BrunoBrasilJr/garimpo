import type { OrderStage } from '@garimpo/contracts';
export const statusLabel: Record<OrderStage, string> = { PENDING: 'Aguardando pagamento', PAID: 'Pago', PREPARING: 'Em separação', SEPARATED: 'Separado', SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado' };
export const methodLabel = { CARD: 'Cartão', PIX: 'Pix', BOLETO: 'Boleto' };
export const dateLabel = (value: string) => new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
