import { doc } from "prettier";
import {
    STRING_NEEDS_QUOTES,
    followsWordPressCodingStandards,
    innerLine
} from "../util/index.js";

const { group, line, indent, join, ifBreak } = doc.builders;

const printArrayExpression = (node, path, print, options) => {
    node[STRING_NEEDS_QUOTES] = true;
    if (node.elements.length === 0) {
        return "[]";
    }
    const mappedElements = path.map(print, "elements");
    const padding = innerLine(options);
    // WordPress: a comma after the last element, once broken
    const trailingComma = followsWordPressCodingStandards(options)
        ? ifBreak(",")
        : "";
    const indentedContent = [
        padding,
        join([",", line], mappedElements),
        trailingComma
    ];

    return group(["[", indent(indentedContent), padding, "]"]);
};

export { printArrayExpression };
