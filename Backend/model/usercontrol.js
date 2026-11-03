
import User from '../model/user.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -confirmpassword -resetPasswordToken')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: 'success',
      totalUsers: users.length,
      users: users
    });

  } catch (error) {
    console.error('GET ALL USERS ERROR:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Unable to fetch registered users.'
    });
  }
};
