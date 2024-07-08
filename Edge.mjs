#!/usr/bin/env node
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { diffLines } from "diff";
import chalk from "chalk"; // Ensure you have installed chalk for color output
import { Command } from "commander";
const program = new Command();
class Edge {
  constructor(repoPath = ".") {
    this.repoPath = path.join(repoPath, ".edge");
    this.objectsPath = path.join(this.repoPath, "objects");
    this.headPath = path.join(this.repoPath, "HEAD");
    this.indexPath = path.join(this.repoPath, "index");
    this.init();
  }

  async init() {
    await fs.mkdir(this.objectsPath, { recursive: true });
    try {
      await fs.writeFile(this.headPath, "", { flag: "wx" }); // wx: open for writing, fails if file exists
      await fs.writeFile(this.indexPath, JSON.stringify([]), { flag: "wx" });
      console.log("Initialized Repository");
    } catch (error) {
      console.log("Repository already initialized");
    }
  }

  hashObject(content) {
    return crypto.createHash("sha1").update(content, "utf-8").digest("hex");
  }

  async add(fileToBeAdded) {
    const fileData = await fs.readFile(fileToBeAdded, { encoding: "utf-8" });
    const fileHash = this.hashObject(fileData);
    console.log(fileHash);
    const newFileHashObjectPath = path.join(this.objectsPath, fileHash);
    await fs.writeFile(newFileHashObjectPath, fileData);
    await this.updateStagingArea(fileToBeAdded, fileHash);
    console.log(`Added ${fileToBeAdded}`);
  }

  async updateStagingArea(filePath, fileHash) {
    const index = JSON.parse(
      await fs.readFile(this.indexPath, { encoding: "utf-8" })
    );
    index.push({ path: filePath, hash: fileHash });
    await fs.writeFile(this.indexPath, JSON.stringify(index));
  }

  async commit(message) {
    const index = JSON.parse(
      await fs.readFile(this.indexPath, { encoding: "utf-8" })
    );
    const parentCommit = await this.getCurrentHead();
    const commitData = {
      timeStamp: new Date().toISOString(),
      message,
      files: index,
      parent: parentCommit,
    };
    const commitHash = this.hashObject(JSON.stringify(commitData));
    const commitPath = path.join(this.objectsPath, commitHash);
    await fs.writeFile(commitPath, JSON.stringify(commitData));
    await fs.writeFile(this.headPath, commitHash); // update head to point to the latest commit
    await fs.writeFile(this.indexPath, JSON.stringify([])); // clear the staging area
    console.log(`Commit successfully created : ${commitHash}`);
  }

  async getCurrentHead() {
    try {
      return await fs.readFile(this.headPath, { encoding: "utf-8" });
    } catch (error) {
      return null;
    }
  }

  async getLog() {
    let currentCommitHash = await this.getCurrentHead();
    while (currentCommitHash) {
      const commitData = JSON.parse(
        await fs.readFile(path.join(this.objectsPath, currentCommitHash), {
          encoding: "utf-8",
        })
      );
      console.log("----------------------------\n");
      console.log(
        `Commit : ${currentCommitHash}\nDate : ${commitData.timeStamp}\nMessage : ${commitData.message}\n\n`
      );
      currentCommitHash = commitData.parent;
    }
  }

  async showCommitDiff(commitHash) {
    const commitData = JSON.parse(await this.getCommitData(commitHash));
    if (!commitData) {
      console.log("Commit not found");
      return;
    }
    console.log("Changes in the commit : \n");
    for (const file of commitData.files) {
      console.log(`File : ${file.path}`);
      const fileContent = await this.getFileContent(file.hash); // Corrected this line
      console.log(fileContent);
      if (commitData.parent) {
        const parentCommitData = JSON.parse(
          await this.getCommitData(commitData.parent)
        );
        const getParentFileContent = await this.getParentFileContent(
          parentCommitData,
          file.path
        );
        if (getParentFileContent !== undefined) {
          console.log(`\nDiff : `);
          const diff = diffLines(getParentFileContent, fileContent);
          console.log(diff);
          diff.forEach((part) => {
            if (part.added) {
              process.stdout.write(chalk.green("++" + part.value));
            } else if (part.removed) {
              process.stdout.write(chalk.red("--" + part.value));
            } else {
              process.stdout.write(chalk.grey(part.value));
            }
          });
          console.log("\n");
        } else {
          console.log("New file in this commit");
        }
      } else {
        console.log("First Commit");
      }
    }
  }

  async getParentFileContent(parentCommitData, filePath) {
    const parentFile = parentCommitData.files.find(
      (file) => file.path === filePath
    );
    if (parentFile) {
      return await this.getFileContent(parentFile.hash); // Corrected this line
    }
  }

  async getFileContent(fileHash) {
    const objectPath = path.join(this.objectsPath, fileHash);
    return fs.readFile(objectPath, { encoding: "utf-8" });
  }

  async getCommitData(commitHash) {
    const commitPath = path.join(this.objectsPath, commitHash);
    try {
      return await fs.readFile(commitPath, { encoding: "utf-8" });
    } catch (error) {
      console.log("Failed to read commit data", error);
      return null;
    }
  }
}
H;
//(async () => {
// const edge = new Edge();
//await edge.add("sample.txt");
//await edge.commit("fourth Commit");
//await edge.getLog();
// await edge.showCommitDiff("8fab2698f75f9b30b9ed303a2abbbeb7cb480b62");
//})();

program.command("init").action(async () => {
  const edge = new Edge();
});
program.command("add <file>").action(async (file) => {
  const edge = new Edge();
  await edge.add(file);
});
program.command("commit <message>").action(async (message) => {
  const edge = new Edge();
  await edge.commit(message);
});
program.command("log ").action(async () => {
  const edge = new Edge();
  await edge.log();
});
program.command("show <commitHash> ").action(async (commitHash) => {
  const edge = new Edge();
  await edge.showCommitDiff(commitHash);
});

program.parse(process.argv);
