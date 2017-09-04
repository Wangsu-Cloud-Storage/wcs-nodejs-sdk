const wcsHttp = require('../http');
const utils = require('../utils');

class ResourceManager {
    constructor(config) {
        this.config = config;
    }

    fileStat(bucketName, fileName, callback) {
        let uri = '/stat/' + utils.encodedEntry(bucketName, fileName);
        this.sendRequest(uri, callback);
    }

    fileDelete(bucketName, fileName, callback) {
        let uri = '/delete/' + utils.encodedEntry(bucketName, fileName);
        this.sendRequest(uri, callback, wcsHttp.METHOD_POST);
    }

    fops(bucketName, fileName, fops, notifyURL, force, separate, callback) {
        force = force || 0;
        separate = separate || 0;
        notifyURL = notifyURL || null;
        let data = 'bucket=' + utils.urlsafeBase64Encode(bucketName) + '&' +
                   'key=' + utils.urlsafeBase64Encode(fileName) + '&' +
                   'fops=' + utils.urlsafeBase64Encode(fops) + '&' +
                   'force=' + force + '&' +
                   'separate=' + separate;
        if (notifyURL) {
            data += '&notifyURL=' + utils.urlsafeBase64Encode(notifyURL);
        }

        let uri = '/fops';
        this.sendRequest(uri, callback, wcsHttp.METHOD_POST, data);
    }

    fopsStatus(persistentId, callback) {
        let uri = '/status/get/prefop?persistentId=' + persistentId;
        this.sendRequest(uri, callback);
    }

    sendRequest(uri, callback, method, data) {
        method = method || wcsHttp.METHOD_GET;
        data = data || null;

        let scheme = this.config.IsUseHttps ? "https://" : "http://";
        let uploadDomain = scheme + this.config.MgrDomain + uri;

        let token = utils.mgrToken(this.config.AccessKey, this.config.SecretKey, uri, data);
        let headers = {'Authorization': token};

        let http = new wcsHttp(this.config.HttpTimeout, this.config.RetryTimes);
        if (method == wcsHttp.METHOD_GET) {
            http.get(uploadDomain, headers, callback);
        }
        else {
            http.post(uploadDomain, data, headers, callback);
        }
    }
}

module.exports = ResourceManager;