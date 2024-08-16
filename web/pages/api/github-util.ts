import axios from 'axios';

export const getLatestReleaseVersion = async (githubUrl: string): Promise<string> => {
    const regex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/releases\/tag\/([^\/]+)/;
    const match = githubUrl.match(regex);

    if (!match) {
        throw new Error('Invalid GitHub URL');
    }

    const [_, owner, repo] = match;

    try {
        const response = await axios.get(`https://api.github.com/${owner}/${repo}/releases/latest`);
        return response.data.tag_name;
    } catch (error) {
        console.error('Error fetching latest release:', error);
        return ''; // Handle errors appropriately
    }
};

export async function getDownloadUrl(githubUrl: string): Promise<string | null> {
    const regex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/releases\/tag\/([^\/]+)/;
    const match = githubUrl.match(regex);

    if (!match) {
        throw new Error('Invalid GitHub URL');
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