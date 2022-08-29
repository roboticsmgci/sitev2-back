const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    folderName: { type: String, required: true },
    folderContent: { type: [String], required: true },
    metaData: { type: JSON, required: true },
    path: { type: String, required: true },
    cDirs: { type: [String], required: true },
    cFiles: { type: [String], required: true }
})

let Folder = mongoose.model("Folder", Schema)

Schema.post('save', function (next) {
    Schema.index({ path: 1 });
    next()
});

module.exports = Folder