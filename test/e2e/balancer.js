const Code = require('@hapi/code');
const Hoek = require('@hapi/hoek');
const Axios = require('axios');

const { expect } = Code;

module.exports.run = ({ it }, _elba) => () => {

    it('should load balance between all targets', async () => {
        const REQUEST_LIMIT = 100;
        const targets = new Set();

        const multi = Axios.create({
            baseURL: 'http://localhost:8080',
            headers: {
                Host: 'multi-target'
            },
        });

        const hasBalanced = () => targets.has('mock01')
                               && targets.has('mock02')
                               && targets.has('mock03');

        for (let i = 0; i < REQUEST_LIMIT; i++) {
            const { headers } = await multi.get('/success');
            targets.add(headers['x-elba-target']);

            if(hasBalanced()) {
                break;
            }
        }

        expect(hasBalanced()).to.be.true();
    });

    it('should stop trying unhealthy target after defined threshold', async () => {
        const REQUEST_COUNT = 30;

        const elba = Axios.create({
            baseURL: 'http://localhost:8080',
            headers: {
                Host: 'balancer-1'
            },
        });

        await elba.put('/balancer-1/reset');
        for (let i = 0; i < REQUEST_COUNT; i++) {
            await elba.get('/balancer-1');
        }

        const { data } = await elba.get('/balancer-1/status');
        expect(data).to.equal(3);
    });

    it('should never respond with an unhealthy target response', async () => {
        const REQUEST_COUNT = 30;

        const elba = Axios.create({
            baseURL: 'http://localhost:8080',
            headers: {
                Host: 'balancer-2'
            },
        });

        for (let i = 0; i < REQUEST_COUNT; i++) {
            const { status } = await elba.get('/balancer-2');
            expect(status).to.equal(204);
        }
    });

    it('should reset error count when a successful response is received', async () => {
        const REQUEST_COUNT = 30;

        const elba = Axios.create({
            baseURL: 'http://localhost:8080',
            headers: {
                Host: 'balancer-3'
            },
        });

        await elba.put('/balancer-3/reset');
        for (let i = 0; i < REQUEST_COUNT; i++) {
            await elba.get('/balancer-3');
        }

        const { data } = await elba.get('/balancer-3/status');
        expect(data).to.equal(6); // threshold = 3; requests: error, error, success, error, error, error
    });

    it('should mark target as healthy after timeout has passed', async () => {
        const REQUEST_COUNT = 30;

        const elba = Axios.create({
            baseURL: 'http://localhost:8080',
            headers: {
                Host: 'balancer-4'
            },
        });

        await elba.put('/balancer-4/reset');
        for (let i = 0; i < REQUEST_COUNT; i++) {
            await elba.get('/balancer-4');
        }
        await Hoek.wait(1100);
        for (let i = 0; i < REQUEST_COUNT; i++) {
            await elba.get('/balancer-4');
        }

        const { data } = await elba.get('/balancer-4/status');
        expect(data).to.equal(4); // 3 errors to get marked as unhealthy at first, timeouts and another erros marks it again
    });

    it('none_healthy_is_all_healthy false should fail before trying when all hosts are down', async () => {
        const elba = Axios.create({
            baseURL: 'http://localhost:8080',
            headers: {
                Host: 'balancer-5'
            },
        });

        await elba.get('/fail500').catch(Hoek.ignore);
        let error;
        const start = Date.now();
        await elba.get('/fail500').catch(e => error = e);

        expect(error.response.data.statusCode).to.equal(503);
        expect(Date.now() - start).to.be.below(50); // Due to retry delay this validates there was no retry
    });

    it('none_healthy_is_all_healthy true should retry hosts even when all of them are down', async () => {
        const elba = Axios.create({
            baseURL: 'http://localhost:8080',
            headers: {
                Host: 'balancer-6'
            },
        });

        await elba.get('/fail500').catch(Hoek.ignore);
        let error;
        await elba.get('/fail500').catch(e => error = e);

        expect(error.response.status).to.equal(500);
    });
};
