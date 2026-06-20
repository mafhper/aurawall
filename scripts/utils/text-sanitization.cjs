function stripHtmlDelimiters(value) {
    return String(value).replace(/[<>]/g, '');
}

module.exports = { stripHtmlDelimiters };
