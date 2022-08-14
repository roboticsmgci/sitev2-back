fileSchema = require("../models/file");
folderSchema = require("../models/folder");
var mongoose = require("mongoose");

module.exports = {

    //turns a path like /upload/users/icecream/pawn.jpg into [,root,users,icecream,pawn.jpg]
    pathStringify: function (rawPath) {

        // turns a path like /stupid/users/icecream/pawn.jpg into ["root", "users", "icecream", "pawn.jpg"]
        let path = rawPath.substring(1).split('/');
        path[0] = 'root';

        if (path.at(-1) == '') {
            path.pop();
        };

        var pathString = ',';

        //turns the path into a string like [,root,users,icecream,pawn.jpg]
        for (let i = 0; i < path.length; i++) {
            pathString += path[i] + ',';
        };

        return pathString
    },

    neighbours: function (path, type) {
        // returns an array of all the files in the same directory
        return new Promise((res, rej) => {
            folderSchema.findOne({ path: path })
                .then((folder) => {
                    console.log(folder);
                    if (folder == null) {
                        return res([], []);
                    }
                    else if (type == 0) {
                        return res([folder.cFiles]);
                    }
                    else if (type == 1) {
                        return res([folder.cDirs]);
                    }
                    else if (type == 2) {
                        return res([folder.cFiles, folder.cDirs]);
                    }
                })
                .catch(err => rej(err));
        });

    },

    // returns a promise containing the names of the folder/file ids it is given
    names: function (ids) {

        // turns the string array of ids into an array of Object Id's
        var fileIds = ids[0].map(function (id) { return new mongoose.Types.ObjectId(id); });
        var folderIds = ids[1].map(function (id) { return new mongoose.Types.ObjectId(id); });
        console.log(fileIds);
        console.log(folderIds);

        // returns a promise which contains the querys of which files/folders the id's point to
        return new Promise((res, rej) => {

            // searches the file db
            fileSchema.find({ _id: {$in: fileIds } })
                .then((files) => {
                    // takes each file found and takes it's name + extension
                    const fileArray = files.map(file => file.fileName + file.fileExtension);

                    // searches the folder db
                    folderSchema.find({ _id: {$in: folderIds } })
                        .then((folders) => {
                            // takes each folder and takes it's name
                            const folderArray = folders.map(folder => folder.folderName);
                            // returns the list of names combined
                            return res(fileArray.concat(folderArray))
                        })
                        .catch(err => rej(err));
                })
                .catch(err => rej(err));
        });
    },

    // returns a promise containing the names of the folder/file neighbours (children) of the current folder path
    neighbourNames: function (path, type) {

        return new Promise((res, rej) => {
            // gets the id's of it's neighbours first
            this.neighbours(path, type)
                .then((ids) => {
                    console.log(ids);
                    // turns the list of id's into a list of names
                    this.names(ids)
                        .then((Array) => {
                            //returns the list
                            return res(Array);
                        })
                        .catch(err => rej(err));

                })
                .catch(err => rej(err));
        });
    },

    fileTitle: function (file) {
        return file.fileName + file.Extension;
    }
};