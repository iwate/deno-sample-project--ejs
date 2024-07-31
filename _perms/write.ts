import { It_needs } from "./_shared.ts";

It_needs(
  'dist',
  ['ESBUILD_BINARY_PATH'],
  ['LOCALAPPDATA', '/Cache/esbuild/bin'],
  // ['LOCALAPPDATA', '/deno-wasmbuild'],
)
