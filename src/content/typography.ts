import { FileHelper } from "@supernovaio/export-helpers";

import {
  OutputTextFile,
  PulsarContext,
  RemoteVersionIdentifier,
  Supernova,
  Token,
  TokenGroup,
  TokenType,
  TypographyToken,
} from "@supernovaio/sdk-exporters";

import { generateGenericFile } from "./utils";
import { typographyTokenToCSSClass } from "./token";

export function convertTokensToCSS({
  tokens,
  tokenGroups,
}: {
  tokens: Token[];
  tokenGroups: TokenGroup[];
}) {
  const cssVariables = tokens
    .filter((t) => t.tokenType === TokenType.typography)
    .map((token) =>
      typographyTokenToCSSClass(token as TypographyToken, tokenGroups)
    )
    .join("\n");

  return cssVariables;
}

// THOSE SHOULDNT BE HARDCODED, BUT SINCE FIGMA -> SUPERNOVA CREATES 2 DIFFERENT GROUPS
// FOR THE SAME STYLES, WE CANT RELY ON PARENTID
const TYPOGRAPHY_TOKENS = [
  "Body-01",
  "Body-02",
  "Body-Compact-01",
  "Body-Compact-02",
  "Code-01",
  "Code-02",
  "Label-01",
  "Heading-01",
  "Heading-02",
  "Heading-03",
  "Heading-04",
  "Heading-05",
  "Heading-06",
  "Heading-07",
  "Heading-compat-01",
  "Heading-compact-02",
  "Helper-text-01",
  "Helper-text-02",
  "Legal-01",
  "Legal-02",
];

export async function generateTypographyTokens({
  remoteVersionIdentifier,
  sdk,
  context,
  tokenGroups,
}: {
  remoteVersionIdentifier: RemoteVersionIdentifier;
  sdk: Supernova;
  context: PulsarContext;
  tokenGroups: TokenGroup[];
}) {
  let tokens = await sdk.tokens.getTokens(remoteVersionIdentifier);

  const typographyGroups = tokenGroups.filter(
    (group) => group.name === "Typography"
  );

  if (typographyGroups.length === 0) {
    throw new Error("Typography group not found");
  }

  // EITHER REFERENCE FONT WEIGHT OR PARSEINT VALUES FROM token
  const fontWeightTokens = tokens.filter(
    (token) => token.tokenType === TokenType.fontWeight
  );

  await Promise.all(
    TYPOGRAPHY_TOKENS.map(async (typographyTokenName) => {
      const typographyTokenIds = tokenGroups
        .filter((group) => group.name === typographyTokenName)
        .reduce((allTokenIds: string[], group) => {
          allTokenIds.push(...group.tokenIds);
          return allTokenIds;
        }, []);

      const typographyTokens = tokens.filter((token) =>
        typographyTokenIds.includes(token.id)
      );

      // TODO PARSE TYPOGRAPHY TOKENS
      // find relevant tokens and compose new value for typography token

      let tokenToUpdate = tokens.find(
        (token) => token.name === typographyTokenName
      );

      if (!tokenToUpdate) {
        const newLocalToken = sdk.tokens.createLocalToken(
          TokenType.typography,
          "1",
          context.brandId as string, // TODO: change
          []
        );

        const newToken = await sdk.tokens.createToken(
          remoteVersionIdentifier,
          newLocalToken,
          typographyGroups[0].id
        );

        // REFETCH TOKENS
        tokens = await sdk.tokens.getTokens(remoteVersionIdentifier);

        tokenToUpdate = tokens.find((token) => token.id === newToken.id);
      }

      if (tokenToUpdate) {
        tokenToUpdate.name = typographyTokenName;

        // THIS IS A HACK, SINCE TOKEN TYPE IS NOT BEING SET CORRECTLY
        // CORRECT SOLUTION WOULD BE TO SORT THOSE BY TOKEN TYPE
        // const fontFamilyToken = typographyTokens.find(
        //   (token) => token.tokenType === TokenType.fontFamily
        // );
        // const fontWeightToken = typographyTokens.find(
        //   (token) => token.tokenType === TokenType.fontWeight
        // );
        // const fontSizeToken = typographyTokens.find(
        //   (token) => token.tokenType === TokenType.fontSize
        // );
        // const textDecorationToken = typographyTokens.find(
        //   (token) => token.tokenType === TokenType.textDecoration
        // );
        // const textCaseToken = typographyTokens.find(
        //   (token) => token.tokenType === TokenType.textCase
        // );
        // const letterSpacingToken = typographyTokens.find(
        //   (token) => token.tokenType === TokenType.letterSpacing
        // );
        // const lineHeightToken = typographyTokens.find(
        //   (token) => token.tokenType === TokenType.lineHeight
        // );
        // const paragraphSpacingToken = typographyTokens.find(
        //   (token) => token.tokenType === TokenType.paragraphSpacing
        // );

        const fontFamilyToken = typographyTokens.find(
          (token) => token.name === "font-family"
        );
        const fontWeightToken = typographyTokens.find(
          (token) => token.name === "font-weight"
        );
        const fontSizeToken = typographyTokens.find(
          (token) => token.name === "font-size"
        );
        const textDecorationToken = typographyTokens.find(
          (token) => token.name === "text-decoration"
        );
        const textCaseToken = typographyTokens.find(
          (token) => token.name === "text-case"
        );
        const letterSpacingToken = typographyTokens.find(
          (token) => token.name === "letter-spacing"
        );
        const lineHeightToken = typographyTokens.find(
          (token) => token.name === "line-height"
        );
        const paragraphSpacingToken = typographyTokens.find(
          (token) => token.name === "paragraph-spacing"
        );

        // @ts-ignore
        tokenToUpdate.value = {
          // @ts-ignore
          ...tokenToUpdate.value,
          ...(fontFamilyToken && {
            fontFamily: {
              // @ts-ignore
              text: fontFamilyToken.value.text,
              referencedTokenId: null,
            },
          }),
          ...(fontWeightToken && {
            fontWeight: {
              // @ts-ignore
              text: String(fontWeightToken.value.measure),
              // Another hack needed to convert typography token correctly
              // Match string fontWeight token with an actual fontWeight token by value
              // and use its id as reference
              referencedTokenId:
                fontWeightTokens.find(
                  (_token) =>
                    // @ts-ignore
                    _token.value.text === String(fontWeightToken.value.measure)
                )?.id || null,
            },
          }),
          ...(fontSizeToken && {
            // @ts-ignore
            fontSize: {
              // @ts-ignore
              unit: fontSizeToken.value.unit,
              // @ts-ignore
              measure: fontSizeToken.value.measure,
              referencedTokenId: null,
            },
          }),
          ...(textDecorationToken && {
            // @ts-ignore
            textDecoration: {
              // @ts-ignore
              value: textDecorationToken.value.value,
              referencedTokenId: null,
            },
          }),
          ...(textCaseToken && {
            // @ts-ignore
            textCase: {
              // @ts-ignore
              value: textCaseToken.value.value,
              referencedTokenId: null,
            },
          }),
          ...(letterSpacingToken && {
            // @ts-ignore
            letterSpacing: {
              // @ts-ignore
              unit: letterSpacingToken.value.unit,
              // @ts-ignore
              measure: letterSpacingToken.value.measure,
              referencedTokenId: null,
            },
          }),
          ...(lineHeightToken && {
            // @ts-ignore
            lineHeight: {
              // @ts-ignore
              unit: lineHeightToken.value.unit,
              // @ts-ignore
              measure: lineHeightToken.value.measure,
              referencedTokenId: null,
            },
          }),
          ...(paragraphSpacingToken && {
            // @ts-ignore
            paragraphSpacing: {
              // @ts-ignore
              unit: paragraphSpacingToken.value.unit,
              // @ts-ignore
              measure: paragraphSpacingToken.value.measure,
              referencedTokenId: null,
            },
          }),
        };

        await sdk.tokens.updateToken(remoteVersionIdentifier, tokenToUpdate);
      }
    })
  );
}

export function getTypographyTokenFiles({
  tokens,
  tokenGroups,
}: {
  tokens: Token[];
  tokenGroups: TokenGroup[];
}) {
  const typographyTokensCSS = convertTokensToCSS({ tokens, tokenGroups });

  let files: OutputTextFile = FileHelper.createTextFile({
    relativePath: "./",
    fileName: "typography.css",
    content: generateGenericFile({
      cssVariables: typographyTokensCSS,
      geneateDisclaimer: true,
    }),
  });

  return files;
}
