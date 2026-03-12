const allRoles = {
  user: ['manageUsers','getPromoCodes'],
  admin: ['getUsers', 'manageUsers','manageCategories','manageSubCategories','manageProducts','manageOrders','manageBanners','managePromoCodes','getPromoCodes'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
