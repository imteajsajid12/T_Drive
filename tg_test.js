const fs = require('fs');
fs.writeFileSync('test.jpg', 'fake image data');

const tgToken = '8721702939:AAGtDcMWdQPZYxrWGuCBvZ27UTbs4eBzH_E';
const tgChatId = '790875483';

async function run() {
  const formData = new FormData();
  formData.append('chat_id', tgChatId);
  formData.append('document', new Blob([fs.readFileSync('test.jpg')]), '1708954466578.jpg');
  
  const res = await fetch(`https://api.telegram.org/bot${tgToken}/sendDocument`, {
    method: 'POST',
    body: formData
  });
  console.log('Upload:', await res.json());

  const uRes = await fetch(`https://api.telegram.org/bot${tgToken}/getUpdates`);
  console.log('Updates:', await uRes.json());
}
run();
