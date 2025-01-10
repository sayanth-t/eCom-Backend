const multer  = require('multer') ;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/product-images' ); // Specify upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    },
  });

  // Multer middleware
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'));
        }
    },
  }).array('images', 3 ); 

  const imageUpload = async (req,res , next ) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next() ;
    })
  }

  module.exports = {imageUpload} ;