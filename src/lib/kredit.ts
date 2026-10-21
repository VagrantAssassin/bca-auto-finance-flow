export const STATUSES = [
  "Draft Dealer",
  "Menunggu ACC Pembeli",
  "Menunggu Submit Marketing",
  "Menunggu Approval Atasan",
  "Menunggu Upload TTD",
  "Menunggu Final ACC Marketing",
  "Selesai (Pencairan)",
] as const;
export type Status = (typeof STATUSES)[number] | "Ditolak";

export const ROLES = ["Sales Dealer", "Pembeli", "Marketing", "Atasan Marketing", "Admin Backoffice"] as const;
export type Role = (typeof ROLES)[number];

export interface Detail {
  nik: string; tglLahir: string; statusNikah: string;
  merk: string; tipe: string; warna: string; harga: number;
  dp: number; tenor: number; asuransi: string;
}

export interface Pengajuan {
  id: string;
  namaKonsumen: string;
  dokumen: { ktp: boolean; spk: boolean; buktiBayar: boolean };
  status: Status;
  detail?: Detail;
  ttdPembeli: boolean;
  ttdDealer: boolean;
  noPO?: string;
  tercairkan: boolean;
  createdAt: string;
}

export const SEED: Pengajuan[] = [
  {
    id: "KR-0001",
    namaKonsumen: "Budi Santoso",
    dokumen: { ktp: true, spk: true, buktiBayar: true },
    status: "Menunggu ACC Pembeli",
    ttdPembeli: false,
    ttdDealer: false,
    tercairkan: false,
    createdAt: "2026-10-20",
  },
];

export const rupiah = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

/** Applies a TTD upload and advances status once both parties have signed. */
export function applyTtd(p: Pengajuan, who: "pembeli" | "dealer"): Pengajuan {
  const next = { ...p, ttdPembeli: p.ttdPembeli || who === "pembeli", ttdDealer: p.ttdDealer || who === "dealer" };
  if (next.ttdPembeli && next.ttdDealer) next.status = "Menunggu Final ACC Marketing";
  return next;
}
