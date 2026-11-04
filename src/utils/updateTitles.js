import { dashboard_title } from './elements.js';
import { lgd_name } from '../config/config.js';

export function updateTitle () {
    dashboard_title.textContent = `${lgd_name} Data Explorer`;
}