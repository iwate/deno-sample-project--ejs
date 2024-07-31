import { It_needs } from "./_shared.ts";

It_needs(
  'deno.land:443',
  'registry.npmjs.org:443',
  ['DENO_REGISTRY_URL'],
  'code.jquery.com:443',
  '0.0.0.0:8000'
)
