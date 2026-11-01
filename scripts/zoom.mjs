import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const OUT = 'C:\\Users\\ASUS\\AppData\\Local\\Temp\\opencode\\corvexa'
const URL = process.env.TARGET || 'http://localhost:4173/'

fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--enable-unsafe-swiftshader', '--hide-scrollbars'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await page.goto(URL, { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 3000))

const clip = await page.evaluate(() => {
  const r = document.querySelector('.hero__title').getBoundingClientRect()
  const x = Math.max(0, Math.round(r.left - 90))
  const y = Math.max(0, Math.round(r.top - 70))
  return {
    x,
    y,
    width: Math.round(Math.min(1440 - x, r.width + 180)),
    height: Math.round(r.height + 140),
    cx: Math.round(r.left + r.width * 0.55),
    cy: Math.round(r.top + r.height * 0.5),
  }
})

await page.screenshot({ path: path.join(OUT, 'zoom-title@2x.png'), clip })
await page.mouse.move(clip.cx, clip.cy)
await new Promise((r) => setTimeout(r, 700))
await page.screenshot({ path: path.join(OUT, 'zoom-title-hover@2x.png'), clip })
await browser.close()
console.log('zoom saved', clip)
