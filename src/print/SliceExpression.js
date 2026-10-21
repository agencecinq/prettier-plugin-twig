import { printMultipartInParentheses } from "../util/index.js";

const printSliceExpression = (node, path, print, options) => {
    const printedTarget = printMultipartInParentheses(
        node.target,
        path.call(print, "target"),
        options
    );
    const printedStart = node.start ? path.call(print, "start") : "";
    const printedEnd = node.end ? path.call(print, "end") : "";
    return [printedTarget, "[", printedStart, ":", printedEnd, "]"];
};

export { printSliceExpression };
