const fs = require("fs");


function createStatusResponseObject(success, message) {
  if (typeof message === "string" || message instanceof String)
    return { success: success, data: { message: message } }; // {"success": true, "data": {"message": "user inserted."}}

  return { success: success, data: message };  // {"success": true, "data": {"user": {user}}}
}

async function saveFileToPublicDir(file) {
  let fullName = file.name.split(".");
  const name = fullName[0];
  const extention = fullName[1];

  let fileFullName = name + "." + extention;

  fs.appendFile("./public/" + fileFullName, file.data, function (error) {
    if (error) {
      console.log("fileSaveError", error);
    }
  });
}

async function deleteFileFromPublicDir(path) {
  fs.unlink("./public/" + path, (error) => {
    if (error) {
      console.log("fileDeleteError", error);
    }
  });
}


module.exports = {
  statusResponse: createStatusResponseObject,
  saveFileToPublicDir: saveFileToPublicDir,
  deleteFileFromPublicDir: deleteFileFromPublicDir,
};
