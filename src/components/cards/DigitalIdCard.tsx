"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Download, RefreshCw, QrCode } from "lucide-react";

export interface DigitalIdCardProps {
  fullName: string;
  membershipNumber: string;
  stateName: string;
  lgaName: string;
  institutionName?: string | null;
  issuedAt: string | Date;
  expiresAt: string | Date;
  qrCodeUrl?: string;
  onDownloadPdf?: () => void;
  isDownloading?: boolean;
}

export function DigitalIdCard({
  fullName,
  membershipNumber,
  stateName,
  lgaName,
  institutionName,
  issuedAt,
  expiresAt,
  qrCodeUrl,
  onDownloadPdf,
  isDownloading = false,
}: DigitalIdCardProps) {
  const [flipped, setFlipped] = useState(false);

  const formattedIssue = new Date(issuedAt).toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  });
  const formattedExpiry = new Date(expiresAt).toLocaleDateString("en-NG", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* 3D Card Container */}
      <div
        className="w-full aspect-[85.6/53.98] rounded-2xl relative select-none perspective group"
        aria-label="Membership card preview"
      >
        <div
          className={`w-full h-full transition-all duration-700 [transform-style:preserve-3d] rounded-2xl shadow-xl hover:shadow-2xl border border-[#C59B27]/40 ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ---------------- FRONT FACE ---------------- */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl overflow-hidden bg-gradient-to-br from-[#FBF9F5] to-[#f4eee1] flex flex-col justify-between p-4 sm:p-5 border border-white/60">
            {/* Top Brand Banner */}
            <div className="flex items-center justify-between border-b border-[#E2E6E2] pb-3">
              <div className="flex items-center gap-2.5">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold tracking-tight text-[#0B4619]">
                    AREWA FOR ASIWAJU
                  </h3>
                  <p className="text-[10px] font-semibold text-[#C59B27] tracking-wider uppercase">
                    Membership card preview — not issued
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Image
                  src="/brand/08-logo-apc.png"
                  alt="APC logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
                <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-900">
                  PREVIEW · NOT ISSUED
                </div>
              </div>
            </div>

            {/* Middle Section: Photo / Details / QR */}
            <div className="grid grid-cols-12 gap-3 items-center my-auto">
              {/* Photo Box */}
              <div className="col-span-3 sm:col-span-3">
                <div className="aspect-[3/4] w-full rounded-xl bg-gradient-to-b from-[#0B4619]/15 to-[#0B4619]/30 border-2 border-[#C59B27] flex flex-col items-center justify-center text-center p-1 relative shadow-inner overflow-hidden">
                  <div className="h-9 w-9 rounded-full bg-[#0B4619] text-[#C59B27] font-bold text-xs flex items-center justify-center shadow">
                    {fullName.charAt(0)}
                  </div>
                  <span className="text-[9px] font-bold text-[#0B4619] mt-1">PHOTO</span>
                  <span className="text-[8px] text-[#64748B]">MEMBER</span>
                </div>
              </div>

              {/* Member Details */}
              <div className="col-span-6 sm:col-span-6 space-y-1">
                <div>
                  <span className="text-[8px] font-bold tracking-wider text-[#64748B] uppercase block">
                    Full Name
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#121713] line-clamp-1">
                    {fullName}
                  </span>
                </div>

                <div>
                  <span className="text-[8px] font-bold tracking-wider text-[#64748B] uppercase block">
                    Membership ID
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-[#0B4619] tracking-wider">
                    {membershipNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[9px]">
                  <div>
                    <span className="text-[7.5px] font-semibold text-[#64748B] block">STATE</span>
                    <span className="font-bold text-[#121713]">{stateName}</span>
                  </div>
                  <div>
                    <span className="text-[7.5px] font-semibold text-[#64748B] block">LGA</span>
                    <span className="font-bold text-[#121713] truncate block">{lgaName}</span>
                  </div>
                </div>

                {institutionName && (
                  <div>
                    <span className="text-[7.5px] font-semibold text-[#64748B] block">
                      CAMPUS CHAPTER
                    </span>
                    <span className="text-[9px] font-medium text-[#121713] truncate block">
                      {institutionName}
                    </span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="col-span-3 sm:col-span-3 flex flex-col items-center justify-center text-center">
                <div className="p-1 rounded-lg bg-white border border-[#C59B27] shadow-sm">
                  {qrCodeUrl ? (
                    <Image
                      src={qrCodeUrl}
                      alt="Verification QR"
                      width={64}
                      height={64}
                      unoptimized
                      className="h-14 w-14 sm:h-16 sm:w-16 object-contain"
                    />
                  ) : (
                    <div className="h-14 w-14 flex items-center justify-center bg-gray-50 text-[#0B4619]">
                      <QrCode className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <span className="text-[8px] font-bold text-[#0B4619] mt-1">SCAN TO VERIFY</span>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center justify-between border-t border-[#E2E6E2] pt-2 text-[9px] text-[#64748B] font-medium">
              <span>ISSUED: {formattedIssue}</span>
              <span className="text-[#0B4619] font-semibold flex items-center gap-1">
                <RefreshCw className="h-2.5 w-2.5" /> Membership details
              </span>
              <span>EXPIRES: {formattedExpiry}</span>
            </div>
          </div>

          {/* ---------------- BACK FACE ---------------- */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden bg-[#121713] text-white flex flex-col justify-between p-4 sm:p-5 border border-[#C59B27]/40 shadow-inner">
            <div className="border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold text-[#C59B27] uppercase tracking-wider">
                Card information
              </h4>
            </div>

            <div className="space-y-1.5 text-[9px] sm:text-[10px] text-white/80 leading-relaxed my-auto">
              <p>Scan the QR code to check the card&apos;s current status.</p>
              <p>Keep the QR code and its verification link private.</p>
              <p>The membership number identifies a record; it is not a password.</p>
            </div>

            <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[8px] text-white/60 font-mono">
              <span>Do not share this card&apos;s verification details</span>
              <span className="text-[#C59B27] font-sans font-semibold flex items-center gap-1">
                <RefreshCw className="h-2.5 w-2.5" /> Use the Flip card control below
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 w-full">
        {onDownloadPdf && (
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloading}
            className="btn-primary w-full sm:w-auto shadow-md"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating preview PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download preview PDF
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setFlipped(!flipped)}
          className="btn-outline text-xs px-3 py-2.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Flip Card
        </button>
      </div>
    </div>
  );
}
