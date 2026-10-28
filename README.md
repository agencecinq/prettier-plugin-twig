# @agencecinq/prettier-plugin-twig

Agence Cinq's Prettier plugin for Twig. It formats `.twig` and `.html.twig` templates following the [WordPress coding standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/), for WordPress themes built with [Timber](https://timber.github.io/docs/v2/).

It is a fork of [`@zackad/prettier-plugin-twig`](https://github.com/zackad/prettier-plugin-twig), itself a fork of [trivago/prettier-plugin-twig-melody](https://github.com/trivago/prettier-plugin-twig-melody).

![Prettier Twig Banner](./logo/wide-dark.svg#gh-dark-mode-only)
![Prettier Twig Banner](./logo/wide-light.svg#gh-light-mode-only)

> [!NOTE]
> **This plugin is very dogmatic, and we are well aware of it.** It formats Twig one way, the way we write it at Agence Cinq, and makes no attempt to suit every project: Twig's own coding standards disagree with it, on purpose. If it does not fit your project, use [upstream's plugin](https://github.com/zackad/prettier-plugin-twig), or switch the WordPress style off with [`twigFollowWordPressCodingStandards`](#twigfollowwordpresscodingstandards-default-true).

## Why a fork

We build WordPress themes with Timber: the templates are Twig, the rest of the theme is PHP, and we read and write both in the same day. So both follow one style, the WordPress coding standards:

```twig
{{ post.title | default( 'Untitled' ) }}
{% if not post.password_required and ( is_single or is_page ) %}
{% set args = {
	post_type: 'page',
	post_status: 'publish',
} %}
```

These rules contradict [Twig's coding standards](https://twig.symfony.com/doc/3.x/coding_standards.html), which `@zackad/prettier-plugin-twig` follows: no spaces inside parentheses, none around `|`, and so on. Supporting both would mean asking its maintainer to carry a second style, so we forked rather than opening an issue or a pull request.

The fork also reads a pattern we use on every project, tag names that are a Twig expression, and fixes the bugs we hit along the way. See [What differs from upstream](#what-differs-from-upstream).

## Installation

Install the fork from GitHub, **under the name `@zackad/prettier-plugin-twig`**:

```bash
pnpm add -D @zackad/prettier-plugin-twig@github:agencecinq/prettier-plugin-twig#v1.2.2
```

The lockfile pins the exact commit. To upgrade, read the [changelog](CHANGELOG.md) and [Migration](#migration), change the tag and reinstall.

Why upstream's name: [`prettier-plugin-tailwindcss`](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) sorts classes in Twig by importing `@zackad/prettier-plugin-twig`, by that exact name. Installed under any other name, every Twig file fails with `Cannot find package '@zackad/prettier-plugin-twig'` as soon as the Tailwind plugin is enabled. Under that name, Tailwind loads this fork.

## Configuration

Add the plugin to `plugins` in `.prettierrc.json`:

```json
{
	"useTabs": true,
	"plugins": ["@zackad/prettier-plugin-twig", "prettier-plugin-tailwindcss"]
}
```

- `useTabs` is Prettier's own option: the WordPress coding standards indent with tabs. Leave it out if `.editorconfig` already sets `indent_style = tab`, which Prettier reads.
- `prettier-plugin-tailwindcss` must come last. Leave it out on projects without Tailwind.

Then format the templates:

```bash
pnpm prettier --write "**/*.twig"
```

## What differs from upstream

### WordPress coding standards

[`twigFollowWordPressCodingStandards`](#twigfollowwordpresscodingstandards-default-true), on by default, transposes the WordPress coding standards to Twig:

| #   | Rule                                                                                                                                       | Upstream                                    | This fork                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ----------------------------------------------- |
| 1   | Spaces inside the parentheses of calls, filters, tests, macros and arrow functions, unless they are empty                                 | `default('h2')`, `foo()`                    | `default( 'h2' )`, `foo()`                      |
| 2   | Spaces inside grouping parentheses                                                                                                         | `not foo and (a or b)`                      | `not foo and ( a or b )`                        |
| 3   | Spaces inside sequences, unless they are empty                                                                                             | `[1, 2]`, `[]`                              | `[ 1, 2 ]`, `[]`                                |
| 4   | Spaces around an index, unless it is a string or a number                                                                                  | `list[i]`, `list['key']`                    | `list[ i ]`, `list['key']`                      |
| 5   | A mapping stays on one line with a single property, and puts each property on its own line with several                                   | always broken                               | `{ title: title }`                              |
| 6   | A comma after the last element of a broken sequence or mapping                                                                             | `'publish'` then `}`                        | `'publish',` then `}`                           |
| 7   | Spaces around `\|`                                                                                                                         | `name\|upper`                               | `name \| upper`                                 |
| 8   | A ternary tests the true case                                                                                                              | `not active ? 'off' : 'on'`                 | `active ? 'on' : 'off'`                         |
| 9   | Spaces inside interpolations                                                                                                               | `"#{name}"`                                 | `"#{ name }"`                                   |

- Rules 7 and 9 are not in the WordPress coding standards: they are how we write filters and interpolations, like the spaces they ask for around operators and inside parentheses.
- Rule 8 drops every `not` in front of the test, and swaps the branches when there is an odd number of them. Negated tests such as `items is not empty ? … : …` stay as written, as the WordPress coding standards allow for `! empty()`.
- Single quotes, one space before `/>`, spaces around operators and tabs (with `useTabs`) need no extra rule: upstream and Prettier already print them.

Two rules of the WordPress coding standards are left out, because applying them would change the code, not its layout:

- **Yoda conditions** (`'publish' == post.status`) protect against a typo only when they are written that way: `post.status = 'publish'` is an assignment since Twig 3.23, not a comparison a formatter could turn around.
- **Lowercase tag and attribute names** would break SVG and XML, which are case-sensitive (`viewBox`, `linearGradient`).

### Dynamic tag names

At the agency we let clients choose the tag of a block's title (`h2`, `h3`, `p`…). Blocks get reused in many places on a page, so the right level depends on where the block lands: a fixed `h2` under another `h2` breaks the heading outline, which hurts both SEO and accessibility. So the template takes the tag from the block's settings:

```twig
<{{ block.content.heading | default( 'h2' ) }} class="text-title-xl">
	{{- block.content.title -}}
</{{ block.content.heading | default( 'h2' ) }}>
```

This is valid Twig, but upstream stops with `Expected element start`. This fork reads it: the tag name is printed from its expression, formatted like any other, and each closing tag is paired with its opening tag token by token, whatever the spacing, quotes or whitespace control (`{{ tag|default('h2') }}` and `{{- tag | default("h2") -}}` name the same element).

- The expression must be the whole tag name: `<{{ tag }}>`, `<{{ tag }} class="…">` or `<{{ tag }}{{ attributes }}>`. `<h{{ level }}>` and `<{{ prefix }}-icon>` fail.
- The element must be closed (`</{{ tag }}>`) or self-closing (`<{{ tag }} />`). Nothing tells which elements an expression can name, so an element left open (`From: {{ name }} <{{ email }}>` in a plain-text email) fails instead of being guessed.
- Elements opened and closed under a condition (`{% if link %}<a href="…">{% endif %}`) are not supported, as for any other element.

Limitations:

- The closing tag is printed with the opening tag's expression: whitespace control on the closing tag alone is not kept.
- The printer does not know which element the expression renders, so it lays every dynamic element out as a block. Around an inline element (`<a>`, `<button>`…), it removes the spaces between the element and the text next to it, which changes the rendered page. Put `{# prettier-ignore #}` before such an element.

### Bug fixes

- **Strings are read and escaped like Twig.** A backslash escapes any character (`'a\\'`), an escaped quote keeps its backslash in an interpolated string (`"a #{b} \"c\""`), single-quoted strings are never interpolated, and a literal `#{` is escaped when the string is printed between double quotes. Reported upstream as [#155](https://github.com/zackad/prettier-plugin-twig/issues/155).
- **Strings use the quote that needs the fewest escapes**, as Prettier does for JavaScript: `'test \' with "both" kinds'`.
- **A parse error inside an element fails** instead of silently dropping the element from the output. This regression is on upstream's `master`, not in 0.17.0.
- **Parentheses that change the meaning are kept**: `(a ? b : c) ? d : e`, `(a ? 1 : 2) + 3`, `(a ~ b).c`, `(a + b) is even`, `-(a + b)`.
- **The Elvis operator prints as `?:`**, the operator Twig parses, instead of `? :`.
- **Literals in `#{ }` keep their braces.** `"a #{ true }"` printed `"a true"` where Twig renders `a 1`, and `"a #{ "b#{c}" }"` printed an invalid string.
- **Literals in `{{ }}` inside a tag keep their braces.** `<li {{ 'a' }}>` printed `<li a>`, `{{ true }}` printed `true` where Twig renders `1`, and `<li {{ "a #{b}" }}>` lost its interpolation. Expressions inside a tag, between attributes or in a value, are now laid out as in the body.
- **Arguments that start with a parenthesis are read**, such as `html_classes( 'card', ( scheme | default( 'cream' ) ) == 'cream' ? 'bg-cream' : 'bg-ink' )`, instead of being taken for the parameters of an arrow function.
- **Mappings nested in `{{ }}` or `#{ }` are read**: their `}` no longer ends the expression or the interpolation, as in `"blocks/#{ name | replace( { '_': '-' } ) }.html.twig"` or `{{ {a: {b: 1}} }}`.
- **The `mapping` and `sequence` tests of Twig 3.11 are known**, and `is constant( 'E_ALL' )` no longer prints `is ( 'E_ALL' )`.
- **Empty tags print on one line**: `{% block prepend %}{% endblock %}` instead of a blank line between the two, for `block`, `embed`, `macro`, `set`, `spaceless` and `autoescape`.
- **The `has some` and `has every` operators of Twig 3.5 are read**, with an arrow function as right operand: `items has some item => item.badge`. The parentheses that close the arrow function are kept: `( a has some b => b.c ) ? d : e`.
- **Macro arguments take any constant as default value**, as in Twig: `{% macro input( args = {} ) %}`, `[]` or `-1`, where only a string, a number, `null`, `true` or `false` was read.
- **The content of `<pre>` and `<textarea>` is kept as written.** The browser renders its whitespace, which the printer indented and joined: `<pre><code>@theme {` lost its line breaks. Twig inside these elements is not formatted either.
- **The content of `<script>` and `<style>` is kept as written.** The printer joined its lines, so `// Init` followed by `const a = 1;` printed `// Init const a = 1;`, which comments the code out. The content is not reindented, and Twig inside these elements is not formatted either.
- **The spaces around `del`, `ins`, `u`, `bdi`, `data`, `wbr` and `ruby` are kept.** These elements were laid out as blocks, so `and <del>a</del>` printed `and<del>`, which joins the words on the page. `dt` and `dd` print on their own line, as `li`, where `dd` was glued to its `dt`.
- **Inline content breaks at its whitespace only.** Where text touches an inline element, as in `<a href="#">link</a>,`, the printer broke inside the tags and added a space on the page, here before the comma. The element and the text glued to it now move to the next line together.
- **The content of an inline element stays against its tags.** The whitespace inside an inline element is rendered whatever is around it: Twig can trim the whitespace next to the element (`{{- include() -}}<span>`), and CSS can show it. So the whitespace of the source is kept on both sides (`<a href="#"> Next </a>`), and where the content touches a tag, it keeps touching it. When the element does not fit, an expression next to a tag goes on its own line with the whitespace control that keeps the page as it was:

    ```twig
    <span class="sr-only">
    	{{- __( 'View %s', 'theme' ) | format( item.title | default( item.link.title ) ) -}}
    </span>
    ```

    Text has no whitespace control: it stays glued to the tag and breaks between its words.
- **`p` prints on one line when it fits**, as headings and list items, where `<p class="text-s">{{ email }}</p>` was always broken over three lines.

### No Twig tags inside an HTML tag

A Twig tag inside an opening tag, such as a conditional attribute, fails to parse, as upstream ([#61](https://github.com/zackad/prettier-plugin-twig/issues/61)). We keep it that way on purpose: an opening tag is a list of attributes, each written one way. `{# prettier-ignore #}` does not help, because the file has to be parsed before ignore comments are looked at.

Write conditional attributes with [`html_attr`](https://twig.symfony.com/doc/3.x/functions/html_attr.html), from `twig/html-extra`:

```twig
{# Fails to parse #}
<section {% if block.id %}id="{{ block.id }}"{% endif %} class="…">

<section {{ html_attr( { id: block.id } ) }} class="…">
<input type="radio" {{ html_attr( { checked: args.checked } ) }} />
```

`html_attr` leaves out `null` and `false` values, prints `true` as an empty value and escapes the others. A `{% if %}` or a string concatenation (`'id="' ~ block.id ~ '"'`) escapes nothing, since Timber turns autoescaping off: a value holding a quote breaks the HTML.

Only `null` and `false` are left out: an empty string prints `id=""`. Give the template `null` for a missing value, or keep the condition: `html_attr( block.id ? { id: block.id } )`.

### Known limitations

Shared with upstream, so far:

- **An element opened and closed under a condition fails to parse**: `{% if classes %}<div class="…">{% endif %}…{% if classes %}</div>{% endif %}`. Capture the content with `{% set %}` and print it inside the element or alone, or use a dynamic tag name when the condition only picks the tag (`<{{ link ? 'a' : 'div' }}>`).

## Migration

### From `@zackad/prettier-plugin-twig`

1. Point the dependency at the fork, keeping its name:

    ```bash
    pnpm add -D @zackad/prettier-plugin-twig@github:agencecinq/prettier-plugin-twig#v1.2.2
    ```

    The entry in `plugins` stays `@zackad/prettier-plugin-twig`.

2. Add `"useTabs": true` to the Prettier configuration, unless `.editorconfig` already sets `indent_style = tab`.
3. Remove `twigFollowOfficialCodingStandards` and `twigAlwaysBreakObjects` if they are set: the WordPress style takes precedence over them.
4. Rewrite the Twig tags inside HTML tags with `html_attr` (see [No Twig tags inside an HTML tag](#no-twig-tags-inside-an-html-tag)): the templates that keep them cannot be formatted. Commit this on its own too, as it changes the code.
5. Reformat every template once and commit the result on its own, so the style change stays out of feature diffs. To keep upstream's output instead, set `twigFollowWordPressCodingStandards` to `false`.

### From `@agencecinq/prettier-plugin`

1. Remove it from the project, from `plugins` and, if set, the `cinqTwigDynamicTags` option:

    ```bash
    pnpm remove @agencecinq/prettier-plugin
    ```

2. Install this fork as above. Dynamic tag names are built in, and cannot be switched off.
3. Reformat every template once: the expression in a tag name is now formatted like any other expression (`<{{ heading | default( 'h2' ) }}>`), where `@agencecinq/prettier-plugin` kept it as written.

## Options

Add them to the Prettier configuration (e.g. `.prettierrc.json`).

### twigFollowWordPressCodingStandards (default: `true`)

Follow the [WordPress coding standards](#wordpress-coding-standards), transposed to Twig. When `true`, it takes precedence over `twigFollowOfficialCodingStandards` (pipes get spaces, named arguments always use `:`) and over `twigAlwaysBreakObjects` (rule 5). Set it to `false` to get upstream's output.

### twigSingleQuote (default: `true`)

Values can be `true` or `false`. If `true`, single quotes will be used for string literals in Twig files, unless double quotes need fewer escapes.

### twigAlwaysBreakObjects (default: `true`)

Ignored when `twigFollowWordPressCodingStandards` is `true`. If set to `true`, objects will always be wrapped/broken, even if they would fit on one line:

```html
<section
    class="{{
        {
            base: css.prices
        } | classes
    }}"
></section>
```

If set to `false`, this would be printed as:

```html
<section class="{{ { base: css.prices } | classes }}"></section>
```

### twigFollowOfficialCodingStandards (default: `true`)

Follow the standards described in [https://twig.symfony.com/doc/2.x/coding_standards.html](https://twig.symfony.com/doc/2.x/coding_standards.html) exactly. If set to `false`, some slight deviations might occur, such as spaces around the filter `|` operator (`s | upper` instead of `s|upper`). When `twigFollowWordPressCodingStandards` is `true`, pipes always get spaces and named arguments always use `:`.

### twigOutputEndblockName (default: `false`)

Choose whether to output the block name in `{% endblock %}` tags (e.g., `{% endblock content %}`) or not. The default is not to output it.

### twigMultiTags (default: `[]`)

An array of coherent sequences of non-standard Twig tags that should be treated as belonging together. Example (inspired by [Craft CMS](https://docs.craftcms.com/v2/templating/nav.html)):

```json
{
    "twigMultiTags": [
        "nav,endnav",
        "switch,case,default,endswitch",
        "ifchildren,endifchildren",
        "cache,endcache"
    ]
}
```

Looking at the case of `nav,endnav`, this means that the Twig tags `{% nav %}` and `{% endnav %}` will be treated as a pair, and everything in between will be indented:

```twig
{% nav entry in entries %}
    <li>
        <a href="{{ entry.url }}">{{ entry.title }}</a>
    </li>
{% endnav %}
```

If we did not list the `"nav,endnav"` entry in `twigMultiTags`, this code example would be printed without indentation, because `{% nav %}` and `{% endnav %}` would be treated as unrelated, individual Twig tags:

```twig
{% nav entry in entries %}
<li>
    <a href="{{ entry.url }}">{{ entry.title }}</a>
</li>
{% endnav %}
```

Note that the order matters: It has to be `"nav,endnav"`, and it must not be `"endnav,nav"`. In general, the first and the last tag name matter. In the case of `"switch,case,default,endswitch"`, the order of `case` and `default` does not matter. However, `switch` has to come first, and `endswitch` has to come last.

### twigTestExpressions (default: `[]`)

Make custom Twig tests known to the parser.

```json
{
    "twigTestExpressions": [
        "snake_case_test",
        "camelCaseTest"
    ]
}
```

__Example__
```twig
{{ a is snake_case_test }}
{{ a is not snake_case_test }}
{{ a is camelCaseTest }}
{{ a is not camelCaseTest }}
```

## Features

### `prettier-ignore` and `prettier-ignore-start`

When you are not happy with how Prettier formats a certain element or section in the code, you can tell it to leave it in peace:

```
{# prettier-ignore #}
<div   class="weird-formatting"   >This will not be re-formatted</div>

<div   class="weird-formatting"   >But this will be</div>
```

You can also tell Prettier to leave entire regions as they are:

```
{# prettier-ignore-start #}
    ...
{# prettier-ignore-end #}
```

## Development

The repository uses Yarn 1, e.g. through `corepack yarn`:

```bash
yarn install
yarn test
yarn lint
```

Upstream's tests run with `twigFollowWordPressCodingStandards` set to `false` (see [`tests_config/run_spec.js`](tests_config/run_spec.js)), so their snapshots stay as upstream wrote them. This fork's style is tested in [`tests/WordPressCodingStandards`](tests/WordPressCodingStandards).

Twig is parsed by Melody, a JavaScript template engine by trivago that understood Twig and HTML together. Its code lives in [`src/melody`](src/melody): it imitates Twig rather than running it, so a construct it does not know yet (such as the `=` assignment operator of Twig 3.23) fails to parse.

### Syncing with upstream

```bash
git fetch upstream
git merge upstream/master
```

Expect conflicts in `CHANGELOG.md` and in the printers this fork changes. Run the tests after each merge.

### Releasing

Move the changelog entry under the new version with its date, bump `version` in `package.json`, commit, then tag and push:

```bash
git tag -a v1.0.0 -m v1.0.0
git push --follow-tags
```

## Credits

Licensed under the Apache License 2.0, as upstream (see [LICENSE](LICENSE)). Originally written by Tom Bartel at trivago, maintained upstream by [zackad](https://github.com/zackad). This fork's changes are listed above and in the [changelog](CHANGELOG.md).
