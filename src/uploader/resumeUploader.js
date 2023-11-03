const wcsHttp = require('../http');
const utils = require('../utils');
const path = require('path');
const fs = require('fs');

let defaultExtraParams = {
    key: '',
    params: {},
    deadline: null,
    recordFile: null,
    progressCallback: null,
}

class ResumeUploader {
    constructor(config) {
        this.config = config;
        this.uploadBatch = this.buildUploadBatch();
    }

    buildUploadBatch() {
        return utils.urlsafeBase64Encode('wcs-nodejs-sdk'+new Date().getTime());
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
        let fileSize = fs.statSync(localFile).size;

        if (!extraParams.key) {
            extraParams.key = path.basename(localFile);
        }

        return this.stream(uploadToken, fileStream, fileSize, extraParams, callback);
    }

    /**
     * 上传数据流
     * @param {*} uploadToken   上传凭证
     * @param {*} fileStream      数据流
     * @param {*} extraParams   额外表单参数，可填null
     * @param {*} callback      回调
     */
    stream(uploadToken, fileStream, fileSize, extraParams, callback) {
        if (fileSize < this.config.BlockSize) {
            callback(new Error('fileSize(' + fileSize + ') is less than BlockSize(' + this.config.BlockSize + '), please use normalUpload'));
            return;
        }

        extraParams = utils.extend(defaultExtraParams, extraParams || {});

        fileStream.on("error", (err) => {
            callback(err, null, null);
            return;
        });

        this.createRequest(uploadToken, fileStream, fileSize, extraParams, callback);
    }

    createRequest(uploadToken, fileStream, fileSize, extraParams, callback) {
        let blockNumber = fileSize / this.config.BlockSize;
        let totalBlockNumber = (fileSize % this.config.BlockSize == 0) ? blockNumber : (blockNumber + 1);
        let totalBlock = Math.ceil(blockNumber);
        let finishedBlock = 0;
        let currentBlock = 0;
        let readLength = 0;
        let readBuffers = [];
        let finishedCtxList = [];
        let finishedBlkPutRets = [];
        let sent = false
        if (extraParams.recordFile) {
            try {
                let resumeRecords = fs.readFileSync(extraParams.recordFile).toString();
                if (resumeRecords) {
                    try {
                        let records = JSON.parse(resumeRecords);
                        this.uploadBatch = records.uploadBatch;
                        let ctxs = records.ctxs;

                        for (let index = 0; index < ctxs.length; index++) {
                            let ctx = ctxs[index];
                            finishedBlock += 1;
                            finishedCtxList.push(ctx.ctx);
                        }
                    } catch (err) {
                        callback(err);
                    }
                }
            } catch (err) {
                // callback(err)
            }
        }

        let isEnd = fileStream._readableState.ended;

        fileStream.on('data', (chunk) => {
            readLength += chunk.length;
            readBuffers.push(chunk);

            if (readLength % this.config.BlockSize == 0 || readLength == fileSize) {
                let readData = Buffer.concat(readBuffers);
                readBuffers = [];
                currentBlock += 1;
                if (currentBlock > finishedBlock) {
                    fileStream.pause();
                    this.mkblk(uploadToken, readData, currentBlock-1, extraParams, (respErr, respBody, respInfo) => {
                        if (respInfo.statusCode != 200) {
                            callback(respErr, respBody, respInfo);
                            return;
                        } else {
                            finishedBlock += 1;
                            let blkputRet = JSON.parse(respBody);
                            finishedCtxList.push(blkputRet.ctx);
                            finishedBlkPutRets.push(blkputRet);
                            if (extraParams.progressCallback) {
                                extraParams.progressCallback(readLength, fileSize);
                            }
                            if (extraParams.recordFile) {
                                let contents = {uploadBatch: this.uploadBatch, ctxs: finishedBlkPutRets};
                                contents = JSON.stringify(contents);
                                fs.writeFileSync(extraParams.recordFile, contents, {encoding: 'utf-8'});
                            }

                            fileStream.resume();
                            if (totalBlock === finishedCtxList.length) {
                                this.mkfile(uploadToken, fileSize, finishedCtxList, extraParams, callback);
                                sent = true
                            }
                        }
                    });
                }
            }
        });

        fileStream.on('end', () => {
            if (!sent && readLength === fileSize) {
                this.mkfile(uploadToken, fileSize, finishedCtxList, extraParams, callback);
            }
        });
    }

    mkblk(uploadToken, blkData, currentBlock, extraParams, callback) {
        let requestURI = "/mkblk/" + blkData.length + "/" + currentBlock;
        let auth = uploadToken;
        let headers = {
            'Authorization': auth,
            'Content-Type': 'application/octet-stream',
            'UploadBatch' : this.uploadBatch,
        }

        if (extraParams.key) {
            headers.Key = utils.urlsafeBase64Encode(extraParams.key);
        }
        this.sendPost(requestURI, blkData, headers, callback);
    }

    mkfile(uploadToken, fileSize, ctxList, extraParams, callback) {
        let requestURI = "/mkfile/" + fileSize;

        if (extraParams.params) {
            for (let k in extraParams.params) {
                requestURI += "/" + k + "/" + utils.urlsafeBase64Encode(extraParams.params[k].toString());
            }
        }

        let auth = uploadToken;
        let headers = {
            'Authorization': auth,
            'Content-Type': 'text/plain',
            'UploadBatch' : this.uploadBatch,
        }
        if (extraParams.key) {
            headers.Key = utils.urlsafeBase64Encode(extraParams.key);
        }
        if (extraParams.mimeType) {
            headers.MimeType = extraParams.mimeType;
        }
        if (extraParams.deadline) {
            headers.Deadline = extraParams.deadline;
        }
        let postBody = ctxList.join(",");
        this.sendPost(requestURI, postBody, headers, (err, data, res) => {
            if (res.statusCode == 200 || res.statusCode == 401) {
                if (extraParams.recordFile) {
                    fs.unlinkSync(extraParams.recordFile);
                }
            }
            callback(err, data, res);
        });
    }

    sendPost(uri, data, headers, callback) {
        let scheme = this.config.IsUseHttps ? "https://" : "http://";
        let uploadDomain = scheme + this.config.UploadDomain + uri;

        let http = new wcsHttp(this.config.HttpTimeout, this.config.RetryTimes);
        http.post(uploadDomain, data, headers, callback);
    }
}

module.exports = ResumeUploader;
