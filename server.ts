import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
const PORT = process.env.PORT || 3333;
const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('tiny'));
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/video", function (req, res) {
    try {
        // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }
  
    // get video stats (about 61MB)
    const videoPath = __dirname + "/DJI_0053.mp4";
    const videoSize = fs.statSync(videoPath).size;
    console.log(videoSize);
    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  
    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
  
    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);
  
    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });
  
    // Stream the video chunk to the client
    videoStream.pipe(res);
    } catch (error) {
        console.log(error.message);
        throw error;
    }
    
  });

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
