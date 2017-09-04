const wcs = require("../index");
const config = require('./config');

let client = new wcs.wcsClient(config);
var callback = function(err, data, res) {
    if (err) {
        console.log(err);
    }
    else {
        console.log(res.statusCode);
        console.log(data);
    }
}

let bucketName = 'laihy-test';
let fileName = 'a5d51ccbc7aa43bc96f2f67aebf2188d20170904160827tes.list';

// 文件信息
client.fileStat(bucketName, fileName, callback);

// 删除文件
client.fileDelete(bucketName, fileName, callback);

// fops
let fops = '<YOUR FOPS>';  // 转码指令，如avthumb/mp4/vb/64k等
client.fops(bucketName, fileName, fops, null, 0, 0, callback);

// 查询音视频操作状态
client.fopsStatus('<persistentId>', callback);