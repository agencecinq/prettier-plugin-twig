import { doc } from "prettier";
import { Node } from "../melody/melody-types/index.js";
import {
    removeSurroundingWhitespace,
    isInlineElement,
    isOwnlineElement,
    printChildGroups,
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    TOUCHES_PREVIOUS,
    TOUCHES_NEXT
} from "../util/index.js";
import {
    preformattedElements,
    rawTextElements,
    inlineBlockElements
} from "../melody/melody-parser/elementInfo.js";

const { group, line, hardline, softline, indent, join } = doc.builders;
const { replaceEndOfLine } = doc.utils;

// The name is a string, or an expression for dynamic tags (<{{ tag }}>)
const printName = (node, path, print) =>
    typeof node.name === "string" ? node.name : path.call(print, "name");

const textOf = node =>
    node && Node.isPrintTextStatement(node) ? node.value.value : "";

// Between a touching neighbour and the content, whitespace is rendered unless
// Twig trims it ({{- or -}}): only then may it go when the element fits
const printEdge = (hasWhitespace, isTrimmed) => {
    if (!hasWhitespace) {
        return "";
    }
    return isTrimmed ? softline : line;
};

const printOpeningTag = (node, path, print, options) => {
    const groupId = Symbol("opening-tag");

    const opener = ["<", printName(node, path, print)];
    const printedAttributes = printSeparatedList(path, print, "", "attributes");

    const openingTagEnd = [];
    if (node.selfClosing) {
        if (!options.bracketSameLine) {
            openingTagEnd.push(line);
        } else {
            openingTagEnd.push(" ");
        }
        openingTagEnd.push("/>");
    } else {
        if (!options.bracketSameLine) {
            openingTagEnd.push(softline);
        }
        openingTagEnd.push(">");
    }

    const hasAttributes = node.attributes && node.attributes.length > 0;
    if (hasAttributes) {
        return group(
            [opener, indent([line, printedAttributes]), openingTagEnd],
            { id: groupId }
        );
    }

    return group([opener, openingTagEnd], { id: groupId });
};

const printSeparatedList = (path, print, separator, attrName) => {
    return join([separator, line], path.map(print, attrName));
};

const printElement = (node, path, print, options) => {
    // Set a flag in case attributes contain, e.g., a FilterExpression
    node[EXPRESSION_NEEDED] = true;
    const openingGroup = group(printOpeningTag(node, path, print, options));
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = false;

    if (node.selfClosing) {
        return openingGroup;
    }

    const closingTag = ["</", printName(node, path, print), ">"];

    // Laying the children out would change the rendered whitespace, or the
    // code of a script or a style sheet
    if (
        (preformattedElements[node.name] || rawTextElements[node.name]) &&
        node.contentLoc
    ) {
        const { start, end } = node.contentLoc;
        const content = options.originalText.slice(start.index, end.index);

        return [openingGroup, replaceEndOfLine(content), closingTag];
    }

    const groupElement = Symbol("element");
    const opensWithWhitespace = /^\s/.test(textOf(node.children[0]));
    const closesWithWhitespace = /\s$/.test(textOf(node.children.at(-1)));
    node.children = removeSurroundingWhitespace(node.children);

    // On a side where inline content touches its tag, the whitespace inside
    // an inline element is rendered: a line break goes there only where the
    // source has whitespace. The content passes the touch on to its edges.
    const hugsContent =
        isInlineElement(node) &&
        !inlineBlockElements[node.name] &&
        node.children.every(isInlineElement);
    const touchesPrevious = hugsContent && node[TOUCHES_PREVIOUS] === true;
    const touchesNext = hugsContent && node[TOUCHES_NEXT] === true;
    const first = node.children[0];
    const last = node.children.at(-1);
    if (first) {
        first[TOUCHES_PREVIOUS] = touchesPrevious && !opensWithWhitespace;
    }
    if (last) {
        last[TOUCHES_NEXT] = touchesNext && !closesWithWhitespace;
    }

    const childGroups = printChildGroups(node, path, print, "children");
    const result = [openingGroup];
    const joinedChildren = childGroups;
    if (touchesPrevious || touchesNext) {
        const opening = touchesPrevious
            ? printEdge(opensWithWhitespace, first?.trimLeft)
            : softline;
        const closing = touchesNext
            ? printEdge(closesWithWhitespace, last?.trimRight)
            : softline;

        result.push(indent([opening, joinedChildren]), closing);
    } else if (isOwnlineElement(node) || isInlineElement(node)) {
        const element = [indent([softline, joinedChildren]), softline];
        result.push(element);
    } else {
        const childBlock = [];
        if (childGroups.length > 0) {
            childBlock.push(hardline);
        }
        childBlock.push(joinedChildren);
        result.push(indent(childBlock));
        if (childGroups.length > 0) {
            result.push(hardline);
        }
    }
    result.push(closingTag);

    return group(result, { id: groupElement });
};

export { printElement };
