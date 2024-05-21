export function generateContentForFile({
  cssVariables,
  geneateDisclaimer = false,
}: {
  cssVariables: string;
  geneateDisclaimer?: boolean;
}) {
  let content = `:root {\n${cssVariables}\n}`;
  if (geneateDisclaimer) {
    // Add disclaimer to every file if enabled
    content = `/* This file was generated by Supernova, don't change by hand */\n${content}`;
  }

  return content;
}