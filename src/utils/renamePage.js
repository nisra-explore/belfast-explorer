import { lgd_name } from '../config/config.js';

export function renamePage (table) {
    
    const raw_title = `${lgd_name} Data Explorer`;
    const title_split = raw_title.split(" - ");

    return (`${title_split[0]} - ${table}`)
}