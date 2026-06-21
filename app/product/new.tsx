import React from 'react';
import { ProductForm } from '../../components/ProductForm';
import { useStore } from '../../store/StoreContext';

export default function NewProduct() {
  const { addProduct } = useStore();
  return (
    <ProductForm
      title="Nuevo producto"
      submitLabel="Guardar producto"
      onSubmit={(values) => addProduct(values)}
    />
  );
}
