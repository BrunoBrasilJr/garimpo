const states: Record<string, string> = {
  REQUESTED: 'Em análise', AWAITING_POSTING: 'Aguardando postagem', IN_TRANSIT: 'Retorno em trânsito',
  AWAITING_REFUND: 'Aguardando autorização do estorno', WAITING_SUBSTITUTE: 'Aguardando substituto',
  REJECTED: 'Solicitação recusada', REJECTED_AWAITING_SHIPMENT: 'Aguardando reenvio do original',
  REJECTED_IN_TRANSIT: 'Reenvio em trânsito', REJECTED_DELIVERED: 'Reenvio entregue', COMPLETED: 'Devolução concluída',
  CANCELLED: 'Cancelada', EXPIRED: 'Prazo encerrado', CONVERTED: 'Convertida em devolução',
  SHIPPED: 'Substituto enviado', DELIVERED: 'Substituto entregue',
  OFFERED: 'Aguardando resposta', ACCEPTED: 'Aceita', RELEASED: 'Reserva liberada'
};
export const stateLabel = (state: string) => states[state] ?? state;
