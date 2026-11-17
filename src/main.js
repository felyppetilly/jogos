import { isTestMode, testLog } from './core/test-mode.js';

if (isTestMode()) window.__jogos = testLog;
