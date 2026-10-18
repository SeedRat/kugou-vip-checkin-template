import { execFileSync } from "child_process";

function hasSecretWriteToken() {
  return Boolean(process.env.PAT || process.env.GH_TOKEN);
}

function setRepoSecret(name, value) {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GH_TOKEN || process.env.PAT;

  if (!repository) {
    throw new Error("GITHUB_REPOSITORY 未配置");
  }
  if (!token) {
    throw new Error("PAT/GH_TOKEN 未配置");
  }

  execFileSync("gh", ["secret", "set", name, "--repo", repository], {
    input: value,
    encoding: "utf8",
    env: {
      ...process.env,
      GH_TOKEN: token,
    },
    stdio: ["pipe", "pipe", "pipe"],
  });
}

export { hasSecretWriteToken, setRepoSecret };
