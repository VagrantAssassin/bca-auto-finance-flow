import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ROLES, SEED, STATUSES, applyTtd, rupiah, type Detail, type Pengajuan, type Role, type Status } from "@/lib/kredit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PT JKL – Sistem Pengajuan Kredit Kendaraan" },
      { name: "description", content: "Demo alur pengajuan kredit kendaraan bermotor PT JKL antar role." },
      { property: "og:title", content: "PT JKL – Sistem Pengajuan Kredit Kendaraan" },
      { property: "og:description", content: "Demo alur pengajuan kredit kendaraan bermotor PT JKL antar role." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const KEY = "jkl-pengajuan-v2";
const selectCls = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

function statusBadge(s: Status, cair?: boolean) {
  if (cair) return <Badge className="bg-success text-primary-foreground">Tercairkan</Badge>;
  if (s === "Ditolak") return <Badge variant="destructive">Ditolak</Badge>;
  if (s === "Selesai (Pencairan)") return <Badge className="bg-success text-primary-foreground">{s}</Badge>;
  return <Badge variant="secondary" className="border border-primary/30 text-primary">{s}</Badge>;
}

function Index() {
  const [data, setData] = useState<Pengajuan[]>(SEED);
  const [loaded, setLoaded] = useState(false);
  const [role, setRole] = useState<Role>("Pembeli");
  const [modal, setModal] = useState<{ type: string; id?: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setData(JSON.parse(raw));
    const r = localStorage.getItem(KEY + "-role");
    if (r) setRole(r as Role);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(data));
  }, [data, loaded]);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY + "-role", role);
  }, [role, loaded]);

  const update = (id: string, fn: (p: Pengajuan) => Pengajuan) => setData((d) => d.map((p) => (p.id === id ? fn(p) : p)));
  const current = data.find((p) => p.id === modal?.id);
  const close = () => setModal(null);

  const visible = (() => {
    switch (role) {
      case "Atasan Marketing": return data.filter((p) => p.status === "Menunggu Approval Atasan");
      case "Admin Backoffice": return data.filter((p) => p.status === "Selesai (Pencairan)");
      default: return data;
    }
  })();

  const actions = (p: Pengajuan): ReactNode => {
    const s = p.status;
    if (role === "Pembeli") {
      if (s === "Menunggu Upload TTD")
        return p.ttdPembeli ? <span className="text-xs text-muted-foreground">TTD Pembeli ✓</span> :
          <Button size="sm" onClick={() => update(p.id, (x) => applyTtd(x, "pembeli"))}>Upload TTD Pembeli</Button>;
    }
    if (role === "Sales Dealer (Penjual)") {
      if (s === "Menunggu ACC Penjual") return <Button size="sm" onClick={() => setModal({ type: "acc", id: p.id })}>Lihat Data & ACC</Button>;
      if (s === "Menunggu Upload TTD")
        return p.ttdDealer ? <span className="text-xs text-muted-foreground">TTD Penjual ✓</span> :
          <Button size="sm" onClick={() => update(p.id, (x) => applyTtd(x, "dealer"))}>Upload TTD Penjual</Button>;
    }
    if (role === "Marketing") {
      if (s === "Menunggu Submit Marketing") return <Button size="sm" onClick={() => setModal({ type: "lengkapi", id: p.id })}>Lengkapi Data</Button>;
      if (s === "Menunggu Final ACC Marketing")
        return <Button size="sm" onClick={() => update(p.id, (x) => ({ ...x, status: "Selesai (Pencairan)" }))}>Final ACC Dokumen</Button>;
    }
    if (role === "Atasan Marketing") return <Button size="sm" onClick={() => setModal({ type: "review", id: p.id })}>Review</Button>;
    if (role === "Admin Backoffice")
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setModal({ type: "po", id: p.id })}>Lihat Dokumen PO</Button>
          {!p.tercairkan && <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => update(p.id, (x) => ({ ...x, tercairkan: true }))}>Eksekusi Pencairan Dana</Button>}
        </div>
      );
    return <span className="text-xs text-muted-foreground">—</span>;
  };

  const stats = STATUSES.map((s) => ({ s, n: data.filter((p) => p.status === s).length }));

  return (
    <div className="min-h-screen min-w-[1100px]">
      <header className="bg-header text-header-foreground shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background text-sm font-extrabold tracking-wider text-primary">JKL</div>
            <div>
              <div className="text-lg font-bold tracking-wide">PT JKL</div>
              <div className="text-xs opacity-80">Sistem Pengajuan Kredit Kendaraan Bermotor</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm opacity-90">Login As</span>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="h-9 rounded-md bg-background px-3 text-sm font-medium text-foreground">
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <Button size="sm" variant="secondary" onClick={() => { if (confirm("Reset semua data demo?")) setData(SEED); }}>Reset Demo</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-8 py-8">
        <div className="grid grid-cols-7 gap-3">
          {stats.map(({ s, n }) => (
            <Card key={s} className="gap-1 py-3">
              <CardContent className="px-3">
                <div className="text-2xl font-bold text-primary">{n}</div>
                <div className="text-[11px] leading-tight text-muted-foreground">{s}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dashboard {role}</CardTitle>
              <CardDescription>
                {role === "Atasan Marketing" ? "Pengajuan menunggu approval Anda." :
                  role === "Admin Backoffice" ? "Pengajuan siap dicairkan." : "Daftar pengajuan kredit."}
              </CardDescription>
            </div>
            {role === "Pembeli" && <Button onClick={() => setModal({ type: "baru" })}>+ Buat Pengajuan Baru</Button>}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Pengajuan</TableHead>
                  <TableHead>Nama Konsumen</TableHead>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Tidak ada pengajuan.</TableCell></TableRow>
                )}
                {visible.map((p) => (
                  <TableRow key={p.id} className={p.tercairkan ? "bg-success-soft hover:bg-success-soft" : ""}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.namaKonsumen}</TableCell>
                    <TableCell>{p.detail ? `${p.detail.merk} ${p.detail.tipe}` : "—"}</TableCell>
                    <TableCell>{p.detail ? rupiah(p.detail.harga) : "—"}</TableCell>
                    <TableCell>
                      {statusBadge(p.status, p.tercairkan)}
                      {p.status === "Menunggu Upload TTD" && (
                        <div className="mt-1 text-[11px] text-muted-foreground">Pembeli {p.ttdPembeli ? "✓" : "✗"} · Penjual {p.ttdDealer ? "✓" : "✗"}</div>
                      )}
                    </TableCell>
                    <TableCell>{actions(p)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!modal} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-2xl">
          {modal?.type === "baru" && (
            <BaruForm onSubmit={(nama, dok) => {
              const id = `KR-${String(data.length + 1).padStart(4, "0")}-${Date.now().toString().slice(-3)}`;
              setData((d) => [...d, { id, namaKonsumen: nama, dokumen: dok, status: "Menunggu ACC Penjual", ttdPembeli: false, ttdDealer: false, tercairkan: false, createdAt: new Date().toISOString().slice(0, 10) }]);
              close();
            }} />
          )}
          {modal?.type === "acc" && current && (
            <>
              <DialogHeader><DialogTitle>Verifikasi & ACC Pengajuan Konsumen</DialogTitle></DialogHeader>
              <Info rows={[["No. Pengajuan", current.id], ["Nama Konsumen", current.namaKonsumen], ["KTP", current.dokumen.ktp ? "Terupload" : "-"], ["SPK", current.dokumen.spk ? "Terupload" : "-"], ["Bukti Tanda Jadi", current.dokumen.buktiBayar ? "Terupload" : "-"]]} />
              <DialogFooter>
                <Button variant="outline" onClick={close}>Batal</Button>
                <Button onClick={() => { update(current.id, (x) => ({ ...x, status: "Menunggu Submit Marketing" })); close(); }}>ACC Pengajuan</Button>
              </DialogFooter>
            </>
          )}
          {modal?.type === "lengkapi" && current && (
            <LengkapiForm nama={current.namaKonsumen} onSubmit={(detail) => { update(current.id, (x) => ({ ...x, detail, status: "Menunggu Approval Atasan" })); close(); }} />
          )}
          {modal?.type === "review" && current?.detail && (
            <>
              <DialogHeader><DialogTitle>Review Pengajuan {current.id}</DialogTitle></DialogHeader>
              <DetailView p={current} />
              <DialogFooter>
                <Button variant="destructive" onClick={() => { update(current.id, (x) => ({ ...x, status: "Ditolak" })); close(); }}>Reject</Button>
                <Button onClick={() => {
                  update(current.id, (x) => ({ ...x, status: "Menunggu Upload TTD", noPO: `PO/JKL/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}` }));
                  close();
                }}>Approve & Generate PO</Button>
              </DialogFooter>
            </>
          )}
          {modal?.type === "po" && current && (
            <>
              <DialogHeader><DialogTitle>Dokumen Purchase Order</DialogTitle></DialogHeader>
              <POView p={current} />
              <DialogFooter><Button onClick={close}>Tutup</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[180px_1fr] gap-y-2 text-sm">
      {rows.map(([k, v]) => (<Fragment key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></Fragment>))}
    </dl>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="border-b pb-1 text-sm font-semibold text-primary">{title}</h4>
      {children}
    </div>
  );
}

function DetailView({ p }: { p: Pengajuan }) {
  const d = p.detail!;
  const pokok = d.harga - d.dp;
  return (
    <div className="space-y-4">
      <Section title="Data Konsumen"><Info rows={[["Nama", p.namaKonsumen], ["NIK", d.nik], ["Tanggal Lahir", d.tglLahir], ["Status", d.statusNikah]]} /></Section>
      <Section title="Data Kendaraan"><Info rows={[["Merk / Tipe", `${d.merk} ${d.tipe}`], ["Warna", d.warna], ["Harga OTR", rupiah(d.harga)]]} /></Section>
      <Section title="Data Pinjaman"><Info rows={[["DP", rupiah(d.dp)], ["Pokok Pinjaman", rupiah(pokok)], ["Tenor", `${d.tenor} bulan`], ["Asuransi", d.asuransi]]} /></Section>
    </div>
  );
}

function POView({ p }: { p: Pengajuan }) {
  const d = p.detail;
  return (
    <div className="rounded-md border bg-muted p-6 font-mono text-xs leading-relaxed">
      <div className="text-center text-sm font-bold">PT JKL</div>
      <div className="mb-4 text-center">SURAT PERSETUJUAN PEMBIAYAAN / PURCHASE ORDER</div>
      <div>No. PO        : {p.noPO ?? "-"}</div>
      <div>No. Pengajuan : {p.id}</div>
      <div>Konsumen      : {p.namaKonsumen} (NIK {d?.nik})</div>
      <div>Kendaraan     : {d?.merk} {d?.tipe} – {d?.warna}</div>
      <div>Harga OTR     : {rupiah(d?.harga ?? 0)}</div>
      <div>Uang Muka     : {rupiah(d?.dp ?? 0)}</div>
      <div>Pokok Hutang  : {rupiah((d?.harga ?? 0) - (d?.dp ?? 0))}</div>
      <div>Tenor         : {d?.tenor} bulan · Asuransi {d?.asuransi}</div>
      <p className="mt-4">Dengan ini PT JKL menyatakan menyetujui pembiayaan kendaraan tersebut di atas dan meminta dealer untuk melakukan penyerahan unit kepada konsumen. Dokumen telah ditandatangani oleh Konsumen dan Dealer.</p>
      <div className="mt-6 flex justify-between"><span>TTD Pembeli: ✓</span><span>TTD Penjual: ✓</span><span>Marketing: ✓</span></div>
    </div>
  );
}

function BaruForm({ onSubmit }: { onSubmit: (nama: string, dok: Pengajuan["dokumen"]) => void }) {
  const [nama, setNama] = useState("");
  const [dok, setDok] = useState({ ktp: false, spk: false, buktiBayar: false });
  const items: [keyof typeof dok, string][] = [["ktp", "KTP"], ["spk", "SPK"], ["buktiBayar", "Bukti Bayar Tanda Jadi"]];
  const ok = nama.trim() && dok.ktp && dok.spk && dok.buktiBayar;
  return (
    <>
      <DialogHeader><DialogTitle>Form Pengajuan Kredit (Pembeli)</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1"><Label>Nama Pembeli / Pemohon</Label><Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="cth. Siti Rahayu" /></div>
        {items.map(([k, l]) => (
          <div key={k} className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm">{l}</span>
            {dok[k] ? <span className="text-sm font-medium text-success">✓ {k}_dummy.pdf</span> :
              <Button size="sm" variant="outline" onClick={() => setDok({ ...dok, [k]: true })}>Upload</Button>}
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button disabled={!ok} onClick={() => onSubmit(nama.trim(), dok)}>Submit ke Penjual / Dealer</Button>
      </DialogFooter>
    </>
  );
}

function F({ l, children }: { l: string; children: ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{l}</Label>{children}</div>;
}

function LengkapiForm({ nama, onSubmit }: { nama: string; onSubmit: (d: Detail) => void }) {
  const [d, setD] = useState<Detail>({ nik: "", tglLahir: "", statusNikah: "Belum Menikah", merk: "", tipe: "", warna: "", harga: 0, dp: 0, tenor: 36, asuransi: "All Risk" });
  const set = <K extends keyof Detail>(k: K, v: Detail[K]) => setD({ ...d, [k]: v });
  const ok = d.nik.length >= 16 && d.tglLahir && d.merk && d.tipe && d.warna && d.harga > 0 && d.dp > 0 && d.dp < d.harga;
  return (
    <>
      <DialogHeader><DialogTitle>Lengkapi Data – {nama}</DialogTitle></DialogHeader>
      <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
        <Section title="Data Konsumen">
          <div className="grid grid-cols-3 gap-3">
            <F l="NIK (16 digit)"><Input value={d.nik} maxLength={16} onChange={(e) => set("nik", e.target.value.replace(/\D/g, ""))} /></F>
            <F l="Tanggal Lahir"><Input type="date" value={d.tglLahir} onChange={(e) => set("tglLahir", e.target.value)} /></F>
            <F l="Status"><select className={selectCls} value={d.statusNikah} onChange={(e) => set("statusNikah", e.target.value)}><option>Belum Menikah</option><option>Menikah</option><option>Cerai</option></select></F>
          </div>
        </Section>
        <Section title="Data Kendaraan">
          <div className="grid grid-cols-2 gap-3">
            <F l="Merk"><Input value={d.merk} onChange={(e) => set("merk", e.target.value)} placeholder="Toyota" /></F>
            <F l="Tipe"><Input value={d.tipe} onChange={(e) => set("tipe", e.target.value)} placeholder="Avanza 1.5 G" /></F>
            <F l="Warna"><Input value={d.warna} onChange={(e) => set("warna", e.target.value)} placeholder="Hitam" /></F>
            <F l="Harga OTR (Rp)"><Input type="number" value={d.harga || ""} onChange={(e) => set("harga", Number(e.target.value))} /></F>
          </div>
        </Section>
        <Section title="Data Pinjaman">
          <div className="grid grid-cols-3 gap-3">
            <F l="DP (Rp)"><Input type="number" value={d.dp || ""} onChange={(e) => set("dp", Number(e.target.value))} /></F>
            <F l="Tenor"><select className={selectCls} value={d.tenor} onChange={(e) => set("tenor", Number(e.target.value))}>{[12, 24, 36, 48, 60].map((t) => <option key={t} value={t}>{t} bulan</option>)}</select></F>
            <F l="Asuransi"><select className={selectCls} value={d.asuransi} onChange={(e) => set("asuransi", e.target.value)}><option>All Risk</option><option>Total Loss Only</option><option>Kombinasi</option></select></F>
          </div>
          {d.harga > 0 && <p className="text-xs text-muted-foreground">Pokok pinjaman: {rupiah(d.harga - d.dp)}</p>}
        </Section>
      </div>
      <DialogFooter><Button disabled={!ok} onClick={() => onSubmit(d)}>Submit ke Atasan</Button></DialogFooter>
    </>
  );
}
