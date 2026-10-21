import { doc } from "prettier";
import { Node } from "../melody/melody-types/index.js";
import {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    wrapExpressionIfNeeded,
    followsWordPressCodingStandards,
    printMultipartInParentheses
} from "../util/index.js";

const { group } = doc.builders;

const isLiteral = node =>
    Node.isStringLiteral(node) ||
    Node.isNumericLiteral(node) ||
    node.wasImplicitConcatenation === true;

const printMemberExpression = (node, path, print, options) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const parts = [
        printMultipartInParentheses(
            node.object,
            path.call(print, "object"),
            options
        )
    ];
    // WordPress: spaces around an index, unless it is a string or a number
    const space =
        followsWordPressCodingStandards(options) && !isLiteral(node.property)
            ? " "
            : "";
    parts.push(node.computed ? ["[", space] : ".");
    parts.push(path.call(print, "property"));
    if (node.computed) {
        parts.push([space, "]"]);
    }
    wrapExpressionIfNeeded(path, parts, node);
    return group(parts);
};

export { printMemberExpression };
