const fs = require('fs');
const dotenv = require('dotenv');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const shell = require('shelljs');
const fileUpload = require('express-fileupload');
const { createImage } = require('./create-image');
const { fileToCollection } = require('./send-to-media-collection');
const { sendToAnkiCard } = require('./create-anki-card');
const { deleteMedia } = require('./delete-media');
const ffmpeg = require('fluent-ffmpeg');
// const zlib = require('zlib');

const port = 3001;

dotenv.config();

app.use(
  cors({
    origin: '*',
  }),
);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
  }),
);
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

let outputFile = '';

const outputPath = 'output-files';

app.post('/file', async (req, res) => {
  let uploadFile = req.files.file;
  const fileName = req.files.file.name;
  uploadFile.mv(`public/files/${fileName}`, function (err) {
    if (err) {
      return res.status(500).send(err);
    }
    outputFile = fileName;
    console.log('## outputFile (47): ', outputFile);
    res.json({
      file: `public/${req.files.file.name}`,
    });
  });
});

//www.geeksforgeeks.org/node-js-fs-open-method/
//(the media-convere)
// https:
// fs.readdirSync('./anki-folder/' + fileName);
// fs.open('./anki-folder/' + fileName, 'r', function (err, f) {
//   if (err) {
//     console.log('## Opened err: ', err);
//   }
//   console.log('## Opened (f): ', f);
//   console.log('## Opened (fileName): ', fileName);
// });
// fs.watch('./anki-folder', (_, fileName) => {
//   const fileContents = fs.createReadStream('./anki-folder/' + fileName);
//   const writeStream = fs.createWriteStream(
//     './anki-folder/' + fileName.slice(0, -4),
//   );
//   const unzip = zlib.createGunzip();
//   fileContents.pipe(unzip).pipe(writeStream);
// });

app.post('/snippet', async (req, res) => {
  const snips = req.body.snips;
  const audioFileName = req.body.audioFileName;
  const firstSnip = snips[0];
  const ankiDeckName = req.body.ankiDeckName; // + '-' + firstSnip.id;
  try {
    await fs.mkdirSync(`output-files/${firstSnip.id}`); // __dirname
    const duration = (firstSnip.endTime - firstSnip.startTime).toString(); // meed string?
    ffmpeg(`public/files/${audioFileName}`)
      .seekInput(firstSnip.startTime)
      .duration(duration)
      .output(`output-files/${firstSnip.id}/output-${firstSnip.id}.mp3`)
      .on('end', async function () {
        await createImage({ image: firstSnip.image, imageId: firstSnip.id });
        const pathToFile = outputPath + '/' + firstSnip.id;
        const mediaToCopy = await fs.readdirSync(pathToFile);
        mediaToCopy.forEach(async (mediaItem) => {
          const pathToLocalMedia =
            outputPath + '/' + firstSnip.id + '/' + mediaItem;
          await fileToCollection({ pathToLocalMedia, media: mediaItem });
        });
        sendToAnkiCard({ ankiDeckName, mediaId: firstSnip.id });
        return res.status(200).send('Snippet created');
      })
      .run();
  } catch (error) {
    console.log('## Error in creating card: ', error);
    return res.status(400).send('General flop');
  }
});
app.post('/', async (req, res) => {
  const snips = req.body.snips;
  const audioFileName = req.body.audioFileName;
  const firstSnip = snips[0];
  try {
    await fs.mkdirSync(`output-files/${firstSnip.id}`); // __dirname
    shell.exec(
      `ffmpeg -ss ${firstSnip.startTime} -to ${firstSnip.endTime} -i public/files/${audioFileName} -c copy output-files/${firstSnip.id}/output-${firstSnip.id}.mp3`,
    );
    await createImage({ image: firstSnip.image, imageId: firstSnip.id });
    const pathToFile = outputPath + '/' + firstSnip.id;
    const mediaToCopy = await fs.readdirSync(pathToFile);

    mediaToCopy.forEach(async (mediaItem) => {
      const pathToLocalMedia =
        outputPath + '/' + firstSnip.id + '/' + mediaItem;
      await fileToCollection({ pathToLocalMedia, media: mediaItem });
    });
    sendToAnkiCard({ mediaId: firstSnip.id });
    deleteMedia(outputPath + '/' + firstSnip.id);
    return res.status(200).send('Snippet created');
  } catch (error) {
    console.log('## Error in creating card: ', error);
    return res.status(400).send('General flop');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
