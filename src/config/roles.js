const allRoles = {
  user: ['manageUsers'],
  admin: ['getUsers', 'manageUsers','manageCategories','manageSubCategories','manageProducts','manageOrders','manageBanners'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
