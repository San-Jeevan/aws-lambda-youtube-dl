# What this does
Downloads youtube video and pipes the stream directly to S3. By using pipeline we can download youtube videoes of any size, we wont be limited by memory or disk storage limits.

# How to use
1. Upload the .zip file as AWS Lambda layer. The layer file includes important node libraries such as ytdl-core (youtube-dl)
2. Use the code in functionfile.js as your lambda function, you need to replace the variables S3_ACCESS_KEY, S3_SECRET, S3_REGION and S3_BUCKET.

# How to use the API
It will create an REST endpoint. POST t it with a json object:
{"url": "https://www.youtube.com/watch?v=a3lcGnMhvsA"}


The code is not "perfect", but what is important is the essence of the pipelining function + the usage of youtube-dl in nodejs 12.

