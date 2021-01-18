const readline = require('readline');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const ytdl = require('ytdl-core');
const stream = require('stream');
const AWS = require('aws-sdk');
const url = 'https://www.youtube.com/watch?v=';
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const cors = {
        "Access-Control-Allow-Origin" : "*", 
        "Access-Control-Allow-Credentials" : true, 
        "access-control-allow-methods" : "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT"
      };


AWS.config.update({ signatureVersion: 'v4', accessKeyId: YOUR_ACCESS_KEY, secretAccessKey: YOUR_SECRET, region: AWS_REGION });

function FetchAndUploadToS3(url, s3filename){
  return new Promise((resolve, reject) => {
  const passtrough = new stream.PassThrough();
  const upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: YOUR_S3_BUCKET,
      Key: s3filename+".mp4",
      ACL: "private",
      Body: passtrough
    },
    partSize: 1024 * 1024 * 64 // in bytes
  });

  upload.on('httpUploadProgress', (progress) => {
    console.log(`copying video ...`, progress);
  });
  upload.send((err) => {
    if (err) {
     reject(false);
    } else {
     resolve(true);
    }
  });
  
  var starttime;
  const video = ytdl(url, { filter: format => format.container === 'mp4' });

video.once('response', () => {
  starttime = Date.now();
});

video.on('progress', (chunkLength, downloaded, total) => {
  const percent = downloaded / total;
  const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
  const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
  process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
  process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
  process.stdout.write(`, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `);
  readline.moveCursor(process.stdout, 0, -1);
});
video.on('end', () => {
  process.stdout.write('\n\n');
});
  
video.pipe(passtrough);

video.on('error', err => {
  console.log("EN FEIL HAR OPPSTATT");
  console.log(err);
      reject(false);
});

})};



exports.handler = async (event) => {
console.log(event);
var input = JSON.parse(event.body);

if(!input.url){
  return {statusCode: 200,headers: cors, body: JSON.stringify({success:false})};
}
var id  = ytdl.getURLVideoID(input.url)
console.log(id);
var isitvalid = ytdl.validateID(id);
console.log("the id is: " + isitvalid);
if(!isitvalid){
   return {statusCode: 200,headers: cors, body:JSON.stringify({success:false}) }; 
}

var s3filename = uuidv4();
var s3response = await FetchAndUploadToS3(input.url,s3filename);
return {statusCode: 200,headers: cors, body: JSON.stringify({success:s3response, guid: s3filename})};
};

