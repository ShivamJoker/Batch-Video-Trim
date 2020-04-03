const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const sanitize = require("sanitize-filename");

const inputSrc = "./source.mp4";
const outputDir = "./output/";

let timeAndTitles = fs.readFileSync("list.txt", "utf8").split("\n");
// this will get all the lists in array

// console.log(timeStamps);

const regex = /(?<time>(?:[0-9]{1,2})(?::[0-9]{1,2})+)(?:\s?-\s?|\)\s?)(?<title>.*\w)/gim;

let timeStamps = [];
let titles = [];

let matches;
//extract time and titles
timeAndTitles.forEach(e => {
  matches = [...e.matchAll(regex)];

  const time = matches[0][1];
  timeStamps.push(time); //all the times will be stored here

  const title = matches[0][2];
  titles.push(sanitize(title)); //sanitize the title
});

const TrimVideo = async (timeStart, timeEnd, title) => {
  return new Promise((resolve, reject) => {
    ffmpeg("./source.mp4")
      .on("end", function() {
        console.log("Trimmed succesfully");
        resolve("done");
      })
      .on("error", function(err) {
        console.log("an error happened: " + err.message);
        reject("error");
      })
      .setStartTime(timeStart)
      .seekInput(timeEnd)
      // save to file
      .save(`${outputDir}${title}.mp4`);
  });
};

const getVideoDuration = () =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputSrc, function(err, metadata) {
      // console.dir(metadata); // all metadata
      // console.log(metadata.format.duration);
      resolve(metadata.format.duration);
    });
  });


const loopArray = async () => {
  const videoDuration = await getVideoDuration();

  for (const index of timeStamps.keys()) {
    const timeStart = timeStamps[index] ? timeStamps[index] : "0:00";
    const timeEnd = timeStamps[index + 1]
      ? timeStamps[index + 1]
      : videoDuration;
    const title = titles[index];

    console.log(timeStart, timeEnd, title);

    await TrimVideo(timeStart, timeEnd, title).catch(e => {
      console.log(e);
    });
  }
};

loopArray();
