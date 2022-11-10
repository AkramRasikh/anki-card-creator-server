const shell = require('shelljs');

const sendToAnkiCard = ({ ankiDeckName, mediaId }) => {
  shell.exec(
    `python3 main.py --folder_to_anki=${ankiDeckName} --media_id=${mediaId}`,
  );
};

module.exports = {
  sendToAnkiCard,
};
