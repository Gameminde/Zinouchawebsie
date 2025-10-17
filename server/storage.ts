import { db } from "./db";
import {
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type Cart,
  type Wishlist,
  type Review,
  type InsertReview,
  type PromoCode,
  type InsertPromoCode,
  type Address,
  type InsertAddress,
  users,
  products,
  orders,
  carts,
  wishlists,
  reviews,
  promoCodes,
  addresses,
} from "@shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  // Order methods
  getAllOrders(userId?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Cart methods
  getCart(userId: string): Promise<Cart | undefined>;
  upsertCart(userId: string, items: any[]): Promise<Cart>;
  clearCart(userId: string): Promise<void>;

  // Wishlist methods
  getWishlist(userId: string): Promise<Wishlist | undefined>;
  addToWishlist(userId: string, productId: string): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: string): Promise<Wishlist | undefined>;

  // Review methods
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Promo code methods
  getPromoCode(code: string): Promise<PromoCode | undefined>;
  validatePromoCode(code: string): Promise<PromoCode | undefined>;
  incrementPromoUse(code: string): Promise<void>;

  // Address methods
  getUserAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<void>;

  // Admin stats
  getAdminStats(): Promise<any>;
}

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(insertUser: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          firstName: insertUser.firstName,
          lastName: insertUser.lastName,
          profileImageUrl: insertUser.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Order methods
  async getAllOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    }
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const [newOrder] = await db
      .insert(orders)
      .values({ ...order, orderNumber })
      .returning();
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  // Cart methods
  async getCart(userId: string): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    return cart;
  }

  async upsertCart(userId: string, items: any[]): Promise<Cart> {
    const existingCart = await this.getCart(userId);
    
    if (existingCart) {
      const [updated] = await db
        .update(carts)
        .set({ items, updatedAt: new Date() })
        .where(eq(carts.userId, userId))
        .returning();
      return updated;
    } else {
      const [newCart] = await db
        .insert(carts)
        .values({ userId, items })
        .returning();
      return newCart;
    }
  }

  async clearCart(userId: string): Promise<void> {
    await db.update(carts).set({ items: [] }).where(eq(carts.userId, userId));
  }

  // Wishlist methods
  async getWishlist(userId: string): Promise<Wishlist | undefined> {
    const [wishlist] = await db.select().from(wishlists).where(eq(wishlists.userId, userId));
    return wishlist;
  }

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    const existing = await this.getWishlist(userId);
    
    if (existing) {
      const productIds = existing.productIds || [];
      if (!productIds.includes(productId)) {
        const [updated] = await db
          .update(wishlists)
          .set({ 
            productIds: [...productIds, productId],
            updatedAt: new Date(),
          })
          .where(eq(wishlists.userId, userId))
          .returning();
        return updated;
      }
      return existing;
    } else {
      const [newWishlist] = await db
        .insert(wishlists)
        .values({ userId, productIds: [productId] })
        .returning();
      return newWishlist;
    }
  }

  async removeFromWishlist(userId: string, productId: string): Promise<Wishlist | undefined> {
    const existing = await this.getWishlist(userId);
    if (!existing) return undefined;

    const productIds = (existing.productIds || []).filter(id => id !== productId);
    const [updated] = await db
      .update(wishlists)
      .set({ productIds, updatedAt: new Date() })
      .where(eq(wishlists.userId, userId))
      .returning();
    return updated;
  }

  // Review methods
  async getProductReviews(productId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Promo code methods
  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    const [promo] = await db.select().from(promoCodes).where(eq(promoCodes.code, code));
    return promo;
  }

  async validatePromoCode(code: string): Promise<PromoCode | undefined> {
    const [promo] = await db
      .select()
      .from(promoCodes)
      .where(
        and(
          eq(promoCodes.code, code),
          eq(promoCodes.active, true)
        )
      );

    if (!promo) return undefined;

    // Check expiry
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return undefined;
    }

    // Check max uses
    if (promo.maxUses && (promo.currentUses || 0) >= promo.maxUses) {
      return undefined;
    }

    return promo;
  }

  async incrementPromoUse(code: string): Promise<void> {
    await db
      .update(promoCodes)
      .set({ currentUses: sql`${promoCodes.currentUses} + 1` })
      .where(eq(promoCodes.code, code));
  }

  // Address methods
  async getUserAddresses(userId: string): Promise<Address[]> {
    return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.createdAt));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db.insert(addresses).values(address).returning();
    return newAddress;
  }

  async updateAddress(id: string, address: Partial<InsertAddress>): Promise<Address | undefined> {
    const [updated] = await db
      .update(addresses)
      .set(address)
      .where(eq(addresses.id, id))
      .returning();
    return updated;
  }

  async deleteAddress(id: string): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  // Admin stats
  async getAdminStats(): Promise<any> {
    const [ordersResult] = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        revenue: sql<number>`coalesce(sum(${orders.totalAmount}::numeric), 0)`,
      })
      .from(orders);

    const [productsResult] = await db
      .select({
        totalProducts: sql<number>`count(*)`,
      })
      .from(products);

    const [usersResult] = await db
      .select({
        totalCustomers: sql<number>`count(*)`,
      })
      .from(users);

    return {
      totalOrders: Number(ordersResult?.totalOrders || 0),
      revenue: Number(ordersResult?.revenue || 0),
      totalProducts: Number(productsResult?.totalProducts || 0),
      totalCustomers: Number(usersResult?.totalCustomers || 0),
    };
  }
}

export const storage = new DbStorage();
