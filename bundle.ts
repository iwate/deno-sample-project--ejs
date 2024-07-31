import * as path from "https://deno.land/std@0.224.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import * as esbuild from 'https://deno.land/x/esbuild@v0.20.0/mod.js';
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts";
import * as sass from "npm:sass@1.77.8";
import { readLines } from "https://deno.land/std@0.140.0/io/buffer.ts";

const sassPlugin = (): esbuild.Plugin => {
  return {
    name: "sass",
    setup: (build) => {
      build.onLoad({ filter: /\.s[ac]ss/ }, async (args) => {
        const resolvedPath = path.resolve(args.path);
        const result = await sass.compileAsync(resolvedPath, {
        
        });
        const watchFiles = result.loadedUrls
          .filter((url: URL) => url.href.startsWith("file:"))
          .map((url: URL) => path.fromFileUrl(url));

        return {
          contents: result.css,
          loader: 'css',
          watchFiles,
        };
      });
    },
  };
};


await ensureDir("./dist");

const production = Deno.args[0] === '--production'

const ctx = await esbuild.context({
  plugins: [sassPlugin(), ...denoPlugins({ loader: 'portable' })],
  entryPoints: [
    'src/js/main.ts',
    'src/css/main.scss',
  ],
  write: true,
  outdir: 'dist',
  bundle: true,
  minify: true,
  format: "esm",
  sourcemap: production ? 'linked' : 'inline',
});

if(!production) {
  await ctx.watch();
  console.log('Watching...');

  for await(const _ of readLines(Deno.stdin)) {
    await ctx.rebuild().catch(console.error);
  }
} else {
  await ctx.rebuild();
  await ctx.cancel();
  await ctx.dispose();
}
