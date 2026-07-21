import { Injectable } from '@angular/core';
import { Observable, delay, map, of, tap } from 'rxjs';
import {
  BRANCH_OPTIONS,
  CATEGORY_OPTIONS,
  CUSTOMER_OPTIONS,
  DESIGNER_OPTIONS,
  MATERIAL_OPTIONS,
  PURITY_OPTIONS,
  SIMULATED_TOTAL_RECORDS,
  STATUS_OPTIONS,
  SUB_CATEGORY_OPTIONS,
} from '../core/constants/design.constants';
import {
  ApprovalStatus,
  DashboardAnalytics,
  DashboardKpiSummary,
  DesignDetail,
  DesignFilter,
  DesignListItem,
  DesignQuery,
  DesignSalesInfo,
  PaginatedResponse,
  DesignOrderDetail,
  DesignProductionInfo,
  DesignInventoryInfo,
  SalesStatus,
  SelectOption,
} from '../core/models/design.models';

@Injectable({ providedIn: 'root' })
export class DesignService {
  private readonly cache = new Map<number, DesignListItem>();
  private readonly detailCache = new Map<number, DesignDetail>();
  private kpiCache: { filter: string; data: DashboardKpiSummary } | null = null;
  private analyticsCache: { filter: string; data: DashboardAnalytics } | null = null;

  private readonly customers = CUSTOMER_OPTIONS.map((o) => o.label);
  private readonly branches = BRANCH_OPTIONS.map((o) => o.value);
  private readonly categories = CATEGORY_OPTIONS.map((o) => o.value);
  private readonly subCategories = SUB_CATEGORY_OPTIONS.map((o) => o.value);
  private readonly materials = MATERIAL_OPTIONS.map((o) => o.value);
  private readonly purities = PURITY_OPTIONS.map((o) => o.value);
  private readonly designers = DESIGNER_OPTIONS.map((o) => o.value);
  private readonly statuses: ApprovalStatus[] = ['Approved', 'Pending', 'Rejected', 'Inactive'];
  private readonly salesStatuses: SalesStatus[] = ['Active', 'Discontinued', 'Seasonal', 'New'];

  getFilterOptions(): Record<string, SelectOption[]> {
    return {
      customers: CUSTOMER_OPTIONS,
      branches: BRANCH_OPTIONS,
      categories: CATEGORY_OPTIONS,
      subCategories: SUB_CATEGORY_OPTIONS,
      materials: MATERIAL_OPTIONS,
      purities: PURITY_OPTIONS,
      designers: DESIGNER_OPTIONS,
      statuses: STATUS_OPTIONS,
    };
  }

  searchDesigns(
    filter: DesignFilter,
    query: DesignQuery
  ): Observable<PaginatedResponse<DesignListItem>> {
    const cacheKey = this.serializeFilter(filter);
    return of(null).pipe(
      delay(600),
      map(() => {
        const matchedIds = this.findMatchingIds(filter);
        const totalRecords = matchedIds.length > 0
          ? Math.min(matchedIds.length * 50, SIMULATED_TOTAL_RECORDS)
          : 0;

        const sorted = this.sortIds(matchedIds, query.sortBy, query.sortOrder);
        const start = (query.page - 1) * query.pageSize;
        const pageIds = sorted.slice(start, start + query.pageSize);
        const data = pageIds.map((id) => this.getOrCreateDesign(id));

        return { data, totalRecords, page: query.page, pageSize: query.pageSize };
      }),
      tap(() => { /* server-side pagination simulation */ })
    );
  }

  getKpiSummary(filter: DesignFilter): Observable<DashboardKpiSummary> {
    const key = this.serializeFilter(filter);
    if (this.kpiCache?.filter === key) {
      return of(this.kpiCache.data).pipe(delay(100));
    }

    return of(null).pipe(
      delay(400),
      map(() => {
        const matched = this.findMatchingIds(filter);
        const base = matched.length * 42;
        const summary: DashboardKpiSummary = {
          lastUpdated: new Date().toLocaleString('en-IN'),
          metrics: [
            { key: 'totalDesigns', label: 'Total Designs', value: base, growth: 12.5, trend: 'up', icon: 'pi pi-box', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)', sparkline: this.sparkline(7, 80, 120) },
            { key: 'activeDesigns', label: 'Active Designs', value: Math.floor(base * 0.72), growth: 8.3, trend: 'up', icon: 'pi pi-check-circle', gradient: 'linear-gradient(135deg, #16a34a, #15803d)', sparkline: this.sparkline(7, 60, 100) },
            { key: 'inactiveDesigns', label: 'Inactive Designs', value: Math.floor(base * 0.1), growth: -2.1, trend: 'down', icon: 'pi pi-ban', gradient: 'linear-gradient(135deg, #64748b, #475569)', sparkline: this.sparkline(7, 10, 30) },
            { key: 'pendingApproval', label: 'Pending Approval', value: Math.floor(base * 0.08), growth: 5.6, trend: 'up', icon: 'pi pi-clock', gradient: 'linear-gradient(135deg, #ea580c, #c2410c)', sparkline: this.sparkline(7, 20, 50) },
            { key: 'rejectedDesigns', label: 'Rejected Designs', value: Math.floor(base * 0.05), growth: -1.2, trend: 'down', icon: 'pi pi-times-circle', gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)', sparkline: this.sparkline(7, 5, 20) },
            { key: 'totalSalesQty', label: 'Total Sales Qty', value: Math.floor(base * 3.2), growth: 15.8, trend: 'up', icon: 'pi pi-shopping-cart', gradient: 'linear-gradient(135deg, #0891b2, #0e7490)', sparkline: this.sparkline(7, 200, 400) },
            { key: 'totalSalesValue', label: 'Total Sales Value', value: base * 12500, growth: 18.2, trend: 'up', icon: 'pi pi-dollar', gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)', sparkline: this.sparkline(7, 500, 900), format: 'currency' },
            { key: 'pendingOrders', label: 'Pending Orders', value: Math.floor(base * 0.15), growth: 3.4, trend: 'up', icon: 'pi pi-inbox', gradient: 'linear-gradient(135deg, #d97706, #b45309)', sparkline: this.sparkline(7, 30, 70) },
            { key: 'pendingOrderValue', label: 'Pending Order Value', value: base * 3200, growth: 6.7, trend: 'up', icon: 'pi pi-wallet', gradient: 'linear-gradient(135deg, #db2777, #be185d)', sparkline: this.sparkline(7, 100, 300), format: 'currency' },
            { key: 'totalCustomers', label: 'Total Customers', value: this.customers.length * 12, growth: 4.1, trend: 'up', icon: 'pi pi-users', gradient: 'linear-gradient(135deg, #059669, #047857)', sparkline: this.sparkline(7, 40, 80) },
            { key: 'newThisMonth', label: 'New Designs This Month', value: Math.floor(base * 0.04), growth: 22.0, trend: 'up', icon: 'pi pi-sparkles', gradient: 'linear-gradient(135deg, #4f46e5, #4338ca)', sparkline: this.sparkline(7, 10, 40) },
            { key: 'lastUpdated', label: 'Last Updated', value: new Date().toLocaleTimeString('en-IN'), growth: 0, trend: 'neutral', icon: 'pi pi-sync', gradient: 'linear-gradient(135deg, #334155, #1e293b)', sparkline: [], format: 'datetime' },
          ],
        };
        this.kpiCache = { filter: key, data: summary };
        return summary;
      })
    );
  }

  getAnalytics(filter: DesignFilter): Observable<DashboardAnalytics> {
    const key = this.serializeFilter(filter);
    if (this.analyticsCache?.filter === key) {
      return of(this.analyticsCache.data).pipe(delay(100));
    }

    return of(null).pipe(
      delay(500),
      map(() => {
        const data: DashboardAnalytics = {
          salesTrend: this.chartData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], 100, 500),
          topCustomers: this.chartData(this.customers.slice(0, 5), 50, 200),
          topCategories: this.chartData(this.categories, 80, 300),
          topMaterials: this.chartData(this.materials, 60, 250),
          topDesigners: this.chartData(this.designers.slice(0, 5), 40, 180),
          stockMovement: this.chartData(['Week 1', 'Week 2', 'Week 3', 'Week 4'], 30, 150),
          monthlyProduction: this.chartData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], 70, 280),
          pendingOrders: this.chartData(['Urgent', 'Normal', 'Low'], 20, 100),
        };
        this.analyticsCache = { filter: key, data };
        return data;
      })
    );
  }

  getDesignDetail(designID: number): Observable<DesignDetail> {
    const internalId = this.resolveInternalId(designID);
    if (this.detailCache.has(internalId)) {
      return of(this.detailCache.get(internalId)!).pipe(delay(200));
    }

    return of(null).pipe(
      delay(350),
      map(() => {
        const base = this.getOrCreateDesign(internalId);
        const detail: DesignDetail = {
          ...base,
          general: {
            designCode: base.designCode,
            designName: base.designName,
            designID: base.designID,
            barcode: `BAR${base.designID}${base.designCode.replace(/-/g, '')}`,
            customer: base.customerAccount,
            designer: base.designer,
            category: base.category,
            subCategory: base.subCategory,
            material: base.material,
            purity: base.purity,
            grossWeight: base.grossWeight,
            netWeight: base.netWeight,
            stoneWeight: base.stoneWeight,
            makingCharge: base.makingCharge,
            status: base.approvalStatus,
            createdDate: base.createdDate,
            modifiedDate: base.createdDate,
          },
          sales: this.buildSalesInfo(base),
          orders: this.buildOrderDetails(designID),
          production: this.buildProductionInfo(base),
          inventory: this.buildInventoryInfo(base, designID),
        };
        this.detailCache.set(internalId, detail);
        return detail;
      })
    );
  }

  toggleFavorite(designID: number): void {
    const d = this.cache.get(this.resolveInternalId(designID));
    if (d) d.isFavorite = !d.isFavorite;
  }

  togglePin(designID: number): void {
    const d = this.cache.get(this.resolveInternalId(designID));
    if (d) d.isPinned = !d.isPinned;
  }

  clearCache(): void {
    this.cache.clear();
    this.detailCache.clear();
    this.kpiCache = null;
    this.analyticsCache = null;
  }

  private findMatchingIds(filter: DesignFilter): number[] {
    const ids: number[] = [];
    const poolSize = 2000;
    for (let i = 1; i <= poolSize; i++) {
      const d = this.getOrCreateDesign(i);
      if (this.matchesFilter(d, filter)) ids.push(i);
    }
    return ids;
  }

  private matchesFilter(d: DesignListItem, filter: DesignFilter): boolean {
    if (filter.customerAccountId != null) {
      const customer = CUSTOMER_OPTIONS.find((o) => Number(o.value) === filter.customerAccountId);
      if (customer && d.customerAccount !== customer.label) return false;
    }
    if (filter.startDate || filter.endDate) {
      const created = this.parseDisplayDate(d.createdDate);
      if (filter.startDate) {
        const start = new Date(filter.startDate);
        if (created < start) return false;
      }
      if (filter.endDate) {
        const end = new Date(filter.endDate);
        end.setHours(23, 59, 59, 999);
        if (created > end) return false;
      }
    }
    return true;
  }

  private parseDisplayDate(value: string): Date {
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    const [day, mon, year] = value.split('-');
    return new Date(Number(year), months[mon] ?? 0, Number(day));
  }

  private getOrCreateDesign(id: number): DesignListItem {
    if (this.cache.has(id)) return this.cache.get(id)!;

    const seed = id;
    const category = this.categories[seed % this.categories.length];
    const status = this.statuses[seed % this.statuses.length];
    const hasImage = seed % 6 !== 0;

    const salesQty = Math.floor(this.rand(seed, 10, 500));
    const pendingQty = Math.floor(this.rand(seed, 0, 30));
    const makingCharge = parseFloat((this.rand(seed, 500, 5000)).toFixed(2));
    const currentStock = Math.floor(this.rand(seed, 0, 200));
    const reservedQty = Math.floor(this.rand(seed, 0, 50));
    const inProcessing = Math.floor(this.rand(seed, 0, 25));
    const completedOrders = Math.floor(this.rand(seed, 50, 1500));
    const totalSalesValue = Math.floor(salesQty * makingCharge * 1.5);
    const pendingOrderValue = Math.floor(pendingQty * makingCharge * 1.5);

    const design: DesignListItem = {
      designID: 10000 + id,
      designCode: `DC-${String(10000 + id).padStart(5, '0')}`,
      designName: `${category} Design ${id}`,
      customerAccount: this.customers[seed % this.customers.length],
      category,
      subCategory: this.subCategories[seed % this.subCategories.length],
      material: this.materials[seed % this.materials.length],
      purity: this.purities[seed % this.purities.length],
      grossWeight: parseFloat((this.rand(seed, 5, 50)).toFixed(3)),
      netWeight: parseFloat((this.rand(seed, 4, 48)).toFixed(3)),
      stoneWeight: parseFloat((this.rand(seed, 0.1, 5)).toFixed(3)),
      makingCharge,
      salesQuantity: salesQty,
      totalSalesValue,
      pendingOrderQuantity: pendingQty,
      pendingOrderValue,
      inProcessingQuantity: inProcessing,
      completedOrderQuantity: completedOrders,
      currentStock,
      availableStock: Math.max(0, currentStock - reservedQty),
      reservedQuantity: reservedQty,
      createdDate: this.formatDate(new Date(2025, seed % 12, (seed % 28) + 1)),
      designer: this.designers[seed % this.designers.length],
      approvalStatus: status,
      salesStatus: this.salesStatuses[seed % this.salesStatuses.length],
      imageUrl: hasImage ? `https://picsum.photos/seed/dc${id}/640/360` : '',
      images: hasImage
        ? [
            `https://picsum.photos/seed/dc${id}a/800/600`,
            `https://picsum.photos/seed/dc${id}b/800/600`,
            `https://picsum.photos/seed/dc${id}c/800/600`,
          ]
        : [],
      isFavorite: false,
      isPinned: false,
    };

    this.cache.set(id, design);
    return design;
  }

  private buildSalesInfo(base: DesignListItem): DesignSalesInfo {
    return {
      totalSalesQuantity: base.salesQuantity,
      totalSalesValue: base.totalSalesValue,
      averageSellingPrice: base.makingCharge * 1.5,
      lastSoldDate: base.createdDate,
      bestCustomer: base.customerAccount,
      topSellingBranch: this.branches[base.designID % this.branches.length],
      monthlySales: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
        month: m,
        quantity: Math.floor(base.salesQuantity / 6 * (0.8 + i * 0.05)),
        value: Math.floor(base.salesQuantity / 6 * base.makingCharge * 1.5),
      })),
      yearlySales: ['2023', '2024', '2025', '2026'].map((y, i) => ({
        year: y,
        quantity: Math.floor(base.salesQuantity * (0.5 + i * 0.2)),
        value: Math.floor(base.salesQuantity * base.makingCharge * 1.5 * (0.5 + i * 0.2)),
      })),
    };
  }

  private buildOrderDetails(designID: number): DesignOrderDetail[] {
    const stages = ['Cutting', 'Polishing', 'Setting', 'Quality Check', 'Packaging'];
    return Array.from({ length: 8 }, (_, i) => {
      const quantity = Math.floor(this.rand(designID + i, 1, 20));
      const pendingQuantity = Math.floor(this.rand(designID + i + 7, 0, quantity));
      return {
        orderNo: `ORD-${designID}-${1000 + i}`,
        customer: this.customers[(designID + i) % this.customers.length],
        orderDate: this.formatDate(new Date(2026, 5, 10 + i)),
        deliveryDate: this.formatDate(new Date(2026, 6, 15 + i)),
        quantity,
        pendingQuantity,
        status: ['Pending', 'Confirmed', 'In Production', 'Shipped'][i % 4],
        amount: parseFloat((this.rand(designID + i, 5000, 50000)).toFixed(2)),
        processingStage: stages[i % stages.length],
        expectedDelivery: this.formatDate(new Date(2026, 6, 20 + i)),
      };
    });
  }

  private buildProductionInfo(base: DesignListItem): DesignProductionInfo {
    return {
      productionQuantity: base.inProcessingQuantity + base.completedOrderQuantity,
      completedQuantity: base.completedOrderQuantity,
      pendingQuantity: base.pendingOrderQuantity,
      rejectedQuantity: Math.floor(this.rand(base.designID, 0, 10)),
      productionDate: base.createdDate,
      productionDateRaw: base.createdDate || null,
      department: ['Casting', 'Finishing', 'Setting', 'Polishing'][base.designID % 4],
      supervisor: this.designers[base.designID % this.designers.length],
    };
  }

  private buildInventoryInfo(base: DesignListItem, _designID: number): DesignInventoryInfo {
    return {
      currentStock: base.currentStock,
    };
  }

  private sortIds(ids: number[], sortBy: string, sortOrder: string): number[] {
    const sorted = [...ids].sort((a, b) => {
      const da = this.getOrCreateDesign(a);
      const db = this.getOrCreateDesign(b);
      let cmp = 0;
      switch (sortBy) {
        case 'designCode': cmp = da.designCode.localeCompare(db.designCode); break;
        case 'createdDate': cmp = da.createdDate.localeCompare(db.createdDate); break;
        case 'category': cmp = da.category.localeCompare(db.category); break;
        case 'status': cmp = da.approvalStatus.localeCompare(db.approvalStatus); break;
        case 'salesQuantity': cmp = da.salesQuantity - db.salesQuantity; break;
        default: cmp = a - b;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }

  private rand(seed: number, min: number, max: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  }

  private sparkline(points: number, min: number, max: number): number[] {
    return Array.from({ length: points }, (_, i) => Math.floor(min + Math.random() * (max - min) + i * 3));
  }

  private chartData(labels: string[], min: number, max: number) {
    return labels.map((label) => ({ label, value: Math.floor(min + Math.random() * (max - min)) }));
  }

  private formatDate(d: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
  }

  private serializeFilter(filter: DesignFilter): string {
    return JSON.stringify(filter);
  }

  private resolveInternalId(designID: number): number {
    return designID >= 10000 ? designID - 10000 : designID;
  }
}
