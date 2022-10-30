const shell = require('shelljs');

const sendToAnkiCard = ({ folderScript = 'tobira-reading-tesst', mediaId }) => {
  shell.exec(
    `python3 main.py --folder_to_anki=${folderScript} --media_id=${mediaId}`,
  );
};

module.exports = {
  sendToAnkiCard,
};
