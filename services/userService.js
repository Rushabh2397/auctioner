const User = require("../models/user")
const TouranmentHost = require("../models/tournamentHost")

const addUser = async (userInput) => {
    const { name, email, password, tournamnetHostId } = userInput

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        const error = new Error("User already exists.");
        error.code = "USER_EXISTS";
        throw error;
    }

    const tournamentHost = TouranmentHost.findById(tournamnetHostId);

    if (!tournamentHost) {
        const error = new Error("Please enter valid tournament host ID");
        throw error;
    }

    const newUser = new User({
        name,
        email,
        password,
        tournamnetHostId
    })

    const saveduser = await newUser.save(newUser);
    return saveduser;

}

const login = async (loginInput) => {
    const { email, password } = loginInput
    const user = await User.findOne({ email });
    if (!user) {
        const error = new Error("User not found");
        error.code = "NOT_FOUND"
        throw error;
    }

    let passwordMatched = decrypt(password, user.password)
    if (!passwordMatched) {
        const error = new Error("Please check your email/password");
        throw error;
    }

    return {
        name: user.name,
        email: user.email,
        tournamnetHostId: user.tournamnetHostId
    }

}


module.exports = {
    addUser,
    login
}