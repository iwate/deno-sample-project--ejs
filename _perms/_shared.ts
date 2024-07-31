type Path = string | [env: string, suffix?: string]
function distinct(items: string[]) {
  return Array.from(new Set(items));
}
export function It_needs(...items: Path[]) {
    console.log(
      distinct(
        items
          .map(path => {
            if (typeof path === 'string')
              return path
            
            const [env, suffix] = path
            const prefix = Deno.env.get(env)
            if (prefix)
              return prefix + suffix

            return null
          })
          .filter(x => x) as string[]
        )
        .join(',')
    )
}