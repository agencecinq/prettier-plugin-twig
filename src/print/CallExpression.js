import { doc } from "prettier";
import { Node } from "../melody/melody-types/index.js";
import {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    wrapExpressionIfNeeded,
    innerLine,
    innerSpace
} from "../util/index.js";

const { group, line, indent, join } = doc.builders;

const printCallExpression = (node, path, print, options) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const mappedArguments = path.map(print, "arguments");
    const parts = [path.call(print, "callee"), "("];
    if (node.arguments.length === 0) {
        parts.push(")");
    } else if (
        node.arguments.length === 1 &&
        Node.isObjectExpression(node.arguments[0])
    ) {
        // Optimization: No line break between "(" and "{" if
        // there is exactly one object parameter
        const space = innerSpace(options);
        parts.push(space, mappedArguments[0], space, ")");
    } else {
        const padding = innerLine(options);
        parts.push(
            indent([padding, join([",", line], mappedArguments)]),
            padding,
            ")"
        );
    }

    wrapExpressionIfNeeded(path, parts, node);

    return group(parts);
};

export { printCallExpression };
