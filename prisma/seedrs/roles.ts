import { PrismaClient } from '@prisma/client';
import {logger} from '@app/utils/logger'
import { record } from 'zod';

const prisma = new PrismaClient();

export async function createRolesSeed() {
    const roles = [
        {
            name: 'system_admin',
            description: 'System Administrator with full access',
        },
        {
            name: 'company_admin',
            description: 'Company Administrator with access to company settings',
        },
        {
            name: 'company_user',
            description: 'Company User with limited access',
        },
        {
            name: 'creator_company_subsidiary',
            description: 'Creator Company Subsidiary with access to creator features',
        },
        {
            name: 'associate',
            description: 'Associate with limited access',
        }
    ];

    await prisma.role.createMany({
        data: roles,
        skipDuplicates: true
    });

    logger.info('✅ Roles seeded successfully');
}

export async function permissions() {
  const permissions = [
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
      action: 'archived',
      resource: 'company',
      description: 'Allows archiving a company',
    },
    {
      action: 'manage',
      resource: 'company',
      description: 'Allows managing company settings and users',
    },
    {
      action: 'read',
      resource: 'company_associate',
      description: 'Allows reading company associate information',
    },
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
      action: 'archived',
      resource: 'company_subsidiary',
      description: 'Allows archiving a company subsidiary',
    },
    {
      action: 'manage',
      resource: 'company_subsidiary',
      description: 'Allows managing company subsidiary settings and users',
    }
  ];
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
    roleId: roleIds['system_admin'],
    permissionId: pid,
  }));

  [2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach(pid => {
    relations.push({ roleId: roleIds['company_admin'], permissionId: pid });
    });
  
  relations.push({ roleId: roleIds['company_user'], permissionId: 2 });

  [2, 3, 6, 7, 8, 9, 10, 11, 12].forEach(pid => {
    relations.push({ roleId: roleIds['creator_company_subsidiary'], permissionId: pid });
  });

  relations.push({ roleId: roleIds['associate'], permissionId: 2 });

  await prisma.rolesPermission.createMany({
      data: relations,
      skipDuplicates: true
  });

    logger.info('✅ RolesPermissions seeded successfully');
}