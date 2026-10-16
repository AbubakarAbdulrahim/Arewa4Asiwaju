import { expect, test } from "@playwright/test";

test("homepage hero uses the approved movement image and clear calls to action", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Connect Northern Students with Policy for Renewed Hope Agenda 2027",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "President Bola Ahmed Tinubu, grand patron of Arewa for Asiwaju",
    }),
  ).toBeVisible();
  const hero = page.locator("#main-content");
  await expect(hero.getByRole("link", { name: /Join the Student Wing/ })).toHaveAttribute(
    "href",
    "/register",
  );
  await expect(hero.getByRole("link", { name: "Discover the Movement" })).toHaveAttribute(
    "href",
    "/about",
  );
});

test("theme toggle applies dark mode and remembers the preference", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() =>
      page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .toBe("rgb(16, 23, 19)");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("a4a_theme_preference")))
    .toBe("dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("mobile navbar places the theme toggle before Login and has no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  const themeToggle = mobileNav.getByRole("button", { name: "Switch to dark mode" });
  const login = mobileNav.getByRole("link", { name: "Login" });
  await expect(themeToggle).toBeVisible();
  await expect(login).toBeVisible();
  const [toggleBox, loginBox] = await Promise.all([themeToggle.boundingBox(), login.boundingBox()]);
  expect(toggleBox).not.toBeNull();
  expect(loginBox).not.toBeNull();
  expect(toggleBox!.x).toBeLessThan(loginBox!.x);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("important public pages fit narrow mobile and desktop widths", async ({ page }) => {
  test.setTimeout(120_000);
  const routes = [
    "/",
    "/about",
    "/leadership",
    "/news",
    "/events",
    "/contact",
    "/mission",
    "/faqs",
    "/login",
    "/banner-generator",
    "/register",
    "/admin-login",
  ];

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main").first()).toBeVisible();
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `${route} overflows at ${width}px`).toBeLessThanOrEqual(width);
    }
  }
});

test("homepage remains within the requested responsive breakpoints", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator("main").first()).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth, `homepage overflows at ${width}px`).toBeLessThanOrEqual(width);
  }
});
test("carousel advances from tinubu to badaru on user action", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  const carousel = page.getByRole("region", { name: "Movement Highlights Carousel" });
  await expect(carousel).toBeVisible();
  await expect(carousel.getByRole("img", { name: /Tinubu/i }).first()).toBeVisible();
  await carousel.getByRole("button", { name: "Next slide" }).click();
  await expect(carousel.getByRole("img", { name: /Badaru/i }).first()).toBeVisible();
});
