import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fullArchive } from 'node-7z-archive';
import { getDownloadUrl } from './github-util';

const addModFromGitHub = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url || !url.includes('github.com') || !url.includes('/releases/tag/')) {
        return res.status(400).json({ error: 'Invalid GitHub release URL. Please provide a specific release URL.' });
    }

    try {
        // Fetch the download URL for the asset
        const assetUrl = await getDownloadUrl(url);

        if (!assetUrl) {
            return res.status(404).json({ error: 'No assets found for the given release URL.' });
        }

        // Download the asset (archive file)
        const assetResponse = await axios.get(assetUrl, { responseType: 'arraybuffer' });

        // Extract mod name from the GitHub URL and prepare paths
        const modName = url.split('/').slice(-3)[0];
        const modPath = path.join('app', 'user', 'mods', modName);
        const archiveFilePath = path.join(modPath, path.basename(assetUrl));

        // Create the mod directory if it doesn't exist
        fs.mkdirSync(modPath, { recursive: true });

        // Save the downloaded archive to the mod directory
        fs.writeFileSync(archiveFilePath, assetResponse.data);

        // Extract the archive using 7zip-min
        fullArchive(archiveFilePath, modPath)
        // When all is done
        .then(function () {
            console.log('Extracting done!');
        })
        // On error
        .catch(function (err) {
            console.error(err);
        });

        // Update package.json with the provided release URL, or create one if it doesn't exist
        const packageJsonPath = path.join(modPath, 'package.json');
        let packageJson: { [key: string]: any } = {};

        if (fs.existsSync(packageJsonPath)) {
            packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        }

        packageJson.githubUrl = url;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        // Clean up the archive file
        fs.unlinkSync(archiveFilePath);

        res.status(200).json({ message: modName,' added successfully' });
    } catch (error) {
        console.error('Error adding mod:', error);
        res.status(500).json({ error: 'Failed to add mod' });
    }
};

export default addModFromGitHub;