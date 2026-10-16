import { expect, test } from "@playwright/test";

test("unauthenticated portal access shows no private data and links to secure sign-in", async ({
  page,
}) => {
  await page.goto("/portal");
  await expect(page.getByRole("heading", { name: "Sign-in required" })).toBeVisible();
  await expect(page.getByText("Your membership information is private.")).toBeVisible();
  await expect(page.getByText("Membership number", { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Go to member sign-in" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back!" })).toBeVisible();
  await expect(page.getByLabel("Email address or membership number")).toHaveAttribute(
    "type",
    "text",
  );
  await expect(page.getByLabel("Password")).toHaveAttribute("type", "password");
});

test("member sign-in uses the registered email or number and password", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back!" })).toBeVisible();
  await expect(page.getByLabel("Email address or membership number")).toHaveAttribute(
    "type",
    "text",
  );
  await expect(page.getByLabel("Password")).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "View my ID card" })).toBeEnabled();
  await page.getByLabel("Email address or membership number").fill("member@example.test");
  await expect(
    page.getByRole("button", { name: "Forgot your password? Reset it by email" }),
  ).toBeEnabled();
  await expect(page.getByRole("link", { name: "Register here" })).toHaveAttribute(
    "href",
    "/register",
  );
});

test("registration opens on the form and does not gate users behind an availability screen", async ({
  page,
}) => {
  await page.goto("/register");
  await expect(
    page.getByRole("heading", { name: "Join the Arewa for Asiwaju Student Wing" }),
  ).toBeVisible();
  await expect(page.getByLabel(/First name/)).toBeVisible();
  await expect(page.getByLabel(/Email address/)).toBeVisible();
  await expect(page.getByText(/checking registration availability/i)).toHaveCount(0);
});

test("mobile navigation works by keyboard and the hero photo is visible", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 20_000 });

  await expect(
    page.getByRole("heading", {
      name: "Connect Northern students with policy.",
    }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("img", {
        name: /President Bola Ahmed Tinubu/i,
      })
      .first(),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 360);

  const toggle = page.getByRole("button", { name: "Open navigation menu" });
  await toggle.click();
  const mobileNavigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(mobileNavigation).toBeVisible();
  await expect(page.getByRole("button", { name: "Close navigation menu" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  await page.keyboard.press("Escape");
  await expect(mobileNavigation).toBeHidden();
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
