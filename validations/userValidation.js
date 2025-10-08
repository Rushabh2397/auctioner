const yup = require("yup");
const { handleValidationError } = require("../utils");



const validateAdduserSchema = async (req, res, next) => {
    try {
        const signupSchema = yup.object({
            name: yup
                .string()
                .required("Name is required.")
                .trim()
                .min(2, "Name must be at least 2 characters long."),

            email: yup
                .string()
                .email("Invalid email format.")
                .required("Email is required.")
                .trim(),

            password: yup
                .string()
                .required("Password is required.")
                .min(6, "Password must be at least 6 characters long."),

            tournamnetHostId: yup
                .string()
                .required("Tournament Host ID is required.")
        });
        await signupSchema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        return handleValidationError(res, error);
    }
};


module.exports = {
    validateAdduserSchema
};