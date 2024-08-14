import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import SevenZip from '7zip-min'; // Import 7zip-min

const updateModFromGitHub = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { githubUrl, folderName } = req.body;

    if (!githubUrl || !githubUrl.includes('github.com')) {
        return res.status(400).json({ error: 'Invalid GitHub URL.' });
    }

    try {
        // Fetch the specific release page content
        const assetPage = await axios.get(githubUrl);
        const assetRegex = /href="([^"]+\.(zip|7z))"/;
        const assetMatch = assetPage.data.match(assetRegex);

        if (!assetMatch) {
            return res.status(400).json({ error: 'No zip or 7z file found in the specified release.' });
        }

        const assetUrl = `https://github.com${assetMatch[1]}`;
        const assetResponse = await axios.get(assetUrl, { responseType: 'arraybuffer' });

        // Extract mod path and save the file
        const modPath = path.join(process.cwd(), 'app', 'user', 'mods', folderName);
        const archiveFilePath = path.join(modPath, path.basename(assetUrl));

        // Clean existing files
        fs.rmdirSync(modPath, { recursive: true });
        fs.mkdirSync(modPath, { recursive: true });

        fs.writeFileSync(archiveFilePath, assetResponse.data);

        // Extract the file using 7zip-min
        await new Promise((resolve, reject) => {
            SevenZip.unpack(archiveFilePath, modPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });

        res.status(200).json({ message: 'Mod updated successfully' });
    } catch (error) {
        console.error('Error updating mod:', error);
        res.status(500).json({ error: 'Failed to update mod' });
    }
};

export default updateModFromGitHub;