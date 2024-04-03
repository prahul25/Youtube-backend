import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null , "./public/temp")
    },
    filename: function(req,file,cb){
        cb(null,file.originalname) // tried to console.log that filename
    }
})

export const upload = multer({storage})