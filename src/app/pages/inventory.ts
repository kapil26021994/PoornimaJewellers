import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JewelleryService } from '../services/jewellery.service';
import { ProductModal } from './product-modal';
import { ScannerModal } from './scanner-modal';
import { BulkMakingModal } from './bulk-making-modal';
import { WhatsappShareModal } from './whatsapp-share-modal';
import { ProductVideoModal } from './product-video-modal';
import { Product } from '../models/jewellery.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ProductModal, ScannerModal, BulkMakingModal, WhatsappShareModal, ProductVideoModal],
  template: `
    <div class="space-y-3 lg:space-y-2.5 pb-28 lg:pb-6 relative">
      <!-- Contextual Bulk Selection Bar -->
      @if (selectionMode()) {
        <div class="bg-neutral-900 text-white p-4 rounded-3xl shadow-md border border-amber-500/40 flex items-center justify-between gap-2 sticky top-0 z-30">
          <div class="flex items-center space-x-2.5">
            <button (click)="exitSelectionMode()" type="button"
              class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center transition cursor-pointer" title="Exit Selection Mode">
              <span class="material-icons text-base">close</span>
            </button>
            <div>
              <div class="text-sm font-bold text-white">{{ selectedCount() }} Selected</div>
              <div class="text-[10px] text-amber-300">Tap items to toggle selection</div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button (click)="toggleSelectAllFiltered()" type="button"
              class="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer flex items-center space-x-1">
              <span class="material-icons text-sm">{{ allFilteredSelected() ? 'deselect' : 'select_all' }}</span>
              <span>{{ allFilteredSelected() ? 'Deselect All' : 'Select All' }}</span>
            </button>
          </div>
        </div>
      }

      <!-- Search, Scan & Select Bar -->
      <div class="bg-white p-3 rounded-3xl shadow-sm border border-neutral-200">
        <div class="flex items-center space-x-1.5">
          <div class="relative flex-1 min-w-0">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
              <span class="material-icons text-sm">search</span>
            </span>
            <input type="text" [value]="searchQuery()" (input)="searchQuery.set($any($event.target).value)" 
              placeholder="Search name, code..." 
              class="w-full pl-9 pr-7 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition">
            @if (searchQuery()) {
              <button (click)="searchQuery.set('')" type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-400 hover:text-neutral-700 cursor-pointer" title="Clear Search">
                <span class="material-icons text-sm">close</span>
              </button>
            }
          </div>

          <button (click)="openScanner()" type="button"
            class="px-2.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center space-x-1 transition cursor-pointer active:scale-95 shrink-0 shadow-xs"
            title="Scan Tag QR / Barcode">
            <span class="material-icons text-base text-amber-400">qr_code_scanner</span>
            <span>Scan</span>
          </button>

          <button (click)="toggleSelectionMode()" type="button"
            [class]="selectionMode() ? 'bg-amber-500 text-neutral-950 border-amber-500' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-200'"
            class="px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center space-x-1 transition cursor-pointer active:scale-95 shrink-0"
            title="Bulk Select Items">
            <span class="material-icons text-base">checklist</span>
            <span>{{ selectionMode() ? 'Done' : 'Select' }}</span>
          </button>

          <button (click)="openAddModal()" type="button"
            class="hidden lg:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-xs transition cursor-pointer shrink-0">
            <span class="material-icons text-base">add</span>
            <span>Add Product</span>
          </button>
        </div>

        <!-- Low-Stock Status & Threshold Setting Bar -->
        <div class="mt-2.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center space-x-2">
            <button
              type="button"
              (click)="toggleLowStockFilter()"
              [class]="onlyLowStock()
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : (service.lowStockProducts().length > 0
                    ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200')"
              class="px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer active:scale-95">
              <span class="material-icons" [style.fontSize.px]="14">
                {{ service.lowStockProducts().length > 0 ? 'warning' : 'check_circle' }}
              </span>
              @if (service.lowStockProducts().length > 0) {
                <span>
                  {{ service.lowStockProducts().length }} Low Stock{{ onlyLowStock() ? ' (Filtered)' : '' }}
                </span>
              } @else {
                <span>All Stock Healthy</span>
              }
            </button>

            <span class="hidden lg:inline-block text-[11px] font-semibold text-neutral-500 tabular-nums">
              Showing {{ filteredProducts().length }} of {{ service.products().length }} SKUs
            </span>
          </div>

          <button
            type="button"
            (click)="toggleThresholdPanel()"
            [class]="isThresholdPanelOpen() ? 'bg-neutral-900 text-amber-300 border-neutral-900' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'"
            class="px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer active:scale-95">
            <span class="material-icons" [style.fontSize.px]="14">tune</span>
            <span>Min Limit: {{ service.settings().defaultLowStockThreshold }} pcs</span>
          </button>
        </div>

        @if (isThresholdPanelOpen()) {
          <div class="mt-2.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-bold text-neutral-900">Minimum Stock Threshold</div>
                <div class="text-[10px] text-neutral-500">Items below limit show a red border & Low Stock badge</div>
              </div>
              <div class="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  (click)="adjustDraftThreshold(-1)"
                  class="w-7 h-7 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold cursor-pointer">
                  <span class="material-icons" [style.fontSize.px]="15">remove</span>
                </button>
                <input
                  type="number"
                  min="0"
                  [value]="draftThreshold()"
                  (input)="onDraftThresholdInput($event)"
                  class="w-14 py-1 text-center rounded-lg border border-neutral-300 bg-white text-xs font-extrabold text-neutral-900 outline-none focus:border-amber-500" />
                <button
                  type="button"
                  (click)="adjustDraftThreshold(1)"
                  class="w-7 h-7 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold cursor-pointer">
                  <span class="material-icons" [style.fontSize.px]="15">add</span>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                (click)="applyThresholdToAll()"
                class="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-bold transition cursor-pointer">
                Apply to All Products
              </button>
              <button
                type="button"
                (click)="saveDefaultThreshold()"
                class="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-[11px] font-bold transition cursor-pointer">
                Save Default
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Product Catalog: Card Grid on Mobile/Tablet (< lg), Structured Table on Desktop (>= lg) -->
      @if (filteredProducts().length === 0) {
        <div class="bg-white rounded-3xl p-10 text-center border border-neutral-200 shadow-xs">
          <span class="material-icons text-4xl text-neutral-300 mb-2">inventory_2</span>
          <h4 class="font-bold text-neutral-800 text-xs">No jewellery items found</h4>
          <button (click)="openAddModal()" class="mt-2 px-3 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-[11px]" type="button">
            + Add Product
          </button>
        </div>
      } @else {
        <!-- Desktop Table View (>= 1024px, Compact Density) -->
        <div class="hidden lg:block bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  @if (selectionMode()) {
                    <th class="pl-3 pr-1.5 py-2 w-8">
                      <input
                        type="checkbox"
                        aria-label="Select all filtered products"
                        [checked]="allFilteredSelected()"
                        (change)="toggleSelectAllFiltered()"
                        class="w-3.5 h-3.5 rounded accent-amber-500 cursor-pointer" />
                    </th>
                  }
                  <th class="pl-3 pr-2 py-2">Product & SKU</th>
                  <th class="px-2 py-2">Category / Purity</th>
                  <th class="px-2 py-2 text-right">Weight</th>
                  <th class="px-2 py-2 text-right">Making</th>
                  <th class="px-2 py-2 text-right">Selling Price</th>
                  <th class="px-2 py-2 text-center">Stock / Limit</th>
                  <th class="pl-2 pr-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 text-xs">
                @for (prod of filteredProducts(); track prod.id) {
                  <tr [class]="getTableRowClass(prod)" class="transition-colors group">
                    @if (selectionMode()) {
                      <td class="pl-3 pr-1.5 py-1.5">
                        <input
                          type="checkbox"
                          [attr.aria-label]="'Select ' + prod.name"
                          [checked]="isSelected(prod.id)"
                          (change)="toggleProductSelection(prod.id)"
                          class="w-3.5 h-3.5 rounded accent-amber-500 cursor-pointer" />
                      </td>
                    }
                    <td class="pl-3 pr-2 py-1.5">
                      <div class="flex items-center space-x-2 min-w-0">
                        <img
                          [src]="prod.image"
                          [alt]="prod.name"
                          referrerpolicy="no-referrer"
                          class="w-8 h-8 rounded-lg object-cover border border-neutral-200 shrink-0" />
                        <div class="min-w-0 leading-tight">
                          <div class="font-bold text-neutral-900 truncate max-w-[230px]">{{ prod.name }}</div>
                          <div class="text-[10px] font-mono text-amber-700 font-semibold">{{ prod.code }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-2 py-1.5 whitespace-nowrap leading-tight">
                      <span class="px-1.5 py-0.5 text-[9px] font-bold bg-neutral-100 text-neutral-800 rounded-full">
                        {{ prod.category }}
                      </span>
                      <div class="text-[10px] text-neutral-500 mt-0.5">{{ prod.metalType }} • {{ prod.purity }}</div>
                    </td>
                    <td class="px-2 py-1.5 text-right whitespace-nowrap tabular-nums leading-tight">
                      <div class="font-bold text-neutral-900">{{ prod.netWeight }} g</div>
                      <div class="text-[10px] text-neutral-500">Gr: {{ prod.grossWeight }} g</div>
                    </td>
                    <td class="px-2 py-1.5 text-right whitespace-nowrap font-semibold text-neutral-800 tabular-nums">
                      ₹{{ prod.makingCharges | number:'1.0-0' }}
                    </td>
                    <td class="px-2 py-1.5 text-right whitespace-nowrap font-extrabold text-xs text-neutral-950 tabular-nums">
                      ₹{{ prod.sellingPrice | number:'1.0-0' }}
                    </td>
                    <td class="px-2 py-1.5 text-center whitespace-nowrap leading-tight">
                      @if (service.isLowStock(prod)) {
                        <span
                          class="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-300 tabular-nums">
                          <span class="material-icons" [style.fontSize.px]="11">warning</span>
                          <span>{{ prod.quantity }}/{{ service.getMinThreshold(prod) }}</span>
                        </span>
                        <div class="text-[9px] font-bold text-red-600 uppercase tracking-wide">
                          {{ prod.quantity === 0 ? 'Out' : 'Low' }}
                        </div>
                      } @else {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 tabular-nums">
                          {{ prod.quantity }} pcs
                        </span>
                        <div class="text-[9px] text-neutral-500">Min {{ service.getMinThreshold(prod) }}</div>
                      }
                    </td>
                    <td class="pl-2 pr-3 py-1.5 text-right whitespace-nowrap">
                      <div class="inline-flex items-center space-x-1">
                        <button
                          type="button"
                          (click)="openVideoModal(prod)"
                          [class]="prod.videoUrl ? 'bg-amber-500 text-neutral-950 border-amber-400' : 'bg-neutral-100 hover:bg-amber-100 text-neutral-700 border-neutral-200'"
                          class="w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer"
                          [title]="prod.videoUrl ? 'Play Product Video' : 'Add / Record Video'">
                          <span class="material-icons" [style.fontSize.px]="14">{{ prod.videoUrl ? 'play_circle' : 'videocam' }}</span>
                        </button>
                        <button
                          type="button"
                          (click)="openWhatsappShare([prod])"
                          class="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition cursor-pointer"
                          title="Share on WhatsApp">
                          <span class="material-icons" [style.fontSize.px]="14">share</span>
                        </button>
                        <button
                          type="button"
                          (click)="openEditModal(prod)"
                          class="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-amber-100 text-neutral-800 border border-neutral-200 flex items-center justify-center transition cursor-pointer"
                          title="Edit Product">
                          <span class="material-icons" [style.fontSize.px]="14">edit</span>
                        </button>
                        <button
                          type="button"
                          (click)="service.deleteProduct(prod.id)"
                          class="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center transition cursor-pointer"
                          title="Delete Product">
                          <span class="material-icons" [style.fontSize.px]="14">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile & Tablet Card Grid (< 1024px) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 lg:hidden">
          @for (prod of filteredProducts(); track prod.id) {
            <div [class]="getCardContainerClass(prod)"
              class="rounded-2xl overflow-hidden shadow-xs border transition-all flex flex-col justify-between group relative">
              
              <!-- Full-card accessible selection overlay in bulk mode -->
              @if (selectionMode()) {
                <button (click)="toggleProductSelection(prod.id)" type="button"
                  [attr.aria-label]="'Select ' + prod.name"
                  [attr.aria-pressed]="isSelected(prod.id)"
                  class="absolute inset-0 z-10 w-full h-full bg-transparent cursor-pointer focus:outline-none">
                </button>
              }

              <div>
                <!-- Image Header with Badge & Checkbox / Three-Dot Menu -->
                <div class="relative h-28 lg:h-36 w-full bg-neutral-100 overflow-hidden">
                  <img [src]="prod.image" [alt]="prod.name" referrerpolicy="no-referrer" class="w-full h-full object-cover object-center block group-hover:scale-105 transition duration-500">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                  
                  <div class="absolute top-1.5 left-1.5 flex flex-col items-start gap-1">
                    <span class="px-2 py-0.5 text-[8px] font-bold bg-neutral-900/90 backdrop-blur-md text-amber-300 rounded-full">
                      {{ prod.category }}
                    </span>
                    @if (service.isLowStock(prod)) {
                      <span class="px-1.5 py-0.5 text-[8px] font-extrabold bg-red-600 text-white rounded-full shadow-sm flex items-center space-x-0.5 tracking-wide">
                        <span class="material-icons" [style.fontSize.px]="10">warning</span>
                        <span>{{ prod.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK' }}</span>
                      </span>
                    }
                  </div>

                  <!-- Selection Checkbox OR Three-Dot Menu Button -->
                  @if (selectionMode()) {
                    <div class="absolute top-1.5 right-1.5 z-20 pointer-events-none">
                      <div [class]="isSelected(prod.id) ? 'bg-amber-500 border-amber-400 text-neutral-950 scale-105' : 'bg-neutral-900/75 border-white/70 text-transparent'"
                        class="w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-md transition-all">
                        <span class="material-icons text-[14px] font-bold">check</span>
                      </div>
                    </div>
                  } @else {
                    <div class="absolute top-1.5 right-1.5 z-20">
                      <button (click)="toggleMenu($event, prod.id)" class="w-7 h-7 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer active:scale-95 shadow-sm" type="button" title="Options">
                        <span class="material-icons text-[15px]">more_vert</span>
                      </button>

                      <!-- Dropdown Menu -->
                      @if (activeMenuId() === prod.id) {
                        <div class="absolute right-0 top-8 w-40 bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-150">
                          <button (click)="openVideoModal(prod)" class="w-full px-3 py-2 text-left text-neutral-900 hover:bg-amber-50 flex items-center space-x-2 transition cursor-pointer font-semibold" type="button">
                            <span class="material-icons text-xs text-amber-600">{{ prod.videoUrl ? 'play_circle' : 'videocam' }}</span>
                            <span>{{ prod.videoUrl ? 'Play Video' : 'Add / Reel Video' }}</span>
                          </button>
                          <button (click)="openWhatsappShare([prod])" class="w-full px-3 py-2 text-left text-emerald-700 hover:bg-emerald-50 flex items-center space-x-2 transition cursor-pointer font-semibold" type="button">
                            <span class="material-icons text-xs text-emerald-600">share</span>
                            <span>WhatsApp</span>
                          </button>
                          <button (click)="openEditModal(prod)" class="w-full px-3 py-2 text-left text-neutral-800 hover:bg-amber-50 flex items-center space-x-2 transition cursor-pointer" type="button">
                            <span class="material-icons text-xs text-amber-600">edit</span>
                            <span>Edit</span>
                          </button>
                          <button (click)="service.deleteProduct(prod.id)" class="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 transition cursor-pointer" type="button">
                            <span class="material-icons text-xs text-red-500">delete</span>
                            <span>Delete</span>
                          </button>
                        </div>
                      }
                    </div>
                  }

                  <div class="absolute bottom-1.5 left-2 right-10 text-white">
                    <span class="text-[8px] text-amber-300 font-mono block">{{ prod.code }}</span>
                    <h4 class="font-bold text-[11px] text-white line-clamp-1 leading-tight">{{ prod.name }}</h4>
                  </div>

                  @if (!selectionMode()) {
                    <button
                      type="button"
                      (click)="openVideoModal(prod)"
                      [class]="prod.videoUrl ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-900/75 text-amber-300 hover:bg-amber-500 hover:text-neutral-950'"
                      class="absolute bottom-1.5 right-1.5 z-20 w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center shadow-md transition active:scale-95 cursor-pointer"
                      [title]="prod.videoUrl ? 'Play Product Video' : 'Record / Create Video Reel'">
                      <span class="material-icons" [style.fontSize.px]="15">{{ prod.videoUrl ? 'play_arrow' : 'videocam' }}</span>
                    </button>
                  }
                </div>

                <!-- Specs Grid -->
                <div class="p-2 space-y-1">
                  <div class="grid grid-cols-2 gap-1 bg-neutral-50 p-1.5 rounded-xl border border-neutral-100 text-center text-[10px]">
                    <div>
                      <span class="text-neutral-400 text-[8px] block uppercase font-bold">Net Wt</span>
                      <span class="font-bold text-amber-800">{{ prod.netWeight }}g</span>
                    </div>
                    <div>
                      <span class="text-neutral-400 text-[8px] block uppercase font-bold">Making</span>
                      <span class="font-bold text-neutral-800 truncate block text-[9px]">₹{{ prod.makingCharges | number:'1.0-0' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Price Footer -->
              <div [class]="service.isLowStock(prod) ? 'border-red-200/80 bg-red-50/50' : 'border-neutral-100 bg-neutral-50/50'"
                class="p-2.5 pt-1.5 flex items-center justify-between gap-1 border-t">
                <div class="min-w-0">
                  <span class="text-[8px] text-neutral-400 block uppercase font-bold">Price</span>
                  <span class="text-xs font-extrabold text-neutral-950 tabular-nums">₹{{ prod.sellingPrice | number:'1.0-0' }}</span>
                </div>
                <div class="flex items-center space-x-1 shrink-0">
                  <span
                    [class]="service.isLowStock(prod)
                      ? 'text-red-700 bg-red-100 border border-red-300 font-bold'
                      : 'text-emerald-700 bg-emerald-50 font-semibold'"
                    class="text-[9px] px-2 py-0.5 rounded-full tabular-nums"
                    [title]="'Minimum required limit: ' + service.getMinThreshold(prod) + ' pcs'">
                    @if (service.isLowStock(prod)) {
                      Qty: {{ prod.quantity }}/{{ service.getMinThreshold(prod) }}
                    } @else {
                      Qty: {{ prod.quantity }}
                    }
                  </span>
                  <button
                    type="button"
                    (click)="openWhatsappShare([prod])"
                    class="w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer"
                    title="Share on WhatsApp">
                    <span class="material-icons" [style.fontSize.px]="14">share</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Floating Batch Action Bar (in Selection Mode) OR Add Product FAB -->
      @if (selectionMode()) {
        <div class="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] lg:bottom-6 left-3 right-3 z-30 max-w-md mx-auto">
          <div class="bg-neutral-900 text-white px-3 py-2.5 rounded-3xl shadow-2xl border border-amber-500/30 flex items-center justify-between gap-2">
            <div class="text-[11px] font-bold text-amber-300 pl-1 shrink-0 tabular-nums">
              {{ selectedCount() }} {{ selectedCount() === 1 ? 'item' : 'items' }}
            </div>
            <div class="flex items-center space-x-1.5 shrink-0">
              <button (click)="openBulkWhatsappShare()" [disabled]="selectedCount() === 0" type="button"
                class="px-2.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer active:scale-95">
                <span class="material-icons" [style.fontSize.px]="15">share</span>
                <span>WhatsApp</span>
              </button>
              <button (click)="openBulkMakingModal()" [disabled]="selectedCount() === 0" type="button"
                class="px-2.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer active:scale-95">
                <span class="material-icons" [style.fontSize.px]="15">tune</span>
                <span>Making</span>
              </button>
              <button (click)="isBulkDeleteConfirmOpen.set(true)" [disabled]="selectedCount() === 0" type="button"
                class="px-2.5 py-2 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer active:scale-95">
                <span class="material-icons" [style.fontSize.px]="15">delete</span>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      } @else {
        <div class="fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] right-6 z-30 lg:hidden">
          <button (click)="openAddModal()" 
            class="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-3.5 rounded-3xl shadow-xl shadow-amber-500/30 flex items-center space-x-2 transition hover:scale-105 active:scale-95 cursor-pointer border border-amber-400/50" type="button">
            <span class="material-icons text-xl">add</span>
            <span class="text-xs font-bold tracking-wide pr-1">Add Product</span>
          </button>
        </div>
      }

      <!-- Product Modal Component -->
      @if (isModalOpen()) {
        <app-product-modal [editProduct]="selectedProduct()" [prefillCode]="scannedTagCode()" (dismiss)="closeModal()"></app-product-modal>
      }

      <!-- QR / Barcode Scanner Modal -->
      @if (isScannerOpen()) {
        <app-scanner-modal
          (dismiss)="isScannerOpen.set(false)"
          (lookupInInventory)="onLookupScannedCode($event)"
          (editMatchedProduct)="onEditScannedProduct($event)"
          (addWithScannedCode)="onAddWithScannedCode($event)">
        </app-scanner-modal>
      }

      <!-- Bulk Making Charges Modal -->
      @if (isBulkMakingModalOpen()) {
        <app-bulk-making-modal
          [selectedProducts]="selectedProductsList()"
          (dismiss)="isBulkMakingModalOpen.set(false)"
          (applied)="onBulkMakingApplied()">
        </app-bulk-making-modal>
      }

      <!-- WhatsApp Product Share Modal -->
      @if (shareProductsList().length > 0) {
        <app-whatsapp-share-modal
          [products]="shareProductsList()"
          (dismiss)="shareProductsList.set([])">
        </app-whatsapp-share-modal>
      }

      <!-- Product Video Showcase & Recorder Modal -->
      @if (videoProduct(); as vProd) {
        <app-product-video-modal
          [product]="vProd"
          (dismiss)="videoProduct.set(null)"
          (shareWhatsapp)="openWhatsappShare([$event])">
        </app-product-video-modal>
      }

      <!-- Bulk Delete Confirmation Modal -->
      @if (isBulkDeleteConfirmOpen()) {
        <div class="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-red-200 p-6 space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <span class="material-icons text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 class="font-bold text-base text-neutral-900">Delete {{ selectedCount() }} Items?</h3>
                <p class="text-xs text-neutral-500">This will permanently remove the selected items from your inventory.</p>
              </div>
            </div>

            <div class="bg-neutral-50 rounded-2xl p-3 border border-neutral-200 max-h-28 overflow-y-auto space-y-1">
              @for (prod of selectedProductsList(); track prod.id) {
                <div class="text-xs text-neutral-800 flex items-center justify-between">
                  <span class="truncate pr-2 font-medium">{{ prod.name }}</span>
                  <span class="text-[10px] font-mono text-neutral-500 shrink-0">{{ prod.code }}</span>
                </div>
              }
            </div>

            <div class="flex items-center justify-end space-x-2.5 pt-2">
              <button (click)="isBulkDeleteConfirmOpen.set(false)" type="button"
                class="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition cursor-pointer">
                Cancel
              </button>
              <button (click)="confirmBulkDelete()" type="button"
                class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-md cursor-pointer">
                Delete {{ selectedCount() }} Items
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class Inventory {
  readonly service = inject(JewelleryService);
  
  readonly searchQuery = this.service.inventorySearchQuery;
  readonly isModalOpen = signal<boolean>(false);
  readonly isScannerOpen = signal<boolean>(false);
  readonly selectedProduct = signal<Product | null>(null);
  readonly scannedTagCode = signal<string | null>(null);
  readonly activeMenuId = signal<string | null>(null);

  readonly onlyLowStock = signal<boolean>(false);
  readonly isThresholdPanelOpen = signal<boolean>(false);
  readonly draftThreshold = signal<number>(this.service.settings().defaultLowStockThreshold);

  // Bulk Selection State
  readonly selectionMode = signal<boolean>(false);
  readonly selectedIds = signal<string[]>([]);
  readonly isBulkMakingModalOpen = signal<boolean>(false);
  readonly isBulkDeleteConfirmOpen = signal<boolean>(false);
  readonly shareProductsList = signal<Product[]>([]);
  readonly videoProduct = signal<Product | null>(null);

  readonly filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const lowOnly = this.onlyLowStock();
    return this.service.products().filter(p => {
      if (lowOnly && !this.service.isLowStock(p)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.metalType.toLowerCase().includes(q) ||
        p.purity.toLowerCase().includes(q)
      );
    });
  });

  getCardContainerClass(prod: Product): string {
    if (this.isSelected(prod.id)) {
      return 'border-amber-500 ring-2 ring-amber-500/80 bg-amber-50/20 shadow-md';
    }
    if (this.service.isLowStock(prod)) {
      return 'border-red-500 ring-1 ring-red-400/50 bg-red-50/15 hover:border-red-600 hover:shadow-sm';
    }
    return 'border-neutral-200 bg-white hover:border-amber-500/60 hover:shadow-sm';
  }

  getTableRowClass(prod: Product): string {
    if (this.isSelected(prod.id)) {
      return 'bg-amber-50 hover:bg-amber-100/70';
    }
    if (this.service.isLowStock(prod)) {
      return 'bg-red-50/50 hover:bg-red-50 border-l-4 border-l-red-500';
    }
    return 'hover:bg-amber-50/40';
  }

  toggleLowStockFilter() {
    this.onlyLowStock.update(v => !v);
  }

  toggleThresholdPanel() {
    const next = !this.isThresholdPanelOpen();
    if (next) {
      this.draftThreshold.set(this.service.settings().defaultLowStockThreshold);
    }
    this.isThresholdPanelOpen.set(next);
  }

  adjustDraftThreshold(delta: number) {
    this.draftThreshold.update(v => Math.max(0, v + delta));
  }

  onDraftThresholdInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const parsed = Number(input?.value ?? 0);
    this.draftThreshold.set(Math.max(0, Math.floor(Number.isFinite(parsed) ? parsed : 0)));
  }

  saveDefaultThreshold() {
    this.service.updateDefaultLowStockThreshold(this.draftThreshold());
    this.isThresholdPanelOpen.set(false);
  }

  applyThresholdToAll() {
    const limit = Math.max(0, Math.floor(this.draftThreshold()));
    this.service.updateDefaultLowStockThreshold(limit);
    for (const prod of this.service.products()) {
      this.service.updateProduct(prod.id, { minStockThreshold: limit });
    }
    this.service.showToast(`Applied minimum stock limit (${limit} pcs) to all products.`);
    this.isThresholdPanelOpen.set(false);
  }

  readonly selectedProductsList = computed(() => {
    const idSet = new Set(this.selectedIds());
    return this.service.products().filter(p => idSet.has(p.id));
  });

  readonly selectedCount = computed(() => this.selectedProductsList().length);

  readonly allFilteredSelected = computed(() => {
    const filtered = this.filteredProducts();
    if (filtered.length === 0) return false;
    const idSet = new Set(this.selectedIds());
    return filtered.every(p => idSet.has(p.id));
  });

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  toggleSelectionMode() {
    if (this.selectionMode()) {
      this.exitSelectionMode();
    } else {
      this.activeMenuId.set(null);
      this.selectionMode.set(true);
    }
  }

  exitSelectionMode() {
    this.selectionMode.set(false);
    this.selectedIds.set([]);
    this.isBulkMakingModalOpen.set(false);
    this.isBulkDeleteConfirmOpen.set(false);
  }

  toggleProductSelection(id: string) {
    this.selectedIds.update(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  }

  toggleSelectAllFiltered() {
    const filteredIds = this.filteredProducts().map(p => p.id);
    if (this.allFilteredSelected()) {
      const filteredSet = new Set(filteredIds);
      this.selectedIds.update(current => current.filter(id => !filteredSet.has(id)));
    } else {
      const merged = new Set([...this.selectedIds(), ...filteredIds]);
      this.selectedIds.set(Array.from(merged));
    }
  }

  openBulkMakingModal() {
    if (this.selectedCount() === 0) return;
    this.isBulkMakingModalOpen.set(true);
  }

  onBulkMakingApplied() {
    this.exitSelectionMode();
  }

  confirmBulkDelete() {
    const ids = this.selectedProductsList().map(p => p.id);
    this.service.bulkDeleteProducts(ids);
    this.exitSelectionMode();
  }

  toggleMenu(event: Event, productId: string) {
    event.stopPropagation();
    if (this.activeMenuId() === productId) {
      this.activeMenuId.set(null);
    } else {
      this.activeMenuId.set(productId);
    }
  }

  openScanner() {
    this.activeMenuId.set(null);
    this.isScannerOpen.set(true);
  }

  onLookupScannedCode(code: string) {
    this.isScannerOpen.set(false);
    this.searchQuery.set(code);
    this.service.showToast(`Filtered inventory by scanned tag: ${code}`, 'info');
  }

  onEditScannedProduct(product: Product) {
    this.isScannerOpen.set(false);
    this.openEditModal(product);
  }

  onAddWithScannedCode(code: string) {
    this.isScannerOpen.set(false);
    this.selectedProduct.set(null);
    this.scannedTagCode.set(code);
    this.isModalOpen.set(true);
  }

  openAddModal() {
    this.activeMenuId.set(null);
    this.selectedProduct.set(null);
    this.scannedTagCode.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(product: Product) {
    this.activeMenuId.set(null);
    this.selectedProduct.set(product);
    this.scannedTagCode.set(null);
    this.isModalOpen.set(true);
  }

  openWhatsappShare(products: Product[]) {
    if (products.length === 0) return;
    this.activeMenuId.set(null);
    this.shareProductsList.set(products);
  }

  openBulkWhatsappShare() {
    const selected = this.selectedProductsList();
    if (selected.length === 0) return;
    this.shareProductsList.set(selected);
  }

  openVideoModal(product: Product) {
    this.activeMenuId.set(null);
    this.videoProduct.set(product);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedProduct.set(null);
    this.scannedTagCode.set(null);
  }
}
