import { join /* , dirname */ } from 'path';
import { Low, JSONFile } from 'lowdb';
// import { fileURLToPath } from 'url'

// const __dirname = dirname(fileURLToPath(import.meta.url));

let db;

export const init = async () => {
    const file = join(process.env.DATA);
    const adapter = new JSONFile(file);
    db = new Low(adapter);

    await db.read();

    console.log('\nDB connected\n');
}

export default () => db;
