import { FileHelper } from "@supernovaio/export-helpers";

import {
  FontWeightToken,
  OutputTextFile,
  SizeToken,
  Token,
  TokenGroup,
  TokenType,
} from "@supernovaio/sdk-exporters";

import { generateContentForFile } from "./utils";
import { fontWeightTokenToCSS } from "./token";

export function convertTokensToCSS({
  tokens,
  tokenGroups,
}: {
  tokens: Token[];
  tokenGroups: TokenGroup[];
}) {
  const mappedTokens = new Map(tokens.map((token) => [token.id, token]));

  const cssVariables = tokens
    .filter((t) => t.tokenType === TokenType.fontWeight)
    .map((token) =>
      fontWeightTokenToCSS(token as FontWeightToken, mappedTokens, tokenGroups)
    )
    .join("\n");

  return cssVariables;
}

export function getFontWeightTokenFiles({
  tokens,
  tokenGroups,
}: {
  tokens: Token[];
  tokenGroups: TokenGroup[];
}) {
  const fontWeightTokens = convertTokensToCSS({ tokens, tokenGroups });

  let files: OutputTextFile = FileHelper.createTextFile({
    relativePath: "./",
    fileName: "font-weight.css",
    content: generateContentForFile({
      cssVariables: fontWeightTokens,
      geneateDisclaimer: true,
    }),
  });

  return files;
}
