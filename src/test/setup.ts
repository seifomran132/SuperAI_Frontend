import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// CI runners are slower than dev machines: give waitFor/findBy 5s instead of
// 1s. They still resolve as soon as the condition holds.
configure({ asyncUtilTimeout: 5000 });

// jsdom does not implement scrolling; the router's scroll restoration calls it.
window.scrollTo = () => {};
