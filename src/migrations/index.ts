import * as migration_20260302_135846_add_prompt_collections from './20260302_135846_add_prompt_collections';
import * as migration_20260303_030458 from './20260303_030458';

export const migrations = [
  {
    up: migration_20260302_135846_add_prompt_collections.up,
    down: migration_20260302_135846_add_prompt_collections.down,
    name: '20260302_135846_add_prompt_collections',
  },
  {
    up: migration_20260303_030458.up,
    down: migration_20260303_030458.down,
    name: '20260303_030458'
  },
];
