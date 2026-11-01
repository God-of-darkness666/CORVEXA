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
  args: ['--enable-unsafe-swiftshader', '--hide-scrollbars', '--force-device-scale-factor=1'],
})

const errors = []

async function capture(name, width, height, mobile = false) {
  const page = await browser.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[${name}] ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`[${name}] pageerror: ${err.message}`))
  await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile })
  await page.goto(URL, { waitUntil: 'networkidle2' })

  // early frame — cube wordmark assembly
  await new Promise((r) => setTimeout(r, 550))
  await page.screenshot({ path: path.join(OUT, `${name}-hero-forming.png`) })
  await new Promise((r) => setTimeout(r, 2600))

  const stops = await page.evaluate(() =>
    [...document.querySelectorAll('section')].map((s) => [
      s.id,
      Math.max(0, Math.round(s.getBoundingClientRect().top + scrollY - (s.id === 'top' ? 0 : 70))),
    ]),
  )

  for (const [id, top] of stops) {
    await page.evaluate((target) => window.scrollTo({ top: target, behavior: 'instant' }), top)
    await new Promise((r) => setTimeout(r, 1100))
    await page.screenshot({ path: path.join(OUT, `${name}-${id}.png`) })
  }

  const info = await page.evaluate(() => ({
    docH: document.documentElement.scrollHeight,
    docW: document.documentElement.scrollWidth,
    viewport: { w: innerWidth, h: innerHeight },
    rail: getComputedStyle(document.documentElement).getPropertyValue('--rail'),
    canvases: [...document.querySelectorAll('canvas')].map((c) => `${c.clientWidth}x${c.clientHeight}`),
    sections: [...document.querySelectorAll('section')].map((s) => ({
      id: s.id,
      top: Math.round(s.getBoundingClientRect().top + scrollY),
      height: Math.round(s.getBoundingClientRect().height),
    })),
  }))
  await page.close()
  return { stops, info }
}

const desktop = await capture('desk', 1440, 900)
const mobile = await capture('mob', 390, 844, true)

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ errors, desktop, mobile }, null, 2))

await browser.close()
console.log('done', OUT)
