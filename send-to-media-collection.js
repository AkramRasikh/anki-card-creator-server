const fs = require('fs/promises');

const fileToCollection = async ({ pathToLocalMedia, media }) => {
  const collectionPath = process.env.PATH_ANKI_MEDIA_COLLECTION + '/' + media;
  try {
    await fs.copyFile(pathToLocalMedia, collectionPath);
    console.log('# file(s) sent ✅');
  } catch (error) {
    console.log('Error in sending files to media-collection (error): ', error);
  }
  return;
};

module.exports = {
  fileToCollection,
};
