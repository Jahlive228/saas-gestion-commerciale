"use client";

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPOSProductsAction, createSaleAction } from '../_services/actions';
import { ShoppingCartIcon, SearchIcon, XIcon } from '@/icons/index';
import Button from '@/components/ui/button/Button';
import { toast } from 'react-hot-toast';
import type { POSProduct } from '../_services/actions';

interface CartItem {
  product: POSProduct;
  quantity: number;
}

export default function POSInterface() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const queryClient = useQueryClient();

  // Récupérer les produits
  const { data: productsResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['pos-products', searchTerm],
    queryFn: () => getPOSProductsAction(searchTerm || undefined),
    staleTime: 30 * 1000, // 30 secondes
  });

  const products = productsResponse?.success ? productsResponse.data || [] : [];

  // Mutation pour créer une vente
  const createSaleMutation = useMutation({
    mutationFn: createSaleAction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Vente créée avec succès ! Référence: ${result.data.reference}`);
        setCart([]);
        setSearchTerm('');
        queryClient.invalidateQueries({ queryKey: ['my-sales'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création de la vente');
    },
  });

  // Filtrer les produits selon la recherche
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term))
    );
  }, [products, searchTerm]);

  // Calculer le total du panier
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);
  }, [cart]);

  // Ajouter un produit au panier
  const addToCart = (product: POSProduct) => {
    if (product.stock_qty === 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock_qty) {
        toast.error('Stock insuffisant');
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  // Modifier la quantité d'un article
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find((item) => item.product.id === productId);
    if (item && quantity > item.product.stock_qty) {
      toast.error('Stock insuffisant');
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Retirer un produit du panier
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
  };

  // Finaliser la vente
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    const result = await createSaleMutation.mutateAsync(
      cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }))
    );

    if (result.success) {
      // Le toast est déjà géré dans onSuccess
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Zone produits */}
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Point de Vente</h1>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Liste des produits */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingProducts ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCartIcon className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-sm">
                {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit disponible'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((item) => item.product.id === product.id);
                const inCart = !!cartItem;
                const isOutOfStock = product.stock_qty === 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    disabled={isOutOfStock}
                    className={`p-4 bg-white rounded-lg border-2 transition-all text-left ${
                      isOutOfStock
                        ? 'border-gray-200 opacity-50 cursor-not-allowed'
                        : inCart
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-brand-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {product.name}
                      </h3>
                      {inCart && (
                        <span className="ml-2 px-2 py-0.5 bg-brand-500 text-white text-xs rounded-full">
                          {cartItem.quantity}
                        </span>
                      )}
                    </div>
                    {product.sku && (
                      <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-brand-600">
                        {formatCurrency(product.price)}
                      </p>
                      <p className={`text-xs ${isOutOfStock ? 'text-red-600' : 'text-gray-500'}`}>
                        Stock: {product.stock_qty}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Panier */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Panier</h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Vider
              </button>
            )}
          </div>
          {cart.length === 0 ? (
            <p className="text-sm text-gray-500">Le panier est vide</p>
          ) : (
            <p className="text-sm text-gray-500">{cart.length} article(s)</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCartIcon className="w-16 h-16 mb-4" />
              <p className="text-sm">Ajoutez des produits au panier</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.product.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      <span className="text-lg">−</span>
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock_qty}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-lg">+</span>
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 ml-2"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total et bouton de validation */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-brand-600">
              {formatCurrency(cartTotal)}
            </span>
          </div>
          <Button
            onClick={handleCheckout}
            disabled={cart.length === 0 || createSaleMutation.isPending}
            loading={createSaleMutation.isPending}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3"
          >
            {createSaleMutation.isPending ? 'Traitement...' : 'Valider la vente'}
          </Button>
        </div>
      </div>
    </div>
  );
}
