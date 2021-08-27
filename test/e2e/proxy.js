const Code = require('@hapi/code');

const { expect } = Code;

module.exports.run = ({ it }, elba) => () => {

    it('should proxy body to upstream', async () => {
        const { status } = await elba.post('/expect-body', {
            foo: 'bar',
        });
        expect(status).to.equal(204);
    });

    it('should proxy query params to upstream', async () => {
        const { status } = await elba.get('/expect-query?foo=bar');
        expect(status).to.equal(204);
    });

    it('should proxy headers to upstream', async () => {
        const { status } = await elba.get('/expect-header', {
            headers: { 'X-Foo': 'bar' },   
        });
        expect(status).to.equal(204);
    });

    it('should proxy body from upstream', async () => {
        const { data } = await elba.get('/return-body');
        expect(data.foo).to.equal('bar');
    });

    it('should proxy headers from upstream', async () => {
        const { headers } = await elba.get('/return-header');
        expect(headers['x-foo']).to.equal('bar');
    });

    it('should proxy body to upstream on retries', async () => {
        await elba.put('/retry-expect-body/reset');
        const { status } = await elba.post('/retry-expect-body', {
            foo: 'bar',
        });
        expect(status).to.equal(204);
    });

    it('should proxy headers to upstream on retries', async () => {
        await elba.put('/retry-expect-header/reset');
        const { status } = await elba.get('/retry-expect-header', {
            headers: { 'X-Foo': 'bar' },   
        });
        expect(status).to.equal(204);
    });
};
