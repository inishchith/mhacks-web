var {
        mongoose,
        defaultOptions,
        modifySchema,
        defaultSchema
    } = require('../index.js'),
    escapeStringRegex = require('escape-string-regexp');

// Define the document Schema
var schema = new mongoose.Schema(
    Object.assign({}, defaultSchema, {
        name: {
            type: String,
            required: true
        },
        desc: {
            type: String,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        category: {
            type: String,
            enum: ['General', 'Food', 'Tech Talk', 'Sponsor Event', 'Other'],
            default: 'General'
        },
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true
        }
    }),
    defaultOptions
);

// Allow us to query by name
schema.query.byName = function(name) {
    var escapedName = escapeStringRegex(name);
    return this.findOne({
        name: new RegExp(escapedName, 'i')
    });
};

schema.query.byLocationName = function(name) {
    return mongoose
        .model('Location')
        .find()
        .byName(name)
        .exec()
        .then(loc => {
            return this.find({
                location: loc._id
            });
        })
        .catch(err => {
            console.error(err);
        });
};

schema.methods.getCoordinates = function() {
    return {
        latitude: this.latitude,
        longitude: this.longitude
    };
};

schema.methods.updateFields = function(fields) {
    for (var param in fields) {
        this[param] = fields[param];
    }
    return this.save();
};

// All fields are updateable as only admins have power to create and update.
schema.statics.getUpdateableFields = function() {
    return Object.keys(schema.obj);
};

modifySchema(schema);

// Initialize the model with the schema, and export it
var model = mongoose.model('Event', schema);

module.exports = model;
