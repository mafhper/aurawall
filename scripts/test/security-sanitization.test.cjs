const test = require('node:test');
const assert = require('node:assert/strict');

const { stripHtmlDelimiters } = require('../utils/text-sanitization.cjs');

test('nested markup cannot reconstruct a script element', () => {
    const input = '<scr<script>ipt>alert(1)</script>';
    const sanitized = stripHtmlDelimiters(input);

    assert.equal(sanitized.includes('<script'), false);
    assert.equal(sanitized.includes('<'), false);
    assert.equal(sanitized.includes('>'), false);
});

test('plain Lighthouse descriptions remain unchanged', () => {
    const input = 'Reduce unused JavaScript by 125 KiB.';

    assert.equal(stripHtmlDelimiters(input), input);
});
