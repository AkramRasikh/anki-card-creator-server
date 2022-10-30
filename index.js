const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const shell = require('shelljs');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { createImage } = require('./create-image');

const port = 3001;

app.use(
  cors({
    origin: '*',
  }),
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/file', async (req, res) => {
  let uploadFile = req.files.file;
  const fileName = req.files.file.name;
  uploadFile.mv(`public/files/${fileName}`, function (err) {
    if (err) {
      return res.status(500).send(err);
    }
    res.json({
      file: `public/${req.files.file.name}`,
    });
  });
});

app.post('/', async (req, res) => {
  const snips = req.body.snips;
  const audioFileName = req.body.audioFileName;
  const firstSnip = snips[0];
  try {
    await fs.mkdirSync(`output-files/${firstSnip.id}`); // __dirname
  } catch (error) {
    console.log('## Error creating path');
  }
  shell.exec(
    `ffmpeg -ss ${firstSnip.startTime} -to ${firstSnip.endTime} -i public/files/${audioFileName} -c copy output-files/${firstSnip.id}/output.mp3`,
  );
  await createImage({ image: firstSnip.image, imageName: firstSnip.id });
  // create anki card here?
  res.status(200).send('Snippet created');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
