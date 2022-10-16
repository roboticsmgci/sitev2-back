'use strict';
var express = require('express');
var router = express.Router();
var folderSchema = require("../models/folder");
var fileSchema = require("../models/file");
const tool = require('../tools/fileTool');


// middleware that is specific to this router
router.route('/*')
    .get((req, res) => {
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
                        .catch(err => console.log(err));
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
                        res.end();
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    })

module.exports = router;