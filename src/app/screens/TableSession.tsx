import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Clock,
  Plus,
  Minus,
  DollarSign,
  Receipt,
  ArrowLeft,
  CheckCircle,
  Printer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

import type { TableType } from '../context/AppContext';

const getTableRate = (type: TableType): number => {
  switch (type) {
    case '6ft': return 40;
    case '8ft': return 50;
    case '9ft': return 60;
    case 'snooker': return 70;
    default: return 50;
  }
};

export function TableSession() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { tables, products, addProductToTable, endTableSession } = useApp();
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // Receipt state — stores a snapshot of the session when "Finalizar" is pressed
  const [receipt, setReceipt] = useState<{
    tableName: string;
    tableType: TableType;
    elapsedSeconds: number;
    products: { name: string; price: number; quantity: number }[];
    tableCost: number;
    productsCost: number;
    totalCost: number;
    endTime: Date;
  } | null>(null);

  const table = tables.find((t) => t.id === Number(tableId));

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show receipt modal if we have a snapshot (session already ended)
  if (receipt) {
    return (
      <Layout>
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent
            className="bg-zinc-950 border-zinc-800 max-w-md w-full p-0 overflow-hidden"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Sesión Finalizada</h2>
                  <p className="text-green-100 text-sm">
                    {receipt.endTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    {' — '}
                    {receipt.endTime.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Ticket Body */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="px-6 py-5 space-y-5"
            >
              {/* Table info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-xs uppercase tracking-widest">Mesa</p>
                  <p className="text-white text-2xl font-bold">{receipt.tableName}</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-xs uppercase tracking-widest">Tipo</p>
                  <p className="text-zinc-300 font-semibold capitalize">{receipt.tableType}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-zinc-700" />

              {/* Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-zinc-300 text-sm">Tiempo total</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-mono font-bold">{formatTime(receipt.elapsedSeconds)}</span>
                  <p className="text-zinc-500 text-xs">
                    ${getTableRate(receipt.tableType)}/hr → ${receipt.tableCost.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Products */}
              {receipt.products.length > 0 && (
                <>
                  <div className="border-t border-dashed border-zinc-700" />
                  <div>
                    <p className="text-zinc-400 text-xs uppercase tracking-widest mb-3">Productos consumidos</p>
                    <div className="space-y-2">
                      {receipt.products.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.05 }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500 text-sm tabular-nums w-5 text-right">{item.quantity}×</span>
                            <span className="text-zinc-300 text-sm">{item.name}</span>
                          </div>
                          <span className="text-white text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-dashed border-zinc-700" />

              {/* Subtotals */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Tiempo de mesa</span>
                  <span className="text-zinc-300">${receipt.tableCost.toFixed(2)}</span>
                </div>
                {receipt.productsCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Productos</span>
                    <span className="text-zinc-300">${receipt.productsCost.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
                <span className="text-white font-bold text-lg">TOTAL</span>
                <span className="text-3xl font-bold text-purple-400">${receipt.totalCost.toFixed(2)}</span>
              </div>
            </motion.div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <Button 
                onClick={()=> window.print}
                variant="outline"
                className="w-full mb-3 bg-green-500 hover:bg-green-600 text-black font-bold text-base py-6"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Imprimir Ticket
              </Button>
              <Button
                onClick={() => navigate('/tables')}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold text-base py-6"
              >
                <Receipt className="w-5 h-5 mr-2" />
                Cerrar y volver a Mesas
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Layout>
    );
  }

  if (!table || table.status !== 'occupied') {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-zinc-400">Mesa no encontrada o no está activa</p>
          <Button onClick={() => navigate('/tables')} className="mt-4">
            Volver a Mesas
          </Button>
        </div>
      </Layout>
    );
  }

  const timeInHours = table.elapsedSeconds / 3600;
  const tableCost = timeInHours * getTableRate(table.type);
  const productsCost = table.products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalCost = tableCost + productsCost;

  const handleAddProduct = () => {
    if (selectedProduct && quantity > 0) {
      addProductToTable(table.id, selectedProduct, quantity);
      setShowProductModal(false);
      setQuantity(1);
      setSelectedProduct(null);
    }
  };

  const handleEndSession = () => {
    const timeInHours = table.elapsedSeconds / 3600;
    const tCost = timeInHours * getTableRate(table.type);
    const pCost = table.products.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 1. Snapshot the data into local state
    setReceipt({
      tableName: table.name,
      tableType: table.type,
      elapsedSeconds: table.elapsedSeconds,
      products: [...table.products],
      tableCost: tCost,
      productsCost: pCost,
      totalCost: tCost + pCost,
      endTime: new Date(),
    });

    // 2. End the session — this will cause table to disappear from context,
    //    but `receipt` state is now set so the receipt branch renders instead
    //    of the "mesa no encontrada" fallback.
    endTableSession(table.id);
  };

  const openProductModal = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowProductModal(true);
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/tables')}
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{table.name}</h1>
              <p className="text-zinc-500">Sesión activa</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Timer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border-2 border-green-500/50 p-6 shadow-xl shadow-green-500/20 relative overflow-hidden"
            >
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-green-500/10 blur-2xl"
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-zinc-400">Tiempo transcurrido</span>
                </div>
                <p className="text-5xl font-mono font-bold text-green-400 mb-4">
                  {formatTime(table.elapsedSeconds)}
                </p>
                <div className="p-3 bg-black/30 rounded-lg border border-green-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Costo por tiempo</span>
                    <span className="text-lg font-bold text-green-400">
                      ${tableCost.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">${getTableRate(table.type)}/hora</p>
                </div>
              </div>
            </motion.div>

            {/* Total Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-zinc-400">Resumen de Costos</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Tiempo de mesa</span>
                  <span className="text-white">${tableCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Productos</span>
                  <span className="text-white">${productsCost.toFixed(2)}</span>
                </div>
                <div className="h-px bg-zinc-700" />
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-2xl font-bold text-purple-400">
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* End Session Button */}
            <Button
              onClick={handleEndSession}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/30"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Finalizar Sesión
            </Button>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Products */}
            {table.products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
              >
                <h2 className="text-xl font-bold text-white mb-4">
                  Productos Consumidos
                </h2>
                <div className="space-y-3">
                  {table.products.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700"
                    >
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-sm text-zinc-400">
                          ${item.price} x {item.quantity}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-green-400">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Add Products Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-xl"
            >
              <h2 className="text-xl font-bold text-white mb-4">Agregar Productos</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <motion.button
                    key={product.id}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openProductModal(product)}
                    disabled={product.stock === 0}
                    className={`
                      p-4 rounded-lg border-2 transition-all text-left
                      ${
                        product.stock === 0
                          ? 'bg-zinc-800 border-zinc-700 opacity-50 cursor-not-allowed'
                          : 'bg-zinc-800 border-zinc-700 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Plus className="w-5 h-5 text-green-400" />
                      {product.stock < 10 && product.stock > 0 && (
                        <span className="text-xs text-orange-400">Bajo</span>
                      )}
                    </div>
                    <p className="text-white font-medium mb-1">{product.name}</p>
                    <p className="text-green-400 font-bold">${product.price}</p>
                    <p className="text-xs text-zinc-500 mt-1">Stock: {product.stock}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Agregar {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-400">Precio unitario</span>
                <span className="text-xl font-bold text-green-400">
                  ${selectedProduct?.price}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Stock disponible</span>
                <span className="text-white">{selectedProduct?.stock} unidades</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Cantidad</label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="border-zinc-700"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center">
                  <p className="text-3xl font-bold text-white">{quantity}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setQuantity(
                      Math.min(selectedProduct?.stock || 1, quantity + 1)
                    )
                  }
                  className="border-zinc-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Total a agregar</span>
                <span className="text-2xl font-bold text-purple-400">
                  ${((selectedProduct?.price || 0) * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowProductModal(false)}
                className="flex-1 border-zinc-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddProduct}
                className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold"
              >
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}