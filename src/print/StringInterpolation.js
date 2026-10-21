import {
    EXPRESSION_NEEDED,
    STRING_NEEDS_QUOTES,
    innerSpace
} from "../util/index.js";

const printStringInterpolation = (node, path, print, options) => {
    // The expression prints neither `{{ }}` nor `#{ }`, and literals keep
    // their quotes: `"a #{ 'b' }"`
    node[EXPRESSION_NEEDED] = false;
    node[STRING_NEEDS_QUOTES] = true;
    const space = innerSpace(options);

    return ["#{", space, path.call(print, "value"), space, "}"];
};

export { printStringInterpolation };
