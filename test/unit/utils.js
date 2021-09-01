const Code = require('@hapi/code');
const { returnError } = require('../../dist/utils/utils');

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
};
