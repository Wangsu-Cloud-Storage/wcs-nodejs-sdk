const normalUploader = require('./uploader/normalUploader');
const resumeUploader = require('./uploader/resumeUploader');
const resouceManager = require('./manager/resource');
const utils = require('./utils');

var defaultConfig = {
    AccessKey: '',
    SecretKey: '',
    UploadDomain: '',
    MgrDomain: '',
    BlockSize: 4 * 1024 * 1024,
    IsUseHttps: false,
    HttpTimeout: 120000,
}

class WcsClient {
    constructor(config) {
        this.config = utils.extend(defaultConfig, config);
    }

    uploadByPath(filePath, putPolicy, extraParams, callback) {
        let uploadToken = this.uploadToken(putPolicy);

        let uploader = new normalUploader(this.config);
        uploader.file(uploadToken, filePath, extraParams, callback)
    }

    resumeUploadByPath(filePath, putPolicy, extraParams, callback) {
        let uploadToken = this.uploadToken(putPolicy);

        let uploader = new resumeUploader(this.config);
        uploader.file(uploadToken, filePath, extraParams, callback)
    }

    fileStat(bucketName, fileName, callback) {
        let manager = new resouceManager(this.config);
        manager.fileStat(bucketName, fileName, callback);
    }

    fileDelete(bucketName, fileName, callback) {
        let manager = new resouceManager(this.config);
        manager.fileDelete(bucketName, fileName, callback);
    }

    fops(bucketName, fileName, fops, notifyURL, force, separate, callback) {
        let manager = new resouceManager(this.config);
        manager.fops(bucketName, fileName, fops, notifyURL, force, separate, callback);
    }

    fopsStatus(persistentId, callback) {
        let manager = new resouceManager(this.config);
        manager.fopsStatus(persistentId, callback);
    }

    uploadToken(putPolicy) {
        return utils.uploadToken(this.config.AccessKey, this.config.SecretKey, putPolicy);
    }
}

module.exports = WcsClient;