import { doc } from "prettier";
import { Node } from "../melody/melody-types/index.js";
import {
    removeSurroundingWhitespace,
    isInlineElement,
    isOwnlineElement,
    printChildGroups,
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    TRIM_LEFT_WHEN_BROKEN,
    TRIM_RIGHT_WHEN_BROKEN
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

// Between the tag of an inline element and its content, whitespace is
// rendered: the edge keeps the whitespace of the source, unless Twig trims it
// ({{- or -}}). Where the content touches the tag, a line break goes there
// only if Twig trims it: an expression gets the trim when the element breaks,
// text and elements stay glued to the tag.
const printEdge = (edge, hasWhitespace, isTrimmed, trimWhenBroken, groupId) => {
    if (isTrimmed) {
        return softline;
    }
    if (hasWhitespace) {
        return line;
    }
    if (Node.isPrintExpressionStatement(edge)) {
        edge[trimWhenBroken] = groupId;
        return softline;
    }
    return "";
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

    // Inside an inline element with inline content, the whitespace next to
    // the tags is rendered, whatever is around the element: Twig may trim the
    // whitespace before or after it ({{- include() -}}<span>), or CSS show it
    const hugsContent =
        isInlineElement(node) &&
        !inlineBlockElements[node.name] &&
        node.children.every(isInlineElement);
    const first = node.children[0];
    const last = node.children.at(-1);
    let opening = "";
    let closing = "";
    if (hugsContent && first) {
        opening = printEdge(
            first,
            opensWithWhitespace,
            first.trimLeft,
            TRIM_LEFT_WHEN_BROKEN,
            groupElement
        );
        closing = printEdge(
            last,
            closesWithWhitespace,
            last.trimRight,
            TRIM_RIGHT_WHEN_BROKEN,
            groupElement
        );
    } else if (hugsContent && opensWithWhitespace) {
        // Whitespace alone prints once, before the closing tag
        closing = line;
    }

    const childGroups = printChildGroups(node, path, print, "children");
    const result = [openingGroup];
    const joinedChildren = childGroups;
    if (hugsContent) {
        result.push(indent([opening, joinedChildren]), closing);
    } else if (isOwnlineElement(node) || isInlineElement(node)) {
        if (childGroups.length > 0) {
            result.push(indent([softline, joinedChildren]), softline);
        }
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
