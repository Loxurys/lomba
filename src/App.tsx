import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  BarChart3,
  Bell,
  ClipboardList,
  LayoutDashboard,
  Menu as MenuIcon,
  Package,
  ShoppingBasket,
  Wallet,
} from "lucide-react";
import {
  grams,
  initialProducts,
  initialRecipes,
  initialStock,
  initialTransactions,
  load,
  usedStockUnits,
} from "./lib/app-data";
import type {
  CartItem,
  Page,
  Product,
  Recipe,
  Stock,
  Transaction,
} from "./lib/app-data";
import { NavItem } from "./components/ui";
import type { NavigationItem } from "./components/ui";
import {
  Cashier,
  Dashboard,
  Finance,
  MenuPage,
  Report,
  StockPage,
} from "./components/pages";
import {
  DeleteModal,
  EditStockModal,
  FinanceModal,
  MenuModal,
  ReceiptModal,
  RecipeModal,
  RestockModal,
  StockModal,
} from "./components/modals";

function App() {
  const [page, setPage] = useState<Page>("cashier");
  const [stocks, setStocks] = useState<Stock[]>(() =>
    load("app-stocks", initialStock),
  );
  const [products, setProducts] = useState<Product[]>(() =>
    load("app-products", initialProducts),
  );
  const [recipes, setRecipes] = useState<Recipe[]>(() =>
    load("app-recipes", initialRecipes),
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    load("app-transactions", initialTransactions),
  );
  const [demoData, setDemoData] = useState(
    () => localStorage.getItem("app-mode") !== "empty",
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modal, setModal] = useState<
    | "stock"
    | "restock"
    | "edit-stock"
    | "menu"
    | "edit-menu"
    | "recipe"
    | "edit-recipe"
    | "finance"
    | "receipt"
    | null
  >(null);
  const [restockTarget, setRestockTarget] = useState<Stock | null>(null);
  const [editStockTarget, setEditStockTarget] = useState<Stock | null>(null);
  const [editMenuTarget, setEditMenuTarget] = useState<Product | null>(null);
  const [editRecipeTarget, setEditRecipeTarget] = useState<Recipe | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "stock" | "menu" | "recipe";
    id: string;
    name: string;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [lastSale, setLastSale] = useState<Transaction | null>(null);

  useEffect(() => {
    localStorage.setItem("app-stocks", JSON.stringify(stocks));
    localStorage.setItem("app-products", JSON.stringify(products));
    localStorage.setItem("app-recipes", JSON.stringify(recipes));
    localStorage.setItem("app-transactions", JSON.stringify(transactions));
    localStorage.setItem("app-mode", demoData ? "sample" : "empty");
    localStorage.setItem("app-last-sync", new Date().toISOString());
  }, [stocks, products, recipes, transactions, demoData]);
  useEffect(() => {
    const channel = new BroadcastChannel("app-sync");
    channel.onmessage = () => {
      setStocks(load("app-stocks", initialStock));
      setProducts(load("app-products", initialProducts));
      setRecipes(load("app-recipes", initialRecipes));
      setTransactions(load("app-transactions", initialTransactions));
      setDemoData(localStorage.getItem("app-mode") !== "empty");
      setNotice("Data diperbarui dari perangkat lain");
    };
    return () => channel.close();
  }, []);
  const sync = () => {
    new BroadcastChannel("app-sync").postMessage("sync");
    setNotice("Data tersimpan di perangkat ini");
    setTimeout(() => setNotice(""), 2500);
  };
  const switchData = () => {
    const nextDemoData = !demoData;
    const nextStocks = nextDemoData ? initialStock : [];
    const nextProducts = nextDemoData ? initialProducts : [];
    const nextRecipes = nextDemoData ? initialRecipes : [];
    const nextTransactions = nextDemoData ? initialTransactions : [];
    localStorage.setItem("app-stocks", JSON.stringify(nextStocks));
    localStorage.setItem("app-products", JSON.stringify(nextProducts));
    localStorage.setItem("app-recipes", JSON.stringify(nextRecipes));
    localStorage.setItem("app-transactions", JSON.stringify(nextTransactions));
    localStorage.setItem("app-mode", nextDemoData ? "sample" : "empty");
    setStocks(nextStocks);
    setProducts(nextProducts);
    setRecipes(nextRecipes);
    setTransactions(nextTransactions);
    setDemoData(nextDemoData);
    setCart([]);
    setNotice(
      nextDemoData
        ? "Data contoh dimuat ulang"
        : "Data kosong aktif. Siap dites dari nol.",
    );
    new BroadcastChannel("app-sync").postMessage("sync");
  };
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const lowStock = stocks.filter((s) => s.quantity <= s.minimum);
  const productIngredients = (product: Product) => product.ingredients;
  const nav: NavigationItem[] = [
    { id: "cashier", label: "Kasir", icon: ShoppingBasket },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "stock", label: "Stok Bahan", icon: Package },
    { id: "menu", label: "Menu & Resep", icon: ClipboardList },
    { id: "finance", label: "Keuangan", icon: Wallet },
    { id: "report", label: "Laporan", icon: BarChart3 },
  ];
  const addToCart = (product: Product) =>
    setCart((current) => {
      const found = current.find((item) => item.product.id === product.id);
      return found
        ? current.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...current, { product, quantity: 1 }];
    });
  const updateCart = (id: string, quantity: number) =>
    setCart((current) =>
      quantity <= 0
        ? current.filter((item) => item.product.id !== id)
        : current.map((item) =>
            item.product.id === id ? { ...item, quantity } : item,
          ),
    );
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const canFulfill = (item: CartItem) =>
    productIngredients(item.product).every((ingredient) => {
      const stock = stocks.find((s) => s.id === ingredient.stockId);
      return (
        stock &&
        grams(stock) >= usedStockUnits(ingredient, stock) * item.quantity
      );
    });
  const checkout = (method: string) => {
    if (!cart.length) return;
    if (cart.some((item) => !canFulfill(item))) {
      setNotice("Stok bahan kurang. Cek bahan yang merah dulu.");
      return;
    }
    const sale: Transaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      type: "income",
      title: cart.map((i) => `${i.product.name} x${i.quantity}`).join(", "),
      amount: total,
      method,
    };
    setStocks((current) =>
      current.map((stock) => {
        const used = cart.reduce((sum, item) => {
          const ingredient = productIngredients(item.product).find(
            (i) => i.stockId === stock.id,
          );
          return (
            sum +
            (ingredient ? usedStockUnits(ingredient, stock) : 0) * item.quantity
          );
        }, 0);
        return used
          ? {
              ...stock,
              quantity:
                stock.unit === "kg"
                  ? (grams(stock) - used) / 1000
                  : stock.quantity - used,
              updatedAt: "Baru saja",
            }
          : stock;
      }),
    );
    setTransactions((current) => [sale, ...current]);
    setLastSale(sale);
    setCart([]);
    setModal("receipt");
    sync();
  };

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-ink">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white lg:flex">
        <div className="flex items-center gap-3 px-6 py-7">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-moss text-white">
            <ShoppingBasket size={21} />
          </div>
          <p className="font-bold tracking-tight">ini_nama</p>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {nav.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={page === item.id}
              onClick={() => setPage(item.id)}
            />
          ))}
        </nav>
      </aside>
      <main className="lg:ml-64">
        <header className="no-print sticky top-0 z-20 flex h-18 items-center justify-between border-b border-line bg-[#f8f7f2]/95 px-4 backdrop-blur sm:px-8">
          <button className="lg:hidden rounded-lg p-2">
            <MenuIcon />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">Dashboard</p>
            <p className="text-xs text-slate-500">Senin, 19 Oktober 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
              Tersimpan lokal
            </div>
            <button
              onClick={switchData}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${demoData ? "border-moss bg-[#edf6f2] text-moss" : "border-line bg-white text-slate-600 hover:bg-slate-50"}`}
              title="Ganti data pengujian"
            >
              {demoData ? "Data contoh" : "Data kosong"}
            </button>
            <button
              onClick={sync}
              className="rounded-lg border border-line bg-white p-2 text-slate-600 hover:bg-slate-50"
              title="Simpan data"
            >
              <ArrowDownToLine size={18} />
            </button>
            <button className="relative rounded-lg border border-line bg-white p-2 text-slate-600">
              <Bell size={18} />
              {lowStock.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>
          </div>
        </header>
        {notice && (
          <div className="no-print fixed right-5 top-20 z-50 rounded-lg bg-ink px-4 py-3 text-sm text-white shadow-lg">
            {notice}
          </div>
        )}
        <div className="mx-auto max-w-7xl p-4 pb-24 sm:p-8 lg:pb-8">
          {page === "dashboard" && (
            <Dashboard
              income={income}
              expense={expense}
              lowStock={lowStock}
              transactions={transactions}
              setPage={setPage}
            />
          )}
          {page === "stock" && (
            <StockPage
              stocks={stocks}
              onAdd={() => setModal("stock")}
              onRestock={(stock) => {
                setRestockTarget(stock);
                setModal("restock");
              }}
              onEdit={(stock) => {
                setEditStockTarget(stock);
                setModal("edit-stock");
              }}
              onDelete={(stock) =>
                setDeleteTarget({
                  type: "stock",
                  id: stock.id,
                  name: stock.name,
                })
              }
            />
          )}
          {page === "menu" && (
            <MenuPage
              products={products}
              recipes={recipes}
              stocks={stocks}
              onAdd={() => setModal("menu")}
              onEdit={(product) => {
                setEditMenuTarget(product);
                setModal("edit-menu");
              }}
              onDelete={(product) =>
                setDeleteTarget({
                  type: "menu",
                  id: product.id,
                  name: product.name,
                })
              }
              onAddRecipe={() => setModal("recipe")}
              onEditRecipe={(recipe) => {
                setEditRecipeTarget(recipe);
                setModal("edit-recipe");
              }}
              onDeleteRecipe={(recipe) =>
                setDeleteTarget({
                  type: "recipe",
                  id: recipe.id,
                  name: recipe.name,
                })
              }
            />
          )}
          {page === "cashier" && (
            <Cashier
              products={products}
              stocks={stocks}
              cart={cart}
              total={total}
              onAdd={addToCart}
              onUpdate={updateCart}
              onCheckout={checkout}
            />
          )}
          {page === "finance" && (
            <Finance
              transactions={transactions}
              income={income}
              expense={expense}
              onAdd={() => setModal("finance")}
            />
          )}
          {page === "report" && (
            <Report
              transactions={transactions}
              income={income}
              expense={expense}
            />
          )}
        </div>
      </main>
      <nav className="no-print fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-line bg-white px-1 py-2 lg:hidden">
        {nav.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex min-w-13 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium ${page === item.id ? "text-moss" : "text-slate-500"}`}
          >
            <item.icon size={19} />
            {item.label.split(" ")[0]}
          </button>
        ))}
      </nav>
      {modal === "stock" && (
        <StockModal
          onClose={() => setModal(null)}
          onSave={(stock) => {
            setStocks((v) => [stock, ...v]);
            setTransactions((v) => [
              {
                id: crypto.randomUUID(),
                date: new Date().toISOString().slice(0, 10),
                type: "expense",
                title: `Belanja stok: ${stock.name}`,
                amount: stock.quantity * stock.buyPrice,
                method: "Tunai",
              },
              ...v,
            ]);
            setModal(null);
            sync();
          }}
        />
      )}
      {modal === "restock" && restockTarget && (
        <RestockModal
          stock={restockTarget}
          onClose={() => {
            setModal(null);
            setRestockTarget(null);
          }}
          onSave={(quantity, buyPrice, method) => {
            setStocks((items) =>
              items.map((stock) =>
                stock.id === restockTarget.id
                  ? {
                      ...stock,
                      quantity: stock.quantity + quantity,
                      buyPrice,
                      updatedAt: "Baru saja",
                    }
                  : stock,
              ),
            );
            setTransactions((items) => [
              {
                id: crypto.randomUUID(),
                date: new Date().toISOString().slice(0, 10),
                type: "expense",
                title: `Belanja stok: ${restockTarget.name}`,
                amount: quantity * buyPrice,
                method,
              },
              ...items,
            ]);
            setModal(null);
            setRestockTarget(null);
            sync();
          }}
        />
      )}
      {modal === "edit-stock" && editStockTarget && (
        <EditStockModal
          stock={editStockTarget}
          onClose={() => {
            setModal(null);
            setEditStockTarget(null);
          }}
          onSave={(updated) => {
            setStocks((items) =>
              items.map((stock) => (stock.id === updated.id ? updated : stock)),
            );
            setModal(null);
            setEditStockTarget(null);
            sync();
          }}
        />
      )}
      {modal === "menu" && (
        <MenuModal
          stocks={stocks}
          recipes={recipes}
          onClose={() => setModal(null)}
          onSave={(product) => {
            setProducts((v) => [product, ...v]);
            setModal(null);
            sync();
          }}
        />
      )}
      {modal === "edit-menu" && editMenuTarget && (
        <MenuModal
          stocks={stocks}
          recipes={recipes}
          product={editMenuTarget}
          onClose={() => {
            setModal(null);
            setEditMenuTarget(null);
          }}
          onSave={(updated) => {
            setProducts((items) =>
              items.map((product) =>
                product.id === updated.id ? updated : product,
              ),
            );
            setModal(null);
            setEditMenuTarget(null);
            sync();
          }}
        />
      )}
      {modal === "recipe" && (
        <RecipeModal
          stocks={stocks}
          onClose={() => setModal(null)}
          onSave={(recipe) => {
            setRecipes((items) => [recipe, ...items]);
            setModal(null);
            sync();
          }}
        />
      )}
      {modal === "edit-recipe" && editRecipeTarget && (
        <RecipeModal
          stocks={stocks}
          recipe={editRecipeTarget}
          onClose={() => {
            setModal(null);
            setEditRecipeTarget(null);
          }}
          onSave={(updated) => {
            setRecipes((items) =>
              items.map((recipe) =>
                recipe.id === updated.id ? updated : recipe,
              ),
            );
            setModal(null);
            setEditRecipeTarget(null);
            sync();
          }}
        />
      )}
      {modal === "finance" && (
        <FinanceModal
          onClose={() => setModal(null)}
          onSave={(t) => {
            setTransactions((v) => [t, ...v]);
            setModal(null);
            sync();
          }}
        />
      )}
      {modal === "receipt" && lastSale && (
        <ReceiptModal sale={lastSale} onClose={() => setModal(null)} />
      )}
      {deleteTarget && (
        <DeleteModal
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={() => {
            if (deleteTarget.type === "stock") {
              setStocks((items) =>
                items.filter((stock) => stock.id !== deleteTarget.id),
              );
              setProducts((items) =>
                items.map((product) => ({
                  ...product,
                  ingredients: product.ingredients.filter(
                    (ingredient) => ingredient.stockId !== deleteTarget.id,
                  ),
                })),
              );
              setRecipes((items) =>
                items.map((recipe) => ({
                  ...recipe,
                  ingredients: recipe.ingredients.filter(
                    (ingredient) => ingredient.stockId !== deleteTarget.id,
                  ),
                })),
              );
            } else if (deleteTarget.type === "recipe") {
              setRecipes((items) =>
                items.filter((recipe) => recipe.id !== deleteTarget.id),
              );
              setProducts((items) =>
                items.map((product) =>
                  product.recipeId === deleteTarget.id
                    ? { ...product, recipeId: undefined }
                    : product,
                ),
              );
            } else {
              setProducts((items) =>
                items.filter((product) => product.id !== deleteTarget.id),
              );
            }
            setNotice(`${deleteTarget.name} dihapus`);
            setDeleteTarget(null);
            sync();
          }}
        />
      )}
    </div>
  );
}

export default App;
