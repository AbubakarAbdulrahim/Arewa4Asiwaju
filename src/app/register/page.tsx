"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Upload, UserRound } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getWardOptions, NORTHERN_STATES } from "@/lib/geo-data";

type RegistrationConfig = { enabled: boolean; notice?: string; version?: string };
type RegistrationResult = {
  message: string;
  membershipNumber?: string;
  cardStatus?: "ready" | "processing" | "failed";
  downloadUrl?: string | null;
  previewUrl?: string | null;
};
type RegistrationValues = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  stateOfResidence: string;
  lgaOfResidence: string;
  ward: string;
  gender: string;
  dateOfBirth: string;
  occupation: string;
  address: string;
  voterCard: string;
  voterCardNumber: string;
  isStudent: string;
  institutionType: string;
  institutionName: string;
  courseOfStudy: string;
  studyLevel: string;
};

const steps = ["Personal details", "Institution", "Photo", "Review"] as const;
const initialValues: RegistrationValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  stateOfResidence: "",
  lgaOfResidence: "",
  ward: "",
  gender: "",
  dateOfBirth: "",
  occupation: "",
  address: "",
  voterCard: "",
  voterCardNumber: "",
  isStudent: "yes",
  institutionType: "",
  institutionName: "",
  courseOfStudy: "",
  studyLevel: "",
};

async function preparePhoto(file: File): Promise<File> {
  if (file.size <= 0 || file.size > 5 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 5 MB.");
  }
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isJpeg = header[0] === 0xff && header[1] === 0xd8;
  const isPng =
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a;
  const webpHeader = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isWebp =
    String.fromCharCode(...webpHeader.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...webpHeader.slice(8, 12)) === "WEBP";
  if (!isJpeg && !isPng && !isWebp) throw new Error("Use a genuine JPEG, PNG, or WebP image.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This image could not be opened. Choose a different photo.");
  }
  try {
    if (
      bitmap.width < 128 ||
      bitmap.height < 128 ||
      bitmap.width > 4096 ||
      bitmap.height > 4096 ||
      bitmap.width * bitmap.height > 8_000_000
    ) {
      throw new Error("Choose an image between 128 and 4096 pixels in each dimension.");
    }
    const aspect = 3 / 4;
    const sourceWidth = Math.min(bitmap.width, bitmap.height * aspect);
    const sourceHeight = sourceWidth / aspect;
    const sourceX = (bitmap.width - sourceWidth) / 2;
    const sourceY = (bitmap.height - sourceHeight) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 960;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Photo processing is unavailable in this browser.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, 720, 960);
    const normalized = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Photo processing failed. Try again."))),
        "image/jpeg",
        0.9,
      ),
    );
    return new File([normalized], "member-photo.jpg", { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

function RegistrationForm() {
  const [config, setConfig] = useState<RegistrationConfig | null>(null);
  const [values, setValues] = useState(initialValues);
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  const [acceptedNotice, setAcceptedNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [registration, setRegistration] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const selectedState = useMemo(
    () => NORTHERN_STATES.find((state) => state.name === values.stateOfResidence),
    [values.stateOfResidence],
  );
  const wardOptions = useMemo(
    () => getWardOptions(selectedState?.code ?? "", values.lgaOfResidence),
    [selectedState?.code, values.lgaOfResidence],
  );

  useEffect(() => {
    let active = true;
    void fetch("/api/register/config", { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json()) as RegistrationConfig;
        if (active) setConfig(result);
      })
      .catch(() => {
        if (active) setError("The privacy notice could not be loaded. Refresh and try again.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    },
    [],
  );

  function update<K extends keyof RegistrationValues>(key: K, value: RegistrationValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }

  async function choosePhoto(file?: File) {
    if (!file) return;
    setPhotoBusy(true);
    setError("");
    try {
      const preparedPhoto = await preparePhoto(file);
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = URL.createObjectURL(preparedPhoto);
      setPhotoUrl(photoUrlRef.current);
      setPhoto(preparedPhoto);
      setFieldErrors((current) => ({ ...current, profilePhoto: "" }));
    } catch (photoError) {
      setError(
        photoError instanceof Error ? photoError.message : "The photo could not be prepared.",
      );
    } finally {
      setPhotoBusy(false);
    }
  }

  function removePhoto() {
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    photoUrlRef.current = null;
    setPhotoUrl(null);
    setPhoto(null);
  }

  function validateStep(index: number) {
    const nextErrors: Record<string, string> = {};
    if (index === 0) {
      if (values.firstName.trim().length < 2) nextErrors.firstName = "Enter your first name.";
      if (values.lastName.trim().length < 2) nextErrors.lastName = "Enter your last name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
        nextErrors.email = "Enter a valid email address.";
      if (values.password.length < 12) nextErrors.password = "Use a password with at least 12 characters.";
      if (values.password !== values.confirmPassword) nextErrors.confirmPassword = "The passwords do not match.";
      if (!/^\+?[0-9 ()-]{7,30}$/.test(values.phone.trim())) nextErrors.phone = "Enter a valid phone number.";
      if (!selectedState) nextErrors.stateOfResidence = "Select your state of residence.";
      if (!values.lgaOfResidence || !selectedState?.lgas.includes(values.lgaOfResidence))
        nextErrors.lgaOfResidence = "Select a valid LGA.";
      if (!wardOptions.includes(values.ward)) nextErrors.ward = "Select a ward in the chosen LGA.";
      if (values.voterCard === "yes" && !values.voterCardNumber.trim())
        nextErrors.voterCardNumber = "Enter your voter’s card number.";
    }
    if (index === 1 && values.isStudent === "yes") {
      if (!values.institutionType) nextErrors.institutionType = "Choose the institution type.";
      if (!values.institutionName.trim()) nextErrors.institutionName = "Enter your institution name.";
      if (!values.courseOfStudy.trim()) nextErrors.courseOfStudy = "Enter your course or programme.";
      if (!values.studyLevel.trim()) nextErrors.studyLevel = "Enter your current level or year.";
    }
    if (index === 2 && !photo) nextErrors.profilePhoto = "Add a photo for your membership card.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    setError("");
    if (validateStep(step)) setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      if (fieldErrors.profilePhoto || !photo) setStep(2);
      else if (values.isStudent === "yes" && (!values.institutionName || !values.institutionType || !values.courseOfStudy || !values.studyLevel))
        setStep(1);
      else setStep(0);
      return;
    }
    if (!config?.enabled) {
      setError("Registration is temporarily unavailable. Please retry later or contact support.");
      return;
    }
    if (!config.notice || !config.version || !acceptedNotice) {
      setError("Review and accept the current data-processing notice to continue.");
      return;
    }
    setSubmitting(true);
    const body = new FormData();
    Object.entries(values).forEach(([key, value]) => body.set(key, value));
    body.set("acceptedNotice", "true");
    body.set("website", "");
    body.set("profilePhoto", photo!);
    try {
      const response = await fetch("/api/register", { method: "POST", body });
      const result = (await response.json()) as RegistrationResult & {
        error?: string;
        issues?: Array<{ field: string; message: string }>;
      };
      if (!response.ok) {
        for (const issue of result.issues ?? []) {
          setFieldErrors((current) => ({ ...current, [issue.field]: issue.message }));
        }
        throw new Error(result.error || "Registration could not be completed.");
      }
      setRegistration(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Registration could not be completed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(field: string) {
    return fieldErrors[field] ? (
      <p className="mt-1 text-sm text-red-800" role="alert">
        {fieldErrors[field]}
      </p>
    ) : null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="site-container flex-1 py-10 sm:py-14">
        <header className="mx-auto mb-8 max-w-2xl text-center">
          <div className="eyebrow inline-flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" /> Membership registration
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Join the Arewa for Asiwaju Student Wing
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Complete the short form to create your membership record and personalized ID card. No
            email verification is required.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mx-auto mb-5 max-w-3xl border border-red-300 bg-red-50 p-4 text-sm text-red-900"
          >
            {error}
          </div>
        )}

        {registration ? (
          <section className="surface mx-auto max-w-3xl p-5 sm:p-8" aria-live="polite">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-900">
                <Check aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-ink">Membership created</h2>
                <p className="mt-1 text-sm text-muted">{registration.message}</p>
              </div>
            </div>
            {registration.membershipNumber && (
              <p className="mt-5 font-mono font-bold text-brand-forest">
                Membership number: {registration.membershipNumber}
              </p>
            )}
            {registration.previewUrl && (
              <iframe
                title="Preview of your personalized A4A membership ID card"
                src={registration.previewUrl}
                className="mt-5 h-[540px] w-full border border-line bg-white"
              />
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {registration.downloadUrl && (
                <a className="button-primary" href={registration.downloadUrl} rel="noreferrer">
                  Download ID card
                </a>
              )}
              {registration.previewUrl && (
                <a
                  className="button-secondary"
                  href={registration.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open card to print
                </a>
              )}
              <Link className="button-secondary" href="/retrieve-id">
                How to retrieve it later
              </Link>
            </div>
            {registration.membershipNumber && (
              <p className="mt-4 text-sm text-muted">
                Keep your membership number. Sign in later with your registered email or membership
                number and the password you created.
              </p>
            )}
          </section>
        ) : (
          <section className="surface mx-auto max-w-3xl p-5 sm:p-8">
            <ol aria-label="Registration steps" className="mb-8 grid grid-cols-4 gap-2">
              {steps.map((label, index) => (
                <li
                  key={label}
                  aria-current={step === index ? "step" : undefined}
                  className={`border-t-4 pt-2 text-xs font-semibold sm:text-sm ${step === index ? "border-brand-forest text-brand-forest" : step > index ? "border-green-500 text-ink" : "border-line text-muted"}`}
                >
                  <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">
                    {step > index ? <Check aria-hidden="true" className="h-3 w-3" /> : index + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ol>

            <form onSubmit={submit} noValidate>
              {step === 0 && (
                <fieldset className="space-y-5">
                  <legend className="text-xl font-bold text-ink">Personal information</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="field-label" htmlFor="firstName">
                        First name <span aria-hidden="true">*</span>
                      </label>
                      <input
                        className="field-control"
                        id="firstName"
                        autoComplete="given-name"
                        maxLength={100}
                        value={values.firstName}
                        onChange={(event) => update("firstName", event.target.value)}
                      />
                      {fieldError("firstName")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="lastName">
                        Last name <span aria-hidden="true">*</span>
                      </label>
                      <input
                        className="field-control"
                        id="lastName"
                        autoComplete="family-name"
                        maxLength={100}
                        value={values.lastName}
                        onChange={(event) => update("lastName", event.target.value)}
                      />
                      {fieldError("lastName")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="middleName">
                        Middle name <span className="font-normal text-muted">(optional)</span>
                      </label>
                      <input
                        className="field-control"
                        id="middleName"
                        autoComplete="additional-name"
                        maxLength={100}
                        value={values.middleName}
                        onChange={(event) => update("middleName", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="email">
                        Email address <span aria-hidden="true">*</span>
                      </label>
                      <input
                        className="field-control"
                        id="email"
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        value={values.email}
                        onChange={(event) => update("email", event.target.value)}
                      />
                      {fieldError("email")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="memberPassword">
                        Create password <span aria-hidden="true">*</span>
                      </label>
                      <input
                        className="field-control"
                        id="memberPassword"
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        maxLength={128}
                        value={values.password}
                        onChange={(event) => update("password", event.target.value)}
                      />
                      <p className="mt-1 text-xs text-muted">Use at least 12 characters to sign in and retrieve your card later.</p>
                      {fieldError("password")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="confirmMemberPassword">
                        Confirm password <span aria-hidden="true">*</span>
                      </label>
                      <input
                        className="field-control"
                        id="confirmMemberPassword"
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        maxLength={128}
                        value={values.confirmPassword}
                        onChange={(event) => update("confirmPassword", event.target.value)}
                      />
                      {fieldError("confirmPassword")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="phone">Phone number <span aria-hidden="true">*</span></label>
                      <input className="field-control" id="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="080… or +234…" value={values.phone} onChange={(event) => update("phone", event.target.value)} />
                      {fieldError("phone")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="state">
                        State of residence <span aria-hidden="true">*</span>
                      </label>
                      <select
                        className="field-control"
                        id="state"
                        value={values.stateOfResidence}
                        onChange={(event) => {
                          update("stateOfResidence", event.target.value);
                          update("lgaOfResidence", "");
                          update("ward", "");
                        }}
                      >
                        <option value="">Select a state</option>
                        {NORTHERN_STATES.map((state) => (
                          <option key={state.code} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                      {fieldError("stateOfResidence")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="lga">
                        LGA <span aria-hidden="true">*</span>
                      </label>
                      <select
                        className="field-control"
                        id="lga"
                        value={values.lgaOfResidence}
                        disabled={!selectedState}
                        onChange={(event) => {
                          update("lgaOfResidence", event.target.value);
                          update("ward", "");
                        }}
                      >
                        <option value="">
                          {selectedState ? "Select an LGA" : "Select a state first"}
                        </option>
                        {(selectedState?.lgas ?? []).map((lga) => (
                          <option key={lga} value={lga}>
                            {lga}
                          </option>
                        ))}
                      </select>
                      {fieldError("lgaOfResidence")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="ward">Ward <span aria-hidden="true">*</span></label>
                      <select className="field-control" id="ward" value={values.ward} disabled={!values.lgaOfResidence || wardOptions.length === 0} onChange={(event) => update("ward", event.target.value)}>
                        <option value="">{values.lgaOfResidence ? "Select a ward" : "Select an LGA first"}</option>
                        {wardOptions.map((ward) => <option key={ward} value={ward}>{ward}</option>)}
                      </select>
                      {fieldError("ward")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="gender">Gender <span className="font-normal text-muted">(optional)</span></label>
                      <select className="field-control" id="gender" value={values.gender} onChange={(event) => update("gender", event.target.value)}>
                        <option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="dateOfBirth">Date of birth <span className="font-normal text-muted">(optional)</span></label>
                      <input className="field-control" id="dateOfBirth" type="date" max={new Date().toISOString().slice(0, 10)} value={values.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} />
                      {fieldError("dateOfBirth")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="occupation">Occupation <span className="font-normal text-muted">(optional)</span></label>
                      <input className="field-control" id="occupation" maxLength={120} value={values.occupation} onChange={(event) => update("occupation", event.target.value)} />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="voterCard">Do you have a voter’s card? <span className="font-normal text-muted">(optional)</span></label>
                      <select className="field-control" id="voterCard" value={values.voterCard} onChange={(event) => {
                        update("voterCard", event.target.value);
                        if (event.target.value !== "yes") update("voterCardNumber", "");
                      }}>
                        <option value="">Prefer not to say</option><option value="yes">Yes</option><option value="no">No</option>
                      </select>
                    </div>
                    {values.voterCard === "yes" && (
                      <div>
                        <label className="field-label" htmlFor="voterCardNumber">Voter’s card number <span aria-hidden="true">*</span></label>
                        <input className="field-control" id="voterCardNumber" name="voterCardNumber" type="text" inputMode="text" autoComplete="off" autoCapitalize="characters" maxLength={50} value={values.voterCardNumber} onChange={(event) => update("voterCardNumber", event.target.value)} />
                        {fieldError("voterCardNumber")}
                        <p className="mt-1 text-xs text-muted">It is stored with your private membership record and never printed on your ID card.</p>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <label className="field-label" htmlFor="address">Residential address <span className="font-normal text-muted">(optional)</span></label>
                      <textarea className="field-control min-h-20" id="address" autoComplete="street-address" maxLength={500} value={values.address} onChange={(event) => update("address", event.target.value)} />
                    </div>
                  </div>
                  <p className="text-xs text-muted">
                    Ward selection is required. Gender, date of birth, address, and voter-card details are optional.
                  </p>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset className="space-y-5">
                  <legend className="text-xl font-bold text-ink">
                    Institution and membership details
                  </legend>
                  <p className="text-sm leading-relaxed text-muted">
                    Tell us whether you are currently a student. Student institution details help place you in the campus network.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="field-label" htmlFor="isStudent">Are you currently a student? <span aria-hidden="true">*</span></label>
                      <select className="field-control" id="isStudent" value={values.isStudent} onChange={(event) => update("isStudent", event.target.value)}><option value="yes">Yes</option><option value="no">No</option></select>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="institutionType">
                        Institution type {values.isStudent === "yes" && <span aria-hidden="true">*</span>}
                      </label>
                      <select
                        className="field-control"
                        id="institutionType"
                        value={values.institutionType}
                        onChange={(event) => update("institutionType", event.target.value)}
                      >
                        <option value="">Select type</option>
                        <option value="tertiary">Tertiary institution</option>
                        <option value="artisan">Vocational or artisan group</option>
                        <option value="youth_corps">National service</option>
                        <option value="general">Other</option>
                      </select>
                      {fieldError("institutionType")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="institutionName">
                        Institution name {values.isStudent === "yes" && <span aria-hidden="true">*</span>}
                      </label>
                      <input
                        className="field-control"
                        id="institutionName"
                        maxLength={255}
                        value={values.institutionName}
                        onChange={(event) => update("institutionName", event.target.value)}
                      />
                      {fieldError("institutionName")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="courseOfStudy">Course or programme {values.isStudent === "yes" && <span aria-hidden="true">*</span>}</label>
                      <input className="field-control" id="courseOfStudy" maxLength={255} value={values.courseOfStudy} onChange={(event) => update("courseOfStudy", event.target.value)} />
                      {fieldError("courseOfStudy")}
                    </div>
                    <div>
                      <label className="field-label" htmlFor="studyLevel">Current level / year {values.isStudent === "yes" && <span aria-hidden="true">*</span>}</label>
                      <input className="field-control" id="studyLevel" maxLength={80} placeholder="e.g. 300 level, Year 2" value={values.studyLevel} onChange={(event) => update("studyLevel", event.target.value)} />
                      {fieldError("studyLevel")}
                    </div>
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset className="space-y-5">
                  <legend className="text-xl font-bold text-ink">Profile photograph</legend>
                  <p className="text-sm leading-relaxed text-muted">
                    Choose a clear face photo. It is cropped to portrait proportions for the card
                    and stored privately with your membership.
                  </p>
                  <label
                    htmlFor="profilePhoto"
                    className="flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-line bg-paper p-5 text-center hover:border-brand-forest"
                  >
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt="Preview of your cropped membership card photo"
                        width={160}
                        height={208}
                        unoptimized
                        className="h-52 w-40 object-cover"
                      />
                    ) : (
                      <UserRound aria-hidden="true" className="h-12 w-12 text-muted" />
                    )}
                    <span className="inline-flex items-center gap-2 font-semibold text-brand-forest">
                      <Upload aria-hidden="true" className="h-4 w-4" />
                      {photoBusy
                        ? "Preparing photo…"
                        : photo
                          ? "Choose a different photo"
                          : "Choose a photo"}
                    </span>
                    <span className="text-xs text-muted">
                      JPEG, PNG, or WebP · up to 5 MB · minimum 128 × 128 px
                    </span>
                  </label>
                  <input
                    className="sr-only"
                    id="profilePhoto"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    onChange={(event) => void choosePhoto(event.target.files?.[0])}
                  />
                  {photo && (
                    <button type="button" className="button-quiet" onClick={removePhoto}>
                      Remove photo
                    </button>
                  )}
                  {fieldError("profilePhoto")}
                </fieldset>
              )}

              {step === 3 && (
                <fieldset className="space-y-5">
                  <legend className="text-xl font-bold text-ink">Review and submit</legend>
                  <dl className="grid gap-x-5 gap-y-4 border-y border-line py-5 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-bold uppercase text-muted">Full name</dt>
                      <dd className="mt-1 font-semibold">
                        {[values.firstName, values.middleName, values.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase text-muted">Email</dt>
                      <dd className="mt-1">{values.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase text-muted">Phone</dt>
                      <dd className="mt-1">{values.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase text-muted">Residence</dt>
                      <dd className="mt-1">
                        {values.lgaOfResidence}, {values.stateOfResidence}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase text-muted">Institution</dt>
                      <dd className="mt-1">{values.institutionName || "Not provided"}</dd>
                    </div>
                    {values.isStudent === "yes" && (
                      <div>
                        <dt className="text-xs font-bold uppercase text-muted">Student details</dt>
                        <dd className="mt-1">{[values.courseOfStudy, values.studyLevel].filter(Boolean).join(" · ")}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs font-bold uppercase text-muted">ID photo</dt>
                      <dd className="mt-1 flex items-center gap-2">
                        {photoUrl && (
                          <Image
                            src={photoUrl}
                            alt=""
                            width={36}
                            height={48}
                            unoptimized
                            className="h-12 w-9 object-cover"
                          />
                        )}{" "}
                        {photo ? "Ready" : "Not added"}
                      </dd>
                    </div>
                  </dl>
                  <div className="border border-line bg-paper p-4">
                    <h2 className="font-bold text-ink">
                      Data processing notice{config?.version ? ` · ${config.version}` : ""}
                    </h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                      {config?.notice ?? "Loading the current notice…"}
                    </p>
                  </div>
                  <label className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                    <input
                      className="mt-1 h-4 w-4 accent-brand-forest"
                      type="checkbox"
                      checked={acceptedNotice}
                      onChange={(event) => setAcceptedNotice(event.target.checked)}
                      required
                    />
                    <span>
                      I have read and agree to the data-processing notice above.{" "}
                      <span aria-hidden="true">*</span>
                    </span>
                  </label>
                  {!config?.enabled && (
                    <p className="text-sm text-red-800">
                      Registration is temporarily unavailable. You can still review your details;
                      please try again later.
                    </p>
                  )}
                  <div
                    className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                    aria-hidden="true"
                  >
                    <label htmlFor="website">Leave blank</label>
                    <input id="website" name="website" tabIndex={-1} autoComplete="off" />
                  </div>
                  <p className="text-xs leading-relaxed text-muted">
                    Your photo is stored privately for membership administration and ID-card
                    generation. Your contact and location details support membership administration;
                    student details help organise campus activity. Date of birth, gender, occupation,
                    address, and voter-card details are optional. A voter-card number is kept only
                    as long as needed for membership administration, is not printed on your card,
                    and can be corrected or deleted through a privacy request. We do not collect NIN.
                    The public QR check confirms card status only.
                  </p>
                </fieldset>
              )}

              <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-line pt-5 sm:flex-row">
                {step > 0 ? (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      setError("");
                      setStep((current) => current - 1);
                    }}
                  >
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    Previous
                  </button>
                ) : (
                  <span />
                )}
                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    className="button-primary justify-center"
                    onClick={nextStep}
                  >
                    Continue
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="button-primary justify-center"
                    disabled={submitting || photoBusy || !acceptedNotice || !config?.enabled}
                  >
                    {submitting ? "Creating membership and ID card…" : "Register and create my ID"}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return <RegistrationForm />;
}
