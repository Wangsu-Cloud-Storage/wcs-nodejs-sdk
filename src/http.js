var urllib = require('urllib');
var utils = require('./utils');

const defaultTimeout = 120000;  // 120s
const defaultRetryTimes = 3;    // 失败默认重试3次

class Http {
    constructor(timeout, retryTimes) {
        this.timeout = timeout || defaultTimeout;
        this.retryTimes = retryTimes || defaultRetryTimes;
    }

    postByStream(url, form, callback) {
        this.post(url, form, form.headers(), callback);
    }

    post(url, form, headers, callback) {
        headers = headers || {};
        headers['User-Agent'] = headers['User-Agent'] || utils.userAgent();
        headers['Connection'] = 'keep-alive';

        var data = {
            headers: headers,
            method: 'POST',
            timeout: this.timeout,
            dataType: 'text',
            gzip: true,
        };

        if (Buffer.isBuffer(form) || typeof form === 'string') {
            data.content = form;
        } else if (form) {
            data.stream = form;
        } else {
            data.headers['Content-Length'] = 0;
        };

        var req = urllib.request(url, data, callback);

        return req;
    }

    get(url, headers, callback) {
        headers = headers || {};
        headers['User-Agent'] = headers['User-Agent'] || utils.userAgent();
        headers['Connection'] = 'keep-alive';

        var data = {
            headers: headers,
            method: 'GET',
            timeout: this.timeout,
            dataType: 'text',
        };

        var req = urllib.request(url, data, callback);
        return req;
    }
}

module.exports = Http;
module.exports.METHOD_GET = 'get';
module.exports.METHOD_POST = 'post';