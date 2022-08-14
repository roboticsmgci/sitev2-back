'use strict';
var express = require('express');
var router = express.Router();
var tool = require('../tools/fileTool');

// Folder Model
let folderSchema = require("../models/folder");

// File Model
let fileSchema = require("../models/file");

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ');
    next();
})

// how to access files and folders
router.route('/*')
    .get(function (req, res) {

        pathString = tool.pathStringify(req.originalUrl);

        // finds the folder the path directs to
        folderSchema.findOne({ path: pathString }, function (err, folder) {
            if (err) return err;

            if (folder != null) {
                return res.json(folder);
            };
        });

        // if there is no such folder it checks if it's a file
        fileSchema.findOne({ path: pathString }, function (err, file) {
            if (err) return err;

            if (file != null) {
                return res.json(file);
            };
        });

        return res.send(req);

    })

    // if a post request is ever made
    .post((req, res) => {
        // finds the path and neighbour file/folder names
        var pathString = tool.pathStringify(req.originalUrl);
        console.log(pathString);
        tool.neighbourNames(pathString, 2)
            .then((names) => {
                console.log(names);

                // for loops through each item to be added
                for (var i = 0; i < req.body.length; i++) {
                    var item = req.body[i];
                    if (!names.includes(item.name + item.extension)) {
                        // checks if the item to be added is a folder
                        if (item.type == 'folder') {
                            let newFolder = new folderSchema({
                                folderName: item.name,
                                folderContent: [],
                                metaData: item.data,
                                path: pathString + item.name + ',',
                                cDir: [],
                                cFiles: [],
                            });

                            console.log(item);
                            newFolder.save()
                                .then((folderthing) => {
                                    // the parent folder is updated to add the new folder
                                    console.log(pathString);
                                    folderSchema.updateMany(
                                        { path: pathString },
                                        { $push: { cDirs: folderthing._id.toString() } },
                                        function (err, result) {
                                            if (err) {
                                                console.log(err);
                                            }
                                        }
                                    );
                                    console.log(folderthing._id.toString());
                                })
                                .catch(err => res.status(500).json(err));
                        }

                        else {
                            let newFile = new fileSchema({
                                fileName: item.name,
                                fileExtension: item.extension,
                                file: [],
                                metaData: item.data,
                                path: pathString + item.name + item.extension + ',',
                            });

                            newFile.save()
                                .then((fileThing) => {
                                    // the parent folder is updated to add the new folder
                                    console.log(fileThing);
                                    folderSchema.updateMany(
                                        { path: pathString },
                                        { $push: { cFiles: fileThing._id.toString() } },
                                        function (err, result) {
                                            if (err) {
                                                console.log(err);
                                            }
                                        }
                                    );
                                })
                                .catch(err => res.status(500).json(err));
                        };
                    };
                };
                console.log("kill yourself");
            })
            .catch(err => res.status(500).json(err));
        res.end();
    });

module.exports = router;
