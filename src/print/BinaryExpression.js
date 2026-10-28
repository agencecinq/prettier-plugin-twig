import { doc } from "prettier";
import { Node } from "../melody/melody-types/index.js";
import { extension as coreExtension } from "../melody/melody-extension-core/index.js";
import { RIGHT } from "../melody/melody-parser/index.js";
import {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    INSIDE_OF_STRING,
    GROUP_TOP_LEVEL_LOGICAL,
    IS_ROOT_LOGICAL_EXPRESSION,
    firstValueInAncestorChain,
    findParentNode,
    wrapExpressionIfNeeded,
    innerSpace,
    endsWithArrowFunction
} from "../util/index.js";

const { group, line, softline, indent } = doc.builders;
const ALREADY_INDENTED = Symbol("ALREADY_INDENTED");
const OPERATOR_PRECEDENCE = Symbol("OPERATOR_PRECEDENCE");
const NO_WHITESPACE_AROUND = [".."];

const operatorPrecedence = coreExtension.binaryOperators.reduce((acc, curr) => {
    acc[curr.text] = curr.precedence;
    return acc;
}, {});

const operatorAssociativity = coreExtension.binaryOperators.reduce(
    (acc, curr) => {
        acc[curr.text] = curr.associativity;
        return acc;
    },
    {}
);

const unaryPrecedence = coreExtension.unaryOperators.reduce((acc, curr) => {
    acc[curr.text] = curr.precedence;
    return acc;
}, {});

/**
 * Twig 4 changes the precedence of these operators. Twig 3.15 asks for
 * parentheses wherever the meaning would change: around an operand that
 * uses one of them, when its parent binds between the two precedences.
 */
const NEXT_PRECEDENCE = { "??": 5, "~": 27, not: 70 };

const printInterpolatedString = (node, path, print, options) => {
    node[STRING_NEEDS_QUOTES] = false;
    node[INSIDE_OF_STRING] = true;

    const printedFragments = ['"']; // For interpolated strings, we HAVE to use double quotes
    let currentNode = node;
    const currentPath = [];
    while (Node.isBinaryConcatExpression(currentNode)) {
        printedFragments.unshift(path.call(print, ...currentPath, "right"));
        currentPath.push("left");
        currentNode = currentNode.left;
    }
    printedFragments.unshift(path.call(print, ...currentPath));
    printedFragments.unshift('"');
    return printedFragments;
};

const operatorNeedsSpaces = operator => {
    return NO_WHITESPACE_AROUND.indexOf(operator) < 0;
};

const hasLogicalOperator = node => {
    return node.operator === "or" || node.operator === "and";
};

// `a is not empty` is a test, whatever the `not` around it
const isUnaryOperation = node =>
    Node.isUnaryLike(node) && !Node.isTestExpression(node.argument);

const getPrecedence = node => {
    if (Node.isBinaryExpression(node)) {
        return operatorPrecedence[node.operator];
    }
    if (isUnaryOperation(node)) {
        return unaryPrecedence[node.operator];
    }
    return Number.MAX_SAFE_INTEGER;
};

const changesInTwig4 = (ownPrecedence, other) => {
    const nextPrecedence = NEXT_PRECEDENCE[other.operator];
    if (nextPrecedence === undefined) {
        return false;
    }
    const precedence = getPrecedence(other);
    return (
        ownPrecedence > Math.min(precedence, nextPrecedence) &&
        ownPrecedence < Math.max(precedence, nextPrecedence)
    );
};

// Operators that bind the same group on the side of their associativity:
// `a - (b - c)` and `(a ** b) ** c` keep their parentheses
const goesAgainstAssociativity = (node, otherProp) =>
    otherProp ===
    (operatorAssociativity[node.operator] === RIGHT ? "left" : "right");

const otherNeedsParentheses = (node, otherProp) => {
    const other = node[otherProp];
    const isBinaryOther = Node.isBinaryExpression(other);
    const isOperation = isBinaryOther || isUnaryOperation(other);
    const ownPrecedence = operatorPrecedence[node.operator];
    const otherPrecedence = getPrecedence(other);
    return (
        otherPrecedence < ownPrecedence ||
        (otherPrecedence === ownPrecedence &&
            goesAgainstAssociativity(node, otherProp)) ||
        (otherPrecedence > ownPrecedence &&
            isBinaryOther &&
            hasLogicalOperator(other)) ||
        (isOperation && changesInTwig4(ownPrecedence, other)) ||
        Node.isFilterExpression(other) ||
        (otherProp === "left" && endsWithArrowFunction(other)) ||
        // A ternary binds the least of all
        Node.isConditionalExpression(other)
    );
};

const internalPrintBinaryExpression = (node, path, print, options) => {
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;

    const isBinaryRight = Node.isBinaryExpression(node.right);
    const isLogicalOperator = ["and", "or"].indexOf(node.operator) > -1;
    const whitespaceAroundOperator = operatorNeedsSpaces(node.operator);

    const alreadyIndented = firstValueInAncestorChain(
        path,
        ALREADY_INDENTED,
        false
    );
    if (!alreadyIndented && isBinaryRight) {
        node.right[ALREADY_INDENTED] = true;
    }
    const foundRootAbove = firstValueInAncestorChain(
        path,
        IS_ROOT_LOGICAL_EXPRESSION,
        false
    );

    const parentNode = findParentNode(path);
    const shouldGroupOnTopLevel = parentNode[GROUP_TOP_LEVEL_LOGICAL] !== false;

    if (!foundRootAbove) {
        node[IS_ROOT_LOGICAL_EXPRESSION] = true;
    }
    const parentOperator = foundRootAbove
        ? firstValueInAncestorChain(path, "operator")
        : "";

    node[OPERATOR_PRECEDENCE] = operatorPrecedence[node.operator];

    const printedLeft = path.call(print, "left");
    const printedRight = path.call(print, "right");

    const parts = [];
    const leftNeedsParens = otherNeedsParentheses(node, "left");
    const rightNeedsParens = otherNeedsParentheses(node, "right");
    const openingParenthesis = "(" + innerSpace(options);
    const closingParenthesis = innerSpace(options) + ")";

    if (leftNeedsParens) {
        parts.push(openingParenthesis);
    }
    parts.push(printedLeft);
    if (leftNeedsParens) {
        parts.push(closingParenthesis);
    }
    const potentiallyIndented = [
        whitespaceAroundOperator ? line : softline,
        node.operator,
        whitespaceAroundOperator ? " " : ""
    ];
    if (rightNeedsParens) {
        potentiallyIndented.push(openingParenthesis);
    }
    potentiallyIndented.push(printedRight);
    if (rightNeedsParens) {
        potentiallyIndented.push(closingParenthesis);
    }
    const rightHandSide = alreadyIndented
        ? potentiallyIndented
        : indent(potentiallyIndented);
    const result = wrapExpressionIfNeeded(
        path,
        [...parts, rightHandSide],
        node
    );
    const shouldCreateTopLevelGroup = !foundRootAbove && shouldGroupOnTopLevel;
    const isDifferentLogicalOperator =
        isLogicalOperator && node.operator !== parentOperator;

    const shouldGroupResult =
        shouldCreateTopLevelGroup ||
        !isLogicalOperator ||
        (foundRootAbove && isDifferentLogicalOperator);

    return shouldGroupResult ? group(result) : result;
};

const printBinaryExpression = (node, path, print, options) => {
    if (Node.isBinaryConcatExpression(node) && node.wasImplicitConcatenation) {
        return printInterpolatedString(node, path, print, options);
    }
    return internalPrintBinaryExpression(node, path, print, options);
};

export { printBinaryExpression };
