#!/usr/bin/env bun
"use strict";

const url = process.argv[2];

if (!url) {
	console.error("Usage: bun run scripts/open-url.js <url>");
	process.exit(1);
}

const platform = process.platform;
let command;
let args = [];

if (platform === "darwin") {
	command = "open";
	args = [url];
} else if (platform === "win32") {
	command = "cmd";
	args = ["/c", "start", "", url];
} else {
	command = "xdg-open";
	args = [url];
}

const child = Bun.spawn({
	cmd: [command, ...args],
	stdout: "ignore",
	stderr: "ignore",
	stdin: "ignore",
});

child.unref();
