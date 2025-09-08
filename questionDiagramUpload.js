const multer = require('multer');

// Setup multer to store diagram to destination folder
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'question-diagrams/');
    },
    filename: function(req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname);
    }
});
questionDiagramUpload = multer({storage: storage});

module.exports = questionDiagramUpload;
