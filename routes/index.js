'use strict';
var express = require('express');
var router = express.Router();
var folderSchema = require("../models/folder");
var fileSchema = require("../models/file");
const tool = require('../tools/fileTool');

router.route('/')

    .get((req, res) => {
        res.json("kill me");
    })
    // if a post request is ever made
    .post((req, res) => {
        console.log("INDEX.JS POST");
        req.body.forEach(function (item) {
            tool.neighbourNames(null, 2)
                .then((nameCheck) => {
                    console.log(nameCheck);
                    // checks if the item to be added is a folder
                    if (item.type == 'folder' && !nameCheck.includes(item.name + item.extension)) {
                        let newFolder = new folderSchema({
                            folderName: item.name + item.extension,
                            folderContent: [],
                            metaData: item.data,
                            path: ',',
                            cDir: [],
                            cFiles: [],
                        });

                        console.log(item);
                        newFolder.save()
                            .then((folderthing) => {
                                res.send(folderthing);
                            })
                            .catch(err => res.status(500).json(err));
                    }

                    else if (!nameCheck.includes(item.name + item.extension)) {
                        let newFile = new fileSchema({
                            fileName: item.name,
                            fileExtension: item.extension,
                            file: [],
                            metadata: item.data,
                            path: ',',
                        });

                        newFile.save()
                            .then((fileThing) => {
                                res.send(fileThing);
                            })
                            .catch(err => res.status(500).json(err));
                    }
                })
                .catch(err => console.log(err));
        });
    });

module.exports = router;
