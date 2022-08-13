module.exports = async function (page, Comparator) {
    return await page.evaluate(el => el.innerText, (await page.$x(Comparator.key))[0])
}