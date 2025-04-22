import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        minWorkers: 1,
        maxWorkers: 4,
        hookTimeout: 1000000,
        testTimeout: 1000000,
    },
});
