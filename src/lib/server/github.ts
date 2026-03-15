import { Octokit } from 'octokit';
import { GITHUB_TOKEN, GITHUB_ORG } from '$env/static/private';

export const octokit = new Octokit({ auth: GITHUB_TOKEN });
export const ORG = GITHUB_ORG;
