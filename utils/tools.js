function createStatusResponseObject(success, message) {
  if (typeof message === "string" || message instanceof String)
    return { success: success, data: { message: message } }; // {"success": true, "data": {"message": "user inserted."}}

  return { success: success, data: message };  // {"success": true, "data": {"user": {user}}}
}

module.exports = {
  statusResponse: createStatusResponseObject,
};
