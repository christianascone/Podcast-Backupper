class FilenameUtil {
    /**
     * Fix a string in order to use it for filename
     */
    static stringToFilename(toConvert) {
        return toConvert.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }
}

module.exports = FilenameUtil;