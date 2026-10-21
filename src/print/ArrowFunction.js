import { doc } from "prettier";
import { innerSpace } from "../util/index.js";
const { group, indent, join, line, softline } = doc.builders;

const printArrowFunction = (node, path, print, options) => {
    const args = node.args;
    const body = path.call(print, "body");

    const parts = [];

    // Args
    if (args.length > 1) {
        // Multiple args
        const space = innerSpace(options);
        parts.push(
            group([
                "(",
                space,
                join(
                    ", ",
                    args.map(arg => arg.name)
                ),
                space,
                ")"
            ])
        );
    } else {
        // Single arg
        parts.push(args[0].name);
    }

    // Arrow
    parts.push(" => ");

    // Body
    parts.push(body);

    return group(parts);
};

export { printArrowFunction };
