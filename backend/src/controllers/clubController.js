const Club = require('../models/Club');
const ClubMembership = require('../models/ClubMembership');
const ClubEvent = require('../models/ClubEvent');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// @desc Get all clubs with category filtering and search
// @route GET /api/clubs
// @access Public / Private
exports.getClubs = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const clubs = await Club.find(filter)
      .populate('facultyCoordinator', 'name email')
      .populate('studentLeaders', 'name email');

    res.json({
      success: true,
      count: clubs.length,
      clubs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single club profile by ID
// @route GET /api/clubs/:clubId
// @access Public / Private
exports.getClubById = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.clubId)
      .populate('facultyCoordinator', 'name email phone')
      .populate('studentLeaders', 'name email avatar');

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    const events = await ClubEvent.find({ club: club._id }).sort({ eventDate: 1 });
    const membersCount = await ClubMembership.countDocuments({ club: club._id, status: 'active' });

    let userMembership = null;
    if (req.user) {
      userMembership = await ClubMembership.findOne({ club: club._id, student: req.user.id });
    }

    res.json({
      success: true,
      club,
      events,
      membersCount,
      userMembership,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Apply for club membership
// @route POST /api/clubs/:clubId/apply
// @access Private (Student)
exports.applyForMembership = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { applicationText } = req.body;
    const studentId = req.user.id;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    // Check duplicate membership / application
    const existing = await ClubMembership.findOne({ club: clubId, student: studentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existing.status} membership application for this club.`,
      });
    }

    const membership = await ClubMembership.create({
      club: clubId,
      student: studentId,
      status: 'pending',
      applicationText: applicationText || 'I am excited to join and participate in club activities.',
    });

    res.status(201).json({
      success: true,
      message: 'Membership application submitted successfully.',
      membership,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get My Clubs dashboard for student
// @route GET /api/clubs/me/memberships
// @access Private (Student)
exports.getMyMemberships = async (req, res, next) => {
  try {
    const memberships = await ClubMembership.find({ student: req.user.id })
      .populate('club')
      .sort({ createdAt: -1 });

    const activeClubIds = memberships.filter(m => m.status === 'active').map(m => m.club._id);
    const upcomingEvents = await ClubEvent.find({ club: { $in: activeClubIds }, eventDate: { $gte: new Date() } })
      .populate('club', 'name logoUrl')
      .sort({ eventDate: 1 });

    res.json({
      success: true,
      memberships,
      upcomingEvents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Review & approve/reject membership application (Coordinator/Admin)
// @route PATCH /api/clubs/applications/:membershipId
// @access Private (Club Coordinator / Admin)
exports.reviewApplication = async (req, res, next) => {
  try {
    const { membershipId } = req.params;
    const { status, reviewComments, role } = req.body;

    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active or rejected.' });
    }

    const membership = await ClubMembership.findById(membershipId).populate('club');
    if (!membership) {
      return res.status(404).json({ success: false, message: 'Membership application not found.' });
    }

    membership.status = status;
    membership.reviewComments = reviewComments || '';
    if (status === 'active') {
      membership.joinedDate = new Date();
      membership.role = role || 'Member';
    }
    membership.reviewedBy = req.user.id;
    await membership.save();

    // Notify Student
    await Notification.create({
      recipient: membership.student,
      title: `Club Application ${status === 'active' ? 'Approved' : 'Rejected'}`,
      message: `Your membership application for ${membership.club.name} was ${status === 'active' ? 'APPROVED' : 'REJECTED'}.`,
      type: 'CLUB_UPDATE',
      linkUrl: '/my-clubs',
    });

    res.json({
      success: true,
      message: `Application ${status} successfully.`,
      membership,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create club event (Coordinator/Admin)
// @route POST /api/clubs/:clubId/events
// @access Private (Club Coordinator / Admin)
exports.createEvent = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { title, description, eventDate, location, registrationDeadline, maxParticipants } = req.body;

    const event = await ClubEvent.create({
      club: clubId,
      title,
      description,
      eventDate,
      location,
      registrationDeadline,
      maxParticipants: maxParticipants || 100,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Club event created successfully.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Register for club event (Student)
// @route POST /api/clubs/events/:eventId/register
// @access Private (Student)
exports.registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await ClubEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const alreadyReg = event.participants.some(p => p.student.toString() === req.user.id);
    if (alreadyReg) {
      return res.status(400).json({ success: false, message: 'Already registered for this event.' });
    }

    event.participants.push({ student: req.user.id });
    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for event.',
      event,
    });
  } catch (error) {
    next(error);
  }
};
