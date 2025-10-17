import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertReviewSchema, insertAddressSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Helper to ensure user is authenticated
const requireAuth = (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
};

// Helper to ensure user is admin
const requireAdmin = (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user || !req.user.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // ==================== AUTH ROUTES ====================
  
  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      // Check if isAuthenticated method exists and user is authenticated
      if (typeof req.isAuthenticated !== 'function' || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error in /api/auth/me:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  
  // ==================== PRODUCT ROUTES ====================
  
  // Get all products with filters
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      let products = await storage.getAllProducts();
      
      const { category, featured, isNew, minPrice, maxPrice, sizes, colors, sort } = req.query;
      
      // Apply filters
      if (category) {
        products = products.filter(p => p.category === category);
      }
      if (featured === 'true') {
        products = products.filter(p => p.featured);
      }
      if (isNew === 'true') {
        products = products.filter(p => p.isNew);
      }
      if (minPrice) {
        products = products.filter(p => parseFloat(p.price) >= parseFloat(minPrice as string));
      }
      if (maxPrice) {
        products = products.filter(p => parseFloat(p.price) <= parseFloat(maxPrice as string));
      }
      if (sizes && Array.isArray(sizes)) {
        products = products.filter(p => sizes.some(s => p.sizes?.includes(s as string)));
      }
      if (colors && Array.isArray(colors)) {
        products = products.filter(p => colors.some(c => p.colors?.includes(c as string)));
      }
      
      // Apply sorting
      if (sort === 'price_asc') {
        products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      } else if (sort === 'price_desc') {
        products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  
  // Get single product
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  
  // Create product (admin only)
  app.post("/api/products", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });
  
  // Update product (admin only)
  app.put("/api/products/:id", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Failed to update product" });
    }
  });
  
  // Delete product (admin only)
  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  
  // ==================== CART ROUTES ====================
  
  // Get user's cart
  app.get("/api/cart", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const cart = await storage.getCart(req.user!.id);
      res.json(cart || { items: [] });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });
  
  // Add to cart
  app.post("/api/cart", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const { productId, quantity, size, color } = req.body;
      const cart = await storage.getCart(req.user!.id);
      const currentItems = cart?.items || [];
      
      // Find existing item
      const existingIndex = currentItems.findIndex(
        (item: any) => item.productId === productId && item.size === size && item.color === color
      );
      
      let newItems;
      if (existingIndex >= 0) {
        // Update quantity
        newItems = [...currentItems];
        newItems[existingIndex].quantity += quantity;
      } else {
        // Add new item
        newItems = [...currentItems, { productId, quantity, size, color }];
      }
      
      const updatedCart = await storage.upsertCart(req.user!.id, newItems);
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });
  
  // Update cart item
  app.put("/api/cart/:productId", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const { quantity, size, color } = req.body;
      const cart = await storage.getCart(req.user!.id);
      const currentItems = cart?.items || [];
      
      const newItems = currentItems.map((item: any) => {
        if (item.productId === req.params.productId && item.size === size && item.color === color) {
          return { ...item, quantity };
        }
        return item;
      });
      
      const updatedCart = await storage.upsertCart(req.user!.id, newItems);
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart" });
    }
  });
  
  // Remove from cart
  app.delete("/api/cart/:productId", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const { size, color } = req.query;
      const cart = await storage.getCart(req.user!.id);
      const currentItems = cart?.items || [];
      
      const newItems = currentItems.filter((item: any) => 
        !(item.productId === req.params.productId && item.size === size && item.color === color)
      );
      
      const updatedCart = await storage.upsertCart(req.user!.id, newItems);
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from cart" });
    }
  });
  
  // Clear cart
  app.delete("/api/cart", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      await storage.clearCart(req.user!.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });
  
  // ==================== WISHLIST ROUTES ====================
  
  // Get user's wishlist
  app.get("/api/wishlist", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const wishlist = await storage.getWishlist(req.user!.id);
      res.json(wishlist || { productIds: [] });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wishlist" });
    }
  });
  
  // Add to wishlist
  app.post("/api/wishlist", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const { productId } = req.body;
      const wishlist = await storage.addToWishlist(req.user!.id, productId);
      res.json(wishlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to wishlist" });
    }
  });
  
  // Remove from wishlist
  app.delete("/api/wishlist/:productId", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const wishlist = await storage.removeFromWishlist(req.user!.id, req.params.productId);
      res.json(wishlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from wishlist" });
    }
  });
  
  // ==================== ORDER ROUTES ====================
  
  // Get orders (user's own or all for admin)
  app.get("/api/orders", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const orders = req.user!.isAdmin 
        ? await storage.getAllOrders()
        : await storage.getAllOrders(req.user!.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  
  // Get single order
  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Check if user owns this order or is admin
      if (order.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });
  
  // Create order
  app.post("/api/orders", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const validated = insertOrderSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      
      const order = await storage.createOrder(validated);
      
      // Apply promo code if present
      if (order.promoCode) {
        await storage.incrementPromoUse(order.promoCode);
      }
      
      // Clear cart
      await storage.clearCart(req.user!.id);
      
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid order data" });
    }
  });
  
  // Update order status (admin only)
  app.put("/api/orders/:id/status", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });
  
  // ==================== REVIEW ROUTES ====================
  
  // Get product reviews
  app.get("/api/reviews", async (req: Request, res: Response) => {
    try {
      const { productId } = req.query;
      if (!productId) {
        return res.status(400).json({ error: "productId is required" });
      }
      const reviews = await storage.getProductReviews(productId as string);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  
  // Create review
  app.post("/api/reviews", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const validated = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const review = await storage.createReview(validated);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: "Invalid review data" });
    }
  });
  
  // ==================== PROMO CODE ROUTES ====================
  
  // Validate promo code
  app.post("/api/promo-codes/validate", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      const promo = await storage.validatePromoCode(code);
      if (!promo) {
        return res.status(404).json({ error: "Invalid or expired promo code" });
      }
      res.json(promo);
    } catch (error) {
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });
  
  // ==================== ADDRESS ROUTES ====================
  
  // Get user addresses
  app.get("/api/addresses", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const addresses = await storage.getUserAddresses(req.user!.id);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch addresses" });
    }
  });
  
  // Create address
  app.post("/api/addresses", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const validated = insertAddressSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const address = await storage.createAddress(validated);
      res.status(201).json(address);
    } catch (error) {
      res.status(400).json({ error: "Invalid address data" });
    }
  });
  
  // Update address
  app.put("/api/addresses/:id", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      const address = await storage.updateAddress(req.params.id, req.body);
      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }
      res.json(address);
    } catch (error) {
      res.status(400).json({ error: "Failed to update address" });
    }
  });
  
  // Delete address
  app.delete("/api/addresses/:id", async (req: Request, res: Response) => {
    if (!requireAuth(req, res)) return;
    
    try {
      await storage.deleteAddress(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete address" });
    }
  });
  
  // ==================== ADMIN ROUTES ====================
  
  // Get admin stats
  app.get("/api/admin/stats", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
