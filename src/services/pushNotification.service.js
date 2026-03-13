const admin = require('firebase-admin');
const config = require('../config/config');
const logger = require('../config/logger');
const { User } = require('../models');

// Initialize Firebase Admin
try {
  if (config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
    logger.info('Firebase Admin initialized successfully');
  } else {
    logger.warn('Firebase configuration missing. Push notifications will not be sent.');
  }
} catch (error) {
  logger.error('Firebase Admin initialization error:', error);
}

const db = admin.apps.length ? admin.firestore() : null;

/**
 * Trigger a notification (Push + Firestore)
 * @param {string} type - Notification type (e.g., 'newUser', 'orderUpdate', 'priceDrop')
 * @param {Object} data - payload data
 * @param {Object} user - User object containing fcmTokens and id
 */
const triggerNotification = async (type, data, user) => {
  if (!admin.apps.length) return;

  let title = '';
  let body = '';
  let imageUrl = '';
  const payload = { ...data, type, userId: user._id.toString() };

  switch (type) {
    case 'newUser':
      title = 'Welcome to GS Store!';
      body = 'Thank you for joining us! Enjoy special promocodes on your first order.';
      break;
    case 'adminNewUser':
      title = 'New User Registered 👤';
      body = `A new user ${data.fullName} (${data.email}) has just joined GS Store.`;
      break;
    case 'adminNewOrder':
      title = 'New Order Placed 🛍️';
      body = `Order ${data.orderId} for ₹${data.amount} has been placed by ${data.userName}.`;
      break;
    case 'orderUpdate':
      const { status, orderId } = data;
      title = `Order Update: ${status}`;
      switch (status) {
        case 'Shipped':
          body = `Your order ${orderId} has been shipped! It will reach you soon.`;
          break;
        case 'Out for Delivery':
          body = `Your order ${orderId} is out for delivery. Keep your phone handy!`;
          break;
        case 'Delivered':
          title = 'Order Delivered!';
          body = `Your order ${orderId} has been delivered successfully. Enjoy your products!`;
          break;
        case 'Cancelled':
          title = 'Order Cancelled';
          body = `Your order ${orderId} has been cancelled.`;
          break;
        case 'Refunded':
          title = 'Refund Processed';
          body = `A refund has been initiated for your order ${orderId}.`;
          break;
        default:
          body = `The status of your order ${orderId} has been updated to ${status}.`;
      }
      break;
    case 'priceDrop':
      title = 'Price Drop Alert! 📉';
      body = `Great news! The price of ${data.productName} has dropped to ₹${data.newPrice}. Grab it now!`;
      imageUrl = data.productImage;
      break;
    case 'newPromocode':
      title = 'New Discount Alert! 🎁';
      body = `Use code ${data.code} to get ${data.discount}! Valid until ${data.endDate}.`;
      imageUrl = data.imageUrl || ''; // Generic promo image can be provided
      break;
    default:
      title = data.title || 'Notification';
      body = data.body || 'You have a new message';
  }

  // 1. Send Push Notification
  if (user.fcmTokens && user.fcmTokens.length > 0) {
    // Collect all payload data for FCM (must be strings)
    const fcmData = { type };
    Object.keys(payload).forEach(key => {
      if (payload[key] !== undefined && payload[key] !== null) {
        fcmData[key] = payload[key].toString();
      }
    });

    const message = {
      notification: {
        title,
        body,
        ...(imageUrl && { image: imageUrl })
      },
      data: fcmData,
      tokens: user.fcmTokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      logger.info(`Successfully sent ${response.successCount} push notifications to user ${user._id}`);
    } catch (error) {
      logger.error('Error sending push notification:', error);
    }
  }

  // 2. Save to Firestore
  if (db) {
    try {
      // Ensure all fields in payload are serializable (convert ObjectIDs to strings)
      const serializablePayload = JSON.parse(JSON.stringify(payload));
      
      await db.collection('notifications').add({
        userId: user._id.toString(),
        title,
        body,
        imageUrl: imageUrl || null,
        payload: serializablePayload,
        status: 'unread',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info('Notification saved to Firestore');
    } catch (error) {
      logger.error('Error saving notification to Firestore:', error);
    }
  }
};

/**
 * Broadcast a notification to all users with FCM tokens
 * @param {string} type - Notification type
 * @param {Object} data - payload data
 */
const broadcastNotification = async (type, data) => {
  if (!admin.apps.length) return;

  // Find all regular users who have at least one fcmToken
  const usersWithTokens = await User.find({ role: 'user', fcmTokens: { $exists: true, $not: { $size: 0 } } });
  
  if (usersWithTokens.length === 0) {
    logger.info('No users with FCM tokens found for broadcast');
    return;
  }

  logger.info(`Broadcasting notification of type ${type} to ${usersWithTokens.length} users`);

  // Send to each user (this also saves to Firestore for each user)
  const notificationPromises = usersWithTokens.map((user) => triggerNotification(type, data, user));
  await Promise.all(notificationPromises);
};

/**
 * Notify all admins
 * @param {string} type - Notification type
 * @param {Object} data - payload data
 */
const notifyAdmins = async (type, data) => {
  if (!admin.apps.length) return;

  // Find ALL admins (to ensure they get Firestore records even if push is disabled)
  const admins = await User.find({ role: 'admin' });
  
  if (admins.length === 0) {
    logger.info('No admins found to notify');
    return;
  }

  logger.info(`Notifying ${admins.length} admins of type ${type}`);

  const notificationPromises = admins.map((adminUser) => triggerNotification(type, data, adminUser));
  await Promise.all(notificationPromises);
};

/**
 * Specialized handler for new user registration
 * @param {Object} user - The newly registered user
 */
const sendNewUserRegistrationNotifications = async (user) => {
  // 1. Welcome the new user
  await triggerNotification('newUser', {}, user);

  // 2. Notify all admins
  await notifyAdmins('adminNewUser', {
    fullName: user.fullName || user.email || 'New User',
    email: user.email,
    userId: user._id.toString()
  });
};

module.exports = {
  triggerNotification,
  broadcastNotification,
  notifyAdmins
};