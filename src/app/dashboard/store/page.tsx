"use client";

import { useDashboard } from "../dashboard-context";
import { StoreTab } from "../components/store-tab";

export default function DashboardStorePage() {
  const {
    orders,
    handleFulfillOrder,
    products,
    activePage,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleToggleProductActive,
    handleUploadProductFile,
  } = useDashboard();

  return (
    <div className="animate-in fade-in duration-200">
      <StoreTab
        orders={orders}
        onFulfillOrder={handleFulfillOrder}
        products={products}
        activePage={activePage}
        onCreateProduct={handleCreateProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleActive={handleToggleProductActive}
        onUploadFile={handleUploadProductFile}
      />
    </div>
  );
}
