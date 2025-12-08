# wcs-nodejs-sdk

## Language
- [简体中文](README.md)
- [English](README.en.md)

## Installation
1. Install via npm
```
npm install wcs-nodejs-sdk
```

2. Manual installation
After downloading the source code from GitHub, go to the root directory and execute:
```
npm install
```
## Usage
If installed via npm, use the following require directive:
```
const wcs = require('wcs-nodejs-sdk');

let client = new wcs.wcsClient(config);
```

If installed manually, require the index.js file from the root directory:
```
const wcs = require('wcs-nodejs-sdk/index');

let client = new wcs.wcsClient(config)
```

## Configuration
Before using wcs-nodejs-sdk, you need to:
1. Have a pair of keys, which can be viewed in the Wangsu Cloud Storage console
2. Create a new bucket, which can be operated in the Wangsu Cloud Storage console

After completing the above operations, create a config file in your project. The configuration items and definitions are as follows:
```
var config = {
    AccessKey: '<YOUR ACCESS KEY>',         // Upload credential, can be queried in your console under Security Management --> Key Management
    SecretKey: '<YOUR SECRET KEY>',         // Management credential, can be queried in your console under Security Management --> Key Management
    UploadDomain: '<YOUR UPLOAD DOMAIN>',   // Upload domain (without http prefix), can be queried in your console under Security Management --> Domain Query
    MgrDomain: '<YOUR MGR DOOMAIN>',        // Management domain (without http prefix), can be queried in your console under Security Management --> Domain Query
    BlockSize: <chunk upload block size>,   // Default is 4194304 (4M, not recommended to modify), must be greater than 4M and an integer multiple of 4M, must be an int type integer
    HttpTimeout: <http timeout>,            // Http timeout, in milliseconds. Default is 120000 (120 seconds), must be an int type integer
};

module.exports = config;
```

## File Upload - Simple Upload
Simple upload uploads the file to Wangsu Cloud Storage in one operation. It is recommended to use simple upload only when the file is less than 20M.

### Example
```
const wcs = require('wcs-nodejs-sdk');
const config = require('./config');

let putPolicy = {
    scope: bucket+':'+key,
    deadline: '<deadline>',
};

let client = new wcs.wcsClient(config);
var callback = function(err, data, res) {
    console.log('callback');
    if (err) {
        console.log(err);
    }
    else {
        console.log(res.statusCode);
        console.log(wcs.utils.urlSafeBase64Decode(data));
    }
}

// Simple upload
let filePath = __dirname+'/test';
client.uploadByPath(filePath, putPolicy, null, callback);
```

## File Upload - Chunked Upload
1. When the file is large, using simple upload is prone to upload exceptions such as timeouts. It is recommended to use chunked upload when the file is larger than 20M.
2. When using chunked upload, you can customize the chunk size, but the configured chunk size must be greater than 4M and an integer multiple of 4M.
3. When using chunked upload, if you specify a file to save upload records, resumable upload will be enabled after the upload is interrupted and then the same file is uploaded again.

### Example
```
const wcs = require('wcs-nodejs-sdk');
const config = require('./config');

let putPolicy = {
    scope: bucket+':'+key,
    deadline: '<deadline>',
};

let client = new wcs.wcsClient(config);
var callback = function(err, data, res) {
    console.log('callback');
    if (err) {
        console.log(err);
    }
    else {
        console.log(res.statusCode);
        console.log(wcs.utils.urlSafeBase64Decode(data));
    }
}

// Chunked upload progress callback
var progressCallback = function(readLength, fileSize) {
    console.log(readLength + '/' + fileSize + ' finished');
}

// Chunked upload
let filePath = __dirname+'/test20M';

// If recordFile is not specified, resumable upload will not be enabled
let recordFile = __dirname+'/resume.record';
client.resumeUploadByPath(filePath, putPolicy, {deadline:3, mimeType: 'application/text', progressCallback: progressCallback}, callback);
```

For more examples, please refer to **wcs-nodejs-sdk/demos**