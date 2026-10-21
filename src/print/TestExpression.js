import { doc } from "prettier";
import {
    findParentNode,
    STRING_NEEDS_QUOTES,
    innerLine,
    printMultipartInParentheses
} from "../util/index.js";

const { line, group, join, indent } = doc.builders;

const textMap = {
    TestConstantExpression: "constant",
    TestNullExpression: "null",
    TestDivisibleByExpression: "divisible by",
    TestDefinedExpression: "defined",
    TestEmptyExpression: "empty",
    TestEvenExpression: "even",
    TestOddExpression: "odd",
    TestIterableExpression: "iterable",
    TestSameAsExpression: "same as",
    TestInstanceOfExpression: "instance of",
    TestMappingExpression: "mapping",
    TestSequenceExpression: "sequence"
};

const isNegator = node =>
    node.constructor.name === "UnarySubclass" && node.operator === "not";

const printTestExpression = (node, path, print, options) => {
    node[STRING_NEEDS_QUOTES] = true;
    const expressionType = node.__proto__.type;
    const parts = [
        printMultipartInParentheses(
            node.expression,
            path.call(print, "expression"),
            options
        ),
        " is "
    ];
    const parent = findParentNode(path);
    const hasArguments =
        Array.isArray(node.arguments) && node.arguments.length > 0;
    if (isNegator(parent)) {
        parts.push("not ");
    }

    if (expressionType.includes("[") && expressionType.includes("]")) {
        const testText = expressionType.substring(
            expressionType.indexOf("[") + 1,
            expressionType.lastIndexOf("]")
        );

        parts.push(testText);
    } else if (!textMap[expressionType]) {
        console.error(
            "TestExpression: No text for " + expressionType + " defined"
        );
    } else {
        parts.push(textMap[expressionType]);
    }
    if (hasArguments) {
        const printedArguments = path.map(print, "arguments");
        const joinedArguments = join([",", line], printedArguments);
        const padding = innerLine(options);
        parts.push(
            group(["(", indent([padding, joinedArguments]), padding, ")"])
        );
    }

    return parts;
};

export { printTestExpression };
