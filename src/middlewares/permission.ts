export const allAdminPermissions = [
  'create:company',
  'read:company',
  'update:company',
  'delete:company',
  'manage:company',
  'invite:legal_representative',
  'create:company_subsidiary',
  'read:company_subsidiary',
  'update:company_subsidiary',
  'delete:company_subsidiary',
  'manage:company_subsidiary',
  'create:product',
  'read:product',
  'update:product',
  'delete:product',
  'manage:product',
  'read:company_associate',
  'allow:company_associate',
  'delete:company_associate',
  'reject:company_associate',
  'rent:rent_product',
  'rent:rent_space',
  'cancel:rent_product',
  'cancel:rent_space',
  'request_registration:company',
  'request_registration:company_associate',
  'get_all_requests:company',
  'get_all_requests:company_associate',
  'accept:company_associateOrRepresentativeLegal'
];

const excludeFromAdminCompany = ['create:company'];

export const permissions = {
  adminSystemUser: allAdminPermissions,
  adminCompany: allAdminPermissions.filter(p => !excludeFromAdminCompany.includes(p)),
  commonUser: [
    'rent:rent_product',
    'rent:rent_space',
    'cancel:rent_product',
    'cancel:rent_space',
    'request_registration:company',
    'request_registration:company_associate'
  ]
} as const;

export type RoleName = keyof typeof permissions;

export function isValidRoleName(role: string): role is RoleName {
  return Object.keys(permissions).includes(role);
}

export type Permission = typeof allAdminPermissions[number];

export function hasPermission(role: RoleName, permission: string): boolean {
  return (permissions[role] as readonly string[])?.includes(permission) ?? false;
}