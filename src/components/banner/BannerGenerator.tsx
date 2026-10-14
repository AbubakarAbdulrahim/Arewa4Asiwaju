"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from "react";
import { Check, Download, RotateCcw, Sparkles } from "lucide-react";
import {
  BANNER_HEIGHT,
  BANNER_SCALE,
  BANNER_WIDTH,
  drawBanner,
  getBannerFilename,
} from "@/lib/banner/render-banner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_NAME_LENGTH = 80;
const MAX_POSITION_LENGTH = 64;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

type Pan = { x: number; y: number };

export function BannerGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [logoReady, setLogoReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setLogo(image);
      setLogoReady(true);
    };
    image.onerror = () => setError("The movement logo could not be loaded. Refresh and try again.");
    image.src = "/brand/arewa-for-asiwaju-a4a.jpg";
  }, []);

  useEffect(() => {
    if (!photoFile) return;
    const objectUrl = URL.createObjectURL(photoFile);
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth * image.naturalHeight > 40_000_000) {
        setPhoto(null);
        setError("This image has too many pixels to process safely. Choose a smaller picture.");
        return;
      }
      setPhoto(image);
      setError("");
    };
    image.onerror = () => {
      setPhoto(null);
      setError("This picture could not be opened. Try another JPEG, PNG, or WebP image.");
    };
    image.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawBanner(
      canvas,
      {
        name: name.trim(),
        position: position.trim(),
        photo,
        logo,
        zoom,
        panX: pan.x,
        panY: pan.y,
      },
      BANNER_SCALE,
    );
  }, [name, position, photo, logo, zoom, pan]);

  useEffect(() => {
    if (!generatedUrl) return;
    return () => URL.revokeObjectURL(generatedUrl);
  }, [generatedUrl]);

  const invalidateGenerated = useCallback(() => {
    setGeneratedUrl(null);
    setStatus("");
  }, []);

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.currentTarget.value);
    invalidateGenerated();
  }

  function handlePositionChange(event: ChangeEvent<HTMLInputElement>) {
    setPosition(event.currentTarget.value);
    invalidateGenerated();
  }

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    invalidateGenerated();
    const supportedType = ALLOWED_TYPES.has(file.type);
    const extensionFallback =
      (!file.type || file.type === "application/octet-stream") &&
      ALLOWED_EXTENSIONS.test(file.name);
    if (!supportedType && !extensionFallback) {
      setError("Choose a JPEG, JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("That image is larger than 10 MB. Choose a smaller picture.");
      return;
    }
    setError("");
    setStatus("");
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setPhoto(null);
    setPhotoFile(file);
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhoto(null);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setError("");
    invalidateGenerated();
  }

  function startPhotoDrag(event: PointerEvent<HTMLCanvasElement>) {
    if (!photo || isGenerating) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * BANNER_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * BANNER_HEIGHT;
    if (x < 164 || x > 600 || y < 391 || y > 934) return;
    dragRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePhoto(event: PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current || !photo) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const deltaX = ((event.clientX - dragRef.current.x) / rect.width) * BANNER_WIDTH;
    const deltaY = ((event.clientY - dragRef.current.y) / rect.height) * BANNER_HEIGHT;
    dragRef.current = { x: event.clientX, y: event.clientY };
    setPan((current) => ({
      x: Math.max(-1, Math.min(1, current.x + (deltaX / 436) * 2)),
      y: Math.max(-1, Math.min(1, current.y + (deltaY / 543) * 2)),
    }));
    invalidateGenerated();
  }

  function finishPhotoDrag(event: PointerEvent<HTMLCanvasElement>) {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  async function generateBanner() {
    const trimmedName = name.trim();
    const canvas = canvasRef.current;
    if (!trimmedName || !photo || !canvas || !logo) {
      setError("Enter your name and choose a photograph before generating your banner.");
      return;
    }
    setError("");
    setStatus("");
    setIsGenerating(true);
    try {
      await document.fonts.ready;
      drawBanner(
        canvas,
        {
          name: trimmedName,
          position: position.trim(),
          photo,
          logo,
          zoom,
          panX: pan.x,
          panY: pan.y,
        },
        BANNER_SCALE,
      );
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Your browser could not export this image."));
        }, "image/png");
      });
      setGeneratedUrl(URL.createObjectURL(blob));
      setStatus("Your banner is ready to download as a high-resolution PNG.");
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "The banner could not be generated. Try again with a different photo.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function createAnotherBanner() {
    setName("");
    setPosition("");
    removePhoto();
    setGeneratedUrl(null);
    setStatus("Start a new banner by adding a name and photo.");
    nameInputRef.current?.focus();
  }

  const canGenerate = Boolean(name.trim() && photo && logoReady && !isGenerating);
  const accessibleName = name.trim() ? `Banner preview for ${name.trim()}` : "Banner preview";

  return (
    <div className="site-container py-8 sm:py-12">
      <div className="mb-7 max-w-3xl">
        <p className="eyebrow">Create your banner</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Create Your A4A Students’ Wing Banner
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Add your name and a photo to make a shareable banner in the official Student Wing design.
          Your photograph stays on this device and is not uploaded.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(18rem,.72fr)_minmax(22rem,1fr)] lg:gap-12">
        <section aria-labelledby="banner-controls-heading" className="space-y-6">
          <h2 id="banner-controls-heading" className="section-title text-2xl">
            Personalize your banner
          </h2>

          <div>
            <label className="field-label" htmlFor="banner-name">
              Full name <span aria-hidden="true">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="banner-name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={MAX_NAME_LENGTH}
              value={name}
              onChange={handleNameChange}
              onBlur={() => setName((value) => value.trim())}
              placeholder="Garba Magaji"
              className="field-control"
              aria-describedby="banner-name-hint"
              disabled={isGenerating}
            />
            <div className="mt-1 flex justify-between gap-3 text-xs text-muted">
              <span id="banner-name-hint">Leading and trailing spaces are removed.</span>
              <span aria-live="off">
                {name.length}/{MAX_NAME_LENGTH}
              </span>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="banner-position">
              Position / designation <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              id="banner-position"
              name="position"
              type="text"
              maxLength={MAX_POSITION_LENGTH}
              value={position}
              onChange={handlePositionChange}
              onBlur={() => setPosition((value) => value.trim())}
              placeholder="e.g. Member, Coordinator"
              className="field-control"
              aria-describedby="banner-position-hint"
              disabled={isGenerating}
            />
            <p id="banner-position-hint" className="mt-1 text-xs text-muted">
              Appears between your name and the Student Wing line.
            </p>
          </div>

          <div>
            <label className="field-label" htmlFor="banner-picture">
              Profile picture <span aria-hidden="true">*</span>
            </label>
            <p id="banner-picture-hint" className="mb-3 text-sm text-muted">
              Use a clear portrait photo. JPEG, PNG, or WebP; up to 10 MB. Choose another file here
              to replace it.
            </p>
            <input
              ref={fileInputRef}
              id="banner-picture"
              name="picture"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={handleImageSelection}
              className="file-picker"
              aria-describedby="banner-picture-hint"
              disabled={isGenerating}
            />
            {photoFile && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="max-w-full break-all text-xs text-muted" aria-live="polite">
                  Selected: {photoFile.name}
                </p>
                <button
                  type="button"
                  className="button-quiet"
                  onClick={removePhoto}
                  disabled={isGenerating}
                >
                  Remove picture
                </button>
              </div>
            )}
          </div>

          {photo && (
            <div className="space-y-3 border-t border-line pt-5">
              <div className="flex items-center justify-between gap-3">
                <label className="field-label mb-0" htmlFor="photo-zoom">
                  Zoom picture
                </label>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm px-2 text-sm font-semibold text-brand-forest underline-offset-4 hover:underline focus-visible:outline"
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                    invalidateGenerated();
                  }}
                  disabled={isGenerating}
                >
                  <RotateCcw aria-hidden="true" className="h-4 w-4" /> Reset crop
                </button>
              </div>
              <input
                id="photo-zoom"
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(event) => {
                  setZoom(Number(event.currentTarget.value));
                  invalidateGenerated();
                }}
                className="banner-range w-full"
                aria-valuetext={`${zoom.toFixed(1)} times zoom`}
                disabled={isGenerating}
              />
              <p className="text-xs leading-relaxed text-muted">
                Drag the photo in the preview to reposition it. Use the zoom control above to adjust
                the crop.
              </p>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-sm border border-red-300 bg-red-50 p-3 text-sm text-red-900"
            >
              {error}
            </p>
          )}
          {status && (
            <p role="status" className="notice flex items-start gap-2 text-sm">
              <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" />
              {status}
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-line pt-5">
            <button
              type="button"
              className="button-primary w-full"
              onClick={generateBanner}
              disabled={!canGenerate}
            >
              {isGenerating ? (
                <>
                  <span className="loading-spinner" aria-hidden="true" /> Generating banner…
                </>
              ) : (
                <>
                  <Sparkles aria-hidden="true" className="h-4 w-4" /> Generate My Banner
                </>
              )}
            </button>
            {generatedUrl && (
              <a
                className="button-secondary w-full"
                href={generatedUrl}
                download={getBannerFilename(name)}
              >
                <Download aria-hidden="true" className="h-4 w-4" /> Download Banner (PNG)
              </a>
            )}
            {generatedUrl && (
              <button type="button" className="button-quiet w-full" onClick={createAnotherBanner}>
                Create another banner
              </button>
            )}
          </div>

          <p className="text-xs leading-relaxed text-muted">
            Your image is processed locally in your browser. It is not sent to A4A or stored on a
            server.
          </p>
        </section>

        <section aria-labelledby="banner-preview-heading" className="min-w-0">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Live preview</p>
              <h2 id="banner-preview-heading" className="mt-1 text-xl font-bold text-ink">
                Your banner
              </h2>
            </div>
            <p className="text-right text-xs text-muted">
              {BANNER_WIDTH * BANNER_SCALE} × {BANNER_HEIGHT * BANNER_SCALE} px
            </p>
          </div>
          <div className="mx-auto max-w-[490px] overflow-hidden rounded-sm border border-line bg-[#00190f] shadow-sm">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={accessibleName}
              className={`block h-auto w-full select-none ${photo ? "cursor-grab active:cursor-grabbing" : ""}`}
              style={{ touchAction: "none", aspectRatio: `${BANNER_WIDTH} / ${BANNER_HEIGHT}` }}
              onPointerDown={startPhotoDrag}
              onPointerMove={movePhoto}
              onPointerUp={finishPhotoDrag}
              onPointerCancel={finishPhotoDrag}
            >
              Your personalized banner preview. Add a name and portrait to begin.
            </canvas>
          </div>
          <p className="mx-auto mt-3 max-w-[490px] text-xs leading-relaxed text-muted">
            Preview and downloaded PNG use the same composition. The export is a portrait image at
            2× the reference dimensions.
          </p>
        </section>
      </div>
    </div>
  );
}
