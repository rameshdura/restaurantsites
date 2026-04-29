const { getEmbedUrl } = require('google-maps-embed-scraper');
const url = 'https://maps.app.goo.gl/jksfrYcpo8SmAjT47';

getEmbedUrl(url).then(result => {
  console.log('Result:', result);
}).catch(err => {
  console.error('Error:', err);
});
