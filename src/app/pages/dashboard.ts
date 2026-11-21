import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { SalesTrendChart } from '../components/sales-trend-chart';
import { ProductVideoModal } from './product-video-modal';
import { WhatsappShareModal } from './whatsapp-share-modal';
import { Product } from '../models/jewellery.model';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, SalesTrendChart, ProductVideoModal, WhatsappShareModal],
  template: `
    <div class="space-y-4 lg:space-y-6 pb-12 animate-fade-in-scale">
      <!-- Welcome Banner & Quick Showroom Action Bar -->
      <div class="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-3xl p-5 lg:p-6 shadow-xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div class="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none animate-float-slow"></div>
        <div class="space-y-1 relative z-10">
          <div class="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Showroom ERP Active</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
            {{ service.settings().shopName }}
          </h2>
          <p class="text-xs text-neutral-300">
            Welcome back, <strong class="text-amber-300">{{ service.settings().ownerName }}</strong> • Today's bullion rates and sales overview are live.
          </p>
        </div>

        <div class="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2 relative z-10">
          <button
            type="button"
            (click)="openLandingPage()"
            class="px-4 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-extrabold flex items-center space-x-1.5 transition transform hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-sm">
            <span class="material-icons text-base text-amber-400">play_circle</span>
            <span>Showroom & Tutorial</span>
          </button>
          <button
            type="button"
            (click)="navigateTo('sales')"
            class="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black flex items-center space-x-1.5 transition transform hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-lg shadow-amber-500/25">
            <span class="material-icons text-base">point_of_sale</span>
            <span>New Tax Bill (POS)</span>
          </button>
        </div>
      </div>

      <!-- KPI Metrics Grid (2 cols mobile, 3 sm, 6 lg desktop) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Card 1: Today's Sales -->
        <div class="bg-white p-4 rounded-2xl shadow-xs border border-neutral-200/95 transition group animate-slide-up-1">
          <div class="flex items-center justify-between mb-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <span class="material-icons text-xl">payments</span>
            </div>
            <span class="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
              <span class="material-icons text-[11px] mr-0.5">arrow_upward</span> +12%
            </span>
          </div>
          <div class="text-neutral-500 text-[11px] font-semibold">Today's Sales</div>
          <div class="text-base sm:text-lg font-black text-neutral-900 mt-0.5 tabular-nums">₹{{ service.todaysSalesTotal() | number:'1.0-0' }}</div>
        </div>

        <!-- Card 2: Estimated Profit -->
        <div class="bg-white p-4 rounded-2xl shadow-xs border border-neutral-200/95 transition group animate-slide-up-2">
          <div class="flex items-center justify-between mb-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <span class="material-icons text-xl">trending_up</span>
            </div>
            <span class="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Est. Gross</span>
          </div>
          <div class="text-neutral-500 text-[11px] font-semibold">Gross Profit</div>
          <div class="text-base sm:text-lg font-black text-neutral-900 mt-0.5 tabular-nums">₹{{ service.estimatedProfit() | number:'1.0-0' }}</div>
        </div>

        <!-- Card 3: Total Products -->
        <div class="bg-white p-4 rounded-2xl shadow-xs border border-neutral-200/95 transition group animate-slide-up-3">
          <div class="flex items-center justify-between mb-2.5">
            <div class="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shadow-xs">
              <span class="material-icons text-xl">inventory_2</span>
            </div>
            <span class="text-[10px] font-extrabold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full">{{ service.products().length }} SKUs</span>
          </div>
          <div class="text-neutral-500 text-[11px] font-semibold">Stock Items</div>
          <div class="text-base sm:text-lg font-black text-neutral-900 mt-0.5 tabular-nums">{{ service.totalProductsCount() }} Pcs</div>
        </div>

        <!-- Card 4: Gold Stock Weight -->
        <div class="bg-white p-4 rounded-2xl shadow-xs border border-neutral-200/95 transition group animate-slide-up-4">
          <div class="flex items-center justify-between mb-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <span class="material-icons text-xl">workspace_premium</span>
            </div>
            <span class="text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">22K / 18K</span>
          </div>
          <div class="text-neutral-500 text-[11px] font-semibold">Gold Weight</div>
          <div class="text-base sm:text-lg font-black text-neutral-900 mt-0.5 tabular-nums">{{ service.totalGoldStockWeight() | number:'1.1-1' }} g</div>
        </div>

        <!-- Card 5: Silver Stock Weight -->
        <div class="bg-white p-4 rounded-2xl shadow-xs border border-neutral-200/95 transition group animate-slide-up-5">
          <div class="flex items-center justify-between mb-2.5">
            <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs">
              <span class="material-icons text-xl">filter_vintage</span>
            </div>
            <span class="text-[10px] font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">925 Silver</span>
          </div>
          <div class="text-neutral-500 text-[11px] font-semibold">Silver Weight</div>
          <div class="text-base sm:text-lg font-black text-neutral-900 mt-0.5 tabular-nums">{{ service.totalSilverStockWeight() | number:'1.1-1' }} g</div>
        </div>

        <!-- Card 6: Today's Purchases -->
        <div class="bg-white p-4 rounded-2xl shadow-xs border border-neutral-200/95 transition group animate-slide-up-6">
          <div class="flex items-center justify-between mb-2.5">
            <div class="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shadow-xs">
              <span class="material-icons text-xl">local_mall</span>
            </div>
            <span class="text-[10px] font-extrabold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full">Bullion</span>
          </div>
          <div class="text-neutral-500 text-[11px] font-semibold">Purchases</div>
          <div class="text-base sm:text-lg font-black text-neutral-900 mt-0.5 tabular-nums">₹{{ service.todaysPurchasesTotal() | number:'1.0-0' }}</div>
        </div>
      </div>

      <!-- Trending Articles Slider (Carousel on Mobile, 6-Col Grid on Desktop) -->
      <div class="bg-white rounded-3xl shadow-xs border border-neutral-200 p-4 lg:p-6 space-y-4">
        <div class="flex items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div class="flex items-center space-x-2 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <span class="material-icons text-lg">local_fire_department</span>
            </div>
            <div>
              <h3 class="font-black text-neutral-900 text-sm sm:text-base flex items-center truncate">
                <span>Trending Showroom Articles</span>
              </h3>
              <p class="text-[11px] text-neutral-500">Autoplay video reels & signature client favourites</p>
            </div>
            @if (trendingVideoCount() > 0) {
              <span class="hidden sm:inline-flex items-center space-x-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0 border border-emerald-200">
                <span class="material-icons" [style.fontSize.px]="12">play_circle</span>
                <span>{{ trendingVideoCount() }} Reels Active</span>
              </span>
            }
          </div>

          <div class="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              (click)="scrollSlider(-260)"
              class="lg:hidden w-8 h-8 rounded-full bg-neutral-100 hover:bg-amber-100 text-neutral-700 hover:text-amber-800 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-xs"
              title="Previous">
              <span class="material-icons text-base">chevron_left</span>
            </button>
            <button
              type="button"
              (click)="scrollSlider(260)"
              class="lg:hidden w-8 h-8 rounded-full bg-neutral-100 hover:bg-amber-100 text-neutral-700 hover:text-amber-800 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-xs"
              title="Next">
              <span class="material-icons text-base">chevron_right</span>
            </button>
            @if (trendingArticles().length > 0) {
              <button
                type="button"
                (click)="openQuickTrendingVideo()"
                class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold flex items-center space-x-1 transition cursor-pointer shadow-xs"
                title="Add or Create Autoplay Video for Trending Articles">
                <span class="material-icons" [style.fontSize.px]="14">video_call</span>
                <span class="hidden sm:inline">Add Video</span>
              </button>
            }
            <button
              type="button"
              (click)="openCatalog()"
              class="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-extrabold flex items-center space-x-1 transition cursor-pointer shadow-xs">
              <span class="material-icons" [style.fontSize.px]="14">menu_book</span>
              <span class="hidden sm:inline">Catalog</span>
            </button>
            <button
              type="button"
              (click)="navigateTo('inventory')"
              class="text-xs font-bold text-amber-700 hover:text-amber-800 pl-1 transition cursor-pointer underline">
              See All
            </button>
          </div>
        </div>

        @if (trendingArticles().length === 0) {
          <div class="text-center py-8 text-neutral-400 text-xs font-medium">No trending jewellery articles in inventory yet.</div>
        } @else {
          <div
            #trendingSlider
            class="flex items-stretch space-x-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none pb-1 lg:grid lg:grid-cols-6 lg:space-x-0 lg:gap-3.5 lg:overflow-visible lg:pb-0">
            @for (item of trendingArticles(); track item.id; let idx = $index) {
              <div class="snap-start shrink-0 w-60 sm:w-68 lg:w-auto rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-200/90 hover:border-amber-500/60 hover:shadow-md transition flex flex-col justify-between group">
                <div>
                  <div class="relative h-32 lg:h-36 w-full bg-neutral-950 overflow-hidden">
                    <button
                      type="button"
                      (click)="item.videoUrl ? openVideoShowcase(item) : navigateTo('inventory')"
                      class="w-full h-full block cursor-pointer focus:outline-none">
                      @if (item.videoUrl) {
                        <video
                          [attr.data-trending-video]="item.id"
                          [src]="item.videoUrl"
                          [poster]="item.image"
                          autoplay
                          [autoplay]="true"
                          [muted]="unmutedVideoId() !== item.id"
                          loop
                          [loop]="true"
                          playsinline
                          [playsInline]="true"
                          preload="auto"
                          (loadedmetadata)="ensureAutoplay($event, item.id)"
                          (canplay)="ensureAutoplay($event, item.id)"
                          class="w-full h-full object-cover object-center block group-hover:scale-105 transition duration-500"></video>
                      } @else {
                        <img
                          [src]="item.image"
                          [alt]="item.name"
                          referrerpolicy="no-referrer"
                          class="w-full h-full object-cover object-center block group-hover:scale-105 transition duration-500" />
                      }
                    </button>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>

                    <span class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-neutral-950/90 text-amber-300 text-[10px] font-extrabold backdrop-blur-xs border border-white/20 pointer-events-none shadow-xs">
                      #{{ idx + 1 }} Trending
                    </span>

                    <button
                      type="button"
                      (click)="openVideoShowcase(item)"
                      [class]="item.videoUrl
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-300'
                        : 'bg-neutral-950/85 hover:bg-amber-500 text-white hover:text-neutral-950 border-white/30'"
                      class="absolute top-2 right-2 px-2 py-0.5 rounded-full border text-[10px] font-bold backdrop-blur-xs flex items-center space-x-1 transition cursor-pointer shadow-xs"
                      [title]="item.videoUrl ? 'Play with sound or update video' : 'Add Autoplay Video'">
                      <span class="material-icons" [style.fontSize.px]="13">{{ item.videoUrl ? 'videocam' : 'video_call' }}</span>
                      <span>{{ item.videoUrl ? 'Reel' : 'Video' }}</span>
                    </button>

                    @if (item.videoUrl) {
                      <button
                        type="button"
                        (click)="toggleCardAudio(item.id)"
                        [class]="unmutedVideoId() === item.id
                          ? 'bg-amber-500 text-neutral-950 border-amber-300'
                          : 'bg-neutral-950/85 hover:bg-neutral-900 text-white border-white/30'"
                        class="absolute bottom-2 right-2 w-7 h-7 rounded-full border backdrop-blur-xs flex items-center justify-center transition cursor-pointer shadow-xs"
                        [title]="unmutedVideoId() === item.id ? 'Mute Audio' : 'Play Sound'">
                        <span class="material-icons" [style.fontSize.px]="14">{{ unmutedVideoId() === item.id ? 'volume_up' : 'volume_off' }}</span>
                      </button>
                    }

                    <span class="absolute bottom-2 left-2.5 right-12 text-[10px] font-mono text-amber-200 truncate pointer-events-none font-bold">
                      {{ item.code }}
                    </span>
                  </div>

                  <button
                    type="button"
                    (click)="navigateTo('inventory')"
                    class="w-full text-left p-3 pb-2 cursor-pointer block">
                    <h4 class="font-extrabold text-xs text-neutral-900 line-clamp-1 leading-tight">{{ item.name }}</h4>
                    <p class="text-[11px] text-neutral-500 truncate mt-0.5 font-medium">
                      {{ item.netWeight }}g • {{ item.metalType }}
                    </p>
                  </button>
                </div>

                <div class="px-3 pb-3 pt-1.5 flex items-center justify-between border-t border-neutral-100">
                  <span class="text-xs sm:text-sm font-black text-neutral-950 tabular-nums">
                    ₹{{ item.sellingPrice | number:'1.0-0' }}
                  </span>
                  <span
                    [class]="service.isLowStock(item) ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {{ item.quantity }} left
                  </span>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Desktop 2-Column Split: 7-Day Sales Revenue Chart (Left) + Recent Counter Sales (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div class="lg:col-span-7 bg-white rounded-3xl p-4 lg:p-6 shadow-xs border border-neutral-200">
          @defer (on idle) {
            <app-sales-trend-chart></app-sales-trend-chart>
          } @placeholder {
            <div class="h-64 rounded-2xl bg-neutral-50 border border-neutral-200 p-4 animate-pulse"></div>
          } @error {
            <div class="h-64 rounded-2xl bg-white border border-neutral-200 p-6 flex flex-col items-center justify-center text-center text-xs text-neutral-500">
              <span class="material-icons text-3xl text-neutral-300 mb-1">show_chart</span>
              <span>Sales revenue chart could not be loaded right now.</span>
            </div>
          }
        </div>

        <div class="lg:col-span-5 bg-white rounded-3xl shadow-xs border border-neutral-200 p-4 lg:p-6 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3.5 shrink-0 border-b border-neutral-100 pb-3">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <span class="material-icons text-lg">receipt_long</span>
              </div>
              <h3 class="font-black text-neutral-900 text-sm sm:text-base">Recent Counter Sales</h3>
            </div>
            <button (click)="navigateTo('sales')" type="button" class="text-xs font-bold text-amber-700 hover:text-amber-800 transition cursor-pointer underline">View All</button>
          </div>

          @if (service.sales().length === 0) {
            <div class="text-center py-10 text-neutral-400 text-xs font-medium">No sales transactions recorded yet today.</div>
          } @else {
            <div class="space-y-2.5 lg:flex-1 lg:max-h-[280px] lg:overflow-y-auto lg:pr-1">
              @for (sale of service.sales(); track sale.id) {
                <div class="flex items-center justify-between p-3 rounded-2xl bg-neutral-50/80 border border-neutral-200/60 hover:bg-amber-50/40 transition">
                  <div class="flex items-center space-x-3 min-w-0">
                    <div class="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-500/25">
                      <span class="material-icons text-lg">receipt</span>
                    </div>
                    <div class="min-w-0">
                      <div class="font-extrabold text-neutral-900 text-xs sm:text-sm truncate">{{ sale.customerName }}</div>
                      <div class="text-[11px] text-neutral-500 truncate font-medium">{{ sale.invoiceNo }} • {{ sale.date }}</div>
                    </div>
                  </div>
                  <div class="text-right shrink-0 pl-2">
                    <div class="font-black text-xs sm:text-sm text-neutral-950 tabular-nums">₹{{ sale.grandTotal | number:'1.0-0' }}</div>
                    <span class="inline-block px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 mt-0.5">
                      {{ sale.paymentMode }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Low Stock & Compliance Alert Banner -->
      @if (service.lowStockProducts().length > 0) {
        <div class="bg-red-50 border border-red-200 rounded-3xl p-4 lg:p-5 flex items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <span class="material-icons text-xl">warning</span>
            </div>
            <div>
              <div class="text-xs sm:text-sm font-extrabold text-red-950">
                {{ service.lowStockProducts().length }} {{ service.lowStockProducts().length === 1 ? 'Product' : 'Products' }} Below Minimum Stock Limit
              </div>
              <div class="text-[11px] sm:text-xs text-red-700 font-medium">
                Restock recommended for gold & silver items below threshold.
              </div>
            </div>
          </div>
          <button (click)="navigateTo('inventory')" type="button" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer shadow-sm">
            View Stock
          </button>
        </div>
      } @else {
        <div class="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-4 lg:p-5 flex items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <span class="material-icons text-xl">verified</span>
            </div>
            <div>
              <div class="text-xs sm:text-sm font-extrabold text-amber-950">Hallmark & Stock Health Verified</div>
              <div class="text-[11px] sm:text-xs text-amber-800 font-medium">All jewellery items meet minimum stock thresholds and 916 compliance.</div>
            </div>
          </div>
          <button (click)="navigateTo('inventory')" type="button" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer shadow-sm">
            Audit Stock
          </button>
        </div>
      }

      <!-- Trending Article Video Showcase & Recorder Modal -->
      @if (videoProduct(); as vProd) {
        @defer (on immediate) {
          <app-product-video-modal
            [product]="vProd"
            (dismiss)="videoProduct.set(null)"
            (shareWhatsapp)="shareProductsList.set([$event])">
          </app-product-video-modal>
        } @placeholder {
          <div class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl px-5 py-3 text-xs font-bold text-neutral-800 shadow-lg">Opening Video Studio...</div>
          </div>
        } @error {
          <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl p-5 max-w-xs w-full text-center space-y-2 shadow-xl">
              <p class="text-xs font-semibold text-neutral-900">Unable to load video player right now.</p>
              <button type="button" (click)="videoProduct.set(null)" class="px-4 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold">Close</button>
            </div>
          </div>
        }
      }

      @if (shareProductsList().length > 0) {
        @defer (on immediate) {
          <app-whatsapp-share-modal
            [products]="shareProductsList()"
            (dismiss)="shareProductsList.set([])">
          </app-whatsapp-share-modal>
        } @placeholder {
          <div class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl px-5 py-3 text-xs font-bold text-neutral-800 shadow-lg">Opening Share Sheet...</div>
          </div>
        } @error {
          <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl p-5 max-w-xs w-full text-center space-y-2 shadow-xl">
              <p class="text-xs font-semibold text-neutral-900">Unable to load share sheet right now.</p>
              <button type="button" (click)="shareProductsList.set([])" class="px-4 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold">Close</button>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class Dashboard {
  readonly service = inject(JewelleryService);
  readonly tabNavigate = output<string>();
  readonly openSubView = output<string>();

  @ViewChild('trendingSlider') trendingSlider?: ElementRef<HTMLDivElement>;

  readonly videoProduct = signal<Product | null>(null);
  readonly shareProductsList = signal<Product[]>([]);
  readonly unmutedVideoId = signal<string | null>(null);

  readonly trendingArticles = computed(() =>
    [...this.service.products()]
      .sort((a, b) => (b.videoUrl ? 1 : 0) - (a.videoUrl ? 1 : 0) || b.sellingPrice - a.sellingPrice)
      .slice(0, 6)
  );

  readonly trendingVideoCount = computed(() =>
    this.trendingArticles().filter(item => !!item.videoUrl).length
  );

  scrollSlider(deltaX: number) {
    this.trendingSlider?.nativeElement.scrollBy({
      left: deltaX,
      behavior: 'smooth'
    });
  }

  openQuickTrendingVideo() {
    const list = this.trendingArticles();
    const target = list.find(item => !item.videoUrl) ?? list[0];
    if (target) {
      this.openVideoShowcase(target);
    }
  }

  openVideoShowcase(item: Product) {
    this.unmutedVideoId.set(null);
    this.videoProduct.set(item);
  }

  toggleCardAudio(productId: string) {
    const nextId = this.unmutedVideoId() === productId ? null : productId;
    this.unmutedVideoId.set(nextId);

    const sliderEl = this.trendingSlider?.nativeElement;
    if (!sliderEl) return;

    const videos = sliderEl.querySelectorAll('video[data-trending-video]');
    videos.forEach(node => {
      const video = node as HTMLVideoElement;
      const vidId = video.getAttribute('data-trending-video');
      const unmuteThis = nextId !== null && vidId === nextId;
      video.muted = !unmuteThis;
      if (unmuteThis) {
        video.volume = 1;
        void video.play().catch(() => undefined);
      }
    });
  }

  ensureAutoplay(event: Event, productId: string) {
    const videoEl = event.target as HTMLVideoElement | null;
    if (!videoEl) return;
    const isUnmuted = this.unmutedVideoId() === productId;
    videoEl.muted = !isUnmuted;
    videoEl.playsInline = true;
    if (videoEl.paused) {
      void videoEl.play().catch(() => undefined);
    }
  }

  navigateTo(tab: string) {
    this.tabNavigate.emit(tab);
  }

  openCatalog() {
    this.openSubView.emit('catalog');
  }

  openLandingPage() {
    this.openSubView.emit('landing');
  }
}
