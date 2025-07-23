import multer from 'multer';

const storage = multer.memoryStorage(); // Read file into memory

const csvFileFilter = (req, file, cb) => {
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only .csv files are allowed'));
  }
  cb(null, true);
};

const uploadCSV = multer({
  storage,
  fileFilter: csvFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // optional: 2MB limit
});

export default uploadCSV;
