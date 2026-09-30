const goose = require("mongoose");
const adminSeeder = require("../adminSeeder");

exports.connectDatabase = async (URI) => {
    if (!URI) throw new Error("MONGO_URI is not defined. Check Backend/.env");
    await goose.connect(URI);
    console.log("successfully connected to MongoDB");
    await adminSeeder();
}
