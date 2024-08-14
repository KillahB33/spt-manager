import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Mod } from '../../types';

const getLatestReleaseVersion = async (repo: string): Promise<string> => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${repo}/releases/latest`);
        return response.data.tag_name;
    } catch (error) {
        console.error('Error fetching latest release:', error);
        return ''; // Handle errors appropriately
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Read the mod directory and parse mod data
        const modsDir = path.join(process.cwd(), 'app', 'user', 'mods');
        const modFolders = fs.readdirSync(modsDir);

        const mods: Mod[] = await Promise.all(modFolders.map(async (folder) => {
            const packageJsonPath = path.join(modsDir, folder, 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

            // Check the latest version
            const repo = folder; // Assuming folder name is the repo name; adjust as needed
            const latestVersion = await getLatestReleaseVersion(repo);
            const updateAvailable = Boolean(latestVersion && latestVersion !== packageJson.version);

            return {
                name: folder,
                author: packageJson.author,
                version: packageJson.version,
                sptVersion: packageJson.sptVersion,
                update: updateAvailable,
            };
        }));

        res.status(200).json({ mods });
    } catch (error) {
        console.error('Error fetching mods:', error);
        res.status(500).json({ error: 'Failed to fetch mods' });
    }
}