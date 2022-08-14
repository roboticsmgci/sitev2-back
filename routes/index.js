'use strict';
var express = require('express');
var router = express.Router();
var tool = require('../tools/fileTool');
var folderSchema = require("../models/folder");
var fileSchema = require("../models/file");

router.route('/')

    .get((req, res) => {
        res.json("kill me");
    })
    // if a post request is ever made
    .post((req, res) => {

        var item = req.body;
        // checks if the item to be added is a folder
        if (item.type == 'folder') {
            let newFolder = new folderSchema({
                folderName: item.name,
                folderContent: [],
                metaData: item.data,
                path: ',' + item.name + ',',
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

        else {
            let newFile = new fileSchema({
                fileName: item.name,
                fileExtension: item.extension,
                file: [],
                metadata: item.data,
                path: pathString + item.name + item.extension + ',',
            });

            newFile.save()
                .then((fileThing) => {
                    res.send(fileThing);
                })
                .catch(err => res.status(500).json(err));
        };
    });

module.exports = router;
