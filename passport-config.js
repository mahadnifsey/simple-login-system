const LocalStrategy = (require('passport-local')).Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    // Checking if the user is correct against email and password
    const authenticateUser = async (email, password, done) => {
        // Checking user by email
        const user = getUserByEmail(email)
        if (user == null) {
            return done(null, false, { message: 'No User with that email.' })
        }

        // Checking the user stored password against password entered using bcrypt
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Password Incorrect!' })
            }
        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

// Call the function we have in our passport config for export
module.exports = initialize