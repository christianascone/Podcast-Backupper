const expect = require('chai').expect;
const StringFormat = require('../../app/utils/stringFormatUtil');

describe('StringFormat', function () {
    it('should pad left with zeros with given length', () => {
        expect(StringFormat.padZeroWithLength('1000', 10)).to.be.equal('0000001000');
    });
});