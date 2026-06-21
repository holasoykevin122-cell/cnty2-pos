import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ProductForm } from '../../../components/ProductForm';
import { useStore } from '../../../store/StoreContext';
import { colors, type } from '../../../theme';

export default function EditProduct() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, updateProduct, deleteProduct } = useStore();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.txt}>Producto no encontrado.</Text>
      </View>
    );
  }

  return (
    <ProductForm
      title="Editar producto"
      submitLabel="Guardar cambios"
      initial={product}
      onSubmit={(values) => updateProduct(product.id, values)}
      onDelete={() => deleteProduct(product.id)}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  txt: { ...type.body, color: colors.textMuted },
});
