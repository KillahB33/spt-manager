import axios from "axios";
import path from "path";
import fs from "fs";
import { fullArchive } from "node-7z-archive";

export const getLatestReleaseVersion = async (
  githubUrl: string
): Promise<string> => {
  const regex =
    /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/releases\/(?:tag\/[^\/]+|download\/[^\/]+\/[^\/]+)/;

  const match = githubUrl.match(regex);

  if (!match) {
    throw new Error("Invalid GitHub URL");
  }

  const [_, owner, repo] = match;

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`
    );
    const latest = response.data.tag_name.startsWith("v")
      ? response.data.tag_name.slice(1)
      : response.data.tag_name;
    return latest;
  } catch (error) {
    console.error("Error fetching latest release:", error);
    return ""; // Handle errors appropriately
  }
};

export async function getDownloadUrl(
  githubUrl: string
): Promise<string | null> {
  const regex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/releases\/([^\/]+)/;
  const match = githubUrl.match(regex);

  if (!match) {
    throw new Error("Invalid GitHub URL");
  }

  const [_, owner, repo] = match;

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;
  const response = await axios.get(apiUrl);
  const releases = response.data;

  for (const release of releases) {
    if (release.html_url === githubUrl) {
      return release.assets[0]?.browser_download_url || null;
    }
  }

  return null;
}

function waitForFile(filePath: string, maxAttempts: number = 10, interval: number = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const checkFile = async () => {
      try {
        await fs.access(filePath, fs.constants.F_OK);
        resolve();
      } catch (err) {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkFile, interval);
        } else {
          reject(new Error(`File ${filePath} not found after ${maxAttempts} attempts`));
        }
      }
    };
    checkFile();
  });
}

export async function extractAndClean(
  assetUrl: string,
  baseModPath: string = "/app/user/mods",
  archiveDir: string = "/app"
): Promise<string | null> {
  try {
    // Fetch the asset
    const assetResponse = await axios.get(assetUrl, {
      responseType: "arraybuffer",
    });

    const filename = path.basename(assetUrl);
    const modName = path.parse(filename).name;
    const modPath = path.join(baseModPath, modName);
    const archiveFilePath = path.join(archiveDir, filename);

    // Save the downloaded archive
    await fs.promises.writeFile(archiveFilePath, assetResponse.data);

    // Extract the archive
    fullArchive(archiveFilePath, archiveDir).then(async function () {
      // Clean up
      fs.unlinkSync(archiveFilePath);
      // Update package.json with the GitHub URL
      const packageJsonPath = path.join(modPath, "package.json");
      let packageJson: { [key: string]: any } = {};

      // Wait for the package.json file to exist
      await waitForFile(packageJsonPath);

      if (fs.existsSync(packageJsonPath)) {
        const fileContent = await fs.readFile(packageJsonPath, "utf-8");
        packageJson = JSON.parse(fileContent);
        console.log("Existing package.json read");
      } else {
        console.log("package.json not found");
        throw new Error("package.json not found");
      }
  
      // Update or add the githubUrl property
      packageJson.githubUrl = assetUrl;
  
      // Write the updated or new package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log("package.json updated/created successfully");
    });

    return modName;
  } catch (error) {
    // Handle errors or rethrow
    console.error("Error extracting mod:", error);
    throw new Error("Failed to extract mod");
  }
}
