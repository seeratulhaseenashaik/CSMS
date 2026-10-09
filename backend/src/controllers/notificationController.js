const Notification = require('../models/Notification');

// @desc Get user notifications
// @route GET /api/notifications
// @access Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark notification as read
// @route PATCH /api/notifications/:id/read
// @access Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark all notifications as read
// @route PATCH /api/notifications/read-all
// @access Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });

    res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};
