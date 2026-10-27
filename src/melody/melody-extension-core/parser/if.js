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
    Types,
    setStartFromToken,
    setEndFromToken,
    hasTagStartTokenTrimLeft,
    hasTagEndTokenTrimRight
} from "../../melody-parser/index.js";
import { IfStatement } from "./../types.js";

export const IfParser = {
    name: "if",
    parse(parser, token) {
        const tokens = parser.tokens;
        let test = parser.matchExpression();
        let alternate = null;

        tokens.expect(Types.TAG_END);
        const ifTagEndToken = tokens.la(-1);

        const ifStatement = new IfStatement(
            test,
            parser.parse(matchConsequent).expressions
        );

        let elseifTagStartToken;
        let elseifTagEndToken;

        do {
            if (tokens.nextIf(Types.SYMBOL, "else")) {
                const elseTagStartToken = tokens.la(-2);
                tokens.expect(Types.TAG_END);
                const elseTagEndToken = tokens.la(-1);
                // After an elseif, the else is the alternate of the elseif,
                // which prints it with its whitespace control
                const statement = alternate || ifStatement;
                statement.alternate = parser.parse(matchAlternate).expressions;
                statement.trimLeftElse =
                    hasTagStartTokenTrimLeft(elseTagStartToken);
                statement.trimRightElse =
                    hasTagEndTokenTrimRight(elseTagEndToken);
            } else if (tokens.nextIf(Types.SYMBOL, "elseif")) {
                elseifTagStartToken = tokens.la(-2);
                test = parser.matchExpression();
                tokens.expect(Types.TAG_END);
                elseifTagEndToken = tokens.la(-1);
                const consequent = parser.parse(matchConsequent).expressions;
                alternate = (alternate || ifStatement).alternate =
                    new IfStatement(test, consequent);
                alternate.trimLeft =
                    hasTagStartTokenTrimLeft(elseifTagStartToken);
                alternate.trimRightIf =
                    hasTagEndTokenTrimRight(elseifTagEndToken);
            }

            if (tokens.nextIf(Types.SYMBOL, "endif")) {
                break;
            }
        } while (!tokens.test(Types.EOF));

        const endifTagStartToken = tokens.la(-2);

        setStartFromToken(ifStatement, token);
        setEndFromToken(ifStatement, tokens.expect(Types.TAG_END));

        ifStatement.trimRightIf = hasTagEndTokenTrimRight(ifTagEndToken);
        ifStatement.trimLeftEndif =
            hasTagStartTokenTrimLeft(endifTagStartToken);

        return ifStatement;
    }
};

function matchConsequent(tokenText, token, tokens) {
    if (token.type === Types.TAG_START) {
        const next = tokens.la(0).text;
        return next === "else" || next === "endif" || next === "elseif";
    }
    return false;
}

function matchAlternate(tokenText, token, tokens) {
    return token.type === Types.TAG_START && tokens.test(Types.SYMBOL, "endif");
}
