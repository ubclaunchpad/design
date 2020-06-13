import * as path from 'https://deno.land/std/path/mod.ts';

const baseDir = 'assets';

interface IndexEntry {
    /**
     * Path relative to baseDir
     */
    relativePath: string;
    /**
     * Name of this entry
     */
    name: string;
}

async function walkDirectory(dir: string) {
    console.log(`Generating index for ${dir}`);

    const indexFiles: IndexEntry[] = []
    for await (const dirEntry of Deno.readDir(dir)) {
        // add this file to index
        const fullname = path.join(dir, dirEntry.name);
        indexFiles.push({
            name: dirEntry.name,
            relativePath: fullname.replace(baseDir, ''),
        })

        // generate index for subdirectory
        if (dirEntry.isDirectory) {
            await walkDirectory(fullname);
        }
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(
`<html>
    <body>
        <h1>UBC Launch Pad Design Assets<h1>
        <h2>
            <a href="https://github.com/ubclaunchpad/design/tree/master/${dir}">/${dir}<a>
        </h2>
        <p>
            <ul>
                ${indexFiles
                    .map((f) => `<li><a href="${f.relativePath}">${f.name}</a></li>`)
                    .join('\n\t\t\t\t')}
            </ul>
        </p>
    <body>
</html>`);
    Deno.writeFile(path.join(dir, 'index.html'), data);
}

// generate indexes for all subfolders in /assets
walkDirectory(baseDir);
