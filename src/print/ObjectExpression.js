import { doc } from "prettier";
import {
    EXPRESSION_NEEDED,
    wrapExpressionIfNeeded,
    followsWordPressCodingStandards
} from "../util/index.js";

const { group, line, hardline, indent, join, ifBreak } = doc.builders;

const printObjectExpression = (node, path, print, options) => {
    if (node.properties.length === 0) {
        return "{}";
    }
    node[EXPRESSION_NEEDED] = false;
    const mappedElements = path.map(print, "properties");
    const isWordPress = followsWordPressCodingStandards(options);
    // WordPress: one property per line as soon as there are several, and a
    // comma after the last one, once broken
    const alwaysBreak = isWordPress
        ? node.properties.length > 1
        : options.twigAlwaysBreakObjects;
    const separator = alwaysBreak ? hardline : line;
    const trailingComma = isWordPress ? ifBreak(",") : "";
    const indentedContent = [
        line,
        join([",", separator], mappedElements),
        trailingComma
    ];

    const parts = ["{", indent(indentedContent), separator, "}"];
    wrapExpressionIfNeeded(path, parts, node);

    return group(parts);
};

export { printObjectExpression };
