module.exports = function () {
  const jwtKey = process.env.JWT_PRIVATE_KEY;
  if (!jwtKey) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }
};
