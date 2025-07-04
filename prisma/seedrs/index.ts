import { RolesPermissions, createRolesSeed, permissions } from './roles';
import {logger} from '@app/utils/logger'

async function main() {
  console.log('🔁 Seeding: Roles');
  await createRolesSeed();

  console.log('🔁 Seeding: Permissions');
  await permissions();

  console.log('🔁 Seeding: Role-Permissions');
  await RolesPermissions();
}


main()
.then(() => {
    logger.info('✅ Seed completed successfully');
})
.catch((error) => {
    logger.error('❌ Seed failed:', error);
})
.finally(async () => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$disconnect();
}
);