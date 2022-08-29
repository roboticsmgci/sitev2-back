# RoboHub

JSON FORMAT TO FOR EVERYTHING EXCEPT UPLOADS
============================================
```
[
    {
        "type": "folder",
        "name": "Images",
        "extension": "",
        "data": {}
    }
]
```

To create add a new root directory, send a POST request to the home page, http://localhost:1337/

To create a new directory or file, send a POST request to that url in the file system replacing root with files, http://localhost:1337/files/

To grab the data of a file, send a GET request to that url in the file system replacing root with files, http://localhost:1337/files/sheesh.txt

To grab the data of a folder, send a GET request to that url in the file system replacing root with files, http://localhost:1337/files/damn
### NOTE THAT FOLDERS GIVE JSON WHILE FILES GIVE A DOWNLOAD STREAM FOR NOW **WILL CHANGE**

To upload a new file, send a POST request to that url in the file system replacing root with upload, url/upload/folder/nextfolder/

// TODO
// Add editing of files *PUT*
// Grabbing old version of files
// Deleting files
// Uploading entire folders
// Add grabbing part of the tree
// Create packages for commands and that stuff
