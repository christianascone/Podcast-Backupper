class StringFormatUtil {
    /**
     * Pad given string with length
     */
    static padZeroWithLength(toFormat, padLength) {
        const pad = this.buildPadZeroString(padLength);
        return pad.substring(0, pad.length - toFormat.length) + toFormat;
    }

    /**
     * Get pad string with given length
     */
    static buildPadZeroString(padLength) {
        const padChar = '0';
        let pad = '';
        for (let i = 0; i < padLength; i++) {
            pad += padChar;
        }
        return pad;
    }
}

module.exports = StringFormatUtil;