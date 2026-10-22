import { doc } from "prettier";
import {
    createTextGroups,
    PRESERVE_LEADING_WHITESPACE,
    PRESERVE_TRAILING_WHITESPACE
} from "../util/index.js";

const { join, hardline } = doc.builders;

const printTextStatement = (node, path, print) => {
    // Check for special values that might have been
    // computed during preprocessing
    const preserveLeadingWhitespace =
        node[PRESERVE_LEADING_WHITESPACE] === true;
    const preserveTrailingWhitespace =
        node[PRESERVE_TRAILING_WHITESPACE] === true;

    const rawString = path.call(print, "value");
    const textGroups = createTextGroups(
        rawString,
        preserveLeadingWhitespace,
        preserveTrailingWhitespace
    );

    return join([hardline, hardline], textGroups);
};

export { printTextStatement };
