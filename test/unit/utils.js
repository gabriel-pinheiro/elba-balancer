const Code = require('@hapi/code');
const { returnError, bucket } = require('../../dist/utils/utils');

const { expect } = Code;

module.exports.run = ({ it }) => () => {

    it('returnError must return resolved value', async () => {
        const promise = new Promise(r => r(7));
        const [error, result] = await returnError(promise);
        expect(error).to.be.undefined();
        expect(result).to.equal(7);
    });

    it('returnError must return rejected value', async () => {
        const promise = new Promise((_, r) => r(7));
        const [error, result] = await returnError(promise);
        expect(error).to.equal(7);
        expect(result).to.be.undefined();
    });

    it('bucket must return correct bucket', async () => {
        expect(bucket(0, 50)).to.equal(50);
        expect(bucket(1, 50)).to.equal(50);
        expect(bucket(30, 50)).to.equal(50);
        expect(bucket(50, 50)).to.equal(50);
        expect(bucket(51, 50)).to.equal(100);
        expect(bucket(99, 50)).to.equal(100);
        expect(bucket(100, 50)).to.equal(100);
        expect(bucket(101, 50)).to.equal(200);
        expect(bucket(799, 50)).to.equal(800);
        expect(bucket(800, 50)).to.equal(800);
        expect(bucket(801, 50)).to.equal(1600);
    });
};
