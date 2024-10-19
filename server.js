import http from 'http';
import url from 'url';
import { calculateTarif } from './src/parkcalc.js';

const hostname = '127.0.0.1';
const port = 3000;

// Create a server that process the HTML-page and user input
const server = http.createServer((req, res) => {
  const queryObject = url.parse(req.url, true).query;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');

  // If user has transmitted the form, show results
  if (queryObject.parking && queryObject.duration) {
    const parking = queryObject.parking;
    const duration = parseInt(queryObject.duration, 10);

    // Calculate tarif
    let tarif = calculateTarif(parking, duration);

    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Form Submitted</title>
      </head>
      <body>
          <h1>Thank you for completing the form!</h1>
          <p>Parking: ${parking}</p>
          <p>Minutes: ${duration}</p>
          <p>Tarif: $ ${tarif.toFixed(2)}</p>
          <a href="/">Back to form</a>
      </body>
      </html>
    `);
  } else {
    // Show form
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Formulier</title>
      </head>
      <body>
          <h1>Parking Cost Calculator</h1>
          <form action="/" method="get">
              <label for="parking">Parking:</label>
              <select id="parking" name="parking" required>
                  <option value="Economy">Economy</option>
                  <option value="Valet">Valet</option>
                  <option value="Short-Term">Short-Term</option>
                  <option value="Long-Term Garage">Long-Term Garage</option>
                  <option value="Long-Term Surface">Long-Term Surface</option>
                  </select><br><br>
              <label for="duration">Minutes:</label>
              <input type="duration" id="duration" name="duration" required><br><br>
              <input type="submit" value="Submit">
          </form>
      </body>
      </html>
    `);
  }
});

// Start de server
server.listen(port, hostname, () => {
  console.log(`Server draait op http://${hostname}:${port}/`);
});
