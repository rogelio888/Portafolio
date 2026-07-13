// resources/js/app.js

import './bootstrap';
import '../css/app.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import Icon from './components/Icon.vue';

const app = createApp(App);
app.component('Icon', Icon);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');