import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import {
  getDownloadUrl,
  extractAndClean,
  getLatestReleaseVersion,
} from "./github-util";

const updateModFromGitHub = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  console.log(req.body);
  const { githubUrl, folderName } = req.body;

  if (!githubUrl || !folderName) {
    console.log("Invalid update request");
    return res.status(400).json({ error: "Invalid Update Request." });
  }

  const regex =
    /https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/download\/([^/]+)\/.*/;

  // Use match to extract the parts from the URL
  const match = githubUrl.match(regex);

  const [_, owner, repo] = match;

  try {
    const latestVersion = await getLatestReleaseVersion(githubUrl);
    const latestReleaseUrl = `https://github.com/${owner}/${repo}/releases/tag/v${latestVersion}`;
    // Fetch the specific release page content
    const assetUrl = await getDownloadUrl(latestReleaseUrl);
    if (!assetUrl) {
      throw new Error("Failed to retrieve the asset URL");
    }
    // Extract mod path and save the file
    const modPath = path.join("/app", "user", "mods", folderName);

    // Clean existing files
    await fs.promises.rm(modPath, { recursive: true });
    const modName = await extractAndClean(assetUrl);

    res.status(200).json({ message: `${modName} updated successfully` });
  } catch (error) {
    console.error("Error updating mod:", error);
    res.status(500).json({ error: "Failed to update mod" });
  }
};

export default updateModFromGitHub;
