import { createDatabase } from '../apps/api/src/persistence/client.ts';
import { Accounts } from '../apps/api/src/modules/accounts/service.ts';
import { firstAdmin } from '../apps/api/src/modules/accounts/staff/service.ts';
import { parse, registration } from '../apps/api/src/modules/accounts/validation.ts';
import { AccountError } from '../apps/api/src/modules/accounts/errors.ts';

if (!process.env.DATABASE_URL || !process.env.BOOTSTRAP_ADMIN_PASSWORD) throw new Error('DATABASE_URL and protected BOOTSTRAP_ADMIN_PASSWORD are required. No default password.');
const input = parse(registration, {
  name: process.env.BOOTSTRAP_ADMIN_NAME, email: process.env.BOOTSTRAP_ADMIN_EMAIL, password: process.env.BOOTSTRAP_ADMIN_PASSWORD
});
const db = createDatabase(process.env.DATABASE_URL);
try {
  const user = await firstAdmin(new Accounts(db), input);
  console.info(`Primeiro ADMIN criado: ${user.id}. Nenhuma credencial é impressa.`);
} catch (error) {
  console.error(error instanceof AccountError ? `${error.code}: ${error.message}` : 'Falha no bootstrap. Confira configuração e unicidade do e-mail; nenhum detalhe sensível foi registrado.');
  process.exitCode = 1;
} finally { await db.$disconnect(); }
