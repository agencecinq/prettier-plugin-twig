/**
 * Copyright 2017 trivago N.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
    Node,
    BinaryExpression,
    BinaryConcatExpression,
    UnaryExpression,
    type,
    alias,
    visitor
} from "../melody-types/index.js";

import {
    Types,
    setStartFromToken,
    setEndFromToken,
    copyStart,
    copyEnd,
    copyLoc,
    LEFT,
    RIGHT
} from "../melody-parser/index.js";

export const unaryOperators = [];
export const binaryOperators = [];
export const tests = [];

//region Unary Expressions
export const SpreadExpression = createUnaryOperator(
    "...",
    "SpreadExpression",
    // I can't find precedence reference for spread operator
    // Ref: https://twig.symfony.com/doc/3.x/templates.html#operators
    20
);
export const UnaryNotExpression = createUnaryOperator(
    "not",
    "UnaryNotExpression",
    50
);
export const UnaryNeqExpression = createUnaryOperator(
    "-",
    "UnaryNeqExpression",
    500
);
export const UnaryPosExpression = createUnaryOperator(
    "+",
    "UnaryPosExpression",
    500
);
//endregion

//region Binary Expressions
export const BinaryOrExpression = createBinaryOperatorNode({
    text: "or",
    type: "BinaryOrExpression",
    precedence: 10,
    associativity: LEFT
});

export const BinaryXorExpression = createBinaryOperatorNode({
    text: "xor",
    type: "BinaryXorExpression",
    precedence: 12,
    associativity: LEFT
});

export const BinaryAndExpression = createBinaryOperatorNode({
    text: "and",
    type: "BinaryAndExpression",
    precedence: 15,
    associativity: LEFT
});

export const BitwiseOrExpression = createBinaryOperatorNode({
    text: "b-or",
    type: "BitwiseOrExpression",
    precedence: 16,
    associativity: LEFT
});
export const BitwiseXorExpression = createBinaryOperatorNode({
    text: "b-xor",
    type: "BitwiseXOrExpression",
    precedence: 17,
    associativity: LEFT
});
export const BitwiseAndExpression = createBinaryOperatorNode({
    text: "b-and",
    type: "BitwiseAndExpression",
    precedence: 18,
    associativity: LEFT
});

export const BinaryEqualsExpression = createBinaryOperatorNode({
    text: "==",
    type: "BinaryEqualsExpression",
    precedence: 20,
    associativity: LEFT
});
export const BinaryNotEqualsExpression = createBinaryOperatorNode({
    text: "!=",
    type: "BinaryNotEqualsExpression",
    precedence: 20,
    associativity: LEFT
});
export const BinaryLessThanExpression = createBinaryOperatorNode({
    text: "<",
    type: "BinaryLessThanExpression",
    precedence: 20,
    associativity: LEFT
});
export const BinaryGreaterThanExpression = createBinaryOperatorNode({
    text: ">",
    type: "BinaryGreaterThanExpression",
    precedence: 20,
    associativity: LEFT
});
export const BinaryLessThanOrEqualExpression = createBinaryOperatorNode({
    text: "<=",
    type: "BinaryLessThanOrEqualExpression",
    precedence: 20,
    associativity: LEFT
});
export const BinaryGreaterThanOrEqualExpression = createBinaryOperatorNode({
    text: ">=",
    type: "BinaryGreaterThanOrEqualExpression",
    precedence: 20,
    associativity: LEFT
});
export const BinaryThreeWayComparisonExpression = createBinaryOperatorNode({
    text: "<=>",
    type: "BinaryThreeWayComparisonExpression",
    precedence: 20,
    associativity: LEFT
});

export const BinaryNotInExpression = createBinaryOperatorNode({
    text: "not in",
    type: "BinaryNotInExpression",
    precedence: 20,
    associativity: LEFT
});
export const BinaryInExpression = createBinaryOperatorNode({
    text: "in",
    type: "BinaryInExpression",
    precedence: 20,
    associativity: LEFT
});
export const BinaryMatchesExpression = createBinaryOperatorNode({
    text: "matches",
    type: "BinaryMatchesExpression",
    precedence: 20,
    associativity: LEFT
});
export const BinaryStartsWithExpression = createBinaryOperatorNode({
    text: "starts with",
    type: "BinaryStartsWithExpression",
    precedence: 20,
    associativity: LEFT
});
export const BinaryEndsWithExpression = createBinaryOperatorNode({
    text: "ends with",
    type: "BinaryEndsWithExpression",
    precedence: 20,
    associativity: LEFT
});
/**
 * `items has some item => item.badge`: the right operand of `has some` and
 * `has every` is usually an arrow function.
 */
function parseHasOperand(parser, token, lhs) {
    const tokens = parser.tokens;
    let rhs;
    if (
        parser.testArrowFunctionParameters() ||
        (tokens.test(Types.SYMBOL) && tokens.lat(1) === Types.ARROW)
    ) {
        rhs = parser.matchArrowFunction();
        copyEnd(rhs, rhs.body);
    } else {
        rhs = parser.matchExpression(this.precedence + 1);
    }
    const op = this.createNode(token, lhs, rhs);
    copyStart(op, lhs);
    copyEnd(op, rhs);
    return op;
}

export const BinaryHasSomeExpression = createBinaryOperatorNode({
    text: "has some",
    type: "BinaryHasSomeExpression",
    precedence: 20,
    associativity: LEFT,
    parse: parseHasOperand
});
export const BinaryHasEveryExpression = createBinaryOperatorNode({
    text: "has every",
    type: "BinaryHasEveryExpression",
    precedence: 20,
    associativity: LEFT,
    parse: parseHasOperand
});

export const BinaryRangeExpression = createBinaryOperatorNode({
    text: "..",
    type: "BinaryRangeExpression",
    precedence: 25,
    associativity: LEFT
});

export const BinaryAddExpression = createBinaryOperatorNode({
    text: "+",
    type: "BinaryAddExpression",
    precedence: 30,
    associativity: LEFT
});
export const BinarySubExpression = createBinaryOperatorNode({
    text: "-",
    type: "BinarySubExpression",
    precedence: 30,
    associativity: LEFT
});
binaryOperators.push({
    text: "~",
    precedence: 40,
    associativity: LEFT,
    createNode(token, lhs, rhs) {
        const op = new BinaryConcatExpression(lhs, rhs);
        copyStart(op, lhs);
        copyEnd(op, rhs);
        return op;
    }
});
export const BinaryMulExpression = createBinaryOperatorNode({
    text: "*",
    type: "BinaryMulExpression",
    precedence: 60,
    associativity: LEFT
});
export const BinaryDivExpression = createBinaryOperatorNode({
    text: "/",
    type: "BinaryDivExpression",
    precedence: 60,
    associativity: LEFT
});
export const BinaryFloorDivExpression = createBinaryOperatorNode({
    text: "//",
    type: "BinaryFloorDivExpression",
    precedence: 60,
    associativity: LEFT
});
export const BinaryModExpression = createBinaryOperatorNode({
    text: "%",
    type: "BinaryModExpression",
    precedence: 60,
    associativity: LEFT
});

binaryOperators.push({
    text: "is",
    precedence: 100,
    associativity: LEFT,
    parse(parser, token, expr) {
        const tokens = parser.tokens;

        let not = false;
        if (tokens.nextIf(Types.OPERATOR, "not")) {
            not = true;
        }

        const test = getTest(parser);
        let args = null;
        if (tokens.test(Types.LPAREN)) {
            args = parser.matchArguments();
        }
        const testExpression = test.createNode(expr, args);
        setStartFromToken(testExpression, token);
        setEndFromToken(testExpression, tokens.la(-1));
        if (not) {
            return copyLoc(
                new UnaryNotExpression(testExpression),
                testExpression
            );
        }
        return testExpression;
    }
});

function getTest(parser) {
    const tokens = parser.tokens;
    const nameToken = tokens.la(0);
    if (nameToken.type !== Types.NULL) {
        tokens.expect(Types.SYMBOL);
    } else {
        tokens.next();
    }
    let testName = nameToken.text;
    if (!parser.hasTest(testName)) {
        // try 2-words tests
        const continuedNameToken = tokens.expect(Types.SYMBOL);
        testName += " " + continuedNameToken.text;
        if (!parser.hasTest(testName)) {
            parser.error({
                title: `Unknown test "${testName}"`,
                pos: nameToken.pos
            });
        }
    }

    return parser.getTest(testName);
}

export const BinaryPowerExpression = createBinaryOperatorNode({
    text: "**",
    type: "BinaryPowerExpression",
    precedence: 200,
    associativity: RIGHT
});
export const BinaryNullCoalesceExpression = createBinaryOperatorNode({
    text: "??",
    type: "BinaryNullCoalesceExpression",
    precedence: 300,
    associativity: RIGHT
});

// Ref: https://plugins.craftcms.com/empty-coalesce
export const BinaryEmptyCoalesceExpression = createBinaryOperatorNode({
    text: "???",
    type: "BinaryEmptyCoalesceExpression",
    precedence: 300,
    associativity: LEFT
});
//endregion

//region Test Expressions
export const TestEvenExpression = createTestExpression(
    "even",
    "TestEvenExpression"
);
export const TestOddExpression = createTestExpression(
    "odd",
    "TestOddExpression"
);
export const TestDefinedExpression = createTestExpression(
    "defined",
    "TestDefinedExpression"
);
export const TestSameAsExpression = createTestExpression(
    "same as",
    "TestSameAsExpression"
);
tests.push({
    text: "sameas",
    createNode(expr, args) {
        // todo: add deprecation warning
        return new TestSameAsExpression(expr, args);
    }
});
export const TestNullExpression = createTestExpression(
    "null",
    "TestNullExpression"
);
tests.push({
    text: "none",
    createNode(expr, args) {
        return new TestNullExpression(expr, args);
    }
});
export const TestDivisibleByExpression = createTestExpression(
    "divisible by",
    "TestDivisibleByExpression"
);
tests.push({
    text: "divisibleby",
    createNode(expr, args) {
        // todo: add deprecation warning
        return new TestDivisibleByExpression(expr, args);
    }
});
export const TestConstantExpression = createTestExpression(
    "constant",
    "TestConstantExpression"
);
export const TestEmptyExpression = createTestExpression(
    "empty",
    "TestEmptyExpression"
);
export const TestIterableExpression = createTestExpression(
    "iterable",
    "TestIterableExpression"
);
export const TestInstanceOfExpression = createTestExpression(
    "instance of",
    "TestInstanceOfExpression"
);
// Twig 3.11
export const TestMappingExpression = createTestExpression(
    "mapping",
    "TestMappingExpression"
);
export const TestSequenceExpression = createTestExpression(
    "sequence",
    "TestSequenceExpression"
);
//endregion

//region Utilities
export function createTestExpression(text, typeName) {
    const TestExpression = class extends Node {
        /**
         * @param {Node} expr
         * @param {Array<Node>} [args]
         */
        constructor(expr, args) {
            super();
            this.expression = expr;
            this.arguments = args;
        }
    };
    type(TestExpression, typeName);
    alias(TestExpression, "Expression", "TestExpression");
    visitor(TestExpression, "expression", "arguments");

    tests.push({
        text,
        createNode(expr, args) {
            return new TestExpression(expr, args);
        }
    });

    return TestExpression;
}

function createBinaryOperatorNode(options) {
    const { text, precedence, associativity } = options;
    const BinarySubclass = class extends BinaryExpression {
        /**
         * @param {Node} left
         * @param {Node} right
         */
        constructor(left, right) {
            super(text, left, right);
        }
    };
    type(BinarySubclass, options.type);
    alias(BinarySubclass, "BinaryExpression", "Binary", "Expression");
    visitor(BinarySubclass, "left", "right");

    const operator = {
        text,
        precedence,
        associativity
    };
    operator.createNode =
        options.createNode ||
        ((token, lhs, rhs) => new BinarySubclass(lhs, rhs));
    if (options.parse) {
        operator.parse = options.parse;
    }
    binaryOperators.push(operator);

    return BinarySubclass;
}

function createUnaryOperator(operator, typeName, precedence) {
    const UnarySubclass = class extends UnaryExpression {
        /**
         * @param {Node} argument
         */
        constructor(argument) {
            super(operator, argument);
        }
    };
    type(UnarySubclass, typeName);
    alias(UnarySubclass, "Expression", "UnaryLike");
    visitor(UnarySubclass, "argument");

    unaryOperators.push({
        text: operator,
        precedence,
        createNode(token, expr) {
            const op = new UnarySubclass(expr);
            setStartFromToken(op, token);
            copyEnd(op, expr);
            return op;
        }
    });

    return UnarySubclass;
}
//endregion
