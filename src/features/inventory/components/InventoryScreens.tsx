"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import { useMembers } from "@/features/members/hooks/use-members";
import { TaskTeamPicker } from "@/features/tasks/components/TaskTeamPicker";
import { formatDisplayDate } from "@/utils/date";
import { inventoryAssignmentApi } from "../api/inventory-assignment.api";
import { inventoryCategoryApi } from "../api/inventory-category.api";
import { inventoryItemApi } from "../api/inventory-item.api";
import { inventoryStockApi } from "../api/inventory-stock.api";
import { useInventoryAssignment } from "../hooks/use-inventory-assignment";
import { useInventoryAssignments } from "../hooks/use-inventory-assignments";
import { useInventoryCategories } from "../hooks/use-inventory-categories";
import { useInventoryCategory } from "../hooks/use-inventory-category";
import { useInventoryItem } from "../hooks/use-inventory-item";
import { useInventoryItems } from "../hooks/use-inventory-items";
import { useInventorySummary } from "../hooks/use-inventory-summary";
import { useInventoryTransactions } from "../hooks/use-inventory-transactions";
import type {
  InventoryAdjustmentDirection,
  InventoryAssignment,
  InventoryCategory,
  InventoryItem,
  InventoryItemFormValues,
  InventoryReturnStatus,
  InventoryTransactionType,
} from "../types/inventory.types";
import {
  canAdjustInventoryItem,
  canAssignInventoryItem,
  canManageInventory,
  canManageInventoryCategories,
  canReturnInventoryAssignment,
  canStockInInventoryItem,
  canStockOutInventoryItem,
} from "../types/inventory.types";
import {
  buildCreateCategoryPayload,
  buildCreateItemPayload,
  buildUpdateCategoryPayload,
  buildUpdateItemPayload,
  itemToFormValues,
  validateNonNegativeInteger,
  validatePositiveInteger,
} from "../utils/inventory-form";
import {
  formatInventoryNumber,
  formatInventoryStatus,
  formatReturnStatus,
  formatTransactionType,
  getStockLevelLabel,
} from "../utils/inventory-display";
import { getInventoryErrorMessage } from "../utils/inventory-errors";
import styles from "./Inventory.module.css";

const RETURN_STATUSES: InventoryReturnStatus[] = ["OUTSTANDING", "PARTIALLY_RETURNED", "RETURNED"];

const TRANSACTION_TYPES: InventoryTransactionType[] = [
  "STOCK_IN",
  "STOCK_OUT",
  "ADJUSTMENT_IN",
  "ADJUSTMENT_OUT",
  "ASSIGN",
  "RETURN",
];

export const StockLevelIndicator = ({
  item,
}: {
  item: Pick<InventoryItem, "isOutOfStock" | "isLowStock">;
}) => {
  const label = getStockLevelLabel(item);
  const className = item.isOutOfStock
    ? `${styles.badge} ${styles.badgeDanger}`
    : item.isLowStock
      ? `${styles.badge} ${styles.badgeWarning}`
      : styles.badge;
  return <span className={className}>{label}</span>;
};

const StatusBadge = ({ active }: { active: boolean }) => (
  <span className={active ? styles.badge : `${styles.badge} ${styles.badgeWarning}`}>
    {active ? "Active" : "Inactive"}
  </span>
);

const SectionLinks = () => (
  <div className={styles.actions}>
    <Link className={styles.secondaryButton} href="/inventory/categories">
      Categories
    </Link>
    <Link className={styles.secondaryButton} href="/inventory/assignments">
      Assignments
    </Link>
    <Link className={styles.secondaryButton} href="/inventory/transactions">
      Transactions
    </Link>
  </div>
);

const SummaryCards = () => {
  const { viewer } = useAuth();
  const { summary, loading, error, refresh } = useInventorySummary(viewer);

  return (
    <section className={styles.card}>
      <div className={styles.actions}>
        <h2>Inventory Summary</h2>
        <button className={styles.secondaryButton} type="button" onClick={() => void refresh()}>
          Refresh Summary
        </button>
      </div>
      {loading && <LoadingState message="Loading Inventory summary..." />}
      {error && !loading && (
        <ErrorState message={getInventoryErrorMessage(error)} onRetry={() => void refresh()} />
      )}
      {summary && !loading && !error && (
        <div className={styles.grid}>
          <Metric label="Active Items" value={summary.activeItemCount} />
          <Metric label="Inactive Items" value={summary.inactiveItemCount} />
          <Metric label="Low Stock Items" value={summary.lowStockItemCount} />
          <Metric label="Out of Stock Items" value={summary.outOfStockItemCount} />
          <Metric label="Outstanding Assignments" value={summary.outstandingAssignmentCount} />
        </div>
      )}
    </section>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className={styles.detailItem}>
    <span>{label}</span>
    <strong>{formatInventoryNumber(value)}</strong>
  </div>
);

const ItemFilters = ({ hook }: { hook: ReturnType<typeof useInventoryItems> }) => {
  const filters = hook.draftFilters;
  return (
    <section className={styles.card}>
      <div className={styles.filters}>
        <label className={styles.field}>
          <span>Search SKU or Item name</span>
          <input
            className={styles.input}
            maxLength={180}
            value={filters.q}
            onChange={(event) => hook.setDraftFilters({ ...filters, q: event.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span>Category ID</span>
          <input
            className={styles.input}
            value={filters.categoryId}
            onChange={(event) =>
              hook.setDraftFilters({ ...filters, categoryId: event.target.value })
            }
          />
        </label>
        <label className={styles.field}>
          <span>Team ID</span>
          <input
            className={styles.input}
            value={filters.teamId}
            onChange={(event) => hook.setDraftFilters({ ...filters, teamId: event.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span>Status</span>
          <select
            className={styles.select}
            value={filters.isActive}
            onChange={(event) =>
              hook.setDraftFilters({
                ...filters,
                isActive: event.target.value as typeof filters.isActive,
              })
            }
          >
            <option value="ALL">All</option>
            <option value="TRUE">Active</option>
            <option value="FALSE">Inactive</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Returnable</span>
          <select
            className={styles.select}
            value={filters.isReturnable}
            onChange={(event) =>
              hook.setDraftFilters({
                ...filters,
                isReturnable: event.target.value as typeof filters.isReturnable,
              })
            }
          >
            <option value="ALL">All</option>
            <option value="TRUE">Returnable</option>
            <option value="FALSE">Consumable</option>
          </select>
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={filters.lowStockOnly}
            onChange={(event) =>
              hook.setDraftFilters({ ...filters, lowStockOnly: event.target.checked })
            }
          />
          Low stock only
        </label>
        <button className={styles.primaryButton} type="button" onClick={hook.applyFilters}>
          Apply
        </button>
        <button className={styles.secondaryButton} type="button" onClick={hook.resetFilters}>
          Reset
        </button>
      </div>
    </section>
  );
};

export const InventoryManagerOverview = () => {
  const { viewer } = useAuth();
  const itemHook = useInventoryItems(viewer);

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Inventory</p>
          <h1>Inventory Management</h1>
          <p className={styles.description}>
            Manage available stock, returnable assignments, returns, and the immutable ledger.
          </p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primaryButton} href="/inventory/items/new">
            Create Item
          </Link>
          <SectionLinks />
        </div>
      </header>
      <SummaryCards />
      <ItemFilters hook={itemHook} />
      <InventoryItemTable hook={itemHook} />
    </section>
  );
};

export const MyInventory = () => {
  const { viewer } = useAuth();
  const hook = useInventoryAssignments(viewer);
  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>My Inventory</p>
          <h1>Assigned Inventory</h1>
          <p className={styles.description}>View returnable Inventory currently assigned to you.</p>
        </div>
      </header>
      <AssignmentFilters hook={hook} memberMode />
      <InventoryAssignmentTable hook={hook} memberMode />
    </section>
  );
};

export const InventoryLanding = () => {
  const { viewer } = useAuth();
  if (!viewer) return null;
  if (viewer.role === "MEMBER") return <MyInventory />;
  return <InventoryManagerOverview />;
};

const InventoryItemTable = ({ hook }: { hook: ReturnType<typeof useInventoryItems> }) => (
  <section className={styles.card}>
    <div className={styles.actions}>
      <h2>Items</h2>
      <button className={styles.secondaryButton} type="button" onClick={() => void hook.refresh()}>
        Refresh Items
      </button>
    </div>
    {hook.loading && <LoadingState message="Loading Inventory Items..." />}
    {hook.error && !hook.loading && (
      <ErrorState
        message={getInventoryErrorMessage(hook.error)}
        onRetry={() => void hook.refresh()}
      />
    )}
    {!hook.loading && !hook.error && hook.items.length === 0 && (
      <EmptyState title="No Inventory Items" message="No Items match this Inventory view." />
    )}
    {!hook.loading && !hook.error && hook.items.length > 0 && (
      <>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Team</th>
                <th>Category</th>
                <th>Available Quantity</th>
                <th>Stock Level</th>
                <th>Returnable</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hook.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.sku}</td>
                  <td>{item.name}</td>
                  <td>{item.team.name}</td>
                  <td>{item.category?.name ?? "Uncategorized"}</td>
                  <td>{formatInventoryNumber(item.quantity)}</td>
                  <td>
                    <StockLevelIndicator item={item} />
                  </td>
                  <td>{item.isReturnable ? "Returnable" : "Consumable"}</td>
                  <td>
                    <StatusBadge active={item.isActive} />
                  </td>
                  <td>{formatDisplayDate(item.updatedAt)}</td>
                  <td>
                    <Link className={styles.link} href={`/inventory/items/${item.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={hook.meta} onPageChange={hook.setPage} disabled={hook.loading} />
      </>
    )}
  </section>
);

export const InventoryCategoryList = () => {
  const { viewer } = useAuth();
  const hook = useInventoryCategories();
  const [editing, setEditing] = useState<InventoryCategory | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Inventory Categories</p>
          <h1>Categories</h1>
          <p className={styles.description}>Global Category master data for Inventory Items.</p>
        </div>
        {canManageInventoryCategories(viewer) && (
          <button className={styles.primaryButton} type="button" onClick={() => setCreating(true)}>
            Create Category
          </button>
        )}
      </header>
      <section className={styles.card}>
        {hook.loading && <LoadingState message="Loading Categories..." />}
        {hook.error && !hook.loading && (
          <ErrorState
            message={getInventoryErrorMessage(hook.error)}
            onRetry={() => void hook.refresh()}
          />
        )}
        {!hook.loading && !hook.error && hook.categories.length === 0 && (
          <EmptyState title="No Categories" message="No Inventory Categories are available." />
        )}
        {!hook.loading && !hook.error && hook.categories.length > 0 && (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hook.categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.description ?? "—"}</td>
                      <td>
                        <StatusBadge active={category.isActive} />
                      </td>
                      <td>{formatDisplayDate(category.updatedAt)}</td>
                      <td>
                        <Link className={styles.link} href={`/inventory/categories/${category.id}`}>
                          View
                        </Link>
                        {canManageInventoryCategories(viewer) && (
                          <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={() => setEditing(category)}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={hook.meta} onPageChange={hook.setPage} disabled={hook.loading} />
          </>
        )}
      </section>
      <CategoryDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          void hook.refresh();
        }}
      />
      <CategoryDialog
        category={editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          void hook.refresh();
        }}
      />
    </section>
  );
};

const CategoryDialog = ({
  category,
  open,
  onClose,
  onSaved,
}: {
  category?: InventoryCategory | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setPending(true);
    setError(null);
    try {
      if (category) {
        await inventoryCategoryApi.update(
          category.id,
          buildUpdateCategoryPayload(category, { name, description, isActive }),
        );
      } else {
        await inventoryCategoryApi.create(buildCreateCategoryPayload({ name, description }));
      }
      onSaved();
    } catch (saveError) {
      setError(getInventoryErrorMessage(saveError));
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} title={category ? "Edit Category" : "Create Category"} onClose={onClose}>
      <div className={styles.form}>
        <label className={styles.field}>
          <span>Name</span>
          <input
            className={styles.input}
            maxLength={180}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Description</span>
          <textarea
            className={styles.textarea}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        {category && (
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        )}
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={save}
            disabled={pending || !name.trim()}
          >
            {pending ? "Saving..." : "Save Category"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const InventoryCategoryDetails = ({ categoryId }: { categoryId: string }) => {
  const { category, loading, error, refresh } = useInventoryCategory(categoryId);

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Inventory Category</p>
          <h1>{category?.name ?? "Category"}</h1>
        </div>
        <Link className={styles.secondaryButton} href="/inventory/categories">
          Back to Categories
        </Link>
      </header>
      {loading && <LoadingState message="Loading Category..." />}
      {error && !loading && (
        <ErrorState message={getInventoryErrorMessage(error)} onRetry={() => void refresh()} />
      )}
      {category && !loading && !error && (
        <section className={styles.card}>
          <div className={styles.detailGrid}>
            <Detail label="Category ID" value={category.id} />
            <Detail label="Status" value={category.isActive ? "Active" : "Inactive"} />
            <Detail label="Description" value={category.description ?? "—"} />
            <Detail label="Updated" value={formatDisplayDate(category.updatedAt)} />
          </div>
        </section>
      )}
    </section>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.detailItem}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const InventoryCategorySelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { categories, meta, loading, error, setPage } = useInventoryCategories();
  return (
    <label className={styles.field}>
      <span>Category</span>
      <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">No Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id} disabled={!category.isActive}>
            {category.name} {!category.isActive ? "(inactive)" : ""}
          </option>
        ))}
      </select>
      <span className={styles.hint}>
        Category page {meta.page} of {meta.totalPages}
      </span>
      <div className={styles.actions}>
        <button
          className={styles.secondaryButton}
          type="button"
          disabled={loading || meta.page <= 1}
          onClick={() => setPage(meta.page - 1)}
        >
          Previous Categories
        </button>
        <button
          className={styles.secondaryButton}
          type="button"
          disabled={loading || meta.page >= meta.totalPages}
          onClick={() => setPage(meta.page + 1)}
        >
          Next Categories
        </button>
      </div>
      {error && <span className={styles.error}>Unable to load Category options.</span>}
    </label>
  );
};

const InventoryItemForm = ({
  item,
  onSubmit,
  pending,
  error,
}: {
  item?: InventoryItem | null;
  onSubmit: (values: InventoryItemFormValues) => void;
  pending: boolean;
  error: string | null;
}) => {
  const [values, setValues] = useState<InventoryItemFormValues>(() => itemToFormValues(item));
  const [selectedTeamName, setSelectedTeamName] = useState(item?.team.name ?? "");
  const editMode = Boolean(item);
  const validation =
    validateNonNegativeInteger(values.openingQuantity, "Opening quantity") ??
    validateNonNegativeInteger(values.lowStockThreshold, "Low stock threshold");

  const update = (patch: Partial<InventoryItemFormValues>) => setValues({ ...values, ...patch });

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        if (!validation) onSubmit(values);
      }}
    >
      <section className={styles.card}>
        <div className={styles.grid}>
          {editMode ? (
            <>
              <Detail label="Team" value={`${item?.team.name ?? "—"} (${item?.team.id ?? "—"})`} />
              <Detail label="SKU" value={item?.sku ?? "—"} />
              <Detail
                label="Available Quantity"
                value={formatInventoryNumber(item?.quantity ?? 0)}
              />
            </>
          ) : (
            <>
              <label className={styles.field}>
                <span>Team</span>
                <input
                  className={styles.input}
                  value={selectedTeamName || values.teamId}
                  readOnly
                />
              </label>
              <TaskTeamPicker
                selectedTeamId={values.teamId}
                onSelect={(team) => {
                  update({ teamId: team.id });
                  setSelectedTeamName(team.name);
                }}
              />
              <label className={styles.field}>
                <span>SKU</span>
                <input
                  className={styles.input}
                  maxLength={80}
                  value={values.sku}
                  onChange={(e) => update({ sku: e.target.value })}
                />
              </label>
            </>
          )}
          <label className={styles.field}>
            <span>Name</span>
            <input
              className={styles.input}
              maxLength={180}
              value={values.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </label>
          <InventoryCategorySelect
            value={values.categoryId}
            onChange={(categoryId) => update({ categoryId })}
          />
          <label className={styles.field}>
            <span>Low Stock Threshold</span>
            <input
              className={styles.input}
              inputMode="numeric"
              value={values.lowStockThreshold}
              onChange={(e) => update({ lowStockThreshold: e.target.value })}
            />
          </label>
          {!editMode && (
            <label className={styles.field}>
              <span>Opening Quantity</span>
              <input
                className={styles.input}
                inputMode="numeric"
                value={values.openingQuantity}
                onChange={(e) => update({ openingQuantity: e.target.value })}
              />
            </label>
          )}
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={values.isReturnable}
              onChange={(e) => update({ isReturnable: e.target.checked })}
            />
            Returnable
          </label>
          {editMode && (
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(e) => update({ isActive: e.target.checked })}
              />
              Active
            </label>
          )}
        </div>
        <label className={styles.field}>
          <span>Description</span>
          <textarea
            className={styles.textarea}
            maxLength={2000}
            value={values.description}
            onChange={(e) => update({ description: e.target.value })}
          />
        </label>
        {validation && <p className={styles.error}>{validation}</p>}
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Link
            className={styles.secondaryButton}
            href={editMode ? `/inventory/items/${item?.id}` : "/inventory"}
          >
            Cancel
          </Link>
          <button
            className={styles.primaryButton}
            type="submit"
            disabled={
              pending ||
              Boolean(validation) ||
              !values.name.trim() ||
              (!editMode && (!values.teamId || !values.sku.trim()))
            }
          >
            {pending ? "Saving..." : editMode ? "Save Item" : "Create Item"}
          </button>
        </div>
      </section>
    </form>
  );
};

export const InventoryItemCreate = () => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (values: InventoryItemFormValues) => {
    setPending(true);
    setError(null);
    try {
      const item = await inventoryItemApi.create(buildCreateItemPayload(values));
      router.replace(`/inventory/items/${item.id}`);
    } catch (submitError) {
      setError(getInventoryErrorMessage(submitError));
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Create Inventory Item</p>
          <h1>New Item</h1>
          <p className={styles.description}>
            Opening quantity is handled by the create command only. No extra Stock In request is
            sent.
          </p>
        </div>
      </header>
      <InventoryItemForm onSubmit={submit} pending={pending} error={error} />
    </section>
  );
};

export const InventoryItemEdit = ({ itemId }: { itemId: string }) => {
  const router = useRouter();
  const { item, loading, error, refresh } = useInventoryItem(itemId);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const submit = async (values: InventoryItemFormValues) => {
    if (!item) return;
    const payload = buildUpdateItemPayload(item, values);
    if (Object.keys(payload).length === 0) {
      router.replace(`/inventory/items/${item.id}`);
      return;
    }

    setPending(true);
    setSaveError(null);
    try {
      const updated = await inventoryItemApi.update(item.id, payload);
      router.replace(`/inventory/items/${updated.id}`);
    } catch (submitError) {
      setSaveError(getInventoryErrorMessage(submitError));
      await refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Edit Inventory Item</p>
          <h1>{item?.name ?? "Inventory Item"}</h1>
        </div>
      </header>
      {loading && <LoadingState message="Loading Item..." />}
      {error && !loading && (
        <ErrorState message={getInventoryErrorMessage(error)} onRetry={() => void refresh()} />
      )}
      {item && !loading && !error && (
        <InventoryItemForm item={item} onSubmit={submit} pending={pending} error={saveError} />
      )}
    </section>
  );
};

export const InventoryItemDetails = ({ itemId }: { itemId: string }) => {
  const { viewer } = useAuth();
  const { item, setItem, loading, error, refresh } = useInventoryItem(itemId);
  const [dialog, setDialog] = useState<"stock-in" | "stock-out" | "adjustment" | "assign" | null>(
    null,
  );

  const onItemMutation = async (nextItem?: InventoryItem) => {
    if (nextItem) setItem(nextItem);
    await refresh();
    setDialog(null);
  };

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Inventory Item</p>
          <h1>{item?.name ?? "Item"}</h1>
          {item && (
            <p className={styles.description}>
              Available Quantity: {formatInventoryNumber(item.quantity)}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondaryButton} href="/inventory">
            Back to Inventory
          </Link>
          {item && canManageInventory(viewer) && (
            <Link className={styles.secondaryButton} href={`/inventory/items/${item.id}/edit`}>
              Edit
            </Link>
          )}
        </div>
      </header>
      {loading && <LoadingState message="Loading Item..." />}
      {error && !loading && (
        <ErrorState message={getInventoryErrorMessage(error)} onRetry={() => void refresh()} />
      )}
      {item && !loading && !error && (
        <>
          <section className={styles.card}>
            <div className={styles.detailGrid}>
              <Detail label="SKU" value={item.sku} />
              <Detail label="Team" value={`${item.team.name} (${item.team.id})`} />
              <Detail
                label="Category"
                value={item.category ? `${item.category.name} (${item.category.id})` : "—"}
              />
              <Detail label="Available Quantity" value={formatInventoryNumber(item.quantity)} />
              <Detail
                label="Low Stock Threshold"
                value={item.lowStockThreshold?.toString() ?? "—"}
              />
              <div className={styles.detailItem}>
                <span>Stock Level</span>
                <StockLevelIndicator item={item} />
              </div>
              <Detail label="Returnable" value={item.isReturnable ? "Returnable" : "Consumable"} />
              <Detail label="Status" value={item.isActive ? "Active" : "Inactive"} />
            </div>
          </section>
          <section className={styles.card}>
            <h2>Stock Actions</h2>
            <div className={styles.actions}>
              <button
                className={styles.primaryButton}
                type="button"
                disabled={!canStockInInventoryItem(viewer, item)}
                onClick={() => setDialog("stock-in")}
              >
                Stock In
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                disabled={!canStockOutInventoryItem(viewer, item)}
                onClick={() => setDialog("stock-out")}
              >
                Stock Out
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                disabled={!canAdjustInventoryItem(viewer, item)}
                onClick={() => setDialog("adjustment")}
              >
                Adjustment
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                disabled={!canAssignInventoryItem(viewer, item)}
                onClick={() => setDialog("assign")}
              >
                Assign to Member
              </button>
            </div>
            {item.isReturnable && (
              <p className={styles.hint}>
                Returnable Items are issued through Assignment, not Stock Out.
              </p>
            )}
            {!item.isReturnable && (
              <p className={styles.hint}>Consumable Items use Stock Out, not Assignment.</p>
            )}
            {!item.isActive && (
              <p className={styles.hint}>
                Inactive Items can be edited or reactivated, but stock actions are disabled.
              </p>
            )}
          </section>
          <StockCommandDialog
            kind={dialog}
            item={item}
            onClose={() => setDialog(null)}
            onSaved={onItemMutation}
          />
        </>
      )}
    </section>
  );
};

const MemberSelect = ({
  value,
  onChange,
  optional = false,
}: {
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) => {
  const { members, meta, loading, error, setPage } = useMembers();
  return (
    <label className={styles.field}>
      <span>{optional ? "Member (optional)" : "Member"}</span>
      <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
        {optional && <option value="">No Member</option>}
        {!optional && <option value="">Select active Member</option>}
        {members.map((member) => (
          <option key={member.id} value={member.id} disabled={member.status !== "ACTIVE"}>
            {member.name} ({member.employeeId ?? member.id}){" "}
            {member.status !== "ACTIVE" ? "inactive" : ""}
          </option>
        ))}
      </select>
      <span className={styles.hint}>
        Member page {meta.page} of {meta.totalPages}
      </span>
      <div className={styles.actions}>
        <button
          className={styles.secondaryButton}
          type="button"
          disabled={loading || meta.page <= 1}
          onClick={() => setPage(meta.page - 1)}
        >
          Previous Members
        </button>
        <button
          className={styles.secondaryButton}
          type="button"
          disabled={loading || meta.page >= meta.totalPages}
          onClick={() => setPage(meta.page + 1)}
        >
          Next Members
        </button>
      </div>
      {error && <span className={styles.error}>Unable to load Member options.</span>}
    </label>
  );
};

const StockCommandDialog = ({
  kind,
  item,
  onClose,
  onSaved,
}: {
  kind: "stock-in" | "stock-out" | "adjustment" | "assign" | null;
  item: InventoryItem;
  onClose: () => void;
  onSaved: (item?: InventoryItem) => Promise<void>;
}) => {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [memberId, setMemberId] = useState("");
  const [direction, setDirection] = useState<InventoryAdjustmentDirection>("INCREASE");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = kind !== null;
  const title = {
    "stock-in": "Stock In",
    "stock-out": "Stock Out",
    adjustment: "Inventory Adjustment",
    assign: "Assign Inventory",
  }[kind ?? "stock-in"];

  const submit = async () => {
    const quantityError = validatePositiveInteger(quantity, "Quantity");
    if (quantityError) {
      setError(quantityError);
      return;
    }

    if ((kind === "stock-out" || kind === "adjustment") && !reason.trim()) {
      setError("Reason is required.");
      return;
    }

    if (kind === "assign" && !memberId) {
      setError("Select a Member.");
      return;
    }

    setPending(true);
    setError(null);
    const parsedQuantity = Number.parseInt(quantity.trim(), 10);

    try {
      if (kind === "stock-in") {
        const next = await inventoryStockApi.stockIn(item.id, {
          quantity: parsedQuantity,
          ...(note.trim() ? { note: note.trim() } : {}),
        });
        await onSaved(next);
      }
      if (kind === "stock-out") {
        const next = await inventoryStockApi.stockOut(item.id, {
          quantity: parsedQuantity,
          reason: reason.trim(),
          ...(note.trim() ? { note: note.trim() } : {}),
          ...(memberId ? { memberId } : {}),
        });
        await onSaved(next);
      }
      if (kind === "adjustment") {
        const next = await inventoryStockApi.adjust(item.id, {
          direction,
          quantity: parsedQuantity,
          reason: reason.trim(),
          ...(note.trim() ? { note: note.trim() } : {}),
        });
        await onSaved(next);
      }
      if (kind === "assign") {
        await inventoryAssignmentApi.create(item.id, {
          memberId,
          quantity: parsedQuantity,
          ...(note.trim() ? { note: note.trim() } : {}),
        });
        await onSaved();
      }
    } catch (submitError) {
      setError(getInventoryErrorMessage(submitError));
      await onSaved();
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className={styles.form}>
        <label className={styles.field}>
          <span>Quantity</span>
          <input
            className={styles.input}
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
        {kind === "adjustment" && (
          <label className={styles.field}>
            <span>Direction</span>
            <select
              className={styles.select}
              value={direction}
              onChange={(e) => setDirection(e.target.value as InventoryAdjustmentDirection)}
            >
              <option value="INCREASE">Increase</option>
              <option value="DECREASE">Decrease</option>
            </select>
          </label>
        )}
        {(kind === "stock-out" || kind === "adjustment") && (
          <label className={styles.field}>
            <span>Reason</span>
            <input
              className={styles.input}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
        )}
        {kind === "stock-out" && <MemberSelect value={memberId} onChange={setMemberId} optional />}
        {kind === "assign" && <MemberSelect value={memberId} onChange={setMemberId} />}
        <label className={styles.field}>
          <span>Note</span>
          <textarea
            className={styles.textarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={submit}
            disabled={pending}
          >
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const AssignmentFilters = ({
  hook,
  memberMode = false,
}: {
  hook: ReturnType<typeof useInventoryAssignments>;
  memberMode?: boolean;
}) => {
  const filters = hook.draftFilters;
  return (
    <section className={styles.card}>
      <div className={styles.filters}>
        {!memberMode && (
          <>
            <label className={styles.field}>
              <span>Team ID</span>
              <input
                className={styles.input}
                value={filters.teamId}
                onChange={(e) => hook.setDraftFilters({ ...filters, teamId: e.target.value })}
              />
            </label>
            <label className={styles.field}>
              <span>Member ID</span>
              <input
                className={styles.input}
                value={filters.memberId}
                onChange={(e) => hook.setDraftFilters({ ...filters, memberId: e.target.value })}
              />
            </label>
          </>
        )}
        <label className={styles.field}>
          <span>Item ID</span>
          <input
            className={styles.input}
            value={filters.itemId}
            onChange={(e) => hook.setDraftFilters({ ...filters, itemId: e.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span>Return Status</span>
          <select
            className={styles.select}
            value={filters.returnStatus}
            onChange={(e) =>
              hook.setDraftFilters({
                ...filters,
                returnStatus: e.target.value as typeof filters.returnStatus,
              })
            }
          >
            <option value="ALL">All</option>
            {RETURN_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatReturnStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>From</span>
          <input
            className={styles.input}
            type="datetime-local"
            value={filters.from}
            onChange={(e) => hook.setDraftFilters({ ...filters, from: e.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span>To</span>
          <input
            className={styles.input}
            type="datetime-local"
            value={filters.to}
            onChange={(e) => hook.setDraftFilters({ ...filters, to: e.target.value })}
          />
        </label>
        <button className={styles.primaryButton} type="button" onClick={hook.applyFilters}>
          Apply
        </button>
        <button className={styles.secondaryButton} type="button" onClick={hook.resetFilters}>
          Reset
        </button>
      </div>
      {hook.filterError && <p className={styles.error}>{hook.filterError}</p>}
    </section>
  );
};

const InventoryAssignmentTable = ({
  hook,
  memberMode = false,
}: {
  hook: ReturnType<typeof useInventoryAssignments>;
  memberMode?: boolean;
}) => (
  <section className={styles.card}>
    <div className={styles.actions}>
      <h2>{memberMode ? "My Assignments" : "Assignments"}</h2>
      <button className={styles.secondaryButton} type="button" onClick={() => void hook.refresh()}>
        Refresh Assignments
      </button>
    </div>
    {hook.loading && <LoadingState message="Loading Assignments..." />}
    {hook.error && !hook.loading && (
      <ErrorState
        message={getInventoryErrorMessage(hook.error)}
        onRetry={() => void hook.refresh()}
      />
    )}
    {!hook.loading && !hook.error && hook.assignments.length === 0 && (
      <EmptyState title="No Assignments" message="No Inventory Assignments match this view." />
    )}
    {!hook.loading && !hook.error && hook.assignments.length > 0 && (
      <>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Member</th>
                <th>Assigned</th>
                <th>Returned</th>
                <th>Remaining</th>
                <th>Status</th>
                <th>Assigned At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hook.assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    {assignment.item.name}
                    <br />
                    <span className={styles.muted}>{assignment.item.sku}</span>
                  </td>
                  <td>
                    {assignment.member.name}
                    <br />
                    <span className={styles.muted}>{assignment.member.employeeId ?? "—"}</span>
                  </td>
                  <td>{formatInventoryNumber(assignment.quantity)}</td>
                  <td>{formatInventoryNumber(assignment.returnedQuantity)}</td>
                  <td>{formatInventoryNumber(assignment.remainingQuantity)}</td>
                  <td>{formatReturnStatus(assignment.returnStatus)}</td>
                  <td>{formatDisplayDate(assignment.assignedAt)}</td>
                  <td>
                    <Link className={styles.link} href={`/inventory/assignments/${assignment.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={hook.meta} onPageChange={hook.setPage} disabled={hook.loading} />
      </>
    )}
  </section>
);

export const InventoryAssignmentList = ({ memberMode = false }: { memberMode?: boolean }) => {
  const { viewer } = useAuth();
  const hook = useInventoryAssignments(viewer);
  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Inventory Assignments</p>
          <h1>{memberMode ? "My Inventory" : "Assignments"}</h1>
          <p className={styles.description}>
            Returnable Inventory assignment state is read from the backend ledger.
          </p>
        </div>
        {!memberMode && <SectionLinks />}
      </header>
      <AssignmentFilters hook={hook} memberMode={memberMode} />
      <InventoryAssignmentTable hook={hook} memberMode={memberMode} />
    </section>
  );
};

export const InventoryAssignmentDetails = ({ assignmentId }: { assignmentId: string }) => {
  const { viewer } = useAuth();
  const { assignment, setAssignment, loading, error, refresh } =
    useInventoryAssignment(assignmentId);
  const [returnOpen, setReturnOpen] = useState(false);

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Inventory Assignment</p>
          <h1>{assignment?.item.name ?? "Assignment"}</h1>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondaryButton} href="/inventory/assignments">
            Back to Assignments
          </Link>
          {assignment && (
            <button
              className={styles.primaryButton}
              type="button"
              disabled={!canReturnInventoryAssignment(viewer, assignment)}
              onClick={() => setReturnOpen(true)}
            >
              Return
            </button>
          )}
        </div>
      </header>
      {loading && <LoadingState message="Loading Assignment..." />}
      {error && !loading && (
        <ErrorState message={getInventoryErrorMessage(error)} onRetry={() => void refresh()} />
      )}
      {assignment && !loading && !error && (
        <>
          <section className={styles.card}>
            <div className={styles.detailGrid}>
              <Detail label="Item" value={`${assignment.item.name} (${assignment.item.sku})`} />
              <Detail
                label="Member"
                value={`${assignment.member.name} (${assignment.member.employeeId ?? assignment.member.id})`}
              />
              <Detail
                label="Assigned Quantity"
                value={formatInventoryNumber(assignment.quantity)}
              />
              <Detail
                label="Returned Quantity"
                value={formatInventoryNumber(assignment.returnedQuantity)}
              />
              <Detail
                label="Remaining Quantity"
                value={formatInventoryNumber(assignment.remainingQuantity)}
              />
              <Detail label="Return Status" value={formatReturnStatus(assignment.returnStatus)} />
              <Detail
                label="Assigned By"
                value={`${assignment.assignedBy.name} (${assignment.assignedBy.id})`}
              />
              <Detail label="Assigned At" value={formatDisplayDate(assignment.assignedAt)} />
              <Detail
                label="Returned At"
                value={assignment.returnedAt ? formatDisplayDate(assignment.returnedAt) : "—"}
              />
            </div>
            <p className={styles.hint}>
              Return remains available for managers when remaining quantity is greater than zero,
              even if the Item or Member changed later.
            </p>
          </section>
          <ReturnDialog
            open={returnOpen}
            assignment={assignment}
            onClose={() => setReturnOpen(false)}
            onSaved={async (next) => {
              setAssignment(next);
              await refresh();
              setReturnOpen(false);
            }}
          />
        </>
      )}
    </section>
  );
};

const ReturnDialog = ({
  open,
  assignment,
  onClose,
  onSaved,
}: {
  open: boolean;
  assignment: NonNullable<ReturnType<typeof useInventoryAssignment>["assignment"]>;
  onClose: () => void;
  onSaved: (assignment: InventoryAssignment) => Promise<void>;
}) => {
  const [quantity, setQuantity] = useState(assignment.remainingQuantity.toString());
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const validation = validatePositiveInteger(quantity, "Return quantity");
    if (validation) {
      setError(validation);
      return;
    }

    setPending(true);
    setError(null);
    try {
      const next = await inventoryAssignmentApi.returnItems(assignment.id, {
        quantity: Number.parseInt(quantity.trim(), 10),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      await onSaved(next);
    } catch (submitError) {
      setError(getInventoryErrorMessage(submitError));
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} title="Return Inventory" onClose={onClose}>
      <div className={styles.form}>
        <p className={styles.hint}>
          Remaining quantity from backend: {formatInventoryNumber(assignment.remainingQuantity)}
        </p>
        <label className={styles.field}>
          <span>Quantity</span>
          <input
            className={styles.input}
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Note</span>
          <textarea
            className={styles.textarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={submit}
            disabled={pending}
          >
            {pending ? "Returning..." : "Return Inventory"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const InventoryTransactionList = () => {
  const { viewer } = useAuth();
  const hook = useInventoryTransactions(viewer);
  const filters = hook.draftFilters;

  return (
    <section className={styles.section}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Inventory Ledger</p>
          <h1>Transactions</h1>
          <p className={styles.description}>
            Immutable stock ledger. Corrections use new Adjustments.
          </p>
        </div>
        <SectionLinks />
      </header>
      <section className={styles.card}>
        <div className={styles.filters}>
          <label className={styles.field}>
            <span>Type</span>
            <select
              className={styles.select}
              value={filters.type}
              onChange={(e) =>
                hook.setDraftFilters({ ...filters, type: e.target.value as typeof filters.type })
              }
            >
              <option value="ALL">All</option>
              {TRANSACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatTransactionType(type)}
                </option>
              ))}
            </select>
          </label>
          {(["teamId", "itemId", "memberId", "actorId"] as const).map((field) => (
            <label className={styles.field} key={field}>
              <span>{formatInventoryStatus(field)}</span>
              <input
                className={styles.input}
                value={filters[field]}
                onChange={(e) => hook.setDraftFilters({ ...filters, [field]: e.target.value })}
              />
            </label>
          ))}
          <label className={styles.field}>
            <span>From</span>
            <input
              className={styles.input}
              type="datetime-local"
              value={filters.from}
              onChange={(e) => hook.setDraftFilters({ ...filters, from: e.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span>To</span>
            <input
              className={styles.input}
              type="datetime-local"
              value={filters.to}
              onChange={(e) => hook.setDraftFilters({ ...filters, to: e.target.value })}
            />
          </label>
          <button className={styles.primaryButton} type="button" onClick={hook.applyFilters}>
            Apply
          </button>
          <button className={styles.secondaryButton} type="button" onClick={hook.resetFilters}>
            Reset
          </button>
        </div>
        {hook.filterError && <p className={styles.error}>{hook.filterError}</p>}
      </section>
      <section className={styles.card}>
        {hook.loading && <LoadingState message="Loading Transactions..." />}
        {hook.error && !hook.loading && (
          <ErrorState
            message={getInventoryErrorMessage(hook.error)}
            onRetry={() => void hook.refresh()}
          />
        )}
        {!hook.loading && !hook.error && hook.transactions.length === 0 && (
          <EmptyState
            title="No Transactions"
            message="No Inventory ledger entries match this view."
          />
        )}
        {!hook.loading && !hook.error && hook.transactions.length > 0 && (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Previous</th>
                    <th>Resulting</th>
                    <th>Member</th>
                    <th>Actor</th>
                    <th>Reason</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {hook.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.item.name}</td>
                      <td>{formatTransactionType(transaction.type)}</td>
                      <td>{formatInventoryNumber(transaction.quantity)}</td>
                      <td>{formatInventoryNumber(transaction.previousQuantity)}</td>
                      <td>{formatInventoryNumber(transaction.resultingQuantity)}</td>
                      <td>
                        {transaction.member
                          ? `${transaction.member.name} (${transaction.member.employeeId ?? transaction.member.id})`
                          : "—"}
                      </td>
                      <td>{transaction.actor.name}</td>
                      <td>{transaction.reason ?? transaction.note ?? "—"}</td>
                      <td>{formatDisplayDate(transaction.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={hook.meta} onPageChange={hook.setPage} disabled={hook.loading} />
          </>
        )}
      </section>
    </section>
  );
};
