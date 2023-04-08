/**
 * MIT License
 *
 * Copyright (c) 2022, Brion Mario.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import fs from 'fs-extra';
import {dirname, join, resolve} from 'path';
import {MedMarkGlobal} from './models';

/**
 * Defines the structure of the paths for the logs.
 */
interface LogPaths {
  /**
   * The path and file name for the apollo state log.
   * @param articleId The id of the article.
   */
  files: {
    apolloState: (articleId: string) => string;
    /**
     * The path and file name for the metadata log.
     * @param articleId The id of the article.
     */
    metaData: (articleId: string) => string;
  };
  /**
   * The root path for the logs.
   */
  root: string;
}

/**
 * Defines the structure of the debug object that handles logging.
 */
interface Debug {
  /**
   * Returns whether debugging is enabled or not.
   * @returns A boolean indicating if debugging is enabled.
   */
  enabled: () => boolean;
  /**
   * Initializes debugging by creating the root logs folder and setting up the MedMark global object.
   */
  initialize: () => void;
  /**
   * Saves a log file with the provided content.
   * @param articleId The id of the article.
   * @param fileName The type of log file.
   * @param content The content to write to the log file.
   */
  saveLog: (articleId: string, fileName: keyof LogPaths['files'], content: unknown) => void;
}

const runnerTimestamp: string = new Date().toISOString();

const PATHS: {
  logs: LogPaths;
} = {
  logs: {
    files: {
      apolloState(articleId: string) {
        return resolve(join(PATHS.logs.root, articleId, 'apollo-state.json'));
      },
      metaData(articleId: string) {
        return resolve(join(PATHS.logs.root, articleId, 'meta.json'));
      },
    },
    root: resolve(join('logs', runnerTimestamp)),
  },
};

/**
 * Returns whether debugging is enabled or not.
 * @returns A boolean indicating if debugging is enabled.
 */
function enabled(): boolean {
  return global.__MEDMARK__.debug;
}

/**
 * Initializes debugging by creating the root logs folder and setting up the MedMark global object.
 */
function initialize(): void {
  fs.mkdirpSync(PATHS.logs.root);

  if (!global.__MEDMARK__) {
    global.__MEDMARK__ = {};
  }

  const medMarkGlobal: MedMarkGlobal = {
    debug: true,
    runnerTimestamp,
  };
  global.__MEDMARK__ = medMarkGlobal;
}

/**
 * Saves a log file with the provided content.
 * @param articleId The id of the article.
 * @param fileName The type of log file.
 * @param content The content to write to the log file.
 */
function saveLog(articleId: string, fileName: keyof LogPaths['files'], content: unknown): void {
  if (!global?.__MEDMARK__?.debug) {
    return;
  }

  const filePath: string = PATHS.logs.files[fileName](articleId);

  fs.ensureDirSync(resolve(dirname(filePath)));
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
}
/* `global.__` is not doing anything in this code. It seems to be a typo or an incomplete statement. */

const debug: Debug = {
  enabled,
  initialize,
  saveLog,
};

export default debug;
