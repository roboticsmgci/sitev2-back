'use strict';
var express = require('express');
var router = express.Router();
var folderSchema = require("../models/folder");
var fileSchema = require("../models/file");
const tool = require('../tools/fileTool');

// Process Model
let processSchema = require("../models/processes");

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log("hi");
    if (req.originalURL == "/") {
        next();
    }
    processSchema.find({ command: tool.pathBottom(req.originalUrl) })
        .then((process) => {
            if (process.length > 1) {
                res.json({ response: "To be created", content: process });
            }
            console.log(process);
            console.log(process.processPath);
            var processFile = require(process[0].processPath);
            router.use("/" + tool.pathBottom(req.originalUrl) + "/", processFile);
        })
        .catch(err => console.log(err));
    next();
})

router.route('/')

    .get((req, res, next) => {
        res.json("FUCK");
        next();
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
