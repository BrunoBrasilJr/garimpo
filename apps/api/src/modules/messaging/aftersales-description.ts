export interface CaseNotice { id: string; action: string; state: string; deadline: string | null }

export function aftersalesDescription(kind: 'RETURN' | 'EXCHANGE', notice: CaseNotice): [string, string] {
  const label = kind === 'RETURN' ? 'Devolução' : 'Troca';
  if (notice.action === 'OPENED') return [label + ' solicitada', 'A solicitação foi registrada e aguarda análise da equipe.'];
  if (notice.action === 'OFFER') return ['Substituto disponível', 'Um substituto foi reservado para sua resposta. Confira a equivalência e responda até ' + notice.deadline + '.'];
  if (notice.state === 'AWAITING_POSTING') return [label + ' aprovada; postagem necessária', 'O retorno deve ser postado e informado até ' + notice.deadline + '. Consulte o atendimento para registrar o envio.'];
  if (notice.state === 'AWAITING_REFUND') return [label + ' aprovada', 'O atendimento aguarda autorização do administrador para estorno.'];
  if (notice.state === 'CONVERTED' || notice.action === 'WAIT_CONVERTED') return ['Troca convertida em devolução', 'A espera pelo substituto terminou. A devolução vinculada continua sujeita à conferência e autorização de estorno.'];
  if (notice.action === 'SHIPMENT') return ['Substituto enviado', 'A remessa do substituto foi registrada. Consulte o código de rastreamento no atendimento.'];
  if (notice.action === 'DELIVERY') return ['Substituto entregue', 'A entrega do substituto foi registrada e inicia a nova janela de atendimento dessa unidade.'];
  if (notice.action === 'REJECTED_SHIPMENT') return ['Original reenviado', 'A remessa de reenvio do exemplar original foi registrada. Consulte o rastreamento no atendimento.'];
  if (notice.action === 'REJECTED_DELIVERY') return ['Reenvio entregue', 'A entrega do exemplar original reenviado foi registrada.'];
  if (notice.state === 'REJECTED' || notice.state === 'REJECTED_AWAITING_SHIPMENT') return [label + ' recusada', 'A equipe registrou a recusa do atendimento. Se o original já foi recebido, acompanhe o reenvio ao cliente.'];
  if (notice.state === 'EXPIRED' || notice.state === 'CANCELLED') return [label + ' encerrada', 'O atendimento foi encerrado e as reservas vinculadas foram liberadas.'];
  return [label + ' atualizada', 'Uma decisão do atendimento foi registrada. Confira os próximos passos no pedido.'];
}
