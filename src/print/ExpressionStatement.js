import { doc } from "prettier";
import { Node } from "../melody/melody-types/index.js";
import {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    TRIM_LEFT_WHEN_BROKEN,
    TRIM_RIGHT_WHEN_BROKEN,
    isContractableNodeType
} from "../util/index.js";

const { group, indent, line, ifBreak } = doc.builders;

// The trim an inline element asks for when it breaks, for the line break it
// then puts between its tag and the expression
const printTrimWhenBroken = groupId =>
    groupId ? ifBreak("-", "", { groupId }) : "";

const printExpressionStatement = (node, path, print) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const opener = node.trimLeft
        ? "{{-"
        : ["{{", printTrimWhenBroken(node[TRIM_LEFT_WHEN_BROKEN])];
    const closing = node.trimRight
        ? "-}}"
        : [printTrimWhenBroken(node[TRIM_RIGHT_WHEN_BROKEN]), "}}"];
    const shouldContractValue =
        isContractableNodeType(node.value) &&
        !Node.isObjectExpression(node.value);
    const padding = shouldContractValue ? " " : line;
    const printedValue = [padding, path.call(print, "value")];
    const value = shouldContractValue ? printedValue : indent(printedValue);
    return group([opener, value, padding, closing]);
};

export { printExpressionStatement };
