import {
  NamingHelper,
  CSSHelper,
  ColorFormat,
  StringCase,
} from "@supernovaio/export-helpers";
import {
  ColorToken,
  SizeToken,
  Token,
  TokenGroup,
} from "@supernovaio/sdk-exporters";

export function colorTokenToCSS(
  token: ColorToken,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>
): string {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = tokenVariableName(token, tokenGroups);

  // Then creating the value of the token, using another helper function
  const value = CSSHelper.colorTokenValueToCSS(token.value, mappedTokens, {
    allowReferences: true,
    decimals: 3,
    colorFormat: ColorFormat.smartHashHex,
    tokenToVariableRef: (t) => {
      return `var(--${tokenVariableName(t, tokenGroups)})`;
    },
  });

  return `  --${name}: ${value};`;
}

export function spacingTokenToCSS(
  token: SizeToken,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>
): string {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = tokenVariableName(token, tokenGroups);

  // Then creating the value of the token, using another helper function
  const value = CSSHelper.tokenToCSS(token, mappedTokens, {
    allowReferences: true,
    decimals: 3,
    colorFormat: ColorFormat.smartHashHex,
    tokenToVariableRef: (t) => {
      return `var(--${tokenVariableName(t, tokenGroups)})`;
    },
  });

  return `  --${name}: ${value};`;
}

// export function typographyTokenToCSS() {
//   // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
//   const name = tokenVariableName(token, tokenGroups);

//   const stuff = {
//     fontFamily: FontFamilyTokenValue;
//     fontWeight: FontWeightTokenValue;
//     fontSize: FontSizeTokenValue;
//     textDecoration: TextDecorationTokenValue;
//     textCase: TextCaseTokenValue;
//     letterSpacing: LetterSpacingTokenValue;
//     lineHeight: LineHeightTokenValue | null;
//     paragraphIndent: ParagraphSpacingTokenValue;
//     paragraphSpacing: ParagraphSpacingTokenValue;
//     referencedTokenId: string | null;
// }

//   // Then creating the value of the token, using another helper function
//   const value = CSSHelper.typographyTokenValueToCSS(token, mappedTokens, {
//     allowReferences: true,
//     decimals: 3,
//     colorFormat: ColorFormat.smartHashHex,
//     tokenToVariableRef: (t) => {
//       return `var(--${tokenVariableName(t, tokenGroups)})`;
//     },
//   });

//   return `  --${name}: ${value};`;
// }

function tokenVariableName(
  token: Token,
  tokenGroups: Array<TokenGroup>
): string {
  const parent = tokenGroups.find((group) => group.id === token.parentGroupId)!;
  return NamingHelper.codeSafeVariableNameForToken(
    token,
    StringCase.paramCase,
    parent,
    null
  );
}
