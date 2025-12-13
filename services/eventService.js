const UserEvent = require("../models/userEvent");

/**
 * Track a single user event
 * @param {Object} eventData - Event data
 * @returns {Object} Created event
 */
const trackEvent = async (eventData) => {
    const event = new UserEvent({
        userId: eventData.userId || null,
        sessionId: eventData.sessionId,
        tournamentId: eventData.tournamentId,
        eventType: eventData.eventType,
        eventData: eventData.eventData,
        page: eventData.page,
        userAgent: eventData.userAgent,
        ipAddress: eventData.ipAddress,
        timestamp: eventData.timestamp || new Date()
    });

    return await event.save();
};

/**
 * Track multiple events in batch
 * @param {Array} events - Array of event objects
 * @returns {Object} Insert result
 */
const trackEvents = async (events) => {
    if (!events || events.length === 0) {
        return { insertedCount: 0 };
    }

    const preparedEvents = events.map(event => ({
        userId: event.userId || null,
        sessionId: event.sessionId,
        tournamentId: event.tournamentId,
        eventType: event.eventType,
        eventData: event.eventData,
        page: event.page,
        userAgent: event.userAgent,
        ipAddress: event.ipAddress,
        timestamp: event.timestamp || new Date()
    }));

    return await UserEvent.insertMany(preparedEvents);
};

/**
 * Get events by user ID
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters (eventType, startDate, endDate)
 * @returns {Array} List of events
 */
const getEventsByUser = async (userId, filters = {}) => {
    const query = { userId };

    if (filters.eventType) {
        query.eventType = filters.eventType;
    }

    if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
        if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    return await UserEvent.find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100);
};

/**
 * Get events by tournament ID
 * @param {string} tournamentId - Tournament ID
 * @param {Object} filters - Optional filters
 * @returns {Array} List of events
 */
const getEventsByTournament = async (tournamentId, filters = {}) => {
    const query = { tournamentId };

    if (filters.eventType) {
        query.eventType = filters.eventType;
    }

    if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
        if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    return await UserEvent.find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 500);
};

/**
 * Get event statistics for a tournament
 * @param {string} tournamentId - Tournament ID
 * @returns {Object} Event statistics
 */
const getEventStats = async (tournamentId) => {
    const pipeline = [
        { $match: { tournamentId: require('mongoose').Types.ObjectId(tournamentId) } },
        {
            $group: {
                _id: "$eventType",
                count: { $sum: 1 },
                lastOccurred: { $max: "$timestamp" }
            }
        },
        { $sort: { count: -1 } }
    ];

    return await UserEvent.aggregate(pipeline);
};

module.exports = {
    trackEvent,
    trackEvents,
    getEventsByUser,
    getEventsByTournament,
    getEventStats
};
