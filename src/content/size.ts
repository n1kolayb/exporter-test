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
    .filter((t) => t.tokenType === TokenType.size)
    .map((token) =>
      spacingTokenToCSS(token as SizeToken, mappedTokens, tokenGroups)
    )
    .join("\n");

  return cssVariables;
}

export function getSizeTokenFiles({
  tokens,
  tokenGroups,
}: {
  tokens: Token[];
  tokenGroups: TokenGroup[];
}) {
  const sizeTokens = convertTokensToCSS({ tokens, tokenGroups });

  let files: OutputTextFile = FileHelper.createTextFile({
    relativePath: "./",
    fileName: "size.css",
    content: generateContentForFile({
      cssVariables: sizeTokens,
      geneateDisclaimer: true,
    }),
  });

  return files;
}
