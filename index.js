const pulumi = require("@pulumi/pulumi");
const random = require("@pulumi/random");

// Create a random string
const randomString = new random.RandomString("my-random-string", {
    length: 16,
    special: true,
    upper: true,
    lower: true,
    numeric: true,
});

// Export the random string value
exports.randomStringValue = randomString.result;
