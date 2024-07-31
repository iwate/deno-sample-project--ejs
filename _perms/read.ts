import { It_needs } from "./_shared.ts";

It_needs(
  '.',
  ['DENO_DIR'],
  ['ESBUILD_BINARY_PATH'],
  ['LOCALAPPDATA', '/deno'],
  ['LOCALAPPDATA', '/Cache/esbuild/bin/'],
  // ['LOCALAPPDATA', '/deno-wasmbuild'],
)
