// @ts-nocheck

import "./util/index.js";
import * as db from "./schema/database.js";
import * as view from "./schema/view.js";
import * as _z from "zod";

global.z = _z
global.db = db
global.view = view

await import("./util/table.js")
global.handle = await import("./util/helper.js")

import { readdir } from "fs/promises";

const dirs = await readdir('lib-dyn/handler')

for (let i = 0;i < dirs.length;i++) {
  await import("./handler/" + dirs[i])
}