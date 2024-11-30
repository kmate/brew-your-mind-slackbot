import fs from 'node:fs';

const place = 'memory.json';

interface ThingsToRemember {
    lastHeSeen: number;
}

export async function remember(thigs: ThingsToRemember): Promise<void> {
    const content = JSON.stringify(thigs);

    fs.writeFile(place, content, err => {
        if (err) {
            console.error(`I can't remember that ${content}`);
        }
    });
}

export async function recall(): Promise<ThingsToRemember> {
    try {
        const content = fs.readFileSync(place, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error(`I can't reall those things...`);
        return {
            lastHeSeen: 0,
        };
    }
}
