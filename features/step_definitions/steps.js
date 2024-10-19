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
