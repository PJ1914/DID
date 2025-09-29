#!/usr/bin/env node
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import https from 'node:https';

const target = resolve(process.cwd(), 'ptau/pot16_final.ptau');
const url = 'https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau';

if (existsSync(target)) {
    console.log('PTAU file already exists at', target);
    process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });

console.log('Downloading PTAU from', url);

const file = createWriteStream(target);
https.get(url, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Unexpected status code ${res.statusCode} when downloading PTAU`);
        process.exit(1);
    }

    res.pipe(file);
    res.on('end', () => {
        file.close();
        console.log('PTAU downloaded to', target);
    });
}).on('error', (err) => {
    console.error('Failed to download PTAU', err);
    process.exit(1);
});
