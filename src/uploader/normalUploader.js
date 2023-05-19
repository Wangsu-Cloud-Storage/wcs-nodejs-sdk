const wcsHttp = require('../http');
const utils = require('../utils');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const Readable = require('stream').Readable;
const formstream = require('formstream');

var defaultExtraParams = {
    key: '',
    params: {},
    mimeType: null,
    deadline: null,
}

class NormalUploader {
    constructor(config) {
        this.config = config;
    }

    /**
     * 上传本地文件
     * @param {*} uploadToken   上传凭证
     * @param {*} localFile     文件绝对路径
     * @param {*} extraParams   额外表单参数，可填null
     * @param {*} callback      回调
     */
    file(uploadToken, localFile, extraParams, callback) {
        extraParams = utils.extend(defaultExtraParams, extraParams || {});
        let fileStream = fs.createReadStream(localFile);

        if (!extraParams.mimeType) {
            extraParams.mimeType = mime.getType(localFile);
        }

        if (!extraParams.key) {
            extraParams.key = path.basename(localFile);
        }

        return this.stream(uploadToken, fileStream, extraParams, callback);
    }

    /**
     * 上传数据流
     * @param {*} uploadToken   上传凭证
     * @param {*} fileStream      数据流
     * @param {*} extraParams   额外表单参数，可填null
     * @param {*} callback      回调
     */
    stream(uploadToken, fileStream, extraParams, callback) {
        extraParams = utils.extend(defaultExtraParams, extraParams || {});
        if (!extraParams.mimeType) {
            extraParams.mimeType = 'application/octet-stream';
        }

        fileStream.on("error", function(err) {
            callback(err, null, null);
            return;
        });

        this.createRequest(uploadToken, fileStream, extraParams, callback);
    }

    createRequest(uploadToken, fileStream, extraParams, callback) {
        let postForm = formstream();
        postForm.field('token', uploadToken);
        if (extraParams.key) {
            postForm.field('key', extraParams.key);
        }
        if (extraParams.mimeType) {
            postForm.field('mimeType', extraParams.mimeType);
        }
        if (extraParams.deadline) {
            postForm.field('deadline', extraParams.deadline);
        }

        postForm.stream('file', fileStream, path.basename(fileStream.path), extraParams.mimeType);

        // 可选参数
        let params = extraParams.params;
        for (let key in params) {
            postForm.field(key, params[key].toString());
        }
        let fileBody = [];
        fileStream.on('data', function(data) {
            fileBody.push(data);
        });
        this.sendRequest(postForm, callback);
    }

    sendRequest(postForm, callback) {
        let scheme = this.config.IsUseHttps ? "https://" : "http://";
        let uploadDomain = scheme + this.config.UploadDomain + '/file/upload';

        let http = new wcsHttp(this.config.HttpTimeout, this.config.RetryTimes);
        http.postByStream(uploadDomain, postForm, callback);
    }
}

module.exports = NormalUploader;