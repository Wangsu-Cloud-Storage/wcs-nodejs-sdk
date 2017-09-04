var crypto = require('crypto');
const pkg = require('../package.json');
const url = require('url');

class Utils {
    userAgent() {
        return 'WCS-NODEJS-SDK-' + pkg.version + '(http://wcs.chinanetcenter.com)';
    }

    // clone
    clone(obj) {
        let that = this;
        return this.map(obj, function (v) {
            return typeof v === 'object' ? that.clone(v) : v;
        });
    }

    // extend
    extend(target, source) {
        this.each(source, function (val, key) {
            target[key] = source[key];
        });
        return target;
    }

    // each
    each(obj, fn) {
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                fn(obj[i], i);
            }
        }
    }

    // map
    map(obj, fn) {
        var o = this.isArray(obj) ? [] : {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                o[i] = fn(obj[i], i);
            }
        }
        return o;
    }

    // isArray
    isArray(arr) {
        return arr instanceof Array;
    }

    // Entry编码
    encodedEntry(bucket, key) {
        return this.urlsafeBase64Encode(bucket + (key ? ':' + key : ''));
    }

    base64ToUrlSafe(v) {
        return v.replace(/\//g, '_').replace(/\+/g, '-');
    }

    urlSafeToBase64(v) {
        return v.replace(/\_/g, '/').replace(/\-/g, '+');
    }

    // UrlSafe Base64 Decode
    urlsafeBase64Encode(jsonFlags) {
        var encoded = new Buffer(jsonFlags).toString('base64');
        return this.base64ToUrlSafe(encoded);
    }

    // UrlSafe Base64 Decode
    urlSafeBase64Decode(fromStr) {
        return new Buffer(this.urlSafeToBase64(fromStr), 'base64').toString();
    }

    // Hmac-sha1 Crypt
    hmacSha1(data, key) {
        let hmac = crypto.createHmac('sha1', key);
        hmac.update(data);
        return hmac.digest().toString('hex');
    }

    /**
     * 生成上传凭证
     * @param string ak AK
     * @param string sk SK
     * @param object putPolicy 上传策略,如{scope:'bucketName:keyName', deadline: '1398916800000'}
     */
    uploadToken(ak, sk, putPolicy) {
        let putPolicyJson = JSON.stringify(putPolicy);
        let putPolicyEncode = this.urlsafeBase64Encode(putPolicyJson);
        let putPolicySign = this.hmacSha1(putPolicyEncode, sk);
        let encodeSign = this.urlsafeBase64Encode(putPolicySign);

        let token = ak + ':' + encodeSign + ':' + putPolicyEncode;
        return token;
    }

    /**
     * 生成管理凭证
     * @param {*} ak
     * @param {*} sk
     * @param {*} uri
     * @param {*} data
     */
    mgrToken(ak, sk, uri, data) {
      let u = url.parse(uri);
      let signString = u.path;
      signString = signString + '\n';
      console.log(signString);

      if (data) {
        signString += data;
      }

      let encodeSign = this.hmacSha1(signString, sk);
      console.log(encodeSign);
      let safeEncodeSign = this.urlsafeBase64Encode(encodeSign);
      console.log(safeEncodeSign);
      return ak + ':' + safeEncodeSign;
    }
}

module.exports = new Utils();