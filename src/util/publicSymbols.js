/**
 * These symbols are visible to outside users of
 * the package. For example, they might be useful
 * for plugins.
 */

/**
 * Set this to true on an AST node that might be the
 * parent of a StringLiteral node. The StringLiteral
 * will be enclosed in quotes when this attribute is
 * set to true on the parent.
 */
const STRING_NEEDS_QUOTES = Symbol("STRING_NEEDS_QUOTES");

/**
 * Set to " or '
 * Allows a node type to determine the quote char string
 * literals must use.
 */
const OVERRIDE_QUOTE_CHAR = Symbol("OVERRIDE_QUOTE_CHAR");

/**
 * This signals to child nodes that an expression environment
 * {{ ... }} has not yet been opened, so they might have
 * to open one. Example: An Element node, in its attributes
 * array, can directly contain a FilterExpression. Usually,
 * a FilterExpression does not open an {{...}} environment,
 * but here, it has to.
 */
const EXPRESSION_NEEDED = Symbol("EXPRESSION_NEEDED");

/**
 * Signals to child nodes that they are part of a string,
 * which means that expressions have to be interpolated.
 * Example:
 * "Part #{ partNr } of #{ partCount }"
 */
const INSIDE_OF_STRING = Symbol("INSIDE_OF_STRING");

/**
 * Signals to FilterStatement nodes that they are part of
 * a filter block
 */
const FILTER_BLOCK = Symbol("FILTER_BLOCK");

/**
 * Signals to text nodes that they should preserve leading
 * whitespace (whitespace at the beginning)
 */
const PRESERVE_LEADING_WHITESPACE = Symbol("PRESERVE_LEADING_WHITESPACE");

/**
 * Signals to text nodes that they should preserve trailing
 * whitespace (whitespace at the end)
 */
const PRESERVE_TRAILING_WHITESPACE = Symbol("PRESERVE_TRAILING_WHITESPACE");

/**
 * Signals to an expression statement that touches the tag of an inline
 * element that it trims its whitespace ({{- or -}}) when the element breaks:
 * holds the group ID of the element
 */
const TRIM_LEFT_WHEN_BROKEN = Symbol("TRIM_LEFT_WHEN_BROKEN");
const TRIM_RIGHT_WHEN_BROKEN = Symbol("TRIM_RIGHT_WHEN_BROKEN");

/**
 * Signals to statements that they should be ignored
 * and printed as is.
 */
const PRETTIER_IGNORED_CODE = Symbol("PRETTIER_IGNORED_CODE");

/**
 * This defaults to TRUE. Only if it is explicitly set to FALSE,
 * a logical expression will not create a wrapping group on the
 * top level
 */
const GROUP_TOP_LEVEL_LOGICAL = Symbol("GROUP_TOP_LEVEL_LOGICAL");

/**
 * Used to mark the root of a logical expression. Can be important
 * for grouping and parenthesis placement.
 */
const IS_ROOT_LOGICAL_EXPRESSION = Symbol("IS_ROOT_LOGICAL_EXPRESSION");

export {
    STRING_NEEDS_QUOTES,
    OVERRIDE_QUOTE_CHAR,
    PRETTIER_IGNORED_CODE,
    INSIDE_OF_STRING,
    EXPRESSION_NEEDED,
    FILTER_BLOCK,
    PRESERVE_TRAILING_WHITESPACE,
    PRESERVE_LEADING_WHITESPACE,
    TRIM_LEFT_WHEN_BROKEN,
    TRIM_RIGHT_WHEN_BROKEN,
    GROUP_TOP_LEVEL_LOGICAL,
    IS_ROOT_LOGICAL_EXPRESSION
};
