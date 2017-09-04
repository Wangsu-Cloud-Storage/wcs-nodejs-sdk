var config = {
    AccessKey: '<YOUR ACCESS KEY>',         // 上传凭证，可在您控制台安全管理-->密钥管理中查询
    SecretKey: '<YOUR SECRET KEY>',         // 管理凭证，可在您控制台安全管理-->密钥管理中查询
    UploadDomain: '<YOUR UPLOAD DOMAIN>',   // 上传域名（无需http前缀），可在您控制台安全管理-->域名查询中查询
    MgrDomain: '<YOUR MGR DOOMAIN>',        // 管理域名（无需http前缀），可在您控制台安全管理-->域名查询中查询
    BlockSize: '<分片上传块大小>',             // 默认为4M（建议不修改），需大于4M且为4M的整数倍
    HttpTimeout: '<http超时时间>',          // http超时时间，单位毫秒。默认120000（120秒）
};

module.exports = config;