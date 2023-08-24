#! /usr/bin/env node

import { parse } from 'ts-command-line-args'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { replaceAll } from './helpers.js'

interface IArgs {
  simulator: string;
  app: string;
  context: string;
  'simulator-window-name': string;
  'web-tools-window-name': string;
}
const args = Object.assign({
  simulator: 'Simulator',
  app: '.*',
  context: 'localhost',
  'simulator-window-name': '.*',
  'web-tools-window-name': '.*'
}, parse<IArgs>({
  simulator: {
    type: String,
    alias: 's'
  },
  app: {
    type: String,
    alias: 'a'
  },
  context: {
    type: String,
    alias: 'c',
    defaultOption: true
  },
  'simulator-window-name': {
    type: String,
    alias: 'w'
  },
  'web-tools-window-name': {
    type: String,
    alias: 't'
  }
}));

const osascript = replaceAll(fs.readFileSync('./src/open-dev-tools.osascript', 'utf8'), {
  'SIMULATOR': `"${ args.simulator }"`,
  'APP': `"${ args.app }"`,
  'CONTEXT': `"${ args.context }"`,
  'SIMULATOR_WINDOW_NAME': `"${ args['simulator-window-name'] }"`,
  'WEB_TOOLS_WINDOW_NAME': `"${ args['web-tools-window-name'] }"`
});

const process = exec(`osascript <<EndOfScript
${ osascript }
EndOfScript`);
