import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const target = join(root, ".react-public");
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
for (const directory of ["assets", "data", "admin"]) await cp(join(root, directory), join(target, directory), { recursive: true });
for (const file of ["robots.txt", "sitemap.xml"]) await cp(join(root, file), join(target, file));
