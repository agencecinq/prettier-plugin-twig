import {
    firstValueInAncestorChain,
    quoteChar,
    STRING_NEEDS_QUOTES,
    OVERRIDE_QUOTE_CHAR,
    INSIDE_OF_STRING
} from "../util/index.js";

const ESCAPE_SEQUENCE = /\\[\s\S]/g;

// Like Prettier: the preferred quote, unless the other one needs fewer escapes
const getQuoteChar = (s, options) => {
    const preferred = quoteChar(options);
    const alternate = preferred === "'" ? '"' : "'";
    const unescaped = s.replace(ESCAPE_SEQUENCE, "");
    const count = quote => unescaped.split(quote).length - 1;

    return count(preferred) > count(alternate) ? alternate : preferred;
};

// Between double quotes, a literal `#{` would start an interpolation
const escapeQuote = (s, quote) =>
    s.replace(/\\[\s\S]|['"]|#\{/g, match => {
        if (match === quote || (match === "#{" && quote === '"')) {
            return `\\${match}`;
        }
        return match;
    });

const printStringLiteral = (node, path, print, options) => {
    // The structure this string literal is part of
    // determines if we need quotes or not
    const needsQuotes = firstValueInAncestorChain(
        path,
        STRING_NEEDS_QUOTES,
        false
    );
    // In case of a string with interpolations, only double quotes
    // are allowed. This is then indicated by OVERRIDE_QUOTE_CHAR
    // in an ancestor.
    const overridingQuoteChar = firstValueInAncestorChain(
        path,
        OVERRIDE_QUOTE_CHAR,
        null
    );

    if (needsQuotes) {
        const quote = overridingQuoteChar
            ? overridingQuoteChar
            : getQuoteChar(node.value, options);
        return quote + escapeQuote(node.value, quote) + quote;
    }

    // Part of a string with interpolations, printed between double quotes
    if (firstValueInAncestorChain(path, INSIDE_OF_STRING, false)) {
        return escapeQuote(node.value, '"');
    }

    return node.value;
};

export { printStringLiteral };
