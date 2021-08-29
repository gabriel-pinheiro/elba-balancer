const Code = require('@hapi/code');
const Hoek = require('@hapi/hoek');
const Axios = require('axios');

const { expect } = Code;

module.exports.run = ({ it }, elba) => () => {
    let cooldown = Axios.create({
        baseURL: 'http://localhost:8080',
        headers: {
            Host: 'cooldown'
        },
    });
    let elbaVoid = Axios.create({
        baseURL: 'http://localhost:8080',
        headers: {
            Host: 'void'
        },
    });

    it('should wait delay between retries', async () => {
        let delayed = Axios.create({
            baseURL: 'http://localhost:8080',
            headers: {
                Host: 'delayed'
            },
        });

        await delayed.put('/fail-succeed/1/reset');
        const start = new Date();
        await delayed.get('/fail-succeed/1');
        const elapsed = new Date() - start;
        expect(elapsed).to.be.above(100);
        expect(elapsed).to.be.below(200);
    });

    it('should wait at least cooldown between retries to the same host', async () => {

        await cooldown.put('/fail-succeed/2/reset');
        const start = new Date();
        await cooldown.get('/fail-succeed/2');
        const elapsed = new Date() - start;
        expect(elapsed).to.be.above(200);
        expect(elapsed).to.be.below(300);
    });

    it('should not retry more than the specified limit', async () => {
        const start = new Date();
        await cooldown.get('/fail').catch(Hoek.ignore);
        const elapsed = new Date() - start;
        expect(elapsed).to.be.above(400);
        expect(elapsed).to.be.below(500);
    });

    it('should return last error when retry limit is reached', async () => {
        let error;
        await cooldown.get('/fail').catch(e => error = e);
        expect(error.response.data.failed).to.equal('yup');
    });

    it('should return proxy error for connection issues', async () => {
        let error;
        await elbaVoid.get('/').catch(e => error = e);
        expect(error.response.data.statusCode).to.equal(504);
    });

    it('should return x-elba-id header', async () => {
        const { headers } = await elba.get('/success');
        expect(headers).to.include('x-elba-id');
    });

    it('should return the successful target in the x-elba-target header', async () => {
        const { headers } = await elba.get('/success');
        expect(headers).to.include('x-elba-target');
        expect(headers['x-elba-target']).to.equal('mock');
    });

    it('should return the attempt count in the x-elba-attempts header', async () => {
        {
            const { headers } = await elba.get('/success');
            expect(headers).to.include('x-elba-attempts');
            expect(headers['x-elba-attempts']).to.equal('1');
        }

        {
            await cooldown.put('/fail-succeed/3/reset');
            const { headers } = await cooldown.get('/fail-succeed/3');
            expect(headers).to.include('x-elba-attempts');
            expect(headers['x-elba-attempts']).to.equal('2');
        }
    });

    it('should return x-elba-target header when retry limit is reached in responses', async () => {
        let elbaRetry = Axios.create({
            baseURL: 'http://localhost:8080',
            headers: {
                Host: 'response-retry'
            },
        });
        let headers;
        await elbaRetry.get('/v1/fail').catch(e => headers = e.response.headers);
        expect(headers).to.include('x-elba-target');
        expect(headers['x-elba-target']).to.equal('mock');
    });

    it('should return x-elba-target header when retry limit is reached in errors', async () => {
        let headers;
        await elbaVoid.get('/').catch(e => headers = e.response.headers);
        expect(headers).to.include('x-elba-target');
        expect(headers['x-elba-target']).to.equal('void');
    });

    it('should return x-elba-target header on non-retryable errors', async () => {
        let voidNoRetry = Axios.create({
            baseURL: 'http://localhost:8080',
            headers: {
                Host: 'void-noretry'
            },
        });
        let headers;
        await voidNoRetry.get('/').catch(e => headers = e.response.headers);
        expect(headers).to.include('x-elba-target');
        expect(headers['x-elba-target']).to.equal('void');
    });
};
