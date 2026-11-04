import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { DomainEvent } from '../../persistence/generated/client.ts';
import { serializable } from '../../persistence/transaction.ts';
import { appendAudit } from '../../core/audit.ts';
import type { AccessMessages } from './service.ts';
import { shipmentView } from '../orders/history.ts';
const payload = z.object({ userId: z.string().uuid(), orderId: z.string().uuid().nullable().optional(), paymentAttemptId: z.string().uuid().optional(), refundId: z.string().uuid().optional(), shipmentId: z.string().uuid().optional() }).strict();
const descriptions: Record<string, [string, string]> = {
  'ORDER.CREATED': ['Pedido criado', 'Seu pedido foi registrado. Confira os dados e, se estiver pendente, o prazo de pagamento.'],
  'ORDER.EXPIRED': ['Pedido cancelado por vencimento', 'O prazo de pagamento terminou. A reserva foi liberada. Um pagamento tardio será estornado.'],
  'ORDER.CANCELLED': ['Pedido pendente cancelado', 'O pedido aguardando pagamento foi cancelado por bloqueio ou encerramento da conta. A reserva foi liberada; um pagamento recebido depois será conciliado para estorno.'],
  'ORDER.CANCELLED_DIRECT': ['Pedido cancelado', 'O pedido foi cancelado. Consulte as unidades canceladas e acompanhe o estorno, quando aplicável.'],
  'ORDER.PARTIAL_CANCELLATION': ['Pedido atualizado', 'Uma ou mais unidades foram canceladas. Consulte as unidades remanescentes e a cobrança ou o estorno correspondente.'],
  'RETURN.UPDATED': ['Devolução atualizada', 'Consulte o atendimento de devolução para conferir a etapa atual e os próximos passos.'],
  'ORDER.SHIPPED': ['Pedido enviado', 'A postagem da remessa original foi registrada. Consulte o código de rastreamento e a data efetiva no pedido.'],
  'ORDER.DELIVERED': ['Pedido entregue', 'A entrega efetiva foi registrada. Consulte seu pedido e o prazo de atendimento.'],
  'PAYMENT.PAID': ['Pagamento confirmado', 'O pagamento foi confirmado e o pedido está pago.'],
  'PAYMENT.DECLINED': ['Pagamento recusado', 'A tentativa foi recusada. Confira a finalização e tente outro método dentro do prazo original.'],
  'PAYMENT.REFUND_REQUIRED': ['Pagamento encaminhado para estorno', 'Este pagamento não confirmou uma compra válida. Acompanhe o estorno.'],
  'REFUND.PENDING': ['Estorno pendente', 'A obrigação de estorno foi registrada e aguarda resultado.'],
  'REFUND.FAILED': ['Falha no estorno', 'O estorno ainda não foi concluído. A pendência continua visível para nova tentativa pelo sistema ou administrador.'],
  'REFUND.SUCCEEDED': ['Estorno concluído', 'O simulador confirmou a restituição deste pagamento.']
};
export async function consumeCommerce(messages: AccessMessages): Promise<'EMPTY' | 'PROCESSED' | 'FAILED'> {
  const { db, clock } = messages.accounts;
  return serializable(db, async tx => {
    const rows = await tx.$queryRaw<DomainEvent[]>`SELECT * FROM "DomainEvent" WHERE "processedAt" IS NULL AND type IN ('ORDER.CREATED','ORDER.EXPIRED','ORDER.CANCELLED','ORDER.CANCELLED_DIRECT','ORDER.PARTIAL_CANCELLATION','ORDER.SHIPPED','ORDER.DELIVERED','RETURN.UPDATED','PAYMENT.PAID','PAYMENT.DECLINED','PAYMENT.REFUND_REQUIRED','REFUND.PENDING','REFUND.FAILED','REFUND.SUCCEEDED') ORDER BY attempts,"createdAt",id FOR UPDATE SKIP LOCKED LIMIT 1`;
    const event = rows[0]; if (!event) return 'EMPTY';
    await tx.domainEvent.update({ where: { id: event.id }, data: { attempts: { increment: 1 } } }); await tx.$executeRawUnsafe('SAVEPOINT commerce_message');
    try {
      const value = payload.parse(event.payload), user = await tx.user.findUniqueOrThrow({ where: { id: value.userId } });
      const order = value.orderId ? await tx.order.findUniqueOrThrow({ where: { id: value.orderId } }) : null;
      const payment = value.paymentAttemptId ? await tx.paymentAttempt.findUniqueOrThrow({ where: { id: value.paymentAttemptId } }) : null;
      const refund = value.refundId ? await tx.refund.findUniqueOrThrow({ where: { id: value.refundId }, include: { paymentAttempt: true } }) : null;
      const shipment = value.shipmentId ? await tx.shipment.findUniqueOrThrow({ where: { id: value.shipmentId } }) : null;
      if (shipment && (shipment.orderId !== order?.id || shipment.kind !== 'ORIGINAL') || ['ORDER.SHIPPED', 'ORDER.DELIVERED'].includes(event.type) && !shipment || event.type === 'ORDER.DELIVERED' && !shipment?.deliveredAt) throw new Error('Shipment event facts unavailable.');
      if ((event.type.startsWith('ORDER.') && event.aggregateId !== order?.id) || (event.type.startsWith('PAYMENT.') && event.aggregateId !== payment?.id) || (event.type.startsWith('REFUND.') && event.aggregateId !== refund?.id) || order && order.userId !== user.id || payment && payment.userId !== user.id || refund && refund.paymentAttempt.userId !== user.id) throw new Error('Commercial message ownership mismatch.');
      const id = randomUUID(), dedupKey = 'commerce:' + event.id, description = descriptions[event.type]; if (!description) throw new Error('Unknown commercial event.');
      if (!await tx.demoMessage.findUnique({ where: { dedupKey } })) await tx.demoMessage.create({ data: { id, userId: user.id, eventId: event.id, type: 'COMMERCE.' + event.type, dedupKey, restrictedBody: messages.protection.seal(id, JSON.stringify({ recipient: user.emailNormalized, purpose: event.type, title: description[0], message: description[1], ...value, ...(shipment ? { shipment: { ...shipmentView(shipment), deliveredAt: event.type === 'ORDER.SHIPPED' ? null : shipment.deliveredAt?.toISOString() ?? null } } : {}), notice: 'Simulação acadêmica; nenhuma movimentação financeira real.', link: value.orderId ? `${messages.webOrigin}/#/orders?id=${value.orderId}` : `${messages.webOrigin}/#/payments` })), createdAt: clock.now() } });
      await tx.domainEvent.update({ where: { id: event.id }, data: { processedAt: clock.now(), lastErrorCode: null } }); await tx.$executeRawUnsafe('RELEASE SAVEPOINT commerce_message'); return 'PROCESSED';
    } catch { await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT commerce_message'); await tx.domainEvent.update({ where: { id: event.id }, data: { lastErrorCode: 'COMMERCE_PREPARATION_FAILED' } }); await appendAudit(tx, { action: 'COMMERCE.PREPARE_FAILED', targetType: 'EVENT', targetId: event.id, result: 'FAILURE', reason: 'LOCAL_PREPARATION_FAILED', changes: {} }, clock); await tx.$executeRawUnsafe('RELEASE SAVEPOINT commerce_message'); return 'FAILED'; }
  });
}
export async function deliverCommerce(messages: AccessMessages, localCheck: (id: string) => void = () => {}): Promise<'EMPTY' | 'DELIVERED' | 'FAILED'> {
  const { db, clock } = messages.accounts;
  return serializable(db, async tx => {
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "DemoMessage" WHERE type LIKE 'COMMERCE.%' AND status IN ('PENDING','FAILED') ORDER BY attempts,"createdAt",id FOR UPDATE SKIP LOCKED LIMIT 1`;
    const row = rows[0]; if (!row) return 'EMPTY'; const message = await tx.demoMessage.findUniqueOrThrow({ where: { id: row.id } }), user = await tx.user.findUniqueOrThrow({ where: { id: message.userId! } });
    const body = JSON.parse(messages.protection.open(message.id, message.restrictedBody)) as Record<string, unknown>; body.recipient = user.emailNormalized;
    let status: 'DELIVERED' | 'FAILED' = 'DELIVERED'; try { localCheck(row.id); } catch { status = 'FAILED'; }
    await tx.demoMessage.update({ where: { id: row.id }, data: { status, attempts: { increment: 1 }, restrictedBody: messages.protection.seal(row.id, JSON.stringify(body)), ...(status === 'DELIVERED' ? { deliveredAt: clock.now() } : {}) } });
    await appendAudit(tx, { action: 'COMMERCE.' + status, targetType: 'MESSAGE', targetId: row.id, result: status === 'DELIVERED' ? 'SUCCESS' : 'FAILURE', reason: 'LOCAL_MAILBOX_DELIVERY', changes: {} }, clock); return status;
  });
}
