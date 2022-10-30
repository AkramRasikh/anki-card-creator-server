const fs = require('fs');

const deleteMedia = (mediaPath) => {
  return fs.rmSync(mediaPath, { recursive: true });
};

module.exports = {
  deleteMedia,
};
