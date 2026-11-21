import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { CategoryType, Product } from '../models/jewellery.model';
import { WhatsappShareModal } from './whatsapp-share-modal';
import { ProductVideoModal } from './product-video-modal';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'weight-desc';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, WhatsappShareModal, ProductVideoModal],
  template: `
    <div class="space-y-3.5 pb-28 lg:pb-8 relative">
      <!-- Showroom Lookbook Banner -->
      <div class="bg-neutral-900 text-white p-4 lg:p-5 rounded-3xl shadow-md border border-amber-500/25 space-y-3">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center space-x-2.5 min-w-0">
            <button
              type="button"
              (click)="goBack.emit()"
              class="lg:hidden w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition shrink-0 cursor-pointer"
              title="Back">
              <span class="material-icons" [style.fontSize.px]="18">arrow_back</span>
            </button>
            <div class="min-w-0">
              <div class="flex items-center space-x-1.5">
                <span class="material-icons text-amber-400" [style.fontSize.px]="16">menu_book</span>
                <h2 class="font-bold text-sm sm:text-base text-white truncate">Digital Product Catalog</h2>
              </div>
              <p class="text-[11px] text-amber-300/90 truncate">
                {{ service.settings().shopName }} • {{ catalogItems().length }} Curated Designs
              </p>
            </div>
          </div>

          <!-- Customer View / Price Visibility Controls -->
          <div class="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              (click)="showPrices.set(!showPrices())"
              [class]="showPrices() ? 'bg-neutral-800 text-neutral-200 border-neutral-700' : 'bg-amber-500 text-neutral-950 border-amber-400'"
              class="px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer"
              title="Toggle Price Visibility for Customer Browsing">
              <span class="material-icons" [style.fontSize.px]="14">{{ showPrices() ? 'visibility' : 'visibility_off' }}</span>
              <span>{{ showPrices() ? 'Prices On' : 'Prices Hidden' }}</span>
            </button>
          </div>
        </div>

        <!-- Search + Sort + View Mode -->
        <div class="flex items-center gap-2">
          <div class="relative flex-1 min-w-0">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
              <span class="material-icons" [style.fontSize.px]="16">search</span>
            </span>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Search necklace, ring, 22K, SKU..."
              class="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white placeholder-neutral-400 focus:border-amber-400 outline-none transition" />
            @if (searchQuery()) {
              <button
                type="button"
                (click)="searchQuery.set('')"
                class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 hover:text-white cursor-pointer">
                <span class="material-icons" [style.fontSize.px]="15">close</span>
              </button>
            }
          </div>

          <select
            [value]="sortBy()"
            (change)="onSortChange($event)"
            class="px-2.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-[11px] font-semibold text-amber-200 outline-none focus:border-amber-400 cursor-pointer shrink-0">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low-High</option>
            <option value="price-desc">Price: High-Low</option>
            <option value="weight-desc">Heaviest Wt</option>
          </select>

          <button
            type="button"
            (click)="viewMode.set(viewMode() === 'grid' ? 'list' : 'grid')"
            class="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-300 flex items-center justify-center transition shrink-0 cursor-pointer"
            [title]="viewMode() === 'grid' ? 'Switch to List View' : 'Switch to Grid Lookbook'">
            <span class="material-icons" [style.fontSize.px]="18">{{ viewMode() === 'grid' ? 'view_agenda' : 'grid_view' }}</span>
          </button>
        </div>

        <!-- Category Chips + Shortlist Toggle -->
        <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
          @for (cat of categories; track cat) {
            <button
              type="button"
              (click)="selectedCategory.set(cat)"
              [class]="selectedCategory() === cat && !onlyShortlisted()
                ? 'bg-amber-500 text-neutral-950 border-amber-400'
                : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:border-amber-500/50'"
              class="px-3 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0">
              {{ cat }}
            </button>
          }

          <button
            type="button"
            (click)="onlyShortlisted.set(!onlyShortlisted())"
            [class]="onlyShortlisted()
              ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
              : 'bg-neutral-800/80 text-emerald-300 border-emerald-500/30 hover:border-emerald-400'"
            class="px-3 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap flex items-center space-x-1 transition cursor-pointer shrink-0">
            <span class="material-icons" [style.fontSize.px]="13">favorite</span>
            <span>Shortlist ({{ shortlistedIds().length }})</span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      @if (catalogItems().length === 0) {
        <div class="bg-white rounded-3xl p-10 text-center border border-neutral-200 shadow-xs space-y-2">
          <span class="material-icons text-4xl text-neutral-300">auto_stories</span>
          <h4 class="font-bold text-neutral-800 text-sm">No matching catalog pieces</h4>
          <p class="text-xs text-neutral-500">
            {{ onlyShortlisted() ? 'Tap the heart icon on any piece to build a customer shortlist.' : 'Try selecting a different category or clearing your search.' }}
          </p>
          <button
            type="button"
            (click)="resetFilters()"
            class="mt-1 px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold cursor-pointer">
            Show All Catalog
          </button>
        </div>
      } @else if (viewMode() === 'grid') {
        <!-- Lookbook Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          @for (item of catalogItems(); track item.id) {
            <div class="bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-amber-500/60 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <!-- Photo Showcase -->
                <div class="relative h-36 sm:h-40 lg:h-44 w-full bg-neutral-100 overflow-hidden">
                  <button
                    type="button"
                    (click)="inspectProduct.set(item)"
                    class="w-full h-full block cursor-pointer focus:outline-none">
                    <img
                      [src]="item.image"
                      [alt]="item.name"
                      referrerpolicy="no-referrer"
                      class="w-full h-full object-cover object-center block group-hover:scale-105 transition duration-500" />
                  </button>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none"></div>

                  <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-neutral-900/85 text-amber-300 text-[9px] font-bold backdrop-blur-xs pointer-events-none">
                    {{ item.category }} • {{ item.metalType }}
                  </span>

                  <!-- Shortlist Heart -->
                  <button
                    type="button"
                    (click)="toggleShortlist(item.id)"
                    [class]="isShortlisted(item.id) ? 'bg-rose-500 text-white border-rose-400' : 'bg-neutral-900/70 text-white border-white/25 hover:bg-neutral-900'"
                    class="absolute top-2 right-2 w-7 h-7 rounded-full border backdrop-blur-xs flex items-center justify-center shadow-sm transition active:scale-90 cursor-pointer"
                    title="Shortlist for Customer">
                    <span class="material-icons" [style.fontSize.px]="14">{{ isShortlisted(item.id) ? 'favorite' : 'favorite_border' }}</span>
                  </button>

                  <!-- Video Reel Badge if attached -->
                  @if (item.videoUrl) {
                    <button
                      type="button"
                      (click)="videoProduct.set(item)"
                      class="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[9px] font-extrabold flex items-center space-x-0.5 shadow-md cursor-pointer">
                      <span class="material-icons" [style.fontSize.px]="12">play_arrow</span>
                      <span>Reel</span>
                    </button>
                  }

                  <button
                    type="button"
                    (click)="inspectProduct.set(item)"
                    class="absolute bottom-2 left-2 right-12 text-left cursor-pointer">
                    <span class="text-[9px] font-mono text-amber-300 block truncate">{{ item.code }}</span>
                    <h4 class="font-bold text-xs text-white line-clamp-1 leading-tight">{{ item.name }}</h4>
                  </button>
                </div>

                <!-- Specs -->
                <div class="p-2.5 space-y-1">
                  <div class="flex items-center justify-between text-[10px] text-neutral-600">
                    <span class="font-semibold text-amber-800">{{ item.purity }}</span>
                    <span class="font-bold text-neutral-800 tabular-nums">{{ item.netWeight }}g Net</span>
                  </div>
                  <div class="text-[10px] text-neutral-500">
                    @if (item.quantity > 0) {
                      <span class="text-emerald-700 font-semibold">Ready in Showroom ({{ item.quantity }} pcs)</span>
                    } @else {
                      <span class="text-amber-700 font-semibold">Available on Order</span>
                    }
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-2.5 pb-2.5 pt-1.5 border-t border-neutral-100 flex items-center justify-between gap-1.5">
                @if (showPrices()) {
                  <span class="text-xs sm:text-sm font-extrabold text-neutral-950 tabular-nums">
                    ₹{{ item.sellingPrice | number:'1.0-0' }}
                  </span>
                } @else {
                  <span class="text-[10px] font-bold uppercase tracking-wide text-amber-700">Price on Request</span>
                }

                <div class="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    (click)="inspectProduct.set(item)"
                    class="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold transition cursor-pointer">
                    Details
                  </button>
                  <button
                    type="button"
                    (click)="shareProductsList.set([item])"
                    class="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition cursor-pointer"
                    title="Share on WhatsApp">
                    <span class="material-icons" [style.fontSize.px]="14">share</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Editorial List View -->
        <div class="rounded-3xl lg:rounded-none border lg:border-0 border-neutral-200 shadow-xs lg:shadow-none divide-y lg:divide-y-0 divide-neutral-100 grid grid-cols-1 lg:grid-cols-2 lg:gap-3 overflow-hidden lg:overflow-visible">
          @for (item of catalogItems(); track item.id) {
            <div class="p-3 lg:p-3.5 bg-white border-0 lg:border border-neutral-200 lg:rounded-2xl lg:shadow-xs flex items-center justify-between gap-3 hover:bg-amber-50/30 transition">
              <button
                type="button"
                (click)="inspectProduct.set(item)"
                class="flex items-center space-x-3 min-w-0 flex-1 text-left cursor-pointer">
                <img
                  [src]="item.image"
                  [alt]="item.name"
                  referrerpolicy="no-referrer"
                  class="w-16 h-16 rounded-2xl object-cover shrink-0 border border-neutral-200" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center space-x-1.5">
                    <span class="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">{{ item.code }}</span>
                    <span class="text-[9px] font-semibold text-neutral-500">{{ item.metalType }}</span>
                  </div>
                  <h4 class="font-bold text-xs sm:text-sm text-neutral-900 truncate mt-0.5">{{ item.name }}</h4>
                  <p class="text-[11px] text-neutral-500 truncate">
                    {{ item.purity }} • Net {{ item.netWeight }}g • {{ item.quantity > 0 ? 'In Stock' : 'On Order' }}
                  </p>
                </div>
              </button>

              <div class="flex items-center space-x-2 shrink-0">
                <div class="text-right">
                  @if (showPrices()) {
                    <div class="text-xs sm:text-sm font-extrabold text-neutral-950 tabular-nums">₹{{ item.sellingPrice | number:'1.0-0' }}</div>
                  } @else {
                    <div class="text-[10px] font-bold text-amber-700">On Request</div>
                  }
                </div>
                <button
                  type="button"
                  (click)="toggleShortlist(item.id)"
                  [class]="isShortlisted(item.id) ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-neutral-50 text-neutral-500 border-neutral-200'"
                  class="w-8 h-8 rounded-xl border flex items-center justify-center transition cursor-pointer"
                  title="Shortlist">
                  <span class="material-icons" [style.fontSize.px]="16">{{ isShortlisted(item.id) ? 'favorite' : 'favorite_border' }}</span>
                </button>
                <button
                  type="button"
                  (click)="shareProductsList.set([item])"
                  class="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition cursor-pointer"
                  title="Share on WhatsApp">
                  <span class="material-icons" [style.fontSize.px]="16">share</span>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Floating Shortlist / Share Catalog Bar -->
      @if (shortlistedProducts().length > 0) {
        <div class="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] lg:bottom-6 left-3 right-3 z-30 max-w-md mx-auto">
          <div class="bg-neutral-900 text-white px-3.5 py-2.5 rounded-3xl shadow-2xl border border-amber-500/35 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="text-xs font-bold text-amber-300 flex items-center space-x-1">
                <span class="material-icons text-rose-400" [style.fontSize.px]="14">favorite</span>
                <span>{{ shortlistedProducts().length }} Shortlisted</span>
              </div>
              @if (showPrices()) {
                <div class="text-[10px] text-neutral-300 tabular-nums">
                  Est. Value: ₹{{ shortlistTotal() | number:'1.0-0' }}
                </div>
              }
            </div>
            <div class="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                (click)="shortlistedIds.set([]); onlyShortlisted.set(false)"
                class="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-bold cursor-pointer">
                Clear
              </button>
              <button
                type="button"
                (click)="shareProductsList.set(shortlistedProducts())"
                class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center space-x-1 shadow-sm cursor-pointer">
                <span class="material-icons" [style.fontSize.px]="14">share</span>
                <span>Send Shortlist</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Customer Lookbook Detail Sheet -->
      @if (inspectProduct(); as detail) {
        <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[92dvh] overflow-hidden border border-amber-500/25 flex flex-col native-sheet">
            <div class="relative h-64 w-full bg-neutral-900 shrink-0">
              <img
                [src]="detail.image"
                [alt]="detail.name"
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover object-center block" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

              <button
                type="button"
                (click)="inspectProduct.set(null)"
                class="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer"
                title="Close">
                <span class="material-icons text-sm">close</span>
              </button>

              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-neutral-900/85 text-amber-300 text-[10px] font-bold backdrop-blur-xs">
                {{ detail.category }} • {{ detail.purity }}
              </span>

              <div class="absolute bottom-3 left-4 right-4 text-white">
                <div class="text-[10px] font-mono text-amber-300">{{ detail.code }}</div>
                <h3 class="text-base sm:text-lg font-extrabold leading-snug">{{ detail.name }}</h3>
              </div>
            </div>

            <div class="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <div class="grid grid-cols-3 gap-2 text-center bg-neutral-50 border border-neutral-200 rounded-2xl p-2.5">
                <div>
                  <span class="text-[9px] font-bold uppercase text-neutral-400 block">Metal</span>
                  <span class="text-xs font-bold text-neutral-900">{{ detail.metalType }}</span>
                </div>
                <div>
                  <span class="text-[9px] font-bold uppercase text-neutral-400 block">Gross Wt</span>
                  <span class="text-xs font-bold text-neutral-900 tabular-nums">{{ detail.grossWeight }} g</span>
                </div>
                <div>
                  <span class="text-[9px] font-bold uppercase text-neutral-400 block">Net Wt</span>
                  <span class="text-xs font-bold text-amber-800 tabular-nums">{{ detail.netWeight }} g</span>
                </div>
              </div>

              <div class="flex items-center justify-between bg-amber-50/70 border border-amber-200/70 rounded-2xl px-3.5 py-2.5">
                <div>
                  <span class="text-[10px] font-bold uppercase text-amber-800 block">Showroom Price</span>
                  @if (showPrices()) {
                    <span class="text-lg font-extrabold text-neutral-950 tabular-nums">₹{{ detail.sellingPrice | number:'1.0-0' }}</span>
                    <span class="text-[10px] text-neutral-500 block">Incl. making ₹{{ detail.makingCharges | number:'1.0-0' }} (+ GST {{ service.settings().gstPercentage }}%)</span>
                  } @else {
                    <span class="text-sm font-extrabold text-amber-800">Price on Consultation</span>
                  }
                </div>
                <span
                  [class]="detail.quantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0">
                  {{ detail.quantity > 0 ? 'In Stock (' + detail.quantity + ')' : 'Made to Order' }}
                </span>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  (click)="toggleShortlist(detail.id)"
                  [class]="isShortlisted(detail.id) ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-50'"
                  class="px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer">
                  <span class="material-icons" [style.fontSize.px]="16">{{ isShortlisted(detail.id) ? 'favorite' : 'favorite_border' }}</span>
                  <span>{{ isShortlisted(detail.id) ? 'Shortlisted' : 'Shortlist' }}</span>
                </button>

                @if (detail.videoUrl) {
                  <button
                    type="button"
                    (click)="videoProduct.set(detail); inspectProduct.set(null)"
                    class="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-bold flex items-center justify-center space-x-1 transition cursor-pointer">
                    <span class="material-icons" [style.fontSize.px]="16">play_circle</span>
                    <span>Video</span>
                  </button>
                }

                <button
                  type="button"
                  (click)="shareProductsList.set([detail])"
                  class="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition cursor-pointer">
                  <span class="material-icons" [style.fontSize.px]="16">share</span>
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- WhatsApp Share Sheet -->
      @if (shareProductsList().length > 0) {
        <app-whatsapp-share-modal
          [products]="shareProductsList()"
          (dismiss)="shareProductsList.set([])">
        </app-whatsapp-share-modal>
      }

      <!-- Video Showcase Player Modal -->
      @if (videoProduct(); as vProd) {
        <app-product-video-modal
          [product]="vProd"
          (dismiss)="videoProduct.set(null)"
          (shareWhatsapp)="shareProductsList.set([$event])">
        </app-product-video-modal>
      }
    </div>
  `
})
export class ProductCatalog {
  readonly service = inject(JewelleryService);
  readonly goBack = output<void>();

  readonly categories: ('All' | CategoryType)[] = ['All', 'Gold', 'Diamond', 'Silver', 'Artificial'];

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<'All' | CategoryType>('All');
  readonly sortBy = signal<SortOption>('featured');
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly showPrices = signal<boolean>(true);
  readonly onlyShortlisted = signal<boolean>(false);
  readonly shortlistedIds = signal<string[]>([]);

  readonly inspectProduct = signal<Product | null>(null);
  readonly shareProductsList = signal<Product[]>([]);
  readonly videoProduct = signal<Product | null>(null);

  readonly catalogItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const shortOnly = this.onlyShortlisted();
    const shortSet = new Set(this.shortlistedIds());
    const sort = this.sortBy();

    const filtered = this.service.products().filter(p => {
      if (shortOnly && !shortSet.has(p.id)) return false;
      if (!shortOnly && cat !== 'All' && p.category !== cat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.metalType.toLowerCase().includes(q) ||
        p.purity.toLowerCase().includes(q)
      );
    });

    if (sort === 'price-asc') {
      return [...filtered].sort((a, b) => a.sellingPrice - b.sellingPrice);
    }
    if (sort === 'price-desc') {
      return [...filtered].sort((a, b) => b.sellingPrice - a.sellingPrice);
    }
    if (sort === 'weight-desc') {
      return [...filtered].sort((a, b) => b.netWeight - a.netWeight);
    }
    return filtered;
  });

  readonly shortlistedProducts = computed(() => {
    const set = new Set(this.shortlistedIds());
    return this.service.products().filter(p => set.has(p.id));
  });

  readonly shortlistTotal = computed(() =>
    this.shortlistedProducts().reduce((sum, p) => sum + p.sellingPrice, 0)
  );

  isShortlisted(id: string): boolean {
    return this.shortlistedIds().includes(id);
  }

  toggleShortlist(id: string) {
    this.shortlistedIds.update(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    this.searchQuery.set(input?.value ?? '');
  }

  onSortChange(event: Event) {
    const select = event.target as HTMLSelectElement | null;
    this.sortBy.set((select?.value as SortOption) || 'featured');
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set('All');
    this.onlyShortlisted.set(false);
    this.sortBy.set('featured');
  }
}
