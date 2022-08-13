const download = require('download-chromium');
const os = require('os');
const tmp = os.tmpdir();

const puppeteer = require("puppeteer-extra");
const cliSelect = require('cli-select');
const c = require('chalk');

const eval = require('./assets/eval');

const logger = new (require('./Console.js'));

const config = require('./config.json')
let menus = require('./Menus.json');
const Comparator = require('./Comparator.json');

let devMode=true;

async function start() {

    console.log("Setting up... this may take a few seconds.")
    
    const exec = await download({
        revision: 694644,
        installPath: `${tmp}/.local-chromium`})

    console.clear()
    console.log("Select the menu using the arrow keys and enter.\n")

    const link = await prompt();

    await puppeteer.use(require("puppeteer-extra-plugin-stealth")());

    const browser = await puppeteer.launch({
        executablePath: exec,
        ignoreHTTPSErrors: true,
        headless: false,
        args: [
            `--window-size=200,200`,
            "--window-position=000,000",
            "--disable-dev-shm-usage",
            "--no-sandbox",
            //`--user-data-dir="${__dirname}"`,
            "--disable-web-security",
            "--disable-features=site-per-process",
        ],
    });
    
    const [page] = await browser.pages();

    if (devMode) logger.log("Navigating to product page")
    try { await page.goto(link, { timeout: 60000 }) } catch {}
    
    // Add product to cart
    const AddToCart = await page.waitForXPath(Comparator.addToCart);
    await AddToCart.click()
    if (devMode) logger.log("Added product to cart")
    await sleep(1000)

    // Allow passthrough of cookies
    try { await page.goto("https://radiantcheats.net/index.php?controller=cart", { timeout: 60000 }) } catch {}
    if (devMode) logger.log("Navigated to cart")
    await sleep(1000)

    // Goto checkout
    try { await page.goto("https://radiantcheats.net/index.php?controller=order", { timeout: 60000 }) } catch {}
    if (devMode) logger.log("Navigated to checkout")
    await sleep(1000)
    try { await page.click(Comparator.signIn); } catch { logger.error("Product is out of stock"); await browser.close(); await exitProd(); return; }
    await sleep(1000)
    if (devMode) logger.log("Signing in...")

        // Input sign in details
        const InputEmail = await page.waitForXPath(Comparator.inputEmail)
        await InputEmail.type(config.email);

        const InputPassword = await page.waitForXPath(Comparator.inputPassword)
        await InputPassword.type(config.password);
        await sleep(1000)
    
        const SignInButton = await page.waitForXPath(Comparator.signInButton)
        await SignInButton.click()
        await page.waitForNavigation({ waitUntil: "domcontentloaded" })

        // Insert promo code
        if (devMode) logger.log("Inserting promo code...")
        await sleep(1000)
        await page.click(Comparator.promoCode);
        const PromoCodeInput = await page.waitForXPath(Comparator.promoCodeInput)
        await PromoCodeInput.type(config.promocode)
        await sleep(1000)
        const PromoCodeSubmit = await page.waitForXPath(Comparator.promoCodeSubmit)
        await PromoCodeSubmit.click()
        await sleep(1500)

        // Confirm address
        const ConfirmAddress = await page.waitForXPath(Comparator.confirmAddress)
        await ConfirmAddress.click()
        if (devMode) logger.log("Confirmed address")
        await page.waitForNavigation({ waitUntil: "domcontentloaded" })

        // Check boxes
        const PaymentOptionOne = await page.waitForSelector(Comparator.paymentOptionOne);
        await PaymentOptionOne.click();
        const TOS = await page.waitForXPath(Comparator.termsOfService);
        await TOS.click();
        if (devMode) logger.log("Checked boxes")

        // Submit order
        const SubmitOrder = await page.waitForXPath(Comparator.submitOrder);
        await SubmitOrder.click();
        await page.waitForNavigation({ waitUntil: "domcontentloaded" })
        await sleep(1000)
    
    // Get ordwerewrwrwrwrwrwr
    const OrderDetails = await page.$x(Comparator.orderDetails)
    await OrderDetails[0].click()
    await page.waitForNavigation({ waitUntil: "domcontentloaded" })
    if (devMode) logger.log("Navigating to order details")
    await sleep(1000)

    // Get key
    const Key = await eval(page, Comparator)
    require('child_process').spawn('clip').stdin.end(Key);
    console.log(" ")
    logger.log("Key has been saved to clipboard.")
    logger.success(Key)
    await browser.close()
    await exitProd()
}

async function prompt() {
    menus = Object.keys(menus).sort().reduce(
        (obj, key) => { 
          obj[key] = menus[key]; 
          return obj;
        }, 
        {}
    );

    var values = [];
    for (const menu in menus) {
        values.push(menu);
    }
    
    return await cliSelect({
        values,
        valueRenderer: (value, selected) => {
            if (selected) {
                return c.underline(value);
            }
            return value;
        },
    }).then(async (res) => {
        const info = menus[res.value]
        if (typeof info === 'object') {
            values = []
            for (const menuType in info) {
                values.push(menuType)
            }
            return await cliSelect({
                values,
                valueRenderer: (value, selected) => {
                    if (selected) {
                        return c.underline(value);
                    }
                    return value;
                },
            }).then((resTwo) => {
                return info[resTwo.value]
            }).catch(((e) => {console.log(e)}));
        } else {
            return info;
        }
    }).catch(((e) => { console.log(e) }));
}

async function exitProd() {
    console.log("\nPress any key to exit.")
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

start()

process.on('unhandledRejection', async (error) => {
    console.log(error, "error")
    await exitProd();
})
process.on('rejectionHandled', async (error) => {
    console.log(error, "error")
    await exitProd();
})
process.on('uncaughtException', async (error) => {
    console.log(error, "error")
    await exitProd();
})