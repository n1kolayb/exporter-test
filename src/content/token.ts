import {
  NamingHelper,
  CSSHelper,
  ColorFormat,
  StringCase,
} from "@supernovaio/export-helpers";
import {
  ColorToken,
  FontWeightToken,
  LetterSpacingTokenValue,
  SizeToken,
  Token,
  TokenGroup,
  TypographyToken,
  Unit,
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

export function fontWeightTokenToCSS(
  token: FontWeightToken,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>
): string {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = tokenVariableName(token, tokenGroups);

  return `  --${name}: ${token.value.text};`;
}

export function typographyTokenToCSS(
  token: TypographyToken,
  mappedTokens: Map<string, Token>,
  tokenGroups: Array<TokenGroup>
) {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = tokenVariableName(token, tokenGroups);

  // Then creating the value of the token, using another helper function
  const value = CSSHelper.typographyTokenValueToCSS(token.value, mappedTokens, {
    allowReferences: true,
    decimals: 3,
    colorFormat: ColorFormat.smartHashHex,
    tokenToVariableRef: (t) => {
      return `var(--${tokenVariableName(t, tokenGroups)})`;
    },
  });

  return `  --${name}: ${value};`;
}

// THIS IS A HACK AIMED TO FIX LETTER SPACING VALUES BEING SET IN PERCENTS
// PROBABLY WONT BE AN ISSUE IN THE FUTURE
export const __HACK__letterSpacingValueToEM = (
  tokenValue: LetterSpacingTokenValue
) => {
  if (tokenValue.measure === 0) {
    return "0";
  }

  if (tokenValue.unit !== Unit.percent) {
    return `${tokenValue.measure.toFixed(3)}${CSSHelper.unitToCSS(
      tokenValue.unit
    )}`;
  }

  return `${(tokenValue.measure / 100).toFixed(4)}em`;
};

export function typographyTokenToCSSClass(
  token: TypographyToken,
  tokenGroups: Array<TokenGroup>
) {
  // First creating the name of the token, using helper function which turns any token name / path into a valid variable name
  const name = tokenVariableName(token, tokenGroups);

  return `.${name} {
  font-family: "${token.value.fontFamily.text}";
  font-weight: ${token.value.fontWeight.text};
  font-size: ${token.value.fontSize.measure}${CSSHelper.unitToCSS(
    token.value.fontSize.unit
  )};
  text-decoration: ${token.value.textDecoration.value};
  letter-spacing: ${__HACK__letterSpacingValueToEM(token.value.letterSpacing)};
  ${
    token.value.lineHeight
      ? `line-height: ${token.value.lineHeight.measure}${CSSHelper.unitToCSS(
          token.value.lineHeight.unit
        )};`
      : ""
  }
  text-indent: ${token.value.paragraphIndent.measure}${CSSHelper.unitToCSS(
    token.value.paragraphIndent.unit
  )};
}\n`;
}

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
