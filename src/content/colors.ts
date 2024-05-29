import { FileHelper } from "@supernovaio/export-helpers";

import {
  ColorToken,
  OutputTextFile,
  RemoteVersionIdentifier,
  Supernova,
  Token,
  TokenGroup,
  TokenTheme,
  TokenType,
} from "@supernovaio/sdk-exporters";

import { generateContentForFile } from "./utils";
import { colorTokenToCSS } from "./token";

export function convertTokensToCSS({
  tokens,
  tokenGroups,
}: {
  tokens: Token[];
  tokenGroups: TokenGroup[];
}) {
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]));

  const cssVariables = tokens
    .filter((t) => t.tokenType === TokenType.color)
    .map((token) =>
      colorTokenToCSS(token as ColorToken, mappedTokens, tokenGroups)
    )
    .join("\n");

  return cssVariables;
}

async function getTokensForTheme({
  sdk,
  theme,
  allTokens,
  tokenGroups,
}: {
  sdk: Supernova;
  theme: TokenTheme;
  allTokens: Token[];
  tokenGroups: TokenGroup[];
}) {
  const tokens = await sdk.tokens.computeTokensByApplyingThemes(allTokens, [
    theme,
  ]);

  return {
    name: theme.codeName,
    cssVariables: convertTokensToCSS({ tokens, tokenGroups }),
  };
}

export async function getColorTokenFiles({
  sdk,
  tokens,
  tokenGroups,
  remoteVersionIdentifier,
}: {
  sdk: Supernova;
  tokens: Token[];
  tokenGroups: TokenGroup[];
  remoteVersionIdentifier: RemoteVersionIdentifier;
}) {
  // Get all themes and use only dark one.
  // TODO: change it to handle different colour themes
  const themes = (
    await sdk.tokens.getTokenThemes(remoteVersionIdentifier)
  ).filter((theme) => theme.codeName.includes("dark"));

  const defaultThemeTokens = convertTokensToCSS({ tokens, tokenGroups });

  let files: OutputTextFile[] = [
    FileHelper.createTextFile({
      relativePath: "./",
      fileName: "themes/light-theme.scss",
      content: generateContentForFile({
        cssVariables: defaultThemeTokens,
        geneateDisclaimer: true,
        mixinName: "light-colors",
      }),
    }),
  ];

  if (themes.length) {
    const themeTokens = await Promise.all(
      themes.map(async (theme) => {
        return getTokensForTheme({
          sdk,
          theme,
          allTokens: tokens,
          tokenGroups,
        });
      })
    );

    themeTokens.forEach((themeTokenFile) => {
      files.push(
        FileHelper.createTextFile({
          relativePath: "./",
          fileName: `themes/${themeTokenFile.name}-theme.scss`,
          content: generateContentForFile({
            cssVariables: themeTokenFile.cssVariables,
            geneateDisclaimer: true,
            mixinName: `${themeTokenFile.name}-colors`,
          }),
        })
      );
    });
  }

  return files;
}
