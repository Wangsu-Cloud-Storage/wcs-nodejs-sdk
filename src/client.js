const normalUploader = require('./uploader/normalUploader');
const resumeUploader = require('./uploader/resumeUploader');
const resouceManager = require('./manager/resource');
const utils = require('./utils');

var defaultConfig = {
    AccessKey: '',              // AK
    SecretKey: '',              // SK
    UploadDomain: '',           // 上传域名，无需http前缀
    MgrDomain: '',              // 管理域名，无需http前缀
    BlockSize: 4 * 1024 * 1024, // 分片上传块大小，不需修改
    IsUseHttps: false,          // 是否使用https
    HttpTimeout: 120000,        // 默认超时时间，单位毫秒，默认120s
}

class WcsClient {
    constructor(config) {
        this.config = utils.extend(defaultConfig, config);
    }

    /**
     * 按文件路径上传-普通上传
     * @param {*} filePath      文件绝对路径
     * @param {*} putPolicy     上传凭证
     * @param {*} extraParams   额外参数，非必填
     *  key         文件名
     *  params      自定义变量，变量名称需以x:开头
     *  mimeType    自定义文件mimeType
     *  deadline    定义文件过期时间，单位3
     * @param {*} callback
     */
    uploadByPath(filePath, putPolicy, extraParams, callback) {
        let uploadToken = this.uploadToken(putPolicy);

        let uploader = new normalUploader(this.config);
        uploader.file(uploadToken, filePath, extraParams, callback)
    }

    /**
     * 按文件路径上传-分片上传
     * @param {*} filePath      文件绝对路径
     * @param {*} putPolicy     上传凭证
     * @param {*} extraParams   额外参数，非必填
     *  key         文件名
     *  params      自定义变量，变量名称需以x:开头
     *  mimeType    自定义文件mimeType
     *  deadline    定义文件过期时间，单位3
     *  recordFile  上传记录保存路径，指定该路径后会启用断点续传
     *  progressCallback    上传进度回调
     * @param {*} callback
     */
    resumeUploadByPath(filePath, putPolicy, extraParams, callback) {
        let uploadToken = this.uploadToken(putPolicy);

        let uploader = new resumeUploader(this.config);
        uploader.file(uploadToken, filePath, extraParams, callback)
    }

    /**
     * 获取文件基本信息
     * @param {*} bucketName
     * @param {*} fileName
     * @param {*} callback
     */
    fileStat(bucketName, fileName, callback) {
        let manager = new resouceManager(this.config);
        manager.fileStat(bucketName, fileName, callback);
    }

    /**
     * 删除文件
     * @param {*} bucketName
     * @param {*} fileName
     * @param {*} callback
     */
    fileDelete(bucketName, fileName, callback) {
        let manager = new resouceManager(this.config);
        manager.fileDelete(bucketName, fileName, callback);
    }

    /**
     * 音视频操作
     * @param {*} bucketName
     * @param {*} fileName
     * @param {*} fops
     * @param {*} notifyURL
     * @param {*} force
     * @param {*} separate
     * @param {*} callback
     */
    fops(bucketName, fileName, fops, notifyURL, force, separate, callback) {
        let manager = new resouceManager(this.config);
        manager.fops(bucketName, fileName, fops, notifyURL, force, separate, callback);
    }

    /**
     * 查询音视频操作状态
     * @param {*} persistentId
     * @param {*} callback
     */
    fopsStatus(persistentId, callback) {
        let manager = new resouceManager(this.config);
        manager.fopsStatus(persistentId, callback);
    }

    uploadToken(putPolicy) {
        return utils.uploadToken(this.config.AccessKey, this.config.SecretKey, putPolicy);
    }
}

module.exports = WcsClient;