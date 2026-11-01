# Fonts

| Files                                                                    | Licence                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `HankenGrotesk-Variable.woff2`, `HankenGrotesk-VariableItalic.woff2`     | SIL Open Font License 1.1 (`OFL.txt`)                        |
| `DankMono-Regular.woff2`, `DankMono-Italic.woff2`, `DankMono-Bold.woff2` | Proprietary, under the Grazil Ltd end-user licence agreement |

The MIT licence of this repository does not cover the fonts. Each font stays under its own licence.

Dank Mono is proprietary. It is not in this repository or its history. The build fetches it from the owner's private package feed (`pnpm fonts:fetch`, or the pipeline download), for the owner's own builds only. Without it, mono text falls back to Cascadia Mono or the system monospace font. To use Dank Mono, buy your own licence from its author.

The Hanken Grotesk files are the latin subset from `@fontsource-variable/hanken-grotesk` and stay under the OFL.
