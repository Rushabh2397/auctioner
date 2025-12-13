const eventService = require("../services/eventService");
const { sendSuccess, sendError } = require("../utils");

/**
 * Track a single user event
 */
const trackEvent = async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
        };

        const event = await eventService.trackEvent(eventData);
        sendSuccess(res, 201, "Event tracked successfully", { eventId: event._id });
    } catch (error) {
        console.error("Error tracking event:", error);
        sendError(res, 500, "Failed to track event", error);
    }
};

/**
 * Track multiple events in batch
 */
const trackEvents = async (req, res) => {
    try {
        const { events } = req.body;

        if (!events || !Array.isArray(events)) {
            return sendError(res, 400, "Events array is required");
        }

        // Add IP and user agent to all events
        const enrichedEvents = events.map(event => ({
            ...event,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
        }));

        const result = await eventService.trackEvents(enrichedEvents);
        sendSuccess(res, 201, "Events tracked successfully", { count: result.length });
    } catch (error) {
        console.error("Error tracking events:", error);
        sendError(res, 500, "Failed to track events", error);
    }
};

/**
 * Get events by user ID
 */
const getEventsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const filters = req.query;

        const events = await eventService.getEventsByUser(userId, filters);
        sendSuccess(res, 200, "Events retrieved successfully", events);
    } catch (error) {
        console.error("Error getting user events:", error);
        sendError(res, 500, "Failed to get events", error);
    }
};

/**
 * Get events by tournament ID
 */
const getEventsByTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const filters = req.query;

        const events = await eventService.getEventsByTournament(tournamentId, filters);
        sendSuccess(res, 200, "Events retrieved successfully", events);
    } catch (error) {
        console.error("Error getting tournament events:", error);
        sendError(res, 500, "Failed to get events", error);
    }
};

/**
 * Get event statistics for a tournament
 */
const getEventStats = async (req, res) => {
    try {
        const { tournamentId } = req.params;

        const stats = await eventService.getEventStats(tournamentId);
        sendSuccess(res, 200, "Event stats retrieved successfully", stats);
    } catch (error) {
        console.error("Error getting event stats:", error);
        sendError(res, 500, "Failed to get event stats", error);
    }
};

module.exports = {
    trackEvent,
    trackEvents,
    getEventsByUser,
    getEventsByTournament,
    getEventStats
};
