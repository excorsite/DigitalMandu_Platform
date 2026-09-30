const multer = require("multer")
const fs = require("fs")
const path = require("path")
const uploadDir = path.join(__dirname, "..", "uploads")
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    //specifying the destination 
    destination: function (req, file, cb) {
        // creating allowd file types array for imgage like jpg png and jpeg
        const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];
        // checking if the file type is allowed or not
        if (!allowedFileTypes.includes(file.mimetype)) {
            return cb(new Error('Not an image!'))
        } else {
            cb(null, uploadDir)
        }

    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        //   giving null in case of error and 
        // if success then use filename as  user porvidd - date - random number format
        const extension = file.mimetype.split('/')[1];
        cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
    }
})
module.exports = {
    multer,
    storage
}
