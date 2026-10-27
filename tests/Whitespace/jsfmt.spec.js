import { run_spec } from "tests_config/run_spec";
import { describe, expect, it } from "vitest";

/** @type {import('tests_config/run_spec').PrettierOptions} */
const formatOptions = {};

describe("Whitespace", () => {
    it("should handle whitespace", async () => {
        const { actual, snapshotFile } = await run_spec(import.meta.url, {
            source: "element.twig"
        });
        await expect(actual).toMatchFileSnapshot(snapshotFile);
    });

    it("should keep the whitespace around text-level elements", async () => {
        const { actual, snapshotFile } = await run_spec(import.meta.url, {
            source: "textLevel.twig"
        });
        await expect(actual).toMatchFileSnapshot(snapshotFile);
    });

    it("should break inline content at its whitespace only", async () => {
        const { actual, snapshotFile } = await run_spec(import.meta.url, {
            source: "inlineBreaks.twig"
        });
        await expect(actual).toMatchFileSnapshot(snapshotFile);
    });

    it("should keep the content of an inline element against its tags", async () => {
        const { actual, snapshotFile } = await run_spec(import.meta.url, {
            source: "inlineEdges.twig"
        });
        await expect(actual).toMatchFileSnapshot(snapshotFile);
    });
});
