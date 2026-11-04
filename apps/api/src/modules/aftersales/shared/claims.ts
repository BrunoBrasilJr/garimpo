import type { Prisma } from '../../../persistence/client.ts';

export const unclaimedUnit = {
  commercialState: 'KEPT',
  returnItems: { none: { active: true } },
  exchangeItems: { none: { active: true } }
} satisfies Prisma.OrderUnitWhereInput;
