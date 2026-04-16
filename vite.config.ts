import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const certDir = resolve(__dirname, 'cert');
const keyPath = resolve(certDir, 'key.pem');
const certPath = resolve(certDir, 'cert.pem');
const useHttps = existsSync(keyPath) && existsSync(certPath);

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    server: useHttps
        ? {
            host: 'localhost',
            https: {
                key: readFileSync(keyPath),
                cert: readFileSync(certPath),
            },
        }
        : {
            host: 'localhost',
        },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
});
