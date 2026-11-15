import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);
Config.setPixelFormat("yuv420p");
Config.setConcurrency(8);
Config.setCrf(23);
Config.setAudioCodec("aac");
Config.setAudioBitrate("128k");
Config.setCodec("h264");
Config.setOverwriteOutput(true);