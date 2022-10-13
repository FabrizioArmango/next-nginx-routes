#!/usr/bin/env node
"use strict";
const yargs = require("yargs");
const { cwd, exit } = require("process");
const path = require("node:path")
const { readFileSync, writeFileSync } = require("fs");

const argv = yargs
  .option("routes-manifest-file", {
    alias: "f",
    description: "Routes manifest",
    type: "string",
    default: "./.next/routes-manifest.json",
  })
  .option("output-file", {
    alias: "o",
    description: "Output file path",
    type: "string",
    default: "./next-routes.conf"
  })
  .help()
  .alias("help", "h").argv;

const routesManifest = argv["routes-manifest-file"];
const outputFile = argv["output-file"];
const manifest = JSON.parse(readFileSync(routesManifest, "utf8"));

const routes = manifest.staticRoutes
  .concat(manifest.dynamicRoutes)
  .map((route) => {
    if (route.page === "/") {
      route.page = "/index";
    }
    return `
location ~ ${route.regex} {
    try_files ${route.page}.html /index.html;
}`;
  });

writeFileSync(outputFile, routes.join("\n"));

console.log(`Nginx routes configuration written to ${path.join(cwd(), outputFile)}`);
