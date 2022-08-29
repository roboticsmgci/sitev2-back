'use strict';
var express = require('express');
var router = express.Router();
var tool = require('../tools/fileTool');
var dbConfig = require('../database/db');
const mongoose = require('mongoose');

// Folder Model
let folderSchema = require("../models/folder");

// File Model
let fileSchema = require("../models/file");

const connect = mongoose.createConnection(dbConfig.db);

let gfs;

connect.once('open', () => {
    // initialize stream
    gfs = new mongoose.mongo.GridFSBucket(connect.db, {
        bucketName: "uploads"
    });
});


// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ');
    next();
})

// how to access files and folders
router.route('/*')
    .get(function (req, res) {

        const pathString = tool.pathStringify(req.originalUrl, 1);

        // finds the folder the path directs to
        folderSchema.findOne({
            path: pathString,
            folderName: tool.pathTop(req.originalUrl)
        })
            .then((folder) => {
                if (folder != null) {
                    console.log(folder);
                    tool.neighbourNames(tool.pathStringify(req.originalUrl), 2)
                        .then((file) => {
                            console.log(file);
                        })
                        .catch (err => console.log(err));
                    return res.json(folder);
                };

                var fName = tool.pathTop(req.originalUrl).split(".");
                if (fName.length == 1) {
                    fName.push("")
                }
                else {
                    fName[1] = "." + fName[1];
                }
                // if there is no such folder it checks if it's a file
                fileSchema.findOne({
                    path: pathString,
                    fileName: fName[0],
                    fileExtension: fName[1]
                })
                    .then((file) => {
                        if (file != null) {
                            gfs.find({ _id: file.file[0] }).toArray((err, fileData) => {
                                if (err != null) {
                                    return console.log(err);
                                }
                                gfs.openDownloadStreamByName(fileData[0].filename).pipe(res);
                            })
                        }
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));

    })

    // if a post request is ever made
    .post((req, res) => {
        // finds the path and neighbour file/folder names
        var pathString = tool.pathStringify(req.originalUrl);

        tool.neighbourNames(pathString, 2)
            .then((names) => {
                console.log(names);

                // for loops through each item to be added
                for (var i = 0; i < req.body.length; i++) {
                    var item = req.body[i];
                    if (names.includes(item.name + item.extension) == false) {
                        // checks if the item to be added is a folder
                        if (item.type == 'folder') {
                            let newFolder = new folderSchema({
                                folderName: item.name + item.extension,
                                folderContent: [],
                                metaData: item.data,
                                path: pathString,
                                cDir: [],
                                cFiles: [],
                            });

                            console.log(item);
                            newFolder.save()
                                .then((folderthing) => {
                                    // the parent folder is updated to add the new folder
                                    console.log(pathString);
                                    folderSchema.updateMany(
                                        {
                                            path: tool.pathStringify(req.originalUrl, 1),
                                            folderName: tool.pathTop(req.originalUrl)
                                        },
                                        { $push: { cDirs: folderthing._id } },
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
                                path: pathString,
                            });

                            newFile.save()
                                .then((fileThing) => {
                                    // the parent folder is updated to add the new folder
                                    console.log(fileThing);
                                    folderSchema.updateMany(
                                        {
                                            path: tool.pathStringify(req.originalUrl, 1),
                                            folderName: tool.pathTop(req.originalUrl)
                                        },
                                        { $push: { cFiles: fileThing._id } },
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
