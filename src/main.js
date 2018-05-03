import App from './App.html';
import store from './store.js';

const app = new App({
	target: document.body,
	store
});

// HACK
window.dirty = false;

export default app;
