import { doc } from "prettier";
import { followsWordPressCodingStandards } from "../util/index.js";

const { group, join, line, softline, hardline, indent } = doc.builders;

const printOpener = (node, path, print, options) => {
    const parts = [
        node.trimLeft ? "{%-" : "{%",
        " macro ",
        path.call(print, "name"),
        "("
    ];
    const mappedArguments = path.map(print, "arguments");
    const joinedArguments = join([",", line], mappedArguments);
    // WordPress: spaces inside the parentheses, unless they are empty
    const isPadded =
        followsWordPressCodingStandards(options) && mappedArguments.length > 0;
    parts.push(indent([isPadded ? line : softline, joinedArguments]));
    parts.push(isPadded ? [line, ")"] : ")");
    parts.push(line, node.trimRightMacro ? "-%}" : "%}");
    return group(parts);
};

const printMacroDeclarationStatement = (node, path, print, options) => {
    const parts = [printOpener(node, path, print, options)];
    parts.push(indent([hardline, path.call(print, "body")]));
    parts.push(
        hardline,
        node.trimLeftEndmacro ? "{%-" : "{%",
        " endmacro ",
        node.trimRight ? "-%}" : "%}"
    );
    return parts;
};

export { printMacroDeclarationStatement };
