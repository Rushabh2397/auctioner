const yup = require("yup");
const { handleValidationError } = require("../utils");

const validateTournamentHostSchema = async (req, res, next) => {
    try {
        const tournamentHostSchema = yup.object({
            name: yup
                .string()
                .required("Name is required.")
                .trim()
                .min(2, "Name must be at least 5 characters long."),

            logo: yup
                .string()
                .required("Logo is required.")
                .trim()
        });

        await tournamentHostSchema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        return handleValidationError(res, error);
    }
};

module.exports = {
    validateTournamentHostSchema,
};
