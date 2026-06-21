# CNTY2 Jeans — App POS

Sistema de punto de venta e inventario para **CNTY2 Jeans**.
Hecho con **Expo (React Native)** para Android e iOS.

> **Fase actual:** Prototipo visual con datos de ejemplo (en memoria).
> **Fase siguiente:** Conectar la nube (Supabase) para guardar inventario y ventas reales.

## Cómo verla en tu celular

1. Instala la app **Expo Go** desde la Play Store / App Store.
2. En la computadora, dentro de esta carpeta, corre:
   ```bash
   npm start
   ```
3. Escanea el código QR que aparece con Expo Go (Android) o la cámara (iPhone).

## Qué incluye el prototipo

- **Resumen (Dashboard):** ventas por periodo (Hoy / 7 / 14 / 30 días), gráfico
  animado de ingresos, pedidos, piezas, ticket promedio, alerta de stock bajo y
  productos más vendidos.
- **Inventario:** búsqueda, filtro por categoría, estado de stock por color,
  valor del inventario y botón **+** para agregar.
- **Producto (nuevo/editar):** subir foto (galería o cámara), nombre, categoría,
  precio, **precio variable** (ajustable al vender) y existencias.
- **Vender:** toca productos para armar el carrito, ajusta cantidad y precio
  (en productos variables) y cobra. La venta descuenta stock y actualiza el dashboard.

## Estructura

```
app/                 Pantallas (expo-router)
  (tabs)/            Resumen, Inventario, Vender
  product/           Crear / editar producto
components/          Icon, BarChart, AnimatedNumber, SegmentedControl, etc.
store/               Estado en memoria + cálculo de métricas
data/                Tipos, configuración y datos de ejemplo
theme/               Colores, tipografías y espaciado
```

## Personalización rápida

- **Moneda:** `data/config.ts` → `currencySymbol` (ej. `$`, `Q`, `€`).
- **Colores:** `theme/colors.ts`.
- **Tipografías:** `theme/typography.ts`.
