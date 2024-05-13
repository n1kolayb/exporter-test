import { FileHelper } from "@supernovaio/export-helpers";

import {
  OutputTextFile,
  SizeToken,
  Token,
  TokenGroup,
  TokenType,
} from "@supernovaio/sdk-exporters";

import { generateContentForFile } from "./utils";
import { spacingTokenToCSS } from "./token";

export function convertTokensToCSS({
  tokens,
  tokenGroups,
}: {
  tokens: Token[];
  tokenGroups: TokenGroup[];
}) {
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]));

  const cssVariables = tokens
    .filter((t) => t.tokenType === TokenType.space)
    .map((token) =>
      spacingTokenToCSS(token as SizeToken, mappedTokens, tokenGroups)
    )
    .join("\n");

  return cssVariables;
}

export function getSpacingTokenFiles({
  tokens,
  tokenGroups,
}: {
  tokens: Token[];
  tokenGroups: TokenGroup[];
}) {
  const spacingTokens = convertTokensToCSS({ tokens, tokenGroups });

  let files: OutputTextFile = FileHelper.createTextFile({
    relativePath: "./",
    fileName: "spacing.css",
    content: generateContentForFile({
      cssVariables: spacingTokens,
      geneateDisclaimer: true,
    }),
  });

  return files;
}
