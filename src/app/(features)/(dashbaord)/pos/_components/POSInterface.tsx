"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [stockUpdatedProducts, setStockUpdatedProducts] = useState<Set<string>>(new Set());
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const previousProductsRef = useRef<POSProduct[]>([]);
  const queryClient = useQueryClient();

  // Gérer le focus de la fenêtre pour activer/désactiver le polling
  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Récupérer les produits avec polling optimisé
  const { data: productsResponse, isLoading: isLoadingProducts, dataUpdatedAt } = useQuery({
    queryKey: ['pos-products', searchTerm],
    queryFn: () => getPOSProductsAction(searchTerm || undefined),
    staleTime: 5 * 1000, // 5 secondes - données considérées comme fraîches pendant 5s
    gcTime: 10 * 60 * 1000, // 10 minutes - garder en cache pendant 10 minutes
    refetchOnWindowFocus: true, // Rafraîchir quand la fenêtre reprend le focus
    refetchOnMount: false, // Ne pas rafraîchir à chaque montage si les données sont fraîches
    refetchInterval: (query) => {
      // Polling seulement si la fenêtre est active et qu'on n'est pas en train de chercher
      if (!isWindowFocused || searchTerm.trim().length > 0) {
        return false; // Désactiver le polling si la fenêtre n'est pas active ou si on cherche
      }
      // Polling toutes les 8 secondes quand la fenêtre est active
      return 8000;
    },
  });

  const products = useMemo(() => {
    return productsResponse?.success ? productsResponse.data || [] : [];
  }, [productsResponse]);

  // Détecter les changements de stock et mettre à jour le panier si nécessaire
  useEffect(() => {
    if (products.length === 0 || previousProductsRef.current.length === 0) {
      previousProductsRef.current = products;
      return;
    }

    const updatedProducts = new Set<string>();
    const productMap = new Map(products.map(p => [p.id, p]));
    const previousProductMap = new Map(previousProductsRef.current.map(p => [p.id, p]));

    // Détecter les changements de stock
    products.forEach(product => {
      const previousProduct = previousProductMap.get(product.id);
      if (previousProduct && previousProduct.stock_qty !== product.stock_qty) {
        updatedProducts.add(product.id);
      }
    });

    // Mettre à jour le panier si le stock a changé pour un produit dans le panier
    if (updatedProducts.size > 0) {
      setStockUpdatedProducts(updatedProducts);
      setLastUpdateTime(new Date());

      // Nettoyer l'animation après 3 secondes
      const timer = setTimeout(() => {
        setStockUpdatedProducts(new Set());
      }, 3000);

      // Mettre à jour le panier avec les nouveaux stocks
      setCart(prevCart => {
        return prevCart.map(item => {
          const updatedProduct = productMap.get(item.product.id);
          if (updatedProduct) {
            // Si le stock a diminué et que la quantité dans le panier dépasse le nouveau stock
            if (item.quantity > updatedProduct.stock_qty) {
              toast(
                `Stock insuffisant pour "${item.product.name}". Quantité ajustée à ${updatedProduct.stock_qty}.`,
                { 
                  duration: 4000,
                  icon: '⚠️',
                  style: {
                    background: '#FEF3C7',
                    color: '#92400E',
                  },
                }
              );
              return {
                ...item,
                product: updatedProduct,
                quantity: Math.min(item.quantity, updatedProduct.stock_qty),
              };
            }
            // Mettre à jour le produit dans le panier avec les nouvelles données
            return {
              ...item,
              product: updatedProduct,
            };
          }
          return item;
        }).filter(item => item.quantity > 0); // Retirer les articles avec quantité 0
      });

      // Afficher une notification si des produits ont été mis à jour
      if (updatedProducts.size > 0 && !searchTerm) {
        toast.success(
          `Stock mis à jour pour ${updatedProducts.size} produit(s)`,
          { 
            duration: 2000,
            icon: '🔄',
          }
        );
      }

      return () => clearTimeout(timer);
    }

    previousProductsRef.current = products;
  }, [products, searchTerm]);

  // Mutation pour créer une vente
  const createSaleMutation = useMutation({
    mutationFn: createSaleAction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Vente créée avec succès ! Référence: ${result.data.reference}`);
        setCart([]);
        setSearchTerm('');
        // Invalider les queries pour forcer le rafraîchissement
        queryClient.invalidateQueries({ queryKey: ['my-sales'] });
        queryClient.invalidateQueries({ queryKey: ['pos-products'] });
        // Rafraîchir immédiatement les produits pour mettre à jour le stock
        queryClient.refetchQueries({ queryKey: ['pos-products', searchTerm] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: any) => {
      // Si l'erreur est liée au stock insuffisant, rafraîchir les produits
      if (error.message?.includes('stock') || error.message?.includes('Stock')) {
        queryClient.invalidateQueries({ queryKey: ['pos-products'] });
        queryClient.refetchQueries({ queryKey: ['pos-products', searchTerm] });
      }
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

  // Ajouter un produit au panier avec vérification du stock
  const addToCart = useCallback((product: POSProduct) => {
    // Vérifier le stock actuel depuis les produits mis à jour
    const currentProduct = products.find(p => p.id === product.id);
    const currentStock = currentProduct?.stock_qty ?? product.stock_qty;

    if (currentStock === 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= currentStock) {
        toast.error(`Stock insuffisant. Stock disponible: ${currentStock}`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, product: currentProduct || product }
            : item
        )
      );
    } else {
      setCart([...cart, { product: currentProduct || product, quantity: 1 }]);
    }
  }, [cart, products]);

  // Retirer un produit du panier
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter((item) => item.product.id !== productId));
  }, []);

  // Modifier la quantité d'un article avec vérification du stock
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Vérifier le stock actuel depuis les produits mis à jour
    const currentProduct = products.find(p => p.id === productId);
    
    setCart(prevCart => {
      const item = prevCart.find((item) => item.product.id === productId);
      
      if (item) {
        const currentStock = currentProduct?.stock_qty ?? item.product.stock_qty;
        if (quantity > currentStock) {
          toast.error(`Stock insuffisant. Stock disponible: ${currentStock}`);
          return prevCart;
        }

        return prevCart.map((item) =>
          item.product.id === productId 
            ? { ...item, quantity, product: currentProduct || item.product }
            : item
        );
      }
      return prevCart;
    });
  }, [products, removeFromCart]);

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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Point de Vente</h1>
            {lastUpdateTime && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full ${isWindowFocused ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span>
                  {isWindowFocused ? 'Mise à jour automatique active' : 'Mise à jour en pause'}
                </span>
              </div>
            )}
          </div>
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

                const isStockUpdated = stockUpdatedProducts.has(product.id);
                const previousStock = previousProductsRef.current.find(p => p.id === product.id)?.stock_qty;
                const stockChanged = previousStock !== undefined && previousStock !== product.stock_qty;

                return (
                  <button
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    disabled={isOutOfStock}
                    className={`p-4 bg-white rounded-lg border-2 transition-all text-left relative ${
                      isOutOfStock
                        ? 'border-gray-200 opacity-50 cursor-not-allowed'
                        : inCart
                          ? 'border-brand-500 bg-brand-50'
                          : isStockUpdated
                            ? 'border-green-400 bg-green-50 animate-pulse'
                            : 'border-gray-200 hover:border-brand-300 hover:shadow-md'
                    }`}
                  >
                    {/* Badge de mise à jour du stock */}
                    {isStockUpdated && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full animate-bounce">
                        🔄 Mis à jour
                      </div>
                    )}
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
                      <div className="flex items-center gap-1">
                        {stockChanged && previousStock !== undefined && (
                          <span className={`text-xs ${previousStock > product.stock_qty ? 'text-red-500' : 'text-green-500'}`}>
                            {previousStock > product.stock_qty ? '↓' : '↑'}
                          </span>
                        )}
                        <p className={`text-xs font-medium ${isOutOfStock ? 'text-red-600' : isStockUpdated ? 'text-green-600' : 'text-gray-500'}`}>
                          Stock: {product.stock_qty}
                        </p>
                      </div>
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
