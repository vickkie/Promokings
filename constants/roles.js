// Values must match the backend signed `role` JWT claim; staff
// `position` fields use the same vocabulary.
export const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  INVENTORY: "inventory",
  FINANCE: "finance",
  DRIVER: "driver",
  SALES: "sales",
  SUPPLIER: "supplier",
  DISPATCHER: "dispatcher",
  CUSTOMER_SERVICE: "customerservice",
};

export const STAFF_ROLES = [
  ROLES.INVENTORY,
  ROLES.FINANCE,
  ROLES.ADMIN,
  ROLES.DRIVER,
  ROLES.SALES,
  ROLES.SUPPLIER,
  ROLES.DISPATCHER,
  ROLES.CUSTOMER_SERVICE,
];
