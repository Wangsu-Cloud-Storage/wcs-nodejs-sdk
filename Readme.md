## wcs-nodejs-sdk

### 安装
1. npm安装
```
npm install wcs-nodejs-sdk
```

2. 手动安装
从GitHub站点下载源码后，到根目录执行。
```
npm install
```

### 配置
使用wcs-nodejs-sdk之前，您需要
1. 拥有一对密钥，可在网宿云存储控制台查看
2. 新建一个空间，可以网宿云存储控制台操作

执行完以上操作后，在您的项目中创建一个config文件，配置项及定义如下
```
var config = {
    AccessKey: '<YOUR ACCESS KEY>',         // 上传凭证，可在您控制台安全管理-->密钥管理中查询
    SecretKey: '<YOUR SECRET KEY>',         // 管理凭证，可在您控制台安全管理-->密钥管理中查询
    UploadDomain: '<YOUR UPLOAD DOMAIN>',   // 上传域名（无需http前缀），可在您控制台安全管理-->域名查询中查询
    MgrDomain: '<YOUR MGR DOOMAIN>',        // 管理域名（无需http前缀），可在您控制台安全管理-->域名查询中查询
    BlockSize: '<分片上传块大小>',             // 默认为4M（建议不修改），需大于4M且为4M的整数倍
    HttpTimeout: '<http超时时间>',          // http超时时间，单位毫秒。默认120000（120秒）
};

module.exports = config;
```

### 文件上传-普通上传
普通上传在一次操作中将文件上传至网宿云存储，建议仅在文件小于20M时使用普通上传。
范例
```
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

// 普通上传
let filePath = __dirname+'/test';
client.uploadByPath(filePath, putPolicy, null, callback);
```

### 文件上传-分片上传
1. 当文件较大时，使用普通上传容易出现超时等上传异常。建议在文件大于20M时选择分片上传功能。
2. 使用分片上传时可自定义分块大小，但配置的分块大小必须大于4M且为4M的整数倍。
3. 使用分片上传时如指定文件保存上传记录，则上传中断后再次上传相同文件会启用断点续传功能。

范例
```
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

// 分片上传进度回调
var progressCallback = function(readLength, fileSize) {
    console.log(readLength + '/' + fileSize + ' finished');
}

// 分片上传
let filePath = __dirname+'/test20M';

// 若不指定recordFile则不会启用断点续传功能
let recordFile = __dirname+'/resume.record';
client.resumeUploadByPath(filePath, putPolicy, {deadline:3, mimeType: 'application/text', progressCallback: progressCallback}, callback);
```

更多范例参考**wcs-nodejs-sdk/demos**