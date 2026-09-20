import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();

const routeFiles = [
  "app/api/projects/route.ts",
  "app/api/projects/[projectId]/route.ts",
  "app/api/tasks/route.ts",
  "app/api/tasks/[taskId]/route.ts",
  "app/api/team/route.ts",
  "app/api/team/[memberId]/route.ts",
];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing expected file: ${relativePath}`);
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, "utf8");
}

function removeWorkspaceConstantImport(content) {
  content = content.replace(
    /import\s*\{\s*getWorkspaceProjects,\s*PRODUCT_TEAM_WORKSPACE_ID,\s*\}\s*from\s*"@\/lib\/workspace-repository";/,
    'import { getWorkspaceProjects } from "@/lib/workspace-repository";'
  );

  content = content.replace(
    /import\s*\{\s*getWorkspaceTasks,\s*PRODUCT_TEAM_WORKSPACE_ID,\s*\}\s*from\s*"@\/lib\/workspace-repository";/,
    'import { getWorkspaceTasks } from "@/lib/workspace-repository";'
  );

  content = content.replace(
    /import\s*\{\s*getWorkspaceMembers,\s*PRODUCT_TEAM_WORKSPACE_ID,\s*\}\s*from\s*"@\/lib\/workspace-repository";/,
    'import { getWorkspaceMembers } from "@/lib/workspace-repository";'
  );

  content = content.replace(
    /^import\s*\{\s*PRODUCT_TEAM_WORKSPACE_ID\s*\}\s*from\s*"@\/lib\/workspace-repository";\r?\n/m,
    ""
  );

  return content;
}

for (const relativePath of routeFiles) {
  let content = read(relativePath);

  if (!content.includes("PRODUCT_TEAM_WORKSPACE_ID")) {
    throw new Error(
      `${relativePath} no longer contains PRODUCT_TEAM_WORKSPACE_ID. ` +
        "Stop here and inspect the file before applying this commit."
    );
  }

  if (!content.includes("getCurrentWorkspaceAccess")) {
    throw new Error(
      `${relativePath} does not use getCurrentWorkspaceAccess. ` +
        "Refusing to replace workspace IDs without an authorization context."
    );
  }

  content = removeWorkspaceConstantImport(content);
  content = content.replaceAll(
    "PRODUCT_TEAM_WORKSPACE_ID",
    "access.workspaceId"
  );

  if (content.includes("PRODUCT_TEAM_WORKSPACE_ID")) {
    throw new Error(
      `Failed to fully migrate ${relativePath} to access.workspaceId.`
    );
  }

  write(relativePath, content);
  console.log(`Scoped mutations: ${relativePath}`);
}

const repositoryPath = "lib/workspace-repository.ts";
let repository = read(repositoryPath);

repository = repository.replace(
  /\/\*\*[\s\S]*?Temporary compatibility export[\s\S]*?\*\/\r?\nexport const PRODUCT_TEAM_WORKSPACE_ID = "workspace-product-team";\r?\n\r?\n/,
  ""
);

repository = repository.replace(
  /^export const PRODUCT_TEAM_WORKSPACE_ID = "workspace-product-team";\r?\n\r?\n/m,
  ""
);

if (repository.includes("PRODUCT_TEAM_WORKSPACE_ID")) {
  throw new Error(
    "lib/workspace-repository.ts still contains PRODUCT_TEAM_WORKSPACE_ID."
  );
}

write(repositoryPath, repository);
console.log("Removed Product Team compatibility constant.");

const scanRoots = ["app", "lib"];

for (const scanRoot of scanRoots) {
  const absoluteRoot = path.join(root, scanRoot);

  const stack = [absoluteRoot];

  while (stack.length > 0) {
    const current = stack.pop();

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(absolutePath);
        continue;
      }

      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) {
        continue;
      }

      const content = fs.readFileSync(absolutePath, "utf8");

      if (content.includes("PRODUCT_TEAM_WORKSPACE_ID")) {
        throw new Error(
          `Hardcoded workspace constant still exists in ${path.relative(
            root,
            absolutePath
          )}`
        );
      }
    }
  }
}

console.log("");
console.log("Day 14 Commit 4 applied successfully.");
console.log("All project/task/team mutations now use access.workspaceId.");
console.log("No PRODUCT_TEAM_WORKSPACE_ID references remain in app/ or lib/.");

const selfPath = fileURLToPath(import.meta.url);
fs.unlinkSync(selfPath);
