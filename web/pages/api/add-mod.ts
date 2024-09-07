import type { NextApiRequest, NextApiResponse } from "next";
import { getDownloadUrl, extractAndClean } from "./github-util";
import { setUpdateRequired } from './states';

const addModFromGitHub = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url || !url.includes("github.com") || !url.includes("/releases/tag/")) {
    return res.status(400).json({
      error:
        "Invalid GitHub release URL. Please provide a specific release URL.",
    });
  }

  try {
    // Fetch the download URL for the asset
    const assetUrl = await getDownloadUrl(url);

    if (!assetUrl) {
      return res
        .status(404)
        .json({ error: "No assets found for the given release URL." });
    }

    const modName = await extractAndClean(assetUrl);
    setUpdateRequired(true);
    res.status(200).json({ message: `${modName} added successfully` });
  } catch (error) {
    console.error("Error adding mod:", error);
    res.status(500).json({ error: "Failed to add mod" });
  }
};

export default addModFromGitHub;
