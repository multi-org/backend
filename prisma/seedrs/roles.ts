import { PrismaClient } from '@prisma/client';
import {logger} from '@app/utils/logger'

const prisma = new PrismaClient();

export async function createRolesSeed() {
    const roles = [
        {
            name: 'adminUser',
            description: 'System Administrator with full access',
        },
        {
            name: 'adminCompany',
            description: 'Company Administrator with access to company settings',
        },
        {
            name: 'commonUser',
            description: 'Common User with limited access',
        },
    ];

    await prisma.role.createMany({
        data: roles,
        skipDuplicates: true
    });

    logger.info('✅ Roles seeded successfully');
}

export async function permissions() {
  const permissions = [
  // CRUD Empresas
    {
      action: 'create',
      resource: 'company',
      description: 'Allows creating a company',
    },
    {
      action: 'read',
      resource: 'company',
      description: 'Allows reading company information',
    },
    {
      action: 'update',
      resource: 'company',
      description: 'Allows updating company information',
    },
    {
      action: 'delete',
      resource: 'company',
      description: 'Allows deleting a company',
    },
    {
      action: 'manage',
      resource: 'company',
      description: 'Allows managing company settings and users',
    },
    
    // Convidar representante legal
    {
      action: 'invite',
      resource: 'legal_representative',
      description: 'Allows inviting a legal representative to the company',
    },

    // CRUD Filiais
    {
      action: 'create',
      resource: 'company_subsidiary',
      description: 'Allows creating a company subsidiary',
    },
    {
      action: 'read',
      resource: 'company_subsidiary',
      description: 'Allows reading company subsidiary information',
    },
    {
      action: 'update',
      resource: 'company_subsidiary',
      description: 'Allows updating company subsidiary information',
    },
    {
      action: 'delete',
      resource: 'company_subsidiary',
      description: 'Allows deleting a company subsidiary',
    },
    {
      action: 'manage',
      resource: 'company_subsidiary',
      description: 'Allows managing company subsidiary settings and users',
    },

    // CRUD Produtos
    {
      action: 'create',
      resource: 'product',
      description: 'Allows creating a product',
    },
    {
      action: 'read',
      resource: 'product',
      description: 'Allows reading product information',
    },
    {
      action: 'update',
      resource: 'product',
      description: 'Allows updating product information',
    },
    {
      action: 'delete',
      resource: 'product',
      description: 'Allows deleting a product',
    },
    {
      action: 'manage',
      resource: 'product',
      description: 'Allows managing product settings and categories',
    },

    // Associados

    {
      action: 'read',
      resource: 'company_associate',
      description: 'Allows reading company associate information',
    },
    {
      action: "allow",
      resource: "company_associate",
      description: 'Allows creating a company associate',
    },
    {
      action: 'delete',
      resource: 'company_associate',
      description: 'Allows deleting a company associate',
    },

    // Alugar espaços e produtos
    {
      action: 'rent',
      resource: 'rent_product',
      description: 'Allows renting a product',
    },
    {
      action: 'rent',
      resource: 'rent_space',
      description: 'Allows renting a space',
    },
    {
      action: 'cancel',
      resource: 'rent_product',
      description: 'Allows canceling a rented product',
    },
    {
      action: 'cancel',
      resource: 'rent_space',
      description: 'Allows canceling a rented space',
    }
    // 22
  ];

  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true
  });

  logger.info('✅ Permissions seeded successfully');
}

export async function RolesPermissions() {
  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();

  const roleIds: Record<string, number> = {};
  roles.forEach(role => {
    roleIds[role.name] = role.id;
  });

  const permissionIds: number[] = permissions.map(p => p.id);

  const relations = permissionIds.map(pid => ({
    roleId: roleIds['adminUser'],
    permissionId: pid,
  }));

  // Adicionando permissões específicas para papel de administrador da empresa
  const adminCompanyRelations = permissionIds
    .filter(pid => pid !== 1)
    .map(pid => ({
      roleId: roleIds['adminCompany'],
      permissionId: pid,
  }));
  relations.push(...adminCompanyRelations);

  // Adicionando permissões para papel de usuário comum
  [ 19, 20, 21, 22].forEach(pid => {
    relations.push({ roleId: roleIds['commonUser'], permissionId: pid });
  });

  await prisma.rolesPermission.createMany({
      data: relations,
      skipDuplicates: true
  });

    logger.info('✅ RolesPermissions seeded successfully');
}