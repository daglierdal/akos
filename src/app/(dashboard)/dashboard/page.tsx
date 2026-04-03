export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Aktif Projeler
          </h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Toplam Müşteri
          </h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Bekleyen Teklifler
          </h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-6 min-h-[300px]">
        <h2 className="text-lg font-semibold">Son Aktiviteler</h2>
        <p className="mt-4 text-muted-foreground">
          Henüz aktivite bulunmuyor.
        </p>
      </div>
    </div>
  );
}
