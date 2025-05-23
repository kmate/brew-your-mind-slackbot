import fs from 'node:fs';

const place = 'memory.json';

interface ThingsToRemember {
    humanExperimentsSeen: Set<number>;
}

export async function remember(newHeNumber: number): Promise<void> {
    const currentMemory = await recall();
    currentMemory.humanExperimentsSeen.add(newHeNumber);
    const content = JSON.stringify({
        humanExperimentsSeen: Array.from(currentMemory.humanExperimentsSeen).sort((a, b) => a - b),
    });

    fs.writeFile(place, content, err => {
        if (err) {
            console.error(`I can't remember that ${content}`);
        }
    });
}

export async function recall(): Promise<ThingsToRemember> {
    try {
        const content = fs.readFileSync(place, 'utf8');
        const parsed = JSON.parse(content);

        if (!Array.isArray(parsed.humanExperimentsSeen)) {
            const lastHeSeen = parsed.lastHeSeen || 0;
            const migratedSet = new Set<number>(
                Array.from({ length: lastHeSeen }, (_, i) => i + 1)
            );
            return {
                humanExperimentsSeen: migratedSet,
            };
        }

        return {
            humanExperimentsSeen: new Set(parsed.humanExperimentsSeen),
        };
    } catch (err) {
        console.error(`I can't recall those things...`);
        return {
            humanExperimentsSeen: new Set(),
        };
    }
}
