-- Medical Forms Table
CREATE TABLE IF NOT EXISTS medical_forms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  
  -- Personal Info Section
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  gender ENUM('Male', 'Female', 'Other'),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  emergency_contact_name VARCHAR(100),
  emergency_contact_relationship VARCHAR(50),
  emergency_contact_phone VARCHAR(20),
  
  -- Medical History Section (Text Area)
  medical_history TEXT,
  
  -- Medications Section (Text Area)
  medications TEXT,
  
  -- Allergies Section (Text Area)
  allergies TEXT,
  
  -- Emergency Contact Section
  emergency_contact_name_emergency VARCHAR(100),
  emergency_contact_relationship_emergency VARCHAR(50),
  emergency_contact_phone_emergency VARCHAR(20),
  information_accurate_confirmation BOOLEAN DEFAULT FALSE,
  
  -- Additional Fields
  documents JSON, -- Store Cloudinary URLs as JSON array
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
); 