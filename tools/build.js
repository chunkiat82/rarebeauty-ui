/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { copyFile, makeDir, copyDir, cleanDir } from './lib/fs.js';
import pkg from '../package.json' with { type: 'json' };

/**
 * Compiles the project from source files into a distributable
 * format and copies it to the output (build) folder.
 */
async function build() {
  // Clean the build directory
  await cleanDir('build/*', {
    nosort: true,
    dot: true,
    ignore: ['build/.git'],
  });

  // Create build directory
  await makeDir('build');

  // Copy package files
  await Promise.all([
    copyFile('package.json', 'build/package.json'),
    copyFile('package-lock.json', 'build/package-lock.json'),
    copyFile('LICENSE.txt', 'build/LICENSE.txt'),
  ]);

  // Copy source files
  await copyDir('src', 'build/src');

  // Create a production package.json
  const prodPackage = {
    name: pkg.name,
    version: pkg.version,
    private: true,
    engines: pkg.engines,
    dependencies: pkg.dependencies,
    type: 'module',
    scripts: {
      start: 'node src/server.js'
    }
  };

  await copyFile(
    'package.json',
    'build/package.json',
    JSON.stringify(prodPackage, null, 2)
  );

  console.info('Build completed successfully!');
}

export default build;
