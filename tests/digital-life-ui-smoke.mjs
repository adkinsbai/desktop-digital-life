import { chromium } from "playwright";
import { assert, withServer } from "./support/serverHarness.mjs";

async function main() {
  await withServer(async ({ baseUrl }) => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1366, height: 820 } });
    try {
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { name: "数字生命" }).waitFor({ timeout: 6000 });
      await page.getByRole("heading", { name: "今晚聊什么" }).waitFor({ timeout: 6000 });

      const desktopLayout = await page.evaluate(() => ({
        bodyWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        composerBottom: Math.round(document.querySelector(".life-composer").getBoundingClientRect().bottom),
        panelBottom: Math.round(document.querySelector(".conversation-panel").getBoundingClientRect().bottom),
        composerHeight: Math.round(document.querySelector(".life-composer").getBoundingClientRect().height),
        messageLogHeight: Math.round(document.querySelector("#messageLog").getBoundingClientRect().height),
        sendHeight: Math.round(document.querySelector(".life-composer .primary-action").getBoundingClientRect().height),
      }));
      assert(desktopLayout.bodyWidth <= desktopLayout.viewportWidth + 1, "desktop UI should not create horizontal scroll");
      assert(Math.abs(desktopLayout.composerBottom - desktopLayout.panelBottom) <= 2, "composer should stay fixed at the bottom of the chat panel");
      assert(desktopLayout.composerHeight <= 140, "desktop composer should not consume the chat panel");
      assert(desktopLayout.messageLogHeight >= 360, "desktop message log should remain the main chat surface");
      assert(desktopLayout.sendHeight >= 44, "send button should meet minimum touch target height");

      await page.locator("#lifeInput").fill("测试 Enter 发送，记住我喜欢安静一点的回答");
      await page.keyboard.press("Enter");

      await page.locator(".msg.user", { hasText: "测试 Enter 发送" }).waitFor({ timeout: 6000 });
      await page.locator(".msg.assistant").last().waitFor({ timeout: 10000 });

      const userMessage = await page.locator(".msg.user", { hasText: "测试 Enter 发送" }).count();
      assert(userMessage >= 1, "Enter should submit and render the user message immediately");

      await page.locator("#innerStateSummary").waitFor({ timeout: 6000 });
      await page.locator("#autonomySummary").waitFor({ timeout: 6000 });
      await page.locator("#cognitionSummary").waitFor({ timeout: 6000 });
      await page.locator(".mind-drawer").waitFor({ timeout: 6000 });

      const mindOpenInitially = await page.locator(".mind-drawer").evaluate(node => node.open);
      assert(mindOpenInitially === false, "mind panel should stay folded by default");
      await page.locator(".mind-drawer summary").click();
      await page.locator("#mindPanel", { hasText: "goals" }).waitFor({ timeout: 6000 });
      await page.locator("#mindPanel", { hasText: "attention" }).waitFor({ timeout: 6000 });

      const canvasMetrics = await page.locator("#lifeExpression").evaluate(canvas => {
        const ctx = canvas.getContext("2d");
        const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let nonblank = 0;
        for (let index = 3; index < sample.length; index += 4) {
          if (sample[index] > 0) nonblank += 1;
          if (nonblank > 10) break;
        }
        return {
          width: canvas.width,
          height: canvas.height,
          expressionState: canvas.dataset.expressionState || "",
          nonblank,
        };
      });
      assert(canvasMetrics.width > 100 && canvasMetrics.height > 80, "expression canvas should have stable dimensions");
      assert(canvasMetrics.nonblank > 10, "expression canvas should render nonblank pixels");
      assert(canvasMetrics.expressionState.length > 0, "expression canvas should expose expression state");

      const internalTextVisible = await page.getByText("结合记忆思考中").count();
      assert(internalTextVisible === 0, "UI should not expose internal memory-thinking status text");

      const messageLogMetrics = await page.locator("#messageLog").evaluate(node => ({
        scrollTop: node.scrollTop,
        scrollHeight: node.scrollHeight,
        clientHeight: node.clientHeight,
      }));
      assert(messageLogMetrics.scrollHeight >= messageLogMetrics.clientHeight, "message log should have stable dimensions");

      await page.setViewportSize({ width: 390, height: 760 });
      await page.waitForTimeout(120);
      const mobileLayout = await page.evaluate(() => ({
        bodyWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        composerVisible: document.querySelector(".life-composer").getBoundingClientRect().top < window.innerHeight,
        composerHeight: Math.round(document.querySelector(".life-composer").getBoundingClientRect().height),
        messageLogHeight: Math.round(document.querySelector("#messageLog").getBoundingClientRect().height),
        sendHeight: Math.round(document.querySelector(".life-composer .primary-action").getBoundingClientRect().height),
        miniTop: Math.round(document.querySelector("#lifeExpressionMini").getBoundingClientRect().top),
        miniHeight: Math.round(document.querySelector("#lifeExpressionMini").getBoundingClientRect().height),
      }));
      assert(mobileLayout.bodyWidth <= mobileLayout.viewportWidth + 1, "mobile UI should not create horizontal scroll");
      assert(mobileLayout.composerVisible === true, "mobile composer should remain reachable without page-bottom hunting");
      assert(mobileLayout.composerHeight <= 170, "mobile composer should not consume the chat panel");
      assert(mobileLayout.messageLogHeight >= 180, "mobile message log should remain usable");
      assert(mobileLayout.sendHeight >= 44, "mobile send button should meet minimum touch target height");
      assert(mobileLayout.miniTop >= 0 && mobileLayout.miniTop + mobileLayout.miniHeight <= 760, "mobile header should keep a live expression visible in the first viewport");

      const miniCanvasMetrics = await page.locator("#lifeExpressionMini").evaluate(canvas => {
        const ctx = canvas.getContext("2d");
        const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let nonblank = 0;
        for (let index = 3; index < sample.length; index += 4) {
          if (sample[index] > 0) nonblank += 1;
          if (nonblank > 10) break;
        }
        return {
          width: canvas.width,
          height: canvas.height,
          expressionState: canvas.dataset.expressionState || "",
          nonblank,
        };
      });
      assert(miniCanvasMetrics.width > 40 && miniCanvasMetrics.height > 24, "mini expression canvas should have stable dimensions");
      assert(miniCanvasMetrics.nonblank > 10, "mini expression canvas should render nonblank pixels");
      assert(miniCanvasMetrics.expressionState.length > 0, "mini expression should expose expression state");

      console.log(JSON.stringify({
        ok: true,
        baseUrl,
        userMessage,
        messageLogMetrics,
      }, null, 2));
    } finally {
      await browser.close();
    }
  }, { dbPrefix: "desktop-digital-life-ui-test" });
}

try {
  await main();
} catch (error) {
  console.error(`FAIL digital-life UI smoke: ${error?.message || error}`);
  process.exitCode = 1;
}
