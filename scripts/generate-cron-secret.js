#!/usr/bin/env node
/** Genera un CRON_SECRET seguro para usar en Vercel y GitHub Actions */
const crypto = require("crypto");
const secret = crypto.randomBytes(32).toString("hex");
console.log("\nTu CRON_SECRET (cópialo y guárdalo):\n");
console.log(secret);
console.log("\nAñádelo en:");
console.log("  1. Vercel → Settings → Environment Variables → CRON_SECRET");
console.log("  2. GitHub → Repo → Settings → Secrets → CRON_SECRET");
console.log("  3. (Opcional) BATCH_CRON_SECRET con el mismo valor\n");
