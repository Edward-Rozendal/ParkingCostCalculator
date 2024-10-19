# Parking Cost Calculator
Taken from the book "ATTD by example" from Markus Gärtner.


## Use Cucumber to automate the tests
Install cucumber as a development dependency:
```
> npm install --save-dev @cucumber/cucumber
```

## Create feature for Valet Parking
features/Valet.feature:
```
Feature: Valet Parking feature
    The parking lot calculator calculates cost for Valet Parking.

    Scenario: Calculate Valet Parking Cost for half an hour
    When I park my car in the "Valet" Parking Lot for 30 minutes
    Then I will have to pay $ 12.00
```

Add in package.json:
```
"type": "module",
```

To get hits on how to implement the missing steps, run Cucumber:
```
> npx cucumber-js
```
or:
```
> .\node_modules\.bin\cucumber-js
```
or:
```
> .\node_modules\.bin\cucumber-js .\features\greeting.feature
```

features/step_definitions/steps.js:
```
import { When, Then } from "@cucumber/cucumber";

When('I park my car in the {string} Parking Lot for {int} minutes', function (string, int) {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});

Then('I will have to pay $ {float}', function (float) {
    // Write code here that turns the phrase above into concrete actions
    return 'pending';
});
```


## Use Selenium to drive the browser from the code
Install Selenium as a development dependency:
```
> npm install --save-dev selenium-webdriver
```

Install additional component for browser:
- download chromedriver-win64.zip
- copy chromedriver.exe into PATH, e.g. C:\Program Files\nodejs


## Create a webserver
server.js:
```
import http from 'http';
import url from 'url';

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
    let tarif;
    if (parking === 'Valet') {
        tarif = duration / 2.5;
    } else if (parking === 'Long-Term Surface') {
        tarif = 3 * duration;
    } else {
        tarif = duration;
    }

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
```

Run the server:
```
> node server.js
```

Access the server at http://127.0.0.1:3000/


## Have Cucumber access the webpage through Selenium
features/step_definitions/steps.js:
```
import { When, Then } from '@cucumber/cucumber';
import { Builder, By, until } from 'selenium-webdriver';
import assert from 'assert';

let driver;

When('I park my car in the {string} Parking Lot for {int} minutes', async function (parking, duration) {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://127.0.0.1:3000');

    let parkingDropdown = await driver.findElement(By.id('parking'));
    await parkingDropdown.click();
    await driver.findElement(By.css(`#parking option[value="${parking}"]`)).click();

    let durationInput = await driver.findElement(By.id('duration'));
    await durationInput.sendKeys(duration);

    let submitButton = await driver.findElement(By.css('input[type="submit"]'));
    await submitButton.click();
});

Then('I will have to pay $ {float}', async function (expectedTarif) {
    await driver.wait(until.titleIs('Form Submitted'), 5000);

    let tarif = await driver.findElement(By.xpath(`//p[contains(text(),'Tarif: $ ')]`)).getText();
    let expected = "Tarif: $ " + expectedTarif.toFixed(2);
    assert.strictEqual(tarif, expected);

    await driver.quit();
});
```


## Start the webserver as part of the test
features/step_definitions/steps.js:
```
import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { Builder, By, until } from 'selenium-webdriver';
import assert from 'assert';
import { exec } from 'child_process'; // Voor het starten van de server
import path from 'path';

let driver;
let serverProcess;

const serverScript = path.join(process.cwd(), 'server.js');

// Start server before tests begin
BeforeAll(async function () {
serverProcess = exec(`node ${serverScript}`, (error, stdout, stderr) => {
    if (error) {
    console.error(`Starting server failed: ${error.message}`);
    return;
    }
    if (stderr) {
    console.error(`Server error: ${stderr}`);
    }
    console.log(`Server started:\n${stdout}`);
});

// Wait 1 second to allow server toa start properly
await new Promise(resolve => setTimeout(resolve, 1000));
});

// Terminate server after completing the tests
AfterAll(async function () {
if (serverProcess) {
    serverProcess.kill();
    console.log('Server terminated.');
}
});
```


## Extract the calculation in a separate module
src/parkcalc.js:
```
/**
* Calculate the parking tarif.
* @param {string} parking - The parking lot type.
* @param {number} duration - The parking duration in minutes.
* @returns {number} - The calculated tarig.
*/
export function calculateTarif(parking, duration) {
    let tarif;
    if (parking === 'Valet') {
        tarif = duration / 2.5;
    } else if (parking === 'Long-Term Surface') {
        tarif = 3 * duration;
    } else {
        tarif = duration;
    }
    return tarif;
}
```

server.js:
```
import { calculateTarif } from './src/parkcalc.js';

// Calculate tarif
let tarif = calculateTarif(parking, duration);
```


## Unit test the calculation
Install Mocha (testframework) and Chai (assertion library) as a development dependency:
```
> npm install --save-dev mocha chai
```

test/valet.test.js
```
import { expect } from 'chai';
import { calculateTarif } from '../src/parkcalc.js';

describe('Valet Parking Tarif', function () {

    it('should return $ 12.00 for 30 minutes', function () {
        const result = calculateTarif('Valet', 30);
        expect(result).to.equal(12.00);
    });

});
```

Run test (without setup in package.json):
```
> node .\node_modules\mocha\bin\mocha.js
```

Set up a test script in package.json:
```
"scripts": {
  "test": "mocha"
}
```

Run test (with setup in package.json):
```
> npm test
```
