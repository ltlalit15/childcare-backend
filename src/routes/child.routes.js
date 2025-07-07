import multer from 'multer';
import { addChild } from '../controllers/child.controller';
const upload = multer({ dest: 'uploads/' });

const childUploads = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'auth_affirmation_form', maxCount: 1 },
  { name: 'immunization_record', maxCount: 1 },
  { name: 'medical_form', maxCount: 1 }
]);

router.post(
  "/add-child",
//   verifyToken,
//   authorizeRoles("Admin", "Secretary"),
  childUploads,
  addChild
);
