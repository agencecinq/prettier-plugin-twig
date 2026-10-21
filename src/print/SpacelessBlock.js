import { doc } from "prettier";
import { printChildBlockBeforeClosingTag } from "../util/index.js";

const { group } = doc.builders;

const printSpacelessBlock = (node, path, print) => {
    const parts = [
        node.trimLeft ? "{%-" : "{%",
        " spaceless ",
        node.trimRightSpaceless ? "-%}" : "%}"
    ];
    parts.push(printChildBlockBeforeClosingTag(node, path, print, "body"));
    parts.push(
        node.trimLeftEndspaceless ? "{%-" : "{%",
        " endspaceless ",
        node.trimRight ? "-%}" : "%}"
    );
    const result = group(parts);
    return result;
};

export { printSpacelessBlock };
