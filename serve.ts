import { walk, ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { dirname, join, relative, resolve } from "https://deno.land/std@0.224.0/path/mod.ts";
import { Hono  } from 'jsr:@hono/hono'
import { serveStatic } from 'jsr:@hono/hono/deno'
import * as ejs from 'https://esm.sh/ejs@3.1.10'
import { denoLoaderPlugin } from "https://deno.land/x/esbuild_deno_loader@0.9.0/src/plugin_deno_loader.ts";

const SRC_DIR = './stories/'
const DST_DIR = './dist/'
const TARGET = /^(?!.*\/_)[^_]*\.ejs$/

const ejsOptions = {
  includer(path: string, filename: string) {
    let template: string
    if (filename) {
      template = Deno.readTextFileSync(filename)
    }
    else {
      template = `!!!${path} is not found!!!`
    }

    return { path, template}
  }
}

function toDst(src: string) {
  const relativeSrcPath = relative(SRC_DIR, src)
  const relativeDstPath = relativeSrcPath.replace(/\.[^\.]+$/, '.html')
  return join(DST_DIR, relativeDstPath)
}
function render(path: string) {
  try {
    ejs.renderFile(path, {}, ejsOptions, async (err, str) => {
      if (!err) {
        const dst = toDst(path)
        console.log('[render]', dst)
        await ensureDir(dirname(dst))
        await Deno.writeTextFile(dst, str)
      }
      else {
        console.error(err)
      }
    })
  } catch(ex) {
    console.error(ex)
  }
}

function remove(path: string) {
  const dst = toDst(path)
  console.log('[remove]', dst)
  Deno.remove(dst)
}

for await (const { isFile, path } of walk(SRC_DIR)) {
  if (isFile && TARGET.test(path)) {
    render(resolve(path))
  }
}

if (Deno.args[0] === '--render-only') {
  Deno.exit(0)
}

const watcher = Deno.watchFs(SRC_DIR, { recursive: true });
(async () => {
  for await (const event of watcher) {
    const paths = event.paths.map(x => resolve(x)).filter(x => TARGET.test(x));
    
    if (paths.length == 0) {
      continue;
    }

    if (event.kind === 'create' || event.kind === 'modify') {
      paths.forEach(render);
    }
    else if (event.kind === 'remove') {
      paths.forEach(remove);
    }
  }
})()

const app = new Hono()

app.use('*', serveStatic({ root: DST_DIR }))

Deno.serve(app.fetch)