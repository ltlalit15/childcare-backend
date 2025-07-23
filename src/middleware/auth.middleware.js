import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = decoded;
    next();
  });
};

export const verifyUser = (req, res, next) => {
  // Dummy example — replace with actual JWT/session logic
  const user = {
    id: 1,
    name: 'John Doe',
    role: 'Admin'
  };

  req.user = user;
  next();
};