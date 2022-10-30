const fs = require('fs/promises');

const createImage = async ({ image, imageId = 'output' }) => {
  const base64Data = image.replace(/^data:image\/png;base64,/, '');
  try {
    await fs.writeFile(
      `./output-files/${imageId}/output-${imageId}.png`,
      base64Data,
      'base64',
    );
  } catch (error) {
    console.log('## error creating image 🤕: ', error);
  }
  return;
};

module.exports = { createImage };
