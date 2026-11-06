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
// Helper to normalize Date of Birth variants for matching
// Handles: YYYY-MM-DD, DD-MM-YYYY, YYYY/MM/DD, DD/MM/YYYY, YYYYMMDD, DDMMYYYY
function normalizeDobVariants(input) {
  if (!input) return [];
  const trimmed = String(input).trim();
  const digits = trimmed.replace(/\D/g, '');
  const variants = new Set([trimmed]);

  if (digits.length === 8) {
    variants.add(digits);
    // YYYYMMDD
    const y1 = Number(digits.slice(0, 4));
    const m1 = digits.slice(4, 6);
    const d1 = digits.slice(6, 8);
    if (y1 >= 1900 && y1 <= 2100) {
      variants.add(`${y1}-${m1}-${d1}`);
      variants.add(`${d1}-${m1}-${y1}`);
      variants.add(`${d1}/${m1}/${y1}`);
    }

    // DDMMYYYY
    const d2 = digits.slice(0, 2);
    const m2 = digits.slice(2, 4);
    const y2 = Number(digits.slice(4, 8));
    if (y2 >= 1900 && y2 <= 2100) {
      variants.add(`${y2}-${m2}-${d2}`);
      variants.add(`${d2}-${m2}-${y2}`);
      variants.add(`${d2}/${m2}/${y2}`);
    }
  }

  return Array.from(variants);
}

// @desc Login user (supports Email or Registration Number, and Password or Date of Birth)
// @route POST /api/auth/login
// @access Public
exports.login = async (req, res, next) => {
  try {
    const rawIdentifier = (req.body.identifier || req.body.registrationNumber || req.body.email || '').trim();
    const rawPassword = (req.body.password || req.body.dateOfBirth || '').trim();

    if (!rawIdentifier || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Registration Number / Email and Password / Date of Birth.',
      });
    }

    // 1. Try finding student by Registration Number
    let user = null;
    let studentProfile = await StudentProfile.findOne({
      registrationNumber: new RegExp('^' + rawIdentifier + '$', 'i'),
    });

    if (studentProfile) {
      user = await User.findById(studentProfile.user).select('+password');
    }

    // 2. Try finding faculty by Employee ID
    let facultyProfile = null;
    if (!user) {
      facultyProfile = await FacultyProfile.findOne({
        employeeId: new RegExp('^' + rawIdentifier + '$', 'i'),
      });
      if (facultyProfile) {
        user = await User.findById(facultyProfile.user).select('+password');
      }
    }

    // 3. Try finding user by Email
    if (!user) {
      user = await User.findOne({ email: rawIdentifier.toLowerCase() }).select('+password');
      if (user) {
        if (user.role === 'student') {
          studentProfile = await StudentProfile.findOne({ user: user._id });
        } else if (user.role === 'faculty') {
          facultyProfile = await FacultyProfile.findOne({ user: user._id });
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No account found for this Registration Number or Email.',
      });
    }

    // Verify credentials: Check password hash OR dateOfBirth in profile
    let isMatch = false;

    // A. Check standard password hash
    if (user.password) {
      isMatch = await user.matchPassword(rawPassword);
    }

    // B. Check Date of Birth matching if entered credential did not match standard password
    if (!isMatch) {
      const targetDob = studentProfile?.dateOfBirth || facultyProfile?.dateOfBirth;
      if (targetDob) {
        const inputVariants = normalizeDobVariants(rawPassword);
        const targetVariants = normalizeDobVariants(targetDob);
        isMatch = inputVariants.some((v) => targetVariants.includes(v));
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your password or Date of Birth (YYYY-MM-DD or DD-MM-YYYY).',
      });
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
