import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/index.js");
// Read project photos straight from the site's public folder.
Config.setPublicDir("../public");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
