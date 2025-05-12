/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { promisify } from 'util';

// Convert callback-based functions to promise-based
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const renameAsync = promisify(fs.rename);
const globAsync = promisify(glob);
const mkdirpAsync = promisify(mkdirp);
const rimrafAsync = promisify(rimraf);

export const readFile = file => readFileAsync(file, 'utf8');

export const writeFile = (file, contents) => writeFileAsync(file, contents, 'utf8');

export const renameFile = (source, target) => renameAsync(source, target);

export const copyFile = (source, target) =>
  new Promise((resolve, reject) => {
    let cbCalled = false;
    function done(err) {
      if (!cbCalled) {
        cbCalled = true;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    }

    const rd = fs.createReadStream(source);
    rd.on('error', err => done(err));
    const wr = fs.createWriteStream(target);
    wr.on('error', err => done(err));
    wr.on('close', err => done(err));
    rd.pipe(wr);
  });

export const readDir = (pattern, options) => globAsync(pattern, options);

export const makeDir = name => mkdirpAsync(name);

export const moveDir = async (source, target) => {
  const dirs = await readDir('**/*.*', {
    cwd: source,
    nosort: true,
    dot: true,
  });
  await Promise.all(
    dirs.map(async dir => {
      const from = path.resolve(source, dir);
      const to = path.resolve(target, dir);
      await makeDir(path.dirname(to));
      await renameFile(from, to);
    }),
  );
};

export const copyDir = async (source, target) => {
  const dirs = await readDir('**/*.*', {
    cwd: source,
    nosort: true,
    dot: true,
  });
  await Promise.all(
    dirs.map(async dir => {
      const from = path.resolve(source, dir);
      const to = path.resolve(target, dir);
      await makeDir(path.dirname(to));
      await copyFile(from, to);
    }),
  );
};

export const cleanDir = (pattern, options) => rimrafAsync(pattern, { glob: options });

export default {
  readFile,
  writeFile,
  renameFile,
  copyFile,
  readDir,
  makeDir,
  copyDir,
  moveDir,
  cleanDir,
};
