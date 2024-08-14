import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import SevenZip from '7zip-min'; // Import 7zip-min

const addModFromGitHub = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url || !url.includes('github.com') || !url.includes('/releases/tag/')) {
        return res.status(400).json({ error: 'Invalid GitHub release URL. Please provide a specific release URL.' });
    }

    try {
        // Fetch the specific release page content
        const assetPage = await axios.get(url);
        const assetRegex = /href="([^"]+\.(zip|7z))"/;
        const assetMatch = assetPage.data.match(assetRegex);

        if (!assetMatch) {
            return res.status(400).json({ error: 'No zip or 7z file found in the specified release.' });
        }

        const assetUrl = `https://github.com${assetMatch[1]}`;
        const assetResponse = await axios.get(assetUrl, { responseType: 'arraybuffer' });

        // Extract mod name from URL and save the file
        const modName = url.split('/').slice(-3)[0];
        const modPath = path.join(process.cwd(), 'app', 'user', 'mods', modName);
        const archiveFilePath = path.join(modPath, path.basename(assetUrl));

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

        // Update package.json with the provided release URL
        const packageJsonPath = path.join(modPath, 'package.json');
        let packageJson;

        if (fs.existsSync(packageJsonPath)) {
            packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        }

        packageJson.githubUrl = url;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        res.status(200).json({ message: 'Mod added successfully' });
    } catch (error) {
        console.error('Error adding mod:', error);
        res.status(500).json({ error: 'Failed to add mod' });
    }
};

export default addModFromGitHub;