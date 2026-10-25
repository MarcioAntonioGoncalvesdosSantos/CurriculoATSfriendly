import { mkdir, writeFile } from 'node:fs/promises';
import { Builder, By, until, type WebDriver } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';
import { CV_SAMPLE, JOB_SAMPLE } from '../src/lib/fixtures';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const OUT = 'docs/prints';

async function shot(driver: WebDriver, name: string) {
  const base64 = await driver.takeScreenshot();
  await writeFile(`${OUT}/${name}.png`, Buffer.from(base64, 'base64'));
  console.log(`· ${name}.png`);
}

async function clickByText(driver: WebDriver, text: string) {
  const element = await driver.wait(
    until.elementLocated(By.xpath(`//button[contains(., "${text}")] | //a[contains(., "${text}")]`)),
    10000,
  );
  await driver.executeScript('arguments[0].scrollIntoView({block:"center"})', element);
  await element.click();
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const options = new firefox.Options()
    .addArguments('-headless')
    .windowSize({ width: 1280, height: 1500 });
  const service = new firefox.ServiceBuilder('.tools/geckodriver');

  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .setFirefoxService(service)
    .build();

  try {
    await driver.get(BASE);
    await driver.wait(until.elementLocated(By.css('h1')), 15000);
    await driver.sleep(1200);
    await shot(driver, '01-landing');

    await clickByText(driver, 'Analisar meu currículo');
    const cvField = await driver.wait(until.elementLocated(By.css('textarea[aria-label="Texto do currículo"]')), 10000);
    await cvField.sendKeys(CV_SAMPLE);
    await driver.sleep(400);
    await shot(driver, '02-curriculo');

    await clickByText(driver, 'Continuar');
    const jobField = await driver.wait(until.elementLocated(By.css('textarea[aria-label="Descrição da vaga"]')), 10000);
    await jobField.sendKeys(JOB_SAMPLE);
    await driver.sleep(400);
    await clickByText(driver, 'Analisar compatibilidade');

    await driver.wait(until.elementLocated(By.xpath('//*[contains(text(), "Compatibilidade")]')), 20000);
    await driver.sleep(2500);
    await shot(driver, '03-diagnostico');

    for (const [tab, nome] of [
      ['Palavras-chave', '04-palavras-chave'],
      ['Formato', '05-formato'],
      ['Reescrita', '06-reescrita'],
    ] as const) {
      await clickByText(driver, tab);
      await driver.sleep(900);
      await driver.executeScript('window.scrollTo(0, 260)');
      await driver.sleep(300);
      await shot(driver, nome);
    }

    console.log('prints gerados em', OUT);
  } finally {
    await driver.quit();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
