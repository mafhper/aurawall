/**
 * Fetch Changelog Script
 * 
 * Fetches commits from GitHub API and generates a changelog.json file
 * for the promo site.
 * 
 * Usage: node scripts/fetch-changelog.js
 * 
 * Environment:
 *   GITHUB_TOKEN (optional) - For higher rate limits
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to read repo info from package.json
let REPO_OWNER = 'mafhper';
let REPO_NAME = 'aurawall';

try {
    const pkg = require('../../package.json');
    if (pkg.repository) {
        const repoUrl = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url;
        // Parse: https://github.com/owner/repo or git@github.com:owner/repo.git
        const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
        if (match) {
            REPO_OWNER = match[1];
            REPO_NAME = match[2].replace(/\.git$/, '');
        }
    }
} catch (e) {
    // Use defaults if package.json not found
}

const OUTPUT_PATH = path.join(__dirname, '../..', 'website', 'public', 'changelog.json');
const CACHE_PATH = path.join(__dirname, '../..', 'website', 'public', 'changelog-cache.json');

// Conventional commit types mapping
const COMMIT_TYPES = {
    'feat': 'feature',
    'fix': 'fix',
    'breaking': 'breaking',
    'refactor': 'refactor',
    'docs': 'feature',
    'style': 'refactor',
    'perf': 'feature',
    'chore': 'refactor',
};

function parseConventionalCommit(message) {
    // Matches: type(scope): description or type: description
    const regex = /^(\w+)(?:\([\w-]+\))?:\s*(.+)/;
    const match = message.match(regex);

    if (match) {
        const type = match[1].toLowerCase();
        return {
            type: COMMIT_TYPES[type] || 'refactor',
            message: match[2],
        };
    }

    return {
        type: 'refactor',
        message: message.split('\n')[0], // First line only
    };
}

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'AuraWall-Changelog-Fetcher',
                'Accept': 'application/vnd.github.v3+json',
            },
        };

        // Add auth token if available
        if (process.env.GITHUB_TOKEN) {
            options.headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON: ${e.message}`));
                }
            });
        }).on('error', reject);
    });
}

async function fetchCommits() {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=100`;

    console.log(`Fetching commits from ${REPO_OWNER}/${REPO_NAME}...`);

    try {
        const commits = await fetchJSON(url);

        if (!Array.isArray(commits)) {
            console.log('Repository not public or no commits found. Using cached data if available.');
            return null;
        }

        console.log(`Found ${commits.length} commits.`);
        return commits;
    } catch (error) {
        console.error('Error fetching commits:', error.message);
        return null;
    }
}

function groupCommitsByDate(commits) {
    const groups = {};

    commits.forEach(commit => {
        const date = commit.commit.author.date.split('T')[0];
        const weekStart = getWeekStart(new Date(date));

        if (!groups[weekStart]) {
            groups[weekStart] = [];
        }

        groups[weekStart].push({
            sha: commit.sha.substring(0, 7),
            message: commit.commit.message,
            date: date,
            author: commit.commit.author.name,
        });
    });

    return groups;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
}

function generateChangelog(commits) {
    if (!commits || commits.length === 0) {
        return [];
    }

    const groups = groupCommitsByDate(commits);
    const changelog = [];

    // Sort by date descending
    const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

    // Generate version numbers based on order
    let majorVersion = 0;
    let minorVersion = sortedDates.length;

    sortedDates.forEach((date, index) => {
        const groupCommits = groups[date];

        // Determine primary type for this group
        let primaryType = 'refactor';
        const types = groupCommits.map(c => parseConventionalCommit(c.message).type);
        if (types.includes('breaking')) primaryType = 'breaking';
        else if (types.includes('feature')) primaryType = 'feature';
        else if (types.includes('fix')) primaryType = 'fix';

        // Get first meaningful commit message for title
        const firstCommit = groupCommits[0];
        const parsed = parseConventionalCommit(firstCommit.message);

        changelog.push({
            version: `0.${minorVersion - index}.0`,
            date: date,
            title: parsed.message.charAt(0).toUpperCase() + parsed.message.slice(1),
            description: `${groupCommits.length} commit(s) nesta semana incluindo melhorias e ajustes.`,
            type: primaryType,
            commits: groupCommits.map(c => c.message.split('\n')[0]).slice(0, 5),
        });
    });

    return changelog;
}

async function main() {
    console.log('=== AuraWall Changelog Fetcher ===\n');

    // Check if cache exists and is recent
    if (fs.existsSync(CACHE_PATH)) {
        const cacheStats = fs.statSync(CACHE_PATH);
        const cacheAge = Date.now() - cacheStats.mtimeMs;
        const oneHour = 60 * 60 * 1000;

        if (cacheAge < oneHour) {
            console.log('Cache is less than 1 hour old. Skipping fetch.');
            console.log('To force refresh, delete:', CACHE_PATH);
            return;
        }
    }

    const commits = await fetchCommits();

    if (commits === null) {
        // Try to use existing changelog
        if (fs.existsSync(OUTPUT_PATH)) {
            console.log('Using existing changelog.json');
            return;
        }

        // Create default changelog
        console.log('Creating default changelog...');
        const defaultChangelog = [
            {
                version: '0.1.0',
                date: new Date().toISOString().split('T')[0],
                title: 'Lançamento Inicial',
                description: 'Primeira versão pública do AuraWall com suporte a dois modos de criação (Boreal e Chroma), sistema de animação CSS, exportação em múltiplos formatos e internacionalização.',
                type: 'feature',
                commits: ['Initial release'],
            },
        ];

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(defaultChangelog, null, 2));
        console.log('Default changelog created at:', OUTPUT_PATH);
        return;
    }

    const changelog = generateChangelog(commits);

    // Write output
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(changelog, null, 2));
    console.log('Changelog written to:', OUTPUT_PATH);

    // Write cache marker
    fs.writeFileSync(CACHE_PATH, JSON.stringify({ lastFetch: new Date().toISOString() }));
    console.log('Cache marker updated.');

    console.log('\nChangelog entries generated:', changelog.length);
}

main().catch(console.error);
