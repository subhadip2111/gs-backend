const httpStatus = require('http-status');
const { User, Order } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return await User.findById(id).select('');
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {

  return await User.findOne({ email }).populate('wishlist').populate('cart').populate('orders').populate('addresses').populate('reviews');
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  console.log(updateBody);
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const updateUserByEmail = async (email, updateBody) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, user._id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  console.log('hfdhdf', updateBody);
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Upsert user by email (for social login)
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const upsertUserByEmail = async (userBody) => {
  let user = await getUserByEmail(userBody.email);
  if (user) {
    const updateUser = await User.findOneAndUpdate({ email: userBody.email }, userBody, { new: true })
    return updateUser;
  } else {
    user = await User.create(userBody);
  }
  return user;
};

/**
 * Get user IDs based on their type/activity
 * @param {string} type - 'newUser', 'regular user', 'frequent_user', 'prime_user', 'inactive user'
 * @returns {Promise<Array<ObjectId>>}
 */
const getUserIdsByType = async (type) => {
  let userIds = [];
  const now = new Date();

  switch (type) {
    case 'newUser':
      userIds = await User.find({ role: 'user', newUser: true }).distinct('_id');
      break;

    case 'regular_user': {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const activeUsers = await Order.aggregate([
        {
          $match: {
            status: 'Delivered',
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: { _id: '$user' }
        }
      ]);
      userIds = activeUsers.map(u => u._id);
      break;
    }

    case 'frequent_user': {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      const frequentUsers = await Order.aggregate([
        {
          $match: {
            status: 'Delivered',
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: '$user',
            orderCount: { $sum: 1 }
          }
        },
        {
          $match: { orderCount: { $gte: 3 } }
        }
      ]);
      userIds = frequentUsers.map(u => u._id)
      break;
    }
    case 'all':
      userIds = await User.find({ role: 'user' }).distinct('_id');
      break;
    

    case 'prime_user': {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      const primeUsers = await Order.aggregate([
        {
          $match: {
            status: 'Delivered',
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: '$user',
            totalSpent: { $sum: '$totalAmount' }
          }
        },
        {
          $match: { totalSpent: { $gte: 10000 } }
        }
      ]);
      userIds = primeUsers.map(u => u._id);
      break;
    }

    case 'inactive_user': {
      const usersWithOrders = await Order.distinct('user');
      userIds = await User.find({
        role: 'user',
        _id: { $nin: usersWithOrders }
      }).distinct('_id');
      break;
    }

    default:
      userIds = [];
  }

  return userIds;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  upsertUserByEmail,
  updateUserByEmail,
  getUserIdsByType,
};
