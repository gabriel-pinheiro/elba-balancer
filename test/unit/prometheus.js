const Code = require('@hapi/code');
const { Counter } = require('../../dist/utils/prometheus');

const { expect } = Code;

module.exports.run = ({ it }) => () => {

    it('should stringify correctly', async () => {
        const metric01 = new Counter('metric01', 'Help for metric01');
        const metric02 = new Counter('metric02', 'Help for metric02');

        const valueOne = metric01.createValue({
            name: 'one',
            lorem: 'ipsum',
        });
        valueOne.add();
        valueOne.add(4);

        const valueTwo = metric01.createValue({
            name: 'two',
        });
        valueTwo.set(NaN);

        metric02.createValue({
            foo: 'bar',
        }, 1);

        const actual = metric01.stringify() + metric02.stringify();

        const expected = `# HELP metric01 Help for metric01
# TYPE metric01 counter
metric01{name="one",lorem="ipsum"} 5
metric01{name="two"} NaN
# HELP metric02 Help for metric02
# TYPE metric02 counter
metric02{foo="bar"} 1
`;

        expect(actual).to.equal(expected);
    });
};
