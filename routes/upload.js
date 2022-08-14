'use strict';
var express = require('express');
var router = express.Router();
var tool = require('../tools/fileTool');

// File Model
let fileSchema = require("../models/file");

// Folder Model
let folderSchema = require("../models/folder");

module.exports = (upload) => {
    router.route('/*')
    .get(function (req, res) {
        console.log("wtf");
    })

    /* POST new files to the database */
    .post(upload.array("files"), function (req, res) {
        let files = req.files;

        var pathString = tool.pathStringify(req.originalUrl);
        tool.neighbourNames(pathString, 2)
            .then((fileArray) => {
                // loops through each file to add
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    // only runs if a file of the same name isn't already in the selected folder
                    if (!fileArray.includes(file.originalname)) {

                        // splits the file title into the name and the extension
                        var fileTitle = file.originalname.split(".");
                        var fileName = fileTitle[0];

                        if (fileTitle.length > 1) {
                            var fileExtension = '.' + fileTitle[1]
                        }
                        else {
                            var fileExtension = '';
                        }
                        // makes the new file
                        let newFile = new fileSchema({
                            fileName: fileName,
                            fileExtension: fileExtension,
                            file: [file.id],
                            metaData: {},
                            path: pathString + file.originalname + ',',
                        });

                        // saves the file and updates it's parent folder to include it's id
                        newFile.save()
                            .then((fileThing) => {
                                folderSchema.updateMany(
                                    { path: pathString },
                                    { $push: { cFiles: fileThing._id.toString() } },
                                    function (err, result) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    }
                                );
                                res.end();
                            })
                            .catch(err => res.status(500).json(err));
                    };
                };
            })
            .catch(err => res.status(500).json(err));
    });

    return router;
}
