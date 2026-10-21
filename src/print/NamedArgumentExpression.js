import {
    STRING_NEEDS_QUOTES,
    followsWordPressCodingStandards
} from "../util/index.js";

const printNamedArgumentExpression = (node, path, print, options) => {
    node[STRING_NEEDS_QUOTES] = true;
    const printedName = path.call(print, "name");
    const printedValue = path.call(print, "value");
    const usesColon =
        followsWordPressCodingStandards(options) ||
        options.twigFollowOfficialCodingStandards;
    const separator = usesColon ? ": " : " = ";
    return [printedName, separator, printedValue];
};

export { printNamedArgumentExpression };
