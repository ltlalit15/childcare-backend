// import multer from 'multer';
// import express from 'express';

// const router = express.Router();  
// import { addChild } from '../controllers/child.controller.js';

// const upload = multer({ dest: 'uploads/' });

// const childUploads = upload.fields([
//   { name: 'photo', maxCount: 1 },
//   { name: 'auth_affirmation_form', maxCount: 1 },
//   { name: 'immunization_record', maxCount: 1 },
//   { name: 'medical_form', maxCount: 1 }
// ]);

// router.post(
//   "/add-child",
// //   verifyToken,
// //   authorizeRoles("Admin", "Secretary"),
//   childUploads,
//   addChild
// );

// export default router;



import multer from 'multer';
import express from 'express';
import { addChild, getChild, updateChild } from '../controllers/child.controller.js';
// import { verifyToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
    }
  }
});

// Define upload fields matching your form
const childUploads = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'medical_form', maxCount: 1 },
  { name: 'immunization_record', maxCount: 1 },
  { name: 'auth_affirmation_form', maxCount: 1 }
]);

// Routes
router.post(
  "/add-child",
  // verifyToken,
  // authorizeRoles("Admin", "Secretary"),
  childUploads,
  addChild
);

router.get(
  "/:child_id",
  // verifyToken,
  // authorizeRoles("Admin", "Secretary", "Teacher"),
  getChild
);

router.patch(
  "/:child_id",
  // verifyToken,
  // authorizeRoles("Admin", "Secretary"),
  childUploads,
  updateChild
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: 'File upload error: ' + error.message });
  }
  if (error.message === 'Invalid file type. Only images and PDFs are allowed.') {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

export default router;