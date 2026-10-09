const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'csms_super_secret_jwt_key_2026_antigravity', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc Register user
// @route POST /api/auth/register
// @access Public / Admin
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, registrationNumber, department, degree, academicYear, currentSemester, batch, employeeId, designation } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    });

    // Create role profile if applicable
    if (user.role === 'student') {
      await StudentProfile.create({
        user: user._id,
        registrationNumber: registrationNumber || `REG${Date.now().toString().slice(-6)}`,
        department: department || 'Computer Science & Engineering',
        degree: degree || 'B.Tech',
        academicYear: academicYear || 3,
        currentSemester: currentSemester || 6,
        batch: batch || '2023-2027',
      });
    } else if (user.role === 'faculty') {
      await FacultyProfile.create({
        user: user._id,
        employeeId: employeeId || `FAC${Date.now().toString().slice(-5)}`,
        department: department || 'Computer Science & Engineering',
        designation: designation || 'Assistant Professor',
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);

    // Fetch student or faculty profile
    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id }).populate('enrolledSubjects');
    } else if (user.role === 'faculty') {
      profile = await FacultyProfile.findOne({ user: user._id }).populate('assignedSubjects');
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current logged in user
// @route GET /api/auth/me
// @access Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id }).populate('enrolledSubjects');
    } else if (user.role === 'faculty') {
      profile = await FacultyProfile.findOne({ user: user._id }).populate('assignedSubjects');
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, bio, avatar },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};
