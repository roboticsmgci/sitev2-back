# RoboHub

To create add a new root directory, send a POST request to home page, url/

The POST request should look like:
{
// to add
}

To create a new directory or file, send a POST request to that url in the file system replacing root with files, url/files/folder/nextfolder

The POST request should look like:
{
  type: 
  // to add
}

To upload a new directory or folder, send a POST request to that url in the file system replacing root with upload, url/upload/folder/nextfolder/

The POST request should look like:
{
  type: 
  // to add
}

// TODO
// Add editing of files *PUT*
// Add routing to open and run files
// Add grabbing part of the tree
// Create packages for commands and that stuff
