import {
  Supernova,
  PulsarContext,
  RemoteVersionIdentifier,
  AnyOutputFile,
} from "@supernovaio/sdk-exporters";
import { ExporterConfiguration } from "../config";

import { getColorTokenFiles } from "./content/colors";
import { getSpacingTokenFiles } from "./content/spacing";
import { getFontSizeTokenFiles } from "./content/fontSize";
import { getLetterSpacingTokenFiles } from "./content/letterSpacing";
import { getRadiusTokenFiles } from "./content/radius";
import { getBorderWidthTokenFiles } from "./content/borderWidth";
import { getTypographyTokenFiles } from "./content/typography";
/**
 * Export entrypoint.
 * When running `export` through extensions or pipelines, this function will be called.
 * Context contains information about the design system and version that is currently being exported.
 */
Pulsar.export(
  async (
    sdk: Supernova,
    context: PulsarContext
  ): Promise<Array<AnyOutputFile>> => {
    // Fetch data from design system that is currently being exported (context)
    const remoteVersionIdentifier: RemoteVersionIdentifier = {
      designSystemId: context.dsId,
      versionId: context.versionId,
    };

    // Fetch the necessary data
    let tokens = await sdk.tokens.getTokens(remoteVersionIdentifier);
    let tokenGroups = await sdk.tokens.getTokenGroups(remoteVersionIdentifier);

    const files = await getColorTokenFiles({
      sdk,
      tokens,
      tokenGroups,
      remoteVersionIdentifier,
    });

    await getTypographyTokenFiles({
      sdk,
      context,
      remoteVersionIdentifier,
      tokenGroups,
    });

    files.push(
      ...[
        getSpacingTokenFiles({ tokens, tokenGroups }),
        getFontSizeTokenFiles({ tokens, tokenGroups }),
        getLetterSpacingTokenFiles({ tokens, tokenGroups }),
        getRadiusTokenFiles({ tokens, tokenGroups }),
        getBorderWidthTokenFiles({ tokens, tokenGroups }),
      ]
    );

    // Create output file and return it
    return files;
  }
);

/** Exporter configuration. Adheres to the `ExporterConfiguration` interface and its content comes from the resolved default configuration + user overrides of various configuration keys */
export const exportConfiguration = Pulsar.exportConfig<ExporterConfiguration>();
