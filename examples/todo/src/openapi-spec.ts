// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import fs from 'fs';
import {dump} from 'js-yaml';
import {TodoListApplication} from './application';

/**
 * Save the OpenAPI spec to the given file
 * @param outFile - File name for the spec
 * @param options - Application config
 */
export async function dumpOpenApiSpec(
  outFile: string,
  options?: ApplicationConfig,
) {
  options = options ?? {};
  options.rest = {...options.rest, listenOnStart: false};
  const app = new TodoListApplication(options);
  await app.boot();

  const spec = await app.restServer.getApiSpec();
  if (outFile === '-' || outFile === '') {
    const json = JSON.stringify(spec, null, 2);
    console.log('%s', json);
    return spec;
  }
  const fileName = outFile.toLowerCase();
  if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
    const yaml = dump(spec);
    fs.writeFileSync(outFile, yaml, 'utf-8');
  } else {
    const json = JSON.stringify(spec, null, 2);
    fs.writeFileSync(outFile, json, 'utf-8');
  }
  console.log('The OpenAPI spec is saved to %s.', outFile);
  return spec;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST ?? 'localhost',
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  dumpOpenApiSpec(process.argv[2] ?? '', config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}