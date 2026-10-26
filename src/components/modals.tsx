import { useState } from "react";
import { Check, Plus, Smartphone, Trash2 } from "lucide-react";
import type {
  Ingredient,
  IngredientUnit,
  Product,
  Recipe,
  Stock,
  Transaction,
} from "../lib/app-data";
import { recipeUnit, rupiah, selectableUnits } from "../lib/app-data";
import { Button, Field, Modal } from "./ui";

export function StockModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (stock: Stock) => void;
}) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState<Stock["unit"]>("kg");
  const [priceMode, setPriceMode] = useState<"unit" | "total">("unit");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [minimum, setMinimum] = useState("");
  const price =
    priceMode === "total" && Number(qty)
      ? Number(totalPrice) / Number(qty)
      : Number(unitPrice);
  const save = () => {
    if (!name || !qty || !price) return;
    onSave({
      id: crypto.randomUUID(),
      name,
      quantity: Number(qty),
      unit,
      buyPrice: price,
      minimum: Number(minimum || 0),
      updatedAt: "Baru saja",
    });
  };
  return (
    <Modal title="Tambah bahan baru" onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Nama bahan">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Daging sapi"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Jumlah dibeli">
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Satuan">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as Stock["unit"])}
            >
              <option value="kg">Kilogram</option>
              <option value="gram">Gram</option>
              <option value="pcs">Pcs</option>
            </select>
          </Field>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Harga pembelian
          </p>
          <div className="mb-3 grid grid-cols-2 rounded-xl border border-line p-1 text-sm">
            <button
              onClick={() => setPriceMode("unit")}
              className={`rounded-lg px-3 py-2 font-bold ${priceMode === "unit" ? "bg-moss text-white" : "text-slate-500"}`}
            >
              Per satuan
            </button>
            <button
              onClick={() => setPriceMode("total")}
              className={`rounded-lg px-3 py-2 font-bold ${priceMode === "total" ? "bg-moss text-white" : "text-slate-500"}`}
            >
              Total satuan
            </button>
          </div>
          <input
            type="number"
            value={priceMode === "unit" ? unitPrice : totalPrice}
            onChange={(e) =>
              priceMode === "unit"
                ? setUnitPrice(e.target.value)
                : setTotalPrice(e.target.value)
            }
            placeholder="0"
            className="w-full rounded-xl border border-line px-3 py-3 text-sm"
          />
          {priceMode === "total" && (
            <p className="mt-2 text-xs text-moss">
              Harga per {unit}: {price ? rupiah(price) : "-"}
            </p>
          )}
        </div>
        <Field label="Pengingat stok menipis">
          <input
            type="number"
            value={minimum}
            onChange={(e) => setMinimum(e.target.value)}
            placeholder="Sisa berapa baru diingatkan"
          />
        </Field>
        <Button onClick={save}>Simpan bahan & pengeluaran</Button>
      </div>
    </Modal>
  );
}
export function RestockModal({
  stock,
  onClose,
  onSave,
}: {
  stock: Stock;
  onClose: () => void;
  onSave: (quantity: number, buyPrice: number, method: string) => void;
}) {
  const [quantity, setQuantity] = useState("");
  const [priceMode, setPriceMode] = useState<"unit" | "total">("unit");
  const [unitPrice, setUnitPrice] = useState(String(stock.buyPrice));
  const [totalPrice, setTotalPrice] = useState("");
  const [method, setMethod] = useState("Tunai");
  const price =
    priceMode === "total" && Number(quantity)
      ? Number(totalPrice) / Number(quantity)
      : Number(unitPrice);
  const total = Number(quantity) * price;
  const save = () => {
    if (!quantity || !price) return;
    onSave(Number(quantity), price, method);
  };
  return (
    <Modal title={`Tambah stok ${stock.name}`} onClose={onClose}>
      <div className="grid gap-4">
        <div className="rounded-xl bg-slate-50 p-3 text-sm">
          <p className="text-slate-500">Stok sekarang</p>
          <p className="mt-1 font-bold">
            {stock.quantity} {stock.unit}
          </p>
        </div>
        <Field label={`Jumlah dibeli, ${stock.unit}`}>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
          />
        </Field>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Harga pembelian
          </p>
          <div className="mb-3 grid grid-cols-2 rounded-xl border border-line p-1 text-sm">
            <button
              onClick={() => setPriceMode("unit")}
              className={`rounded-lg px-3 py-2 font-bold ${priceMode === "unit" ? "bg-moss text-white" : "text-slate-500"}`}
            >
              Per satuan
            </button>
            <button
              onClick={() => setPriceMode("total")}
              className={`rounded-lg px-3 py-2 font-bold ${priceMode === "total" ? "bg-moss text-white" : "text-slate-500"}`}
            >
              Total satuan
            </button>
          </div>
          <input
            type="number"
            value={priceMode === "unit" ? unitPrice : totalPrice}
            onChange={(e) =>
              priceMode === "unit"
                ? setUnitPrice(e.target.value)
                : setTotalPrice(e.target.value)
            }
            placeholder="0"
            className="w-full rounded-xl border border-line px-3 py-3 text-sm"
          />
          {priceMode === "total" && (
            <p className="mt-2 text-xs text-moss">
              Harga per {stock.unit}: {price ? rupiah(price) : "-"}
            </p>
          )}
        </div>
        <Field label="Metode pembayaran">
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>Tunai</option>
            <option>QRIS</option>
            <option>Transfer</option>
          </select>
        </Field>
        <p className="rounded-xl bg-[#edf6f2] px-3 py-2 text-xs leading-5 text-moss">
          Total satuan {total ? rupiah(total) : rupiah(0)} akan masuk ke
          pengeluaran.
        </p>
        <Button onClick={save}>Tambah stok & catat belanja</Button>
      </div>
    </Modal>
  );
}
export function EditStockModal({
  stock,
  onClose,
  onSave,
}: {
  stock: Stock;
  onClose: () => void;
  onSave: (stock: Stock) => void;
}) {
  const [name, setName] = useState(stock.name);
  const [quantity, setQuantity] = useState(String(stock.quantity));
  const [unit, setUnit] = useState<Stock["unit"]>(stock.unit);
  const [priceMode, setPriceMode] = useState<"unit" | "total">("unit");
  const [unitPrice, setUnitPrice] = useState(String(stock.buyPrice));
  const [totalPrice, setTotalPrice] = useState(
    String(stock.buyPrice * stock.quantity),
  );
  const [minimum, setMinimum] = useState(String(stock.minimum));
  const price =
    priceMode === "total" && Number(quantity)
      ? Number(totalPrice) / Number(quantity)
      : Number(unitPrice);
  const save = () => {
    if (!name || !quantity || !price) return;
    onSave({
      ...stock,
      name,
      quantity: Number(quantity),
      unit,
      buyPrice: price,
      minimum: Number(minimum || 0),
      updatedAt: "Baru saja",
    });
  };
  return (
    <Modal title="Ubah bahan" onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Nama bahan">
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stok tersedia">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
          <Field label="Satuan">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as Stock["unit"])}
            >
              <option value="kg">Kilogram</option>
              <option value="gram">Gram</option>
              <option value="pcs">Pcs</option>
            </select>
          </Field>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Harga pembelian
          </p>
          <div className="mb-3 grid grid-cols-2 rounded-xl border border-line p-1 text-sm">
            <button
              onClick={() => setPriceMode("unit")}
              className={`rounded-lg px-3 py-2 font-bold ${priceMode === "unit" ? "bg-moss text-white" : "text-slate-500"}`}
            >
              Per satuan
            </button>
            <button
              onClick={() => setPriceMode("total")}
              className={`rounded-lg px-3 py-2 font-bold ${priceMode === "total" ? "bg-moss text-white" : "text-slate-500"}`}
            >
              Total satuan
            </button>
          </div>
          <input
            type="number"
            value={priceMode === "unit" ? unitPrice : totalPrice}
            onChange={(e) =>
              priceMode === "unit"
                ? setUnitPrice(e.target.value)
                : setTotalPrice(e.target.value)
            }
            className="w-full rounded-xl border border-line px-3 py-3 text-sm"
          />
          {priceMode === "total" && (
            <p className="mt-2 text-xs text-moss">
              Harga per {unit}: {price ? rupiah(price) : "-"}
            </p>
          )}
        </div>
        <Field label="Pengingat stok menipis">
          <input
            type="number"
            value={minimum}
            onChange={(e) => setMinimum(e.target.value)}
          />
        </Field>
        <Button onClick={save}>Simpan perubahan</Button>
      </div>
    </Modal>
  );
}
export function DeleteModal({
  target,
  onClose,
  onDelete,
}: {
  target: { type: "stock" | "menu" | "recipe"; id: string; name: string };
  onClose: () => void;
  onDelete: () => void;
}) {
  const label =
    target.type === "stock"
      ? "bahan"
      : target.type === "recipe"
        ? "resep"
        : "menu";
  return (
    <Modal title={`Hapus ${label}`} onClose={onClose}>
      <p className="text-sm leading-6 text-slate-600">
        Hapus {target.name}? Data ini gak bisa dibalikin.
      </p>
      <div className="mt-5 flex gap-3">
        <Button secondary onClick={onClose}>
          Batal
        </Button>
        <button
          onClick={onDelete}
          className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
        >
          Hapus
        </button>
      </div>
    </Modal>
  );
}
export function MenuModal({
  stocks,
  recipes,
  product,
  onClose,
  onSave,
}: {
  stocks: Stock[];
  recipes: Recipe[];
  product?: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [source, setSource] = useState<"recipe" | "direct">(
    product?.recipeId ? "recipe" : "direct",
  );
  const [recipeId, setRecipeId] = useState(
    product?.recipeId || recipes[0]?.id || "",
  );
  const [ingredientId, setIngredientId] = useState(stocks[0]?.id || "");
  const selectedStock = stocks.find((stock) => stock.id === ingredientId);
  const [ingredientUnit, setIngredientUnit] = useState<IngredientUnit>(
    selectableUnits(selectedStock)[0] || "gram",
  );
  const [ingredientQty, setIngredientQty] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    product?.ingredients || [],
  );
  const selectedRecipe = recipes.find((recipe) => recipe.id === recipeId);
  const recipeIngredients =
    selectedRecipe?.ingredients.map((recipeIngredient) => {
      const current = ingredients.find(
        (ingredient) => ingredient.stockId === recipeIngredient.stockId,
      );
      const stock = stocks.find((item) => item.id === recipeIngredient.stockId);
      return (
        current || {
          stockId: recipeIngredient.stockId,
          quantity: 0,
          unit: selectableUnits(stock)[0] || "gram",
        }
      );
    }) || [];
  const changeRecipe = (id: string) => {
    setRecipeId(id);
    const recipe = recipes.find((item) => item.id === id);
    setIngredients(
      recipe?.ingredients.map((recipeIngredient) => {
        const stock = stocks.find(
          (item) => item.id === recipeIngredient.stockId,
        );
        return {
          stockId: recipeIngredient.stockId,
          quantity: 0,
          unit: selectableUnits(stock)[0] || "gram",
        };
      }) || [],
    );
  };
  const selectIngredient = (id: string) => {
    const stock = stocks.find((item) => item.id === id);
    setIngredientId(id);
    setIngredientUnit(selectableUnits(stock)[0] || "gram");
  };
  const addIngredient = () => {
    if (!ingredientId || !ingredientQty) return;
    setIngredients((current) => {
      const next = {
        stockId: ingredientId,
        quantity: Number(ingredientQty),
        unit: ingredientUnit,
      };
      return current.some((item) => item.stockId === ingredientId)
        ? current.map((item) => (item.stockId === ingredientId ? next : item))
        : [...current, next];
    });
    setIngredientQty("");
  };
  const updateIngredient = (
    stockId: string,
    field: "quantity" | "unit",
    value: number | IngredientUnit,
  ) =>
    setIngredients((current) =>
      current.map((ingredient) =>
        ingredient.stockId === stockId
          ? { ...ingredient, [field]: value }
          : ingredient,
      ),
    );
  const save = () => {
    const finalIngredients =
      source === "recipe" ? recipeIngredients : ingredients;
    if (
      !name ||
      !price ||
      !finalIngredients.length ||
      finalIngredients.some((ingredient) => ingredient.quantity <= 0)
    )
      return;
    onSave({
      id: product?.id || crypto.randomUUID(),
      name,
      price: Number(price),
      recipeId: source === "recipe" ? recipeId : undefined,
      ingredients: finalIngredients,
    });
  };
  return (
    <Modal title={product ? "Ubah menu" : "Buat menu baru"} onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Nama menu">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Bakso Telur"
          />
        </Field>
        <Field label="Harga jual">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
          />
        </Field>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Cara atur bahan
          </p>
          <div className="grid grid-cols-2 rounded-xl border border-line p-1 text-sm">
            <button
              onClick={() => setSource("recipe")}
              className={`rounded-lg px-3 py-2 font-bold ${source === "recipe" ? "bg-moss text-white" : "text-slate-500"}`}
            >
              Pakai resep
            </button>
            <button
              onClick={() => setSource("direct")}
              className={`rounded-lg px-3 py-2 font-bold ${source === "direct" ? "bg-moss text-white" : "text-slate-500"}`}
            >
              Racik sendiri
            </button>
          </div>
        </div>
        {source === "recipe" ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <Field label="Pilih resep">
              <select
                value={recipeId}
                onChange={(e) => changeRecipe(e.target.value)}
              >
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name} · {recipe.category}
                  </option>
                ))}
              </select>
            </Field>
            <p className="mb-2 mt-4 text-sm font-bold">
              Takaran untuk menu ini
            </p>
            {recipeIngredients.map((ingredient) => {
              const stock = stocks.find(
                (item) => item.id === ingredient.stockId,
              );
              return (
                <div
                  key={ingredient.stockId}
                  className="mt-2 grid grid-cols-[1fr_80px_75px] items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm"
                >
                  <span>{stock?.name}</span>
                  <input
                    type="number"
                    value={ingredient.quantity || ""}
                    onChange={(e) =>
                      updateIngredient(
                        ingredient.stockId,
                        "quantity",
                        Number(e.target.value),
                      )
                    }
                    placeholder="Jumlah"
                    className="w-full rounded-md border border-line px-2 py-1.5"
                  />
                  <select
                    value={recipeUnit(ingredient, stock)}
                    onChange={(e) =>
                      updateIngredient(
                        ingredient.stockId,
                        "unit",
                        e.target.value as IngredientUnit,
                      )
                    }
                    className="rounded-md border border-line bg-white px-2 py-1.5"
                  >
                    {selectableUnits(stock).map((unit) => (
                      <option key={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="mb-3 text-sm font-bold">Takaran per porsi</p>
            <div className="grid grid-cols-[1fr_72px_72px_auto] gap-2">
              <select
                value={ingredientId}
                onChange={(e) => selectIngredient(e.target.value)}
              >
                {stocks.map((stock) => (
                  <option key={stock.id} value={stock.id}>
                    {stock.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={ingredientQty}
                onChange={(e) => setIngredientQty(e.target.value)}
                placeholder="Jumlah"
              />
              <select
                value={ingredientUnit}
                onChange={(e) =>
                  setIngredientUnit(e.target.value as IngredientUnit)
                }
              >
                {selectableUnits(selectedStock).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <button
                onClick={addIngredient}
                className="rounded-lg bg-moss px-3 text-white"
              >
                <Plus size={18} />
              </button>
            </div>
            {ingredients.map((ingredient, idx) => (
              <div
                key={`${ingredient.stockId}-${idx}`}
                className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
              >
                <span>
                  {
                    stocks.find((stock) => stock.id === ingredient.stockId)
                      ?.name
                  }
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {ingredient.quantity}{" "}
                    {recipeUnit(
                      ingredient,
                      stocks.find((stock) => stock.id === ingredient.stockId),
                    )}
                  </span>
                  <button
                    onClick={() =>
                      setIngredients((current) =>
                        current.filter((_, index) => index !== idx),
                      )
                    }
                    className="text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button onClick={save}>
          {product ? "Simpan perubahan" : "Simpan menu"}
        </Button>
      </div>
    </Modal>
  );
}
export function RecipeModal({
  stocks,
  recipe,
  onClose,
  onSave,
}: {
  stocks: Stock[];
  recipe?: Recipe;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
}) {
  const [name, setName] = useState(recipe?.name || "");
  const [category, setCategory] = useState<Recipe["category"]>(
    recipe?.category || "Makanan",
  );
  const [ingredientId, setIngredientId] = useState(stocks[0]?.id || "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients || [],
  );
  const addIngredient = () => {
    if (!ingredientId) return;
    const stock = stocks.find((item) => item.id === ingredientId);
    if (
      !stock ||
      ingredients.some((ingredient) => ingredient.stockId === ingredientId)
    )
      return;
    setIngredients((current) => [
      ...current,
      {
        stockId: ingredientId,
        quantity: 0,
        unit: selectableUnits(stock)[0] || "gram",
      },
    ]);
  };
  const save = () => {
    if (!name || !ingredients.length) return;
    onSave({
      id: recipe?.id || crypto.randomUUID(),
      name,
      category,
      ingredients,
    });
  };
  return (
    <Modal title={recipe ? "Ubah resep" : "Buat resep baru"} onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Nama resep">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Es Teh Manis"
          />
        </Field>
        <Field label="Jenis resep">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Recipe["category"])}
          >
            <option>Makanan</option>
            <option>Minuman</option>
          </select>
        </Field>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="mb-1 text-sm font-bold">Bahan dalam resep</p>
          <p className="mb-3 text-xs text-slate-500">
            Takaran diisi nanti saat bikin menu.
          </p>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <select
              value={ingredientId}
              onChange={(e) => setIngredientId(e.target.value)}
            >
              {stocks.map((stock) => (
                <option key={stock.id} value={stock.id}>
                  {stock.name}
                </option>
              ))}
            </select>
            <button
              onClick={addIngredient}
              className="rounded-lg bg-moss px-3 text-white"
            >
              <Plus size={18} />
            </button>
          </div>
          {ingredients.map((ingredient, idx) => (
            <div
              key={`${ingredient.stockId}-${idx}`}
              className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
            >
              <span>
                {stocks.find((stock) => stock.id === ingredient.stockId)?.name}
              </span>
              <button
                onClick={() =>
                  setIngredients((current) =>
                    current.filter((_, index) => index !== idx),
                  )
                }
                className="text-rose-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <Button onClick={save}>
          {recipe ? "Simpan perubahan" : "Simpan resep"}
        </Button>
      </div>
    </Modal>
  );
}
export function FinanceModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
}) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Tunai");
  const save = () => {
    if (!title || !amount) return;
    onSave({
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      type,
      title,
      amount: Number(amount),
      method,
    });
  };
  return (
    <Modal title="Catat transaksi" onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Jenis transaksi">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </Field>
        <Field label="Keterangan">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Belanja sayur"
          />
        </Field>
        <Field label="Nominal">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Metode bayar">
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>Tunai</option>
            <option>QRIS</option>
            <option>Transfer</option>
          </select>
        </Field>
        <Button onClick={save}>Simpan transaksi</Button>
      </div>
    </Modal>
  );
}
export function ReceiptModal({
  sale,
  onClose,
}: {
  sale: Transaction;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState("");
  const send = () => {
    const normalized = phone.replace(/^0/, "62").replace(/\D/g, "");
    if (!normalized) return;
    const message = encodeURIComponent(
      `E-Struk\n${sale.title}\nTotal: ${rupiah(sale.amount)}\nPembayaran: ${sale.method}\nTerima kasih.`,
    );
    window.open(`https://wa.me/${normalized}?text=${message}`, "_blank");
  };
  return (
    <Modal title="Pembayaran berhasil" onClose={onClose}>
      <div className="rounded-xl bg-emerald-50 p-4 text-center text-emerald-800">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-white">
          <Check size={21} />
        </div>
        <p className="font-bold">{rupiah(sale.amount)}</p>
        <p className="mt-1 text-sm">Sudah masuk ke pembukuan dan stok.</p>
      </div>
      <div className="mt-5">
        <Field label="Nomor WhatsApp pembeli, opsional">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 08123456789"
          />
        </Field>
        <div className="mt-4 flex gap-3">
          <Button secondary onClick={onClose}>
            Selesai
          </Button>
          <Button onClick={send}>
            <Smartphone size={18} /> Kirim e-struk
          </Button>
        </div>
      </div>
    </Modal>
  );
}
