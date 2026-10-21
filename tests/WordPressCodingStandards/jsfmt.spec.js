import { format } from "prettier";
import plugin from "src/index";
import { run_spec } from "tests_config/run_spec";
import { describe, expect, it } from "vitest";

const formatOptions = { twigFollowWordPressCodingStandards: true };

const runWordPressSpec = async source => {
    const { actual, snapshotFile } = await run_spec(import.meta.url, {
        source,
        formatOptions
    });
    await expect(actual).toMatchFileSnapshot(snapshotFile);

    const formattedAgain = await format(actual, {
        parser: "twig",
        plugins: [plugin],
        tabWidth: 4,
        ...formatOptions
    });
    expect(formattedAgain).toBe(actual);
};

describe("WordPress coding standards", () => {
    it("is on by default", async () => {
        const actual = await format("{{ foo(a)|default([]) }}\n", {
            parser: "twig",
            plugins: [plugin]
        });
        expect(actual).toBe("{{ foo( a ) | default( [] ) }}\n");
    });

    it("puts spaces inside parentheses", async () => {
        await runWordPressSpec("parentheses.twig");
    });

    it("puts spaces inside sequences, and a comma after the last element once broken", async () => {
        await runWordPressSpec("sequences.twig");
    });

    it("breaks mappings of several properties, with a comma after the last one", async () => {
        await runWordPressSpec("mappings.twig");
    });

    it("puts spaces around an index, unless it is a string or a number", async () => {
        await runWordPressSpec("index.twig");
    });

    it("puts spaces around pipes", async () => {
        await runWordPressSpec("pipes.twig");
    });

    it("puts spaces inside interpolations", async () => {
        await runWordPressSpec("interpolation.twig");
    });

    it("tests the true case in ternaries", async () => {
        await runWordPressSpec("ternary.twig");
    });
});
