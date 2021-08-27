process.env.SILENT = 'true';
process.env.CONFIG_PATH = './test/elba.toml';

const App = require('../dist/main');

const Lab = require('@hapi/lab');
const Axios = require('axios');

const ProxyTests = require('./e2e/proxy');
const RetryTests = require('./e2e/retry');

const lab = exports.lab = Lab.script();
const { after, before, describe } = lab;

describe('e2e', () => {
    let server;
    let elba = Axios.create({
        baseURL: 'http://localhost:8080',
        headers: {
            Host: 'single-target'
        },
    });

    before(async () => {
        server = await App.server;
    });

    after(async () => {
        await server.stop();
    });

    describe('proxy', ProxyTests.run(lab, elba));
    describe('retry', RetryTests.run(lab, elba));
})
