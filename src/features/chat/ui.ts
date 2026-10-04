// The chat screens, kept out of index.ts on purpose: the router imports index.ts
// at startup (session reset), and the screens must stay in lazily loaded route
// chunks. Route files import AppShell and ChatPage from here.
export { AppShell } from './components/AppShell';
export { ChatPage } from './pages/ChatPage';
