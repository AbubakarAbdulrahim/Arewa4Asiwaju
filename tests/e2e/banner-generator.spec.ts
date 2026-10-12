import { expect, test } from "@playwright/test";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
  "base64",
);

test("generator previews a local image and downloads the matching high-resolution PNG", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const bannerLink = page.getByRole("link", { name: "Get Your Banner" });
  await expect(bannerLink).toHaveAttribute("href", "/banner-generator");
  await bannerLink.click();
  await expect(page).toHaveURL(/\/banner-generator$/);

  await expect(
    page.getByRole("heading", { name: "Create Your A4A Students’ Wing Banner" }),
  ).toBeVisible();

  await page.getByLabel("Full name").fill("  Comr. Abubakar Abdulrahim  ");
  await page.getByLabel("Profile picture").setInputFiles({
    name: "portrait.png",
    mimeType: "image/png",
    buffer: onePixelPng,
  });

  await expect(
    page.getByRole("img", { name: "Banner preview for Comr. Abubakar Abdulrahim" }),
  ).toBeVisible();
  const canvas = page.locator("canvas");
  const withoutPosition = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.toDataURL(),
  );
  await page.getByLabel(/Position \/ designation/).fill("State Coordinator");
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()))
    .not.toBe(withoutPosition);
  const generate = page.getByRole("button", { name: "Generate My Banner" });
  await expect(generate).toBeEnabled();
  await generate.click();

  const downloadLink = page.getByRole("link", { name: "Download Banner (PNG)" });
  await expect(downloadLink).toBeVisible();
  await expect(page.getByRole("status")).toContainText("high-resolution PNG");
  const canvasSize = await page
    .locator("canvas")
    .evaluate((canvas: HTMLCanvasElement) => [canvas.width, canvas.height]);
  expect(canvasSize).toEqual([1528, 2160]);
  const [download] = await Promise.all([page.waitForEvent("download"), downloadLink.click()]);
  expect(download.suggestedFilename()).toBe("arewa4asiwaju-comr-abubakar-abdulrahim.png");

  await page.getByRole("button", { name: "Create another banner" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("");
  await expect(page.getByLabel(/Position \/ designation/)).toHaveValue("");
  await expect(page.getByRole("button", { name: "Generate My Banner" })).toBeDisabled();
});

test("generator rejects unsupported image types with a readable error", async ({ page }) => {
  await page.goto("/banner-generator");
  await page.getByLabel("Profile picture").setInputFiles({
    name: "document.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  });
  await expect(page.locator('p[role="alert"]')).toHaveText(
    "Choose a JPEG, JPG, PNG, or WebP image.",
  );
  await expect(page.getByRole("button", { name: "Generate My Banner" })).toBeDisabled();
});
