// Registry of all animation scenes by id.

import grundschwung from './grundschwung.js';
import schwungausloesung from './schwungausloesung.js';
import * as basics from './basics.js';
import * as parallel from './parallel.js';
import * as advanced from './advanced.js';

export const scenes = { grundschwung, schwungausloesung, ...basics, ...parallel, ...advanced };
