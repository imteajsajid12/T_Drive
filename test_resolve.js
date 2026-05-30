const tgToken = '8721702939:AAGtDcMWdQPZYxrWGuCBvZ27UTbs4eBzH_E';
const fileId = 'BQACAgUAAxkDAAN_ahRqIepME5w96OTOA4FLaFUyoJEAAnQeAAJUDqFU43cxy2KIMEM7BA';

async function test() {
  const res = await fetch(`https://api.telegram.org/bot${tgToken}/getFile?file_id=${fileId}`);
  const data = await res.json();
  console.log(data);
}
test();
