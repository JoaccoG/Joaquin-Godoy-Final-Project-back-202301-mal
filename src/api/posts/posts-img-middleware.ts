import multer from 'multer';

const uploadGameImg = multer({
  limits: {
    fileSize: 8000000,
  },
});

export default uploadGameImg;
