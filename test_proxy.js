const targetUrl = 'https://api.telegram.org/file/bot8721702939:AAGtDcMWdQPZYxrWGuCBvZ27UTbs4eBzH_E/documents/file_225';
async function test() {
  const res = await fetch(targetUrl);
  console.log(res.status, res.headers.get('content-type'));
}
test();
