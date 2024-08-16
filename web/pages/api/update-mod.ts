import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getDownloadUrl, extractAndClean } from "./github-util";

const updateModFromGitHub = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { githubUrl, folderName } = req.body;

  if (!githubUrl || !githubUrl.includes("github.com")) {
    return res.status(400).json({ error: "Invalid GitHub URL." });
  }

  try {
    // Fetch the specific release page content
    const assetUrl = await getDownloadUrl(githubUrl);
    if (!assetUrl) {
      throw new Error("Failed to retrieve the asset URL");
    }

    // Extract mod path and save the file
    const modPath = path.join("/app", "user", "mods", folderName);

    // Clean existing files
    fs.rmdirSync(modPath, { recursive: true });

    const modName = await extractAndClean(assetUrl);

    res.status(200).json({ message: `${modName} updated successfully` });
  } catch (error) {
    console.error("Error updating mod:", error);
    res.status(500).json({ error: "Failed to update mod" });
  }
};

export default updateModFromGitHub;
