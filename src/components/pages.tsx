import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  Check,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Minus,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  ShoppingBasket,
  Trash2,
  Wallet,
} from "lucide-react";
import type {
  CartItem,
  Page,
  Product,
  Recipe,
  Stock,
  Transaction,
} from "../lib/app-data";
import {
  displayQty,
  grams,
  recipeUnit,
  rupiah,
  usedStockUnits,
} from "../lib/app-data";
import { Button, Title } from "./ui";

export function Dashboard({
  income,
  expense,
  lowStock,
  transactions,
  setPage,
}: {
  income: number;
  expense: number;
  lowStock: Stock[];
  transactions: Transaction[];
  setPage: (page: Page) => void;
}) {
  const cards = [
    {
      label: "Pemasukan hari ini",
      value: rupiah(income),
      icon: ArrowUpRight,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pengeluaran hari ini",
      value: rupiah(expense),
      icon: ArrowDownToLine,
      tone: "bg-rose-50 text-rose-700",
    },
    {
      label: "Saldo usaha",
      value: rupiah(income - expense),
      icon: Wallet,
      tone: "bg-blue-50 text-blue-700",
    },
  ];
  return (
    <>
      <Title
        title="Halo"
        desc="Pantau operasional tanpa ribet."
        action={
          <Button onClick={() => setPage("cashier")}>
            <ShoppingBasket size={18} /> Buka Kasir
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-line bg-white p-5"
          >
            <div
              className={`mb-5 grid h-10 w-10 place-items-center rounded-xl ${card.tone}`}
            >
              <card.icon size={20} />
            </div>
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              {card.value}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="mb-6 flex justify-between">
            <div>
              <h2 className="font-bold">Penjualan 7 hari terakhir</h2>
              <p className="mt-1 text-sm text-slate-500">
                Total pemasukan dari kasir
              </p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              +12,5%
            </span>
          </div>
          <MiniChart />
          <div className="mt-5 flex justify-between border-t border-line pt-4 text-xs text-slate-400">
            <span>13 Okt</span>
            <span>14 Okt</span>
            <span>15 Okt</span>
            <span>16 Okt</span>
            <span>17 Okt</span>
            <span>18 Okt</span>
            <span>Hari ini</span>
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Stok perlu dicek</h2>
              <p className="mt-1 text-sm text-slate-500">
                Sudah mencapai angka pengingat
              </p>
            </div>
            <CircleAlert
              className={
                lowStock.length ? "text-amber-500" : "text-emerald-500"
              }
              size={21}
            />
          </div>
          {lowStock.length ? (
            lowStock.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-t border-line py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-rose-600">
                    Sisa {item.quantity} {item.unit}
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            ))
          ) : (
            <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
              Aman. Semua bahan masih cukup.
            </p>
          )}
          <button
            onClick={() => setPage("stock")}
            className="mt-2 text-sm font-bold text-moss hover:underline"
          >
            Cek semua stok
          </button>
        </section>
      </div>
      <section className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Transaksi terbaru</h2>
            <p className="mt-1 text-sm text-slate-500">
              Aktivitas kas dan penjualan
            </p>
          </div>
          <button
            onClick={() => setPage("finance")}
            className="text-sm font-bold text-moss"
          >
            Lihat semua
          </button>
        </div>
        <TransactionList transactions={transactions.slice(0, 4)} />
      </section>
    </>
  );
}
export function MiniChart() {
  const bars = [38, 59, 42, 73, 57, 88, 66];
  return (
    <div className="flex h-40 items-end gap-3 pt-5">
      {bars.map((h, i) => (
        <div key={i} className="group flex h-full flex-1 items-end">
          <div
            style={{ height: `${h}%` }}
            className={`w-full rounded-t-md transition ${i === 6 ? "bg-moss" : "bg-[#dcebe5] group-hover:bg-[#9bcbbb]"}`}
          />
        </div>
      ))}
    </div>
  );
}
export function StockPage({
  stocks,
  onAdd,
  onRestock,
  onEdit,
  onDelete,
}: {
  stocks: Stock[];
  onAdd: () => void;
  onRestock: (stock: Stock) => void;
  onEdit: (stock: Stock) => void;
  onDelete: (stock: Stock) => void;
}) {
  const [query, setQuery] = useState("");
  const shown = stocks.filter((stock) =>
    stock.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Title
        title="Stok Bahan"
        desc="Atur bahan mentah supaya jualan gak putus."
        action={
          <Button onClick={onAdd}>
            <Plus size={18} /> Tambah bahan
          </Button>
        }
      />
      <div className="mb-5 flex max-w-md items-center gap-2 rounded-xl border border-line bg-white px-3">
        <Search size={18} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari bahan..."
          className="w-full bg-transparent py-3 text-sm outline-none"
        />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <div className="min-w-210">
          <div className="grid grid-cols-[minmax(220px,1.65fr)_minmax(180px,1fr)_minmax(145px,.85fr)_minmax(120px,.7fr)_120px] gap-5 border-b border-line bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            <span>Nama bahan</span>
            <span>Stok tersedia</span>
            <span>Harga beli</span>
            <span>Status</span>
            <span className="text-right">Aksi</span>
          </div>
          {shown.map((stock) => {
            const low = stock.quantity <= stock.minimum;
            return (
              <div
                key={stock.id}
                className="grid grid-cols-[minmax(220px,1.65fr)_minmax(180px,1fr)_minmax(145px,.85fr)_minmax(120px,.7fr)_120px] items-center gap-5 border-b border-line px-5 py-4 last:border-0 hover:bg-slate-50/70"
              >
                <div>
                  <p className="font-semibold">{stock.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Terakhir diubah {stock.updatedAt}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {stock.quantity} {stock.unit}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Pengingat: {stock.minimum} {stock.unit}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {rupiah(stock.buyPrice)}
                  <span className="font-normal text-slate-400">
                    /{stock.unit}
                  </span>
                </p>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${low ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
                >
                  {low ? "Perlu beli" : "Aman"}
                </span>
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onRestock(stock)}
                    className="rounded-lg border border-line p-2 text-slate-500 hover:bg-white"
                    title="Tambah stok"
                  >
                    <Plus size={17} />
                  </button>
                  <button
                    onClick={() => onEdit(stock)}
                    className="rounded-lg border border-line p-2 text-slate-500 hover:bg-white"
                    title="Ubah bahan"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(stock)}
                    className="rounded-lg border border-line p-2 text-rose-600 hover:bg-rose-50"
                    title="Hapus bahan"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
export function MenuPage({
  products,
  recipes,
  stocks,
  onAdd,
  onEdit,
  onDelete,
  onAddRecipe,
  onEditRecipe,
  onDeleteRecipe,
}: {
  products: Product[];
  recipes: Recipe[];
  stocks: Stock[];
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddRecipe: () => void;
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipe: Recipe) => void;
}) {
  const [tab, setTab] = useState<"menu" | "recipe">("menu");
  const getStock = (id: string) => stocks.find((stock) => stock.id === id);
  const resolvedIngredients = (product: Product) => product.ingredients;
  return (
    <>
      <Title
        title="Menu & Resep"
        desc={
          tab === "menu"
            ? "Menu bisa pakai resep atau racik sendiri."
            : "Simpan racikan makanan dan minuman biar tinggal pakai."
        }
        action={
          <Button onClick={tab === "menu" ? onAdd : onAddRecipe}>
            <Plus size={18} /> {tab === "menu" ? "Buat menu" : "Buat resep"}
          </Button>
        }
      />
      <div className="mb-6 flex w-fit rounded-xl border border-line bg-white p-1">
        <button
          onClick={() => setTab("menu")}
          className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === "menu" ? "bg-moss text-white" : "text-slate-500"}`}
        >
          Menu jualan
        </button>
        <button
          onClick={() => setTab("recipe")}
          className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === "recipe" ? "bg-moss text-white" : "text-slate-500"}`}
        >
          Resep dasar
        </button>
      </div>
      {tab === "menu" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const recipe = recipes.find((item) => item.id === product.recipeId);
            const ingredients = resolvedIngredients(product);
            return (
              <article
                key={product.id}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf6f2] text-moss">
                    <ReceiptText size={21} />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(product)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      title="Ubah menu"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                      title="Hapus menu"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
                <h2 className="mt-5 font-bold">{product.name}</h2>
                <p className="mt-1 text-lg font-bold text-moss">
                  {rupiah(product.price)}
                </p>
                <p
                  className={`mt-3 w-fit rounded-full px-2.5 py-1 text-xs font-bold ${recipe ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}
                >
                  {recipe ? `Pakai resep: ${recipe.name}` : "Racik langsung"}
                </p>
                <div className="mt-5 border-t border-line pt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Takaran per porsi
                  </p>
                  {ingredients.length ? (
                    ingredients.map((ingredient) => (
                      <div
                        key={ingredient.stockId}
                        className="flex justify-between py-1 text-sm"
                      >
                        <span className="text-slate-600">
                          {getStock(ingredient.stockId)?.name ||
                            "Bahan terhapus"}
                        </span>
                        <span className="font-semibold">
                          {ingredient.quantity}{" "}
                          {recipeUnit(ingredient, getStock(ingredient.stockId))}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-rose-600">Belum ada bahan.</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <article
              key={recipe.id}
              className="rounded-2xl border border-line bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-[#edf6f2] px-2.5 py-1 text-xs font-bold text-moss">
                  {recipe.category}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditRecipe(recipe)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    title="Ubah resep"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    onClick={() => onDeleteRecipe(recipe)}
                    className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                    title="Hapus resep"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <h2 className="mt-5 font-bold">{recipe.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {recipe.ingredients.length} bahan tersedia untuk dipakai
              </p>
              <div className="mt-5 border-t border-line pt-4">
                {recipe.ingredients.map((ingredient) => (
                  <div
                    key={ingredient.stockId}
                    className="py-1 text-sm font-medium text-slate-600"
                  >
                    {getStock(ingredient.stockId)?.name || "Bahan terhapus"}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
export function Cashier({
  products,
  stocks,
  cart,
  total,
  onAdd,
  onUpdate,
  onCheckout,
}: {
  products: Product[];
  stocks: Stock[];
  cart: CartItem[];
  total: number;
  onAdd: (p: Product) => void;
  onUpdate: (id: string, q: number) => void;
  onCheckout: (method: string) => void;
}) {
  const [method, setMethod] = useState("Tunai");
  const [search, setSearch] = useState("");
  const canFulfill = (p: Product) =>
    p.ingredients.every((i) => {
      const s = stocks.find((st) => st.id === i.stockId);
      return s && grams(s) >= usedStockUnits(i, s);
    });
  return (
    <>
      <Title
        title="Kasir"
        desc="Pilih pesanan, stok bakal kepotong otomatis."
      />
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <section>
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-white px-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu..."
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {products
              .filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((product) => {
                const ready = canFulfill(product);
                return (
                  <button
                    key={product.id}
                    onClick={() => ready && onAdd(product)}
                    className={`rounded-2xl border bg-white p-5 text-left transition ${ready ? "border-line hover:-translate-y-0.5 hover:border-moss hover:shadow-md" : "border-rose-200 opacity-65"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf6f2] text-moss">
                        <ReceiptText size={19} />
                      </div>
                      {!ready && (
                        <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
                          Bahan kurang
                        </span>
                      )}
                    </div>
                    <p className="mt-5 font-bold">{product.name}</p>
                    <p className="mt-1 font-bold text-moss">
                      {rupiah(product.price)}
                    </p>
                  </button>
                );
              })}
          </div>
        </section>
        <section className="h-fit rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bold">Pesanan sekarang</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
              {cart.reduce((sum, x) => sum + x.quantity, 0)} item
            </span>
          </div>
          {cart.length === 0 ? (
            <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-slate-200 p-5 text-center">
              <ShoppingBasket size={26} className="mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">Belum ada pesanan.</p>
            </div>
          ) : (
            <div>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between border-b border-line py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{item.product.name}</p>
                    <p className="text-xs text-slate-500">
                      {rupiah(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdate(item.product.id, item.quantity - 1)
                      }
                      className="rounded-md border border-line p-1"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-4 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdate(item.product.id, item.quantity + 1)
                      }
                      className="rounded-md border border-line p-1"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-5 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">{rupiah(total)}</span>
              </div>
              <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Pembayaran
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm text-ink"
                >
                  <option>Tunai</option>
                  <option>QRIS</option>
                  <option>Transfer</option>
                </select>
              </label>
              <Button onClick={() => onCheckout(method)}>
                <Check size={18} /> Bayar {rupiah(total)}
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
export function Finance({
  transactions,
  income,
  expense,
  onAdd,
}: {
  transactions: Transaction[];
  income: number;
  expense: number;
  onAdd: () => void;
}) {
  return (
    <>
      <Title
        title="Keuangan"
        desc="Catat uang masuk dan keluar tanpa buku tulis."
        action={
          <Button onClick={onAdd}>
            <Plus size={18} /> Catat transaksi
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Pemasukan"
          value={income}
          icon={ArrowUpRight}
          tone="text-emerald-700 bg-emerald-50"
        />
        <Metric
          label="Pengeluaran"
          value={expense}
          icon={ArrowDownToLine}
          tone="text-rose-700 bg-rose-50"
        />
        <Metric
          label="Saldo usaha"
          value={income - expense}
          icon={Banknote}
          tone="text-blue-700 bg-blue-50"
        />
      </div>
      <section className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-bold">Riwayat transaksi</h2>
        <TransactionList transactions={transactions} />
      </section>
    </>
  );
}
export function Metric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Wallet;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div
        className={`mb-4 grid h-9 w-9 place-items-center rounded-xl ${tone}`}
      >
        <Icon size={18} />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{rupiah(value)}</p>
    </div>
  );
}
export function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div>
      {transactions.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between gap-3 border-t border-line py-3 first:border-t-0"
        >
          <div
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${t.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
          >
            {t.type === "income" ? (
              <ArrowUpRight size={18} />
            ) : (
              <ArrowDownToLine size={18} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{t.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {t.date} · {t.method}
            </p>
          </div>
          <p
            className={`text-sm font-bold ${t.type === "income" ? "text-emerald-700" : "text-rose-700"}`}
          >
            {t.type === "income" ? "+" : "-"}
            {rupiah(t.amount)}
          </p>
        </div>
      ))}
    </div>
  );
}
export function Report({
  transactions,
  income,
  expense,
}: {
  transactions: Transaction[];
  income: number;
  expense: number;
}) {
  const sold = transactions.filter((t) => t.type === "income").length;
  return (
    <>
      <Title
        title="Laporan Usaha"
        desc="Ringkasan yang bisa dipakai buat ambil keputusan."
        action={
          <Button secondary onClick={() => window.print()}>
            <ReceiptText size={18} /> Cetak laporan
          </Button>
        }
      />
      <div className="rounded-2xl border border-line bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
          <div>
            <h2 className="text-lg font-bold">Laporan Oktober 2026</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sampai 19 Oktober 2026
            </p>
          </div>
          <span className="rounded-full bg-[#edf6f2] px-3 py-1.5 text-xs font-bold text-moss">
            Usaha aktif
          </span>
        </div>
        <div className="grid gap-4 py-6 sm:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">Total pemasukan</p>
            <p className="mt-1 text-xl font-bold">{rupiah(income)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total pengeluaran</p>
            <p className="mt-1 text-xl font-bold">{rupiah(expense)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Laba bersih sementara</p>
            <p className="mt-1 text-xl font-bold text-moss">
              {rupiah(income - expense)}
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold">{sold} transaksi tercatat</p>
            <p className="mt-1 text-sm text-slate-500">
              Pajak belum dicatat. Tambahkan lewat Keuangan kalau ada.
            </p>
          </div>
          <span className="mt-3 inline-block rounded-lg bg-white px-3 py-2 text-sm font-bold shadow-sm sm:mt-0">
            Margin:{" "}
            {income ? Math.round(((income - expense) / income) * 100) : 0}%
          </span>
        </div>
      </div>
    </>
  );
}
