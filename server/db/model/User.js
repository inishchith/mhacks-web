var bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    mongoose = require('../index.js'),
    config = require('../../../config/default.js'),
    Email = require('../../interactors/email.js'),
    emailResponses = require('../../responses/api/email.js'),
    crypto = require('crypto'),
    sanitizerPlugin = require('mongoose-sanitizer-plugin'),
    secret = config.secret;

// Define the document Schema
var schema = new mongoose.Schema({
    full_name: {
        type: String,
        user_editable: true
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true
        },
        user_editable: true
    },
    email_verified: {
        type: Boolean,
        user_editable: false
    },
    application_submitted: {
        type: Boolean,
        user_editable: false
    },
    verification_tokens: [
        {
            created_at: {
                type: Date,
                default: Date.now
            },
            token: String,
            tokenType: String
        }
    ],
    password: {
        type: String,
        required: true,
        user_editable: true
    },
    tokens: [
        {
            created_at: {
                type: Date,
                default: Date.now
            },
            token: String
        }
    ],
    old_tokens: [
        {
            created_at: {
                type: Date,
                default: Date.now
            },
            token: String
        }
    ],
    created_at: {
        type: Date,
        default: Date.now
    },
    birthday: {
        type: Date,
        user_editable: true
    },
    major: {
        type: String,
        user_editable: true
    },
    university: {
        type: String,
        user_editable: true
    },
    groups: [
        {
            name: String
        }
    ],
    meta: {
        ip: String
    },
    avatar: {
        type: String,
        user_editable: true
    },
    resume: {
        type: String,
        user_editable: true
    },
    github: {
        type: String,
        user_editable: true
    },
    linkedin: {
        type: String,
        user_editable: true
    },
    devpost: {
        type: String,
        user_editable: true
    },
    portfolio: {
        type: String,
        user_editable: true
    },
    tshirt: {
        type: String,
        enum: ['unselected', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl'],
        user_editable: true
    },
    race: {
        type: String,
        enum: [
            'unselected',
            'white',
            'black',
            'am-indian-alaskan',
            'asian',
            'hispanic',
            'other',
            'prefer-not'
        ],
        user_editable: true
    },
    sex: {
        type: String,
        enum: ['unselected', 'male', 'female', 'non-binary', 'prefer-not'],
        user_editable: true
    }
});

// Allow us to query by name
schema.query.byName = function(name) {
    return this.findOne({
        full_name: new RegExp(name, 'i')
    });
};

// Allow us to query by email
schema.query.byEmail = function(email) {
    return this.findOne({
        email: new RegExp(email, 'i')
    });
};

// Allow us to query by token
schema.query.byToken = function(findToken) {
    return this.findOne({
        tokens: {
            $elemMatch: {
                token: findToken
            }
        }
    });
};

// Allow us to query by token
schema.query.byVerificationToken = function(findToken) {
    return this.findOne({
        verification_tokens: {
            $elemMatch: {
                token: findToken
            }
        }
    });
};

// Verify the token is correct
schema.methods.verifyToken = function(token) {
    return new Promise((resolve, reject) => {
        try {
            var tokenData = jwt.verify(token, secret);
            if (this.email == tokenData.email) {
                resolve(true);
            } else {
                reject('Email does not match token');
            }
        } catch (err) {
            console.error(err);
            switch (err.name) {
                case 'TokenExpiredError':
                    break;
                case 'JsonWebTokenError':
                    break;
                default:
                    break;
            }
            reject(err.message);
        }
    });
};

// Handle bcrypt password comparison
schema.methods.checkPassword = function(suppliedPassword) {
    return bcrypt.compare(suppliedPassword, this.password);
};

// Generate a new JWT
schema.methods.generateNewToken = function() {
    if (this.tokens.length >= config.max_tokens) {
        this.tokens.sort(function(first, second) {
            return first.created_at - second.created_at;
        });

        this.removeToken(this.tokens[0].token);
    }

    var newToken = jwt.sign(
        {
            email: this.email
        },
        secret,
        {
            expiresIn: '28d'
        }
    );

    this.tokens.push({
        token: newToken
    });
    this.save();

    return newToken;
};

// Remove a JWT (logout)
schema.methods.removeToken = function(token) {
    var removeElem = null;
    this.tokens.forEach(function(dbToken, elem) {
        if (dbToken.token === token) {
            removeElem = elem;
        }
    });

    var removed = this.tokens.splice(removeElem, 1)[0];
    this.old_tokens.push(removed);

    this.save();
};

schema.methods.generateEmailVerificationToken = function() {
    var token = this.generateTempToken('email_verification');

    return token;
};

schema.methods.generatePasswordResetToken = function() {
    var token = this.generateTempToken('password_reset');

    return token;
};

schema.methods.generateTempToken = function(tokenType) {
    var newToken = jwt.sign(
        {
            email: this.email,
            tokenType: tokenType
        },
        secret,
        {
            expiresIn: '30m'
        }
    );

    this.verification_tokens.push({
        token: newToken,
        tokenType: tokenType
    });

    this.save();

    return newToken;
};

schema.methods.checkEmailVerificationToken = function(token) {
    return this.checkTempToken(token, 'email_verification');
};

schema.methods.checkPasswordResetToken = function(token) {
    return this.checkTempToken(token, 'password_reset');
};

schema.methods.checkTempToken = function(token, tokenType) {
    return new Promise((resolve, reject) => {
        try {
            var tokenData = jwt.verify(token, secret);
            if (
                this.email == tokenData.email &&
                tokenData.tokenType == tokenType
            ) {
                resolve(true);
            } else {
                reject('Token not valid');
            }
        } catch (err) {
            console.error(err);
            switch (err.name) {
                case 'TokenExpiredError':
                    break;
                case 'JsonWebTokenError':
                    break;
                default:
                    break;
            }
            reject(err.message);
        }
    });
};

schema.methods.verifiedEmail = function() {
    this.email_verified = true;

    var verification_tokens = this.verification_tokens;
    this.verification_tokens.forEach(function(tokenInfo, elem) {
        if (tokenInfo.tokenType === 'email_verification') {
            verification_tokens.splice(elem, 1);
        }
    });

    this.verification_tokens = verification_tokens;

    this.save();
};

schema.methods.changePassword = function(password) {
    this.password = password;

    var verification_tokens = this.verification_tokens;
    this.verification_tokens.forEach(function(tokenInfo, elem) {
        if (tokenInfo.tokenType === 'password_reset') {
            verification_tokens.splice(elem, 1);
        }
    });

    this.verification_tokens = verification_tokens;

    this.save();
};

schema.methods.sendVerificationEmail = function() {
    if (config.development) {
        console.log(
            emailResponses.VERIFICATION_URL_CONSOLE,
            config.host +
                '/v1/auth/verify/' +
                this.generateEmailVerificationToken()
        );
    } else {
        Email.sendEmailTemplate(
            config.confirmation_email_template,
            {
                confirmation_url:
                    config.host +
                        '/v1/auth/verify/' +
                        this.generateEmailVerificationToken(),
                FIRST_NAME: this.full_name
                    ? this.full_name.split(' ')[0]
                    : 'Hacker'
            },
            config.confirmation_email_subject,
            this.email,
            config.email_from,
            config.email_from_name
        ).catch(error => {
            console.error('MANDRILL', error);
            return false;
        });
    }
};

schema.methods.sendPasswordResetEmail = function() {
    if (config.development) {
        console.log(
            emailResponses.PASSWORDRESET_URL_CONSOLE,
            config.host +
                '/auth/passwordreset/' +
                this.generatePasswordResetToken()
        );
    } else {
        Email.sendEmailTemplate(
            config.password_reset_email_template,
            {
                update_password_url:
                    config.host +
                        '/auth/passwordreset/' +
                        this.generatePasswordResetToken()
            },
            config.password_reset_email_subject,
            this.email,
            config.email_from,
            config.email_from_name
        ).catch(error => {
            console.error('MANDRILL', error);
        });
    }
};

schema.methods.checkGroup = function(checkGroup) {
    if (checkGroup === 'any') {
        return true;
    } else {
        var returnVal = false;
        this.groups.forEach(function(data) {
            if (data.name === checkGroup) {
                returnVal = true;
            }
        });

        return returnVal;
    }
};

schema.methods.addGroup = function(groupName) {
    if (!this.checkGroup(groupName)) {
        this.groups.push({ name: groupName });
        this.save();

        return true;
    } else {
        return false;
    }
};

schema.methods.getGroupsList = function() {
    var groups = [];

    this.groups.forEach(function(data) {
        groups.push(data.name);
    });

    return groups;
};

schema.methods.updateFields = function(fields) {
    for (var param in fields) {
        if (schema.obj[param].user_editable) {
            this[param] = fields[param];
        }
    }
    this.save();
};

schema.methods.getAvatars = function() {
    var avatars = [];

    if (this.avatar) {
        avatars.push(config.host + '/v1/artifact/avatar/' + this.email);
    }

    avatars = avatars.concat([
        'https://www.gravatar.com/avatar/' +
            crypto.createHash('md5').update(this.email).digest('hex') +
            '?d=404',
        'https://api-avatar.trove.com/v1/avatar/' +
            this.email +
            '?fallback=true'
    ]);

    return avatars;
};

schema.methods.getResume = function() {
    return config.host + '/v1/artifact/resume/' + this.email;
};

schema.methods.getProfile = function() {
    return {
        email: this.email,
        email_verified: this.email_verified,
        application_submitted: this.application_submitted,
        full_name: this.full_name,
        birthday: this.birthday,
        groups: this.getGroupsList(),
        major: this.major,
        university: this.university,
        resume_uploaded: !!this.resume,
        avatar: this.getAvatars(),
        github: this.github,
        linkedin: this.linkedin,
        devpost: this.devpost,
        portfolio: this.portfolio,
        tshirt: this.tshirt,
        race: this.race,
        sex: this.sex
    };
};

// Password middleware to update passwords with bcrypt when needed
var passwordMiddleware = function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt
        .hash(user.password, 10)
        .then(hash => {
            user.password = hash;
            return next();
        })
        .catch(err => {
            console.error(err);
            return next(err);
        });
};

// Set the update middleware on each of the document save and update events
schema.pre('save', passwordMiddleware);
schema.pre('findOneAndUpdate', passwordMiddleware);
schema.pre('update', passwordMiddleware);

schema.plugin(sanitizerPlugin);

// Initialize the model with the schema, and export it
var model = mongoose.model('User', schema);

module.exports = model;
