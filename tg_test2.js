const fs = require('fs');

const tgToken = '8721702939:AAGtDcMWdQPZYxrWGuCBvZ27UTbs4eBzH_E';
const fileId = 'BQACAgUAAxkDAAMLagSStF5861gwmQcVi0rZ2Wjt1QwAAiIeAAJSkChU44lkUySCKig7BA'; // from earlier
async function run() {
  const pathRes = await fetch(`https://api.telegram.org/bot${tgToken}/getFile?file_id=${fileId}`);
  const pathData = await pathRes.json();
  console.log(pathData);
}
run();
