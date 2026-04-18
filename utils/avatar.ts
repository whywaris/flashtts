/**
 * Generates a deterministic integer between 1 and 10 based on a string input.
 * Useful for consistently mapping names to a limited set of avatars.
 */
function getHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 10) + 1; // 1 to 10
}

/**
 * Returns a static, deterministic avatar route (e.g. /avatars/male/4.svg)
 * based on the voice's name and gender.
 */
export function getAvatarPath(name: string, gender?: string | null): string {
    const isMale = gender?.toLowerCase() === 'male';
    const index = getHash(name || 'default');
    
    return isMale ? `/avatars/male/${index}.svg` : `/avatars/female/${index}.svg`;
}

/**
 * Returns a bright, flat color backdrop for the avatar matching our design system.
 */
export function getAvatarBackdrop(name: string): string {
    const colors = [
        '#fcd34d', // yellow
        '#60a5fa', // blue
        '#34d399', // green
        '#f472b6', // pink
        '#a78bfa', // purple
        '#fb923c', // orange
    ];
    const index = Math.abs(getHash(name || 'V')) % colors.length;
    return colors[index];
}
