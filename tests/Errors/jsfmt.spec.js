import { run_spec } from "tests_config/run_spec";
import { describe, expect, it } from "vitest";

describe("Errors", () => {
    describe("parsers", () => {
        it("should fail against unexpected token in expression", async () => {
            const promise = run_spec(import.meta.url, {
                source: "unexpectedTokenInExpression.twig"
            });
            await expect(promise).rejects.toThrow("Invalid Token");
        });
        it("should fail against unexpected token in tag", async () => {
            const promise = run_spec(import.meta.url, {
                source: "unexpectedTokenInTag.twig"
            });
            await expect(promise).rejects.toThrow("Invalid Token");
        });
        it("should fail against unexpected token in element", async () => {
            const promise = run_spec(import.meta.url, {
                source: "unexpectedTokenInElement.twig"
            });
            await expect(promise).rejects.toThrow("Invalid Token");
        });
        it("should fail against an unclosed dynamic tag name", async () => {
            const promise = run_spec(import.meta.url, {
                source: "unclosedDynamicTagName.twig"
            });
            await expect(promise).rejects.toThrow("Expected closing tag");
        });
        it("should fail against a partial dynamic tag name", async () => {
            const promise = run_spec(import.meta.url, {
                source: "partialDynamicTagName.twig"
            });
            await expect(promise).rejects.toThrow(
                "Expected the whole tag name to be an expression"
            );
        });
        it("should fail against a mismatched dynamic closing tag", async () => {
            const promise = run_spec(import.meta.url, {
                source: "mismatchedDynamicTagName.twig"
            });
            await expect(promise).rejects.toThrow(
                'Unexpected closing "{{ a }}" tag'
            );
        });
    });
    describe("lexer", () => {
        it("should fail against non-breaking space token in expression", async () => {
            const promise = run_spec(import.meta.url, {
                source: "nonBreakingSpaceInExpression.twig"
            });
            await expect(promise).rejects.toThrow(
                "Unsupported token: Non-breaking space"
            );
        });
        it("should fail against unknown token in expression", async () => {
            const promise = run_spec(import.meta.url, {
                source: "unknownTokenInExpression.twig"
            });
            await expect(promise).rejects.toThrow("Unknown token ^");
        });
    });
});
