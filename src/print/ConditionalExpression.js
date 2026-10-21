import { doc } from "prettier";
import { Node } from "../melody/melody-types/index.js";
import {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    wrapExpressionIfNeeded,
    isNotExpression,
    followsWordPressCodingStandards
} from "../util/index.js";

const { line, indent, group } = doc.builders;

// `not a is empty` prints as `a is not empty`, and a ternary would need
// parentheses once it is the test: both keep their `not`
const canDropNot = node =>
    isNotExpression(node) &&
    !Node.isTestExpression(node.argument) &&
    !Node.isConditionalExpression(node.argument);

/**
 * WordPress: a ternary tests the true case. Every `not` in front of the
 * test is dropped, and an odd number of them swaps the branches:
 * `not a ? x : y` prints as `a ? y : x`
 */
const getTestPath = (node, options) => {
    const testPath = ["test"];
    const hasBothBranches = node.consequent && node.alternate;
    if (!followsWordPressCodingStandards(options) || !hasBothBranches) {
        return testPath;
    }
    let test = node.test;
    while (canDropNot(test)) {
        test = test.argument;
        testPath.push("argument");
    }
    return testPath;
};

const printConditionalExpression = (node, path, print, options) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;

    const testPath = getTestPath(node, options);
    const isSwapped = testPath.length % 2 === 0;
    const consequent = isSwapped ? "alternate" : "consequent";
    const alternate = isSwapped ? "consequent" : "alternate";

    const rest = [line, "?"];
    if (node[consequent]) {
        rest.push([" ", path.call(print, consequent)]);
    }
    if (node[alternate]) {
        rest.push(line, ": ", path.call(print, alternate));
    }
    const parts = [path.call(print, ...testPath), indent(rest)];
    wrapExpressionIfNeeded(path, parts, node);

    return group(parts);
};

export { printConditionalExpression };
