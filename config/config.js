var fs = require('fs');

var productLocalDev = 'LOCAL_DEV';
var productServer1 = 'LINUX';
var productServer2 = 'WINDOWS';

var production;
production = productLocalDev;
// production = productServer1;
// production = productServer2;

var prodConfig;
if (production === productServer1 || production === productServer2) {
    prodConfig = JSON.parse(fs.readFileSync('./config/build-config.json'));
    console.log('-- [', prodConfig['main.min.js'], '] loaded.');
}

module.exports = {

    TESTNET: true,

    PRODUCTION: production,

    PRODUCTION_LOCAL_DEV: productLocalDev,
    PRODUCTION_SERVER_1: productServer1,
    PRODUCTION_SERVER_2: productServer2,

    DATABASE_URL_LOCAL_DEV: 'postgres://postgres:123456@localhost/pandoradb', // database url for local developmennt
    DATABASE_URL_SERVER_1: 'postgres://postgres:123456@47.75.43.93/pandoradb', // database url for linux server - test
    DATABASE_URL_SERVER_2: 'postgres://postgres:bmUgswMNVK9n4J7S@172.17.0.6/pandoradb', // database url for windows server - production

    SITE_URL_LOCAL_DEV: 'http://192.168.1.130',
    SITE_URL_SERVER_1: 'site_url_server_1',
    SITE_URL_SERVER_2: 'site_url_server_2',

    ETH_URL_LOCAL_DEV: 'http://localhost:8545', // eth rpc url for local - developmennt
    ETH_URL_SERVER_1: 'http://localhost:8545', // eth rpc url for linux server - test
    ETH_URL_SERVER_2: 'http://172.17.0.4:8545', // eth rpc url for windows server - production

    ETH_NEW_ACCOUNT_PASS: '123456789',

    PORT_HTTP: 80,
    PORT_HTTPS: 443,

    BUILD: prodConfig,

    HTTPS_KEY: './ssl/private.key',
    HTTPS_CERT: './ssl/certificate.crt',
    HTTPS_CA: './ssl/ca_bundle.crt',

    LOG_FILE: 'aew',

    SITE_TITLE: 'Pandora',
    SITE_URL:'localhost'
};
