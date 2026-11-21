import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, input, output, OnInit, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JewelleryService } from '../services/jewellery.service';
import { Product } from '../models/jewellery.model';
import { JEWELLERY_ITEM_SUGGESTIONS } from '../shared/jewellery-item-suggestions';

type MarketingDesignId = 'royal-gold' | 'bridal-crimson' | 'minimal-editorial' | 'festival-spotlight' | 'diamond-prism' | 'classic-showroom';

interface MarketingDesignOption {
  readonly id: MarketingDesignId;
  readonly name: string;
  readonly effectLabel: string;
  readonly badge: string;
  readonly icon: string;
  readonly swatchBg: string;
  readonly accentHex: string;
}

@Component({
  selector: 'app-product-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 h-[100dvh] z-[100] bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div class="bg-white rounded-none sm:rounded-sm shadow-2xl max-w-5xl lg:max-w-6xl w-full max-h-[96vh] flex flex-col overflow-hidden border border-amber-500/20 native-sheet">
        <!-- Fixed Modal Header -->
        <div class="bg-neutral-900 text-white px-4 pt-2 pb-2.5 sm:px-4 sm:py-2.5 border-b border-amber-500/20 shrink-0">
          <div class="w-10 h-1 bg-neutral-700 rounded-none mx-auto mb-2 sm:hidden"></div>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
                <span class="material-icons text-lg">inventory_2</span>
              </div>
              <div>
                <h3 class="font-bold text-sm sm:text-base text-white leading-tight">{{ isEdit() ? 'Edit Jewellery Product' : 'Add New Jewellery Item' }}</h3>
                <p class="text-[11px] text-neutral-400">Enter precise weight, purity and valuation details</p>
              </div>
            </div>
            <button (click)="dismiss.emit()" class="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer" type="button">
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
        </div>

        <!-- Form Layout: Scrollable Middle Fields + Fixed Modal Footer -->
        <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div class="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-3 sm:p-4 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <!-- Select Item / Product Name with Custom Dropdown -->
            <div class="sm:col-span-1 lg:col-span-1 relative">
              <label class="block text-xs font-bold text-neutral-800 capitalize tracking-wider mb-1">
                Select Item Name *
                <div class="relative">
                  <input type="text" formControlName="name" (focus)="onItemNameFocus()" (input)="onItemNameInput($event)" placeholder="Select or type item..."
                    class="w-full mt-1 px-3.5 py-2.5 rounded-none border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 font-normal bg-white pr-8">
                  <button type="button" (click)="toggleItemDropdown()" class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer mt-1" tabindex="-1">
                    <span class="material-icons text-sm">arrow_drop_down</span>
                  </button>
                </div>
              </label>

              @if (showItemDropdown() && filteredItemSuggestions().length > 0) {
                <div class="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-neutral-300 rounded-none shadow-2xl max-h-52 overflow-y-auto divide-y divide-neutral-100">
                  @for (item of filteredItemSuggestions(); track item) {
                    <button type="button" (click)="selectItemSuggestion(item)" class="w-full px-3.5 py-2 text-left text-xs sm:text-sm text-neutral-800 hover:bg-amber-50 hover:text-amber-900 font-medium transition cursor-pointer">
                      {{ item }}
                    </button>
                  }
                </div>
              }

              @if (productForm.get('name')?.touched && productForm.get('name')?.invalid) {
                <div class="text-red-500 text-xs mt-1">Item name is required.</div>
              }
            </div>

            <!-- Product Code -->
            <div>
              <label class="block text-xs font-bold text-neutral-800 capitalize tracking-wider mb-1">
                Product Code (SKU) *
                <input type="text" formControlName="code" placeholder="e.g. JWL-G-1004"
                  class="w-full mt-1 px-3.5 py-2 rounded-none border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm text-neutral-900 font-normal bg-white">
              </label>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-xs font-bold text-neutral-800 capitalize tracking-wider mb-1">
                Category *
                <select formControlName="category" class="w-full mt-1 px-3.5 py-2 rounded-none border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm text-neutral-900 bg-white font-normal">
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Artificial">Artificial</option>
                </select>
              </label>
            </div>

            <!-- Metal Type -->
            <div>
              <label class="block text-xs font-bold text-neutral-800 capitalize tracking-wider mb-1">
                Metal Type *
                <select formControlName="metalType" class="w-full mt-1 px-3.5 py-2 rounded-none border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm text-neutral-900 bg-white font-normal">
                  <option value="22K Gold">22K Gold</option>
                  <option value="18K Gold">18K Gold</option>
                  <option value="14K Gold">14K Gold</option>
                  <option value="925 Silver">925 Silver</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Brass/Alloy">Brass/Alloy</option>
                </select>
              </label>
            </div>

            <!-- Purity -->
            <div>
              <label class="block text-xs font-bold text-neutral-800 capitalize tracking-wider mb-1">
                Purity / Hallmarking *
                <input type="text" formControlName="purity" placeholder="e.g. 916 Hallmarked"
                  class="w-full mt-1 px-3.5 py-2 rounded-none border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm text-neutral-900 font-normal bg-white">
              </label>
            </div>

            <!-- Gross Weight -->
            <div>
              <label class="block text-xs font-bold text-neutral-800 capitalize tracking-wider mb-1">
                Gross Weight (g) *
                <input type="number" step="0.1" formControlName="grossWeight" placeholder="0.00"
                  class="w-full mt-1 px-3.5 py-2 rounded-none border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm text-neutral-900 font-normal bg-white">
              </label>
            </div>

            <!-- Net Weight -->
            <div>
              <label class="block text-xs font-bold text-neutral-800 capitalize tracking-wider mb-1">
                Net Weight (g) *
                <input type="number" step="0.1" formControlName="netWeight" placeholder="0.00"
                  class="w-full mt-1 px-3.5 py-2 rounded-none border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm text-neutral-900 font-normal bg-white">
              </label>
            </div>

            <!-- Jewellery Rate (Jewellery Bhav) -->
            <div>
              <label class="block text-xs font-bold text-neutral-800 capitalize tracking-wider mb-1">
                Jewellery Rate (₹/g Bhav) *
                <input type="number" step="0.5" formControlName="jewelleryRate" placeholder="6650"
                  class="w-full mt-1 px-3.5 py-2 rounded-none border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm text-neutral-900 font-normal bg-white">
              </label>
            </div>

            <!-- Making Charges -->
            <div>
              <label class="block text-xs font-bold text-neutral-800 capitalize tracking-wider mb-1">
                Making Charges (₹)
                <input type="number" formControlName="makingCharges" placeholder="0"
                  class="w-full mt-1 px-3.5 py-2 rounded-none border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm text-neutral-900 font-normal bg-white">
              </label>
            </div>

            <!-- Selling Price -->
            <div>
              <label class="block text-xs font-bold text-neutral-800 capitalize tracking-wider mb-1">
                Selling Price (₹) *
                <input type="number" formControlName="sellingPrice" placeholder="0"
                  class="w-full mt-1 px-3.5 py-2 rounded-none border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm text-neutral-900 font-normal bg-white">
              </label>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-xs font-bold text-neutral-800 capitalize tracking-wider mb-1">
                Quantity (Pcs) *
                <input type="number" min="0" formControlName="quantity" placeholder="1"
                  class="w-full mt-1 px-3.5 py-2 rounded-none border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm text-neutral-900 font-normal bg-white">
              </label>
            </div>

            <!-- Media Studio: Unified Multi-Image Gallery & 6-Template Reel Generator for Mobile & Desktop -->
            <div class="sm:col-span-2 lg:col-span-4 grid grid-cols-1 gap-4 pt-3 border-t border-neutral-200">
              <!-- Product Photos Multi-Image Horizontal Scroll -->
              <div class="rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5 sm:p-4">
                <div class="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <span class="material-icons text-sm">collections</span>
                    </div>
                    <span class="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Product Photos
                    </span>
                    @if (desktopImages().length > 0) {
                      <span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {{ desktopImages().length }} selected
                      </span>
                    }
                  </div>
                  <div class="flex items-center gap-2">
                    @if (desktopImages().length > 0) {
                      <button type="button" (click)="clearAllDesktopImages()"
                        class="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer">
                        Clear All
                      </button>
                    }
                    <button type="button" (click)="cameraCaptureInput.click()"
                      class="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-amber-300 text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm">
                      <span class="material-icons text-xs text-amber-400">photo_camera</span>
                      <span>Camera</span>
                    </button>
                    <button type="button" (click)="multiDesktopInput.click()"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm">
                      <span class="material-icons text-xs text-amber-600">add_photo_alternate</span>
                      <span>Add Images</span>
                    </button>
                  </div>
                </div>

                <input #multiDesktopInput type="file" accept="image/*" multiple class="hidden" (change)="onDesktopFilesSelected($event)">
                <input #cameraCaptureInput type="file" accept="image/*" capture="environment" class="hidden" (change)="onDesktopFilesSelected($event)">

                @if (desktopImages().length > 0) {
                  <div
                    (dragover)="onDesktopDragOver($event)"
                    (dragleave)="onDesktopDragLeave($event)"
                    (drop)="onDesktopDrop($event)"
                    class="rounded-lg border p-2 bg-white transition"
                    [class.border-amber-500]="desktopDragOver()"
                    [class.bg-amber-50]="desktopDragOver()"
                    [class.border-neutral-200]="!desktopDragOver()">
                    <div class="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 scroll-smooth">
                      @for (imgUrl of desktopImages(); track $index; let idx = $index) {
                        <div class="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border bg-white transition"
                          [class.border-amber-500]="imgUrl === imagePreview()"
                          [class.ring-2]="imgUrl === imagePreview()"
                          [class.ring-amber-500/30]="imgUrl === imagePreview()"
                          [class.border-neutral-200]="imgUrl !== imagePreview()">
                          <img [src]="imgUrl" [alt]="'Selected jewellery photo ' + (idx + 1)" class="w-full h-full object-cover object-center block">
                          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                          @if (imgUrl === imagePreview()) {
                            <span class="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-neutral-950 text-[8px] font-bold uppercase tracking-wide shadow-sm">
                              Cover
                            </span>
                          } @else {
                            <button type="button" (click)="setDesktopCoverImage(imgUrl)"
                              class="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-neutral-900/80 hover:bg-amber-500 text-white hover:text-neutral-950 text-[8px] font-semibold transition cursor-pointer">
                              Set Cover
                            </button>
                          }

                          <button type="button" (click)="removeDesktopImage(idx)"
                            class="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow transition cursor-pointer"
                            title="Remove Photo">
                            <span class="material-icons text-[11px]">close</span>
                          </button>
                        </div>
                      }

                      <button type="button" (click)="multiDesktopInput.click()"
                        class="shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-amber-400/60 bg-neutral-50 hover:bg-amber-50 text-amber-800 flex flex-col items-center justify-center gap-0.5 transition cursor-pointer">
                        <span class="material-icons text-base text-amber-600">add_photo_alternate</span>
                        <span class="text-[9px] font-bold leading-tight text-center">Add More</span>
                      </button>
                    </div>
                  </div>
                } @else {
                  <button type="button"
                    (click)="multiDesktopInput.click()"
                    (dragover)="onDesktopDragOver($event)"
                    (dragleave)="onDesktopDragLeave($event)"
                    (drop)="onDesktopDrop($event)"
                    class="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-dashed flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 transition cursor-pointer bg-white"
                    [class.border-amber-500]="desktopDragOver()"
                    [class.bg-amber-50]="desktopDragOver()"
                    [class.border-neutral-300]="!desktopDragOver()"
                    [class.hover:border-amber-400]="!desktopDragOver()"
                    [class.hover:bg-amber-50/30]="!desktopDragOver()">
                    <div class="flex items-center gap-2.5 sm:gap-3 text-left">
                      <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                        <span class="material-icons text-base sm:text-lg">collections</span>
                      </div>
                      <div>
                        <div class="text-[11px] sm:text-xs font-bold text-neutral-800">Tap to add multiple jewellery photos</div>
                        <div class="text-[10px] text-neutral-500">All uploaded angles scroll horizontally here</div>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-neutral-100 text-neutral-700 text-[10px] font-bold shrink-0 self-start sm:self-auto">
                      Select Multiple
                    </span>
                  </button>
                }

                @if (imageError()) {
                  <div class="text-red-500 text-[11px] mt-1">{{ imageError() }}</div>
                }
              </div>

              <!-- Marketing Video Studio: 6 Reel Templates for Mobile & Desktop -->
              <div class="rounded-xl border border-neutral-200 bg-neutral-50/70 p-2.5">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-1.5">
                    <span class="material-icons text-amber-600 text-sm">auto_awesome</span>
                    <span class="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">
                      Select Reel Template
                    </span>
                  </div>
                  <span class="px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-600 text-[9px] font-semibold">
                    {{ marketingPhotoCountLabel() }}
                  </span>
                </div>

                <!-- Responsive Template Grid: 3x2 on Mobile, 6x1 on Tablet/Desktop -->
                <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 mb-2.5">
                  @for (design of marketingDesigns; track design.id) {
                    <button
                      type="button"
                      (click)="selectDesign(design.id)"
                      class="rounded-xl border p-1 sm:p-1.5 text-left transition cursor-pointer flex flex-col gap-1 sm:gap-1.5 group"
                      [class.border-amber-500]="selectedDesignId() === design.id"
                      [class.bg-amber-50]="selectedDesignId() === design.id"
                      [class.ring-2]="selectedDesignId() === design.id"
                      [class.ring-amber-500/25]="selectedDesignId() === design.id"
                      [class.border-neutral-200]="selectedDesignId() !== design.id"
                      [class.bg-white]="selectedDesignId() !== design.id"
                      [class.hover:border-amber-300]="selectedDesignId() !== design.id">
                      <!-- Mini Visual Reel Frame Mockup -->
                      <div class="relative w-full h-11 sm:h-12 rounded-lg overflow-hidden" [style.background]="design.swatchBg">
                        <img
                          [src]="marketingSourceImages()[0]"
                          [alt]="design.name"
                          class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-300"
                          [class.rounded-full]="design.id === 'royal-gold'"
                          [class.p-1]="design.id === 'royal-gold' || design.id === 'minimal-editorial'" />
                        <div class="absolute inset-0 pointer-events-none"
                          [class.border-2]="design.id === 'bridal-crimson' || design.id === 'diamond-prism'"
                          [class.border-rose-300/70]="design.id === 'bridal-crimson'"
                          [class.border-cyan-300/70]="design.id === 'diamond-prism'"></div>
                        <span class="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-[7px] sm:text-[8px] font-bold text-white leading-none">
                          {{ design.effectLabel }}
                        </span>
                        @if (selectedDesignId() === design.id) {
                          <span class="material-icons absolute top-1 right-1 text-[13px] sm:text-[14px] text-amber-400 drop-shadow">check_circle</span>
                        }
                      </div>
                      <div class="flex items-center justify-between gap-1 px-0.5">
                        <span class="text-[9px] sm:text-[10px] font-bold text-neutral-800 truncate leading-none">{{ design.name }}</span>
                        <span class="material-icons text-[11px] sm:text-[12px] shrink-0" [style.color]="design.accentHex">{{ design.icon }}</span>
                      </div>
                    </button>
                  }
                </div>

                @if (isGeneratingReel()) {
                  <div class="rounded-lg border border-amber-500/30 bg-neutral-950 px-3 py-2.5 space-y-1.5">
                    <div class="flex items-center justify-between text-[11px] font-bold text-amber-300">
                      <span class="flex items-center gap-1.5 min-w-0">
                        <span class="material-icons text-sm animate-spin shrink-0">autorenew</span>
                        <span class="truncate">Rendering {{ selectedDesign().name }}...</span>
                      </span>
                      <span class="tabular-nums shrink-0">{{ reelProgress() }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-500 transition-all duration-150" [style.width.%]="reelProgress()"></div>
                    </div>
                  </div>
                } @else if (videoPreview()) {
                  <div class="rounded-lg border border-neutral-200 bg-white p-2 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                    <div class="relative w-full sm:w-32 h-32 sm:h-20 rounded-md overflow-hidden bg-black shrink-0">
                      <video [src]="videoPreview()" controls autoplay loop playsinline class="w-full h-full object-contain block"></video>
                    </div>
                    <div class="flex-1 min-w-0 space-y-1.5">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-bold text-neutral-900 truncate">
                          {{ productForm.get('videoLabel')?.value || 'Marketing Reel Ready' }}
                        </span>
                        <span class="text-[10px] text-neutral-500 shrink-0">{{ marketingPhotoCountLabel() }}</span>
                      </div>
                      <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <input
                          type="text"
                          [value]="promoTagline()"
                          (input)="onTaglineInput($event)"
                          placeholder="Optional promo text..."
                          class="w-full sm:w-auto sm:flex-1 px-2.5 py-1 rounded-none border border-neutral-300 bg-neutral-50 text-[11px] text-neutral-900 outline-none focus:border-amber-500">
                        <button type="button" (click)="generateDesktopMarketingVideo()"
                          class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-[10px] font-bold transition cursor-pointer shrink-0">
                          <span class="material-icons text-xs">auto_fix_high</span>
                          <span>Apply {{ selectedDesign().name }}</span>
                        </button>
                        <a [href]="videoPreview()" [download]="marketingDownloadName()"
                          class="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 text-[10px] font-bold transition cursor-pointer shrink-0"
                          title="Download Marketing Video">
                          <span class="material-icons text-xs">download</span>
                          <span>Save</span>
                        </a>
                        <button type="button" (click)="clearSelectedVideo()"
                          class="w-7 h-7 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition cursor-pointer shrink-0"
                          title="Remove Generated Video">
                          <span class="material-icons text-xs">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                } @else {
                  <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5">
                    <input
                      type="text"
                      [value]="promoTagline()"
                      (input)="onTaglineInput($event)"
                      placeholder="Optional Promo Text (e.g. Festive Launch • Flat Making)"
                      class="w-full sm:flex-1 px-3 py-1.5 rounded-none border border-neutral-300 bg-white text-xs text-neutral-900 outline-none focus:border-amber-500">
                    <button type="button" (click)="generateDesktopMarketingVideo()"
                      class="w-full sm:w-auto shrink-0 py-2 sm:py-1.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer active:scale-[0.99]">
                      <span class="material-icons text-sm text-amber-400">auto_fix_high</span>
                      <span>Generate {{ selectedDesign().name }} Video ({{ marketingSourceImages().length }} {{ marketingSourceImages().length === 1 ? 'Photo' : 'Photos' }})</span>
                    </button>
                  </div>
                }

                @if (videoError()) {
                  <div class="text-red-500 text-[11px] mt-1">{{ videoError() }}</div>
                }
              </div>
            </div>
          </div>
          </div>

          <!-- Fixed Modal Footer Actions -->
          <div class="shrink-0 bg-white border-t border-neutral-200 px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:py-3 flex items-center justify-end space-x-2.5">
            <button type="button" (click)="dismiss.emit()" class="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" [disabled]="productForm.invalid" class="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer">
              {{ isEdit() ? 'Update Product' : 'Save Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProductModal implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  readonly service = inject(JewelleryService);
  readonly fb = inject(FormBuilder);

  readonly editProduct = input<Product | null>(null);
  readonly prefillCode = input<string | null>(null);
  readonly dismiss = output<void>();

  private readonly defaultImage = '/images/p1.jpg';

  readonly marketingDesigns: readonly MarketingDesignOption[] = [
    {
      id: 'royal-gold',
      name: 'Royal Mandala',
      effectLabel: '3D Gold Halo',
      badge: 'ROYAL SIGNATURE',
      icon: 'flare',
      swatchBg: 'linear-gradient(135deg, #1c1205 0%, #92400e 60%, #fde047 100%)',
      accentHex: '#f59e0b'
    },
    {
      id: 'bridal-crimson',
      name: 'Bridal Velvet',
      effectLabel: 'Bokeh Glow',
      badge: 'BRIDAL EDITION',
      icon: 'favorite',
      swatchBg: 'linear-gradient(135deg, #3b0712 0%, #9f1239 60%, #fda4af 100%)',
      accentHex: '#fb7185'
    },
    {
      id: 'minimal-editorial',
      name: 'Atelier Split',
      effectLabel: 'Slide Wipe',
      badge: 'ATELIER CURATION',
      icon: 'style',
      swatchBg: 'linear-gradient(135deg, #fafaf9 0%, #d6d3d1 55%, #57534e 100%)',
      accentHex: '#d97706'
    },
    {
      id: 'festival-spotlight',
      name: 'Festive Sparkle',
      effectLabel: 'Offer Pulse',
      badge: 'FESTIVE LAUNCH',
      icon: 'celebration',
      swatchBg: 'linear-gradient(135deg, #064e3b 0%, #059669 55%, #fcd34d 100%)',
      accentHex: '#34d399'
    },
    {
      id: 'diamond-prism',
      name: 'Diamond Prism',
      effectLabel: 'Crystal Rays',
      badge: 'PRISM SHOWCASE',
      icon: 'diamond',
      swatchBg: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #67e8f9 100%)',
      accentHex: '#38bdf8'
    },
    {
      id: 'classic-showroom',
      name: 'Showroom Reel',
      effectLabel: 'Filmstrip',
      badge: 'SHOWROOM REEL',
      icon: 'theaters',
      swatchBg: 'linear-gradient(135deg, #09090b 0%, #27272a 60%, #e4e4e7 100%)',
      accentHex: '#e4e4e7'
    }
  ];

  productForm!: FormGroup;
  isEdit = signal<boolean>(false);
  imagePreview = signal<string>(this.defaultImage);
  hasCustomImage = signal<boolean>(false);
  desktopImages = signal<string[]>([]);
  desktopDragOver = signal<boolean>(false);
  imageError = signal<string | null>(null);
  videoPreview = signal<string | null>(null);
  videoError = signal<string | null>(null);

  selectedDesignId = signal<MarketingDesignId>('royal-gold');
  promoTagline = signal<string>('');
  isGeneratingReel = signal<boolean>(false);
  reelProgress = signal<number>(0);

  readonly selectedDesign = computed(
    () => this.marketingDesigns.find((d) => d.id === this.selectedDesignId()) ?? this.marketingDesigns[0]
  );

  readonly marketingSourceImages = computed(() => {
    const gallery = this.desktopImages();
    return gallery.length ? gallery : [this.imagePreview() || this.defaultImage];
  });

  readonly marketingPhotoCountLabel = computed(() => {
    const gallery = this.desktopImages();
    if (!gallery.length) return 'Cover photo';
    return `${gallery.length} ${gallery.length === 1 ? 'photo' : 'photos'} ready`;
  });

  readonly marketingDownloadName = computed(() => {
    const rawCode = (this.productForm?.get('code')?.value as string | undefined) || 'jewellery';
    return `${rawCode.toLowerCase()}-${this.selectedDesignId()}-reel.webm`;
  });

  ngOnInit() {
    const prod = this.editProduct();
    this.isEdit.set(!!prod);

    const initialImage = prod?.image || this.defaultImage;
    const initialGallery = prod?.images?.length
      ? [...prod.images]
      : (prod?.image ? [prod.image] : []);

    this.imagePreview.set(initialImage);
    this.hasCustomImage.set(!!prod?.image && prod.image !== this.defaultImage);
    this.desktopImages.set(initialGallery);
    this.videoPreview.set(prod?.videoUrl || null);

    const initialCode = prod?.code || this.prefillCode() || ('JWL-' + Math.floor(1000 + Math.random() * 9000));

    this.productForm = this.fb.group({
      name: [prod?.name || '', Validators.required],
      code: [initialCode, Validators.required],
      category: [prod?.category || 'Gold', Validators.required],
      metalType: [prod?.metalType || '22K Gold', Validators.required],
      purity: [prod?.purity || '916 Hallmarked', Validators.required],
      grossWeight: [prod?.grossWeight || 10.0, [Validators.required, Validators.min(0.1)]],
      netWeight: [prod?.netWeight || 9.5, [Validators.required, Validators.min(0.1)]],
      jewelleryRate: [prod?.jewelleryRate ?? this.service.settings().goldRate22k, [Validators.required, Validators.min(1)]],
      makingCharges: [prod?.makingCharges || 2500],
      sellingPrice: [prod?.sellingPrice || 72000, [Validators.required, Validators.min(1)]],
      quantity: [prod?.quantity ?? 1, [Validators.required, Validators.min(0)]],
      image: [initialImage],
      images: [initialGallery.length ? initialGallery : undefined],
      videoUrl: [prod?.videoUrl || undefined],
      videoLabel: [prod?.videoLabel || undefined]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.imageError.set('Please select a valid image file.');
      input.value = '';
      return;
    }

    this.imageError.set(null);
    this.readAndResizeFile(file).then((processedDataUrl) => {
      if (!processedDataUrl) {
        this.imageError.set('Unable to read the selected image.');
        return;
      }
      this.imagePreview.set(processedDataUrl);
      this.hasCustomImage.set(true);
      this.desktopImages.set([processedDataUrl]);
      this.productForm.patchValue({ image: processedDataUrl, images: [processedDataUrl] });
    });
    input.value = '';
  }

  onDesktopFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    input.value = '';
    void this.processDesktopFiles(files);
  }

  onDesktopDragOver(event: DragEvent) {
    event.preventDefault();
    this.desktopDragOver.set(true);
  }

  onDesktopDragLeave(event: DragEvent) {
    event.preventDefault();
    this.desktopDragOver.set(false);
  }

  onDesktopDrop(event: DragEvent) {
    event.preventDefault();
    this.desktopDragOver.set(false);
    const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
    if (files.length) {
      void this.processDesktopFiles(files);
    }
  }

  private async processDesktopFiles(files: File[]) {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) {
      this.imageError.set('Please select valid image files.');
      return;
    }

    this.imageError.set(
      imageFiles.length < files.length ? 'Some non-image files were skipped.' : null
    );

    const processed = await Promise.all(imageFiles.map((file) => this.readAndResizeFile(file)));
    const validUrls = processed.filter((url): url is string => !!url);
    if (!validUrls.length) {
      this.imageError.set('Unable to read the selected images.');
      return;
    }

    const updated = [...this.desktopImages(), ...validUrls];
    this.desktopImages.set(updated);

    const cover = this.hasCustomImage() && updated.includes(this.imagePreview())
      ? this.imagePreview()
      : updated[0];

    this.imagePreview.set(cover);
    this.hasCustomImage.set(cover !== this.defaultImage);
    this.productForm.patchValue({ image: cover, images: updated });
  }

  setDesktopCoverImage(imgUrl: string) {
    this.imagePreview.set(imgUrl);
    this.hasCustomImage.set(imgUrl !== this.defaultImage);
    this.productForm.patchValue({ image: imgUrl });
  }

  removeDesktopImage(index: number) {
    const current = this.desktopImages();
    const removedUrl = current[index];
    const updated = current.filter((_, i) => i !== index);
    this.desktopImages.set(updated);

    if (!updated.length) {
      this.imagePreview.set(this.defaultImage);
      this.hasCustomImage.set(false);
      this.productForm.patchValue({ image: this.defaultImage, images: undefined });
      return;
    }

    const nextCover = removedUrl === this.imagePreview() ? updated[0] : this.imagePreview();
    this.imagePreview.set(nextCover);
    this.hasCustomImage.set(nextCover !== this.defaultImage);
    this.productForm.patchValue({ image: nextCover, images: updated });
  }

  clearAllDesktopImages() {
    this.desktopImages.set([]);
    this.clearSelectedImage();
  }

  private readAndResizeFile(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (!result) {
          resolve(null);
          return;
        }
        this.resizeImageIfNeeded(result, (processedDataUrl) => resolve(processedDataUrl));
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  private resizeImageIfNeeded(dataUrl: string, callback: (url: string) => void) {
    const img = new Image();
    img.onload = () => {
      const maxDim = 800;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.85));
      } else {
        callback(dataUrl);
      }
    };
    img.onerror = () => callback(dataUrl);
    img.src = dataUrl;
  }

  clearSelectedImage() {
    this.imagePreview.set(this.defaultImage);
    this.hasCustomImage.set(false);
    this.desktopImages.set([]);
    this.imageError.set(null);
    this.productForm.patchValue({ image: this.defaultImage, images: undefined });
  }

  selectDesign(id: MarketingDesignId) {
    this.selectedDesignId.set(id);
  }

  onTaglineInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.promoTagline.set(target?.value ?? '');
  }

  async generateDesktopMarketingVideo() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.videoError.set(null);

    const canvas = document.createElement('canvas');
    if (typeof canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
      this.videoError.set('Video reel export is not supported in this browser.');
      return;
    }

    const sources = this.marketingSourceImages();
    const design = this.selectedDesign();
    const shop = this.service.settings();
    const formVal = this.productForm.value as Partial<Product>;

    const productTitle = (formVal.name || '').trim() || 'Signature Jewellery Piece';
    const productCode = (formVal.code || 'JWL-NEW').trim();
    const metalType = formVal.metalType || '22K Gold';
    const purity = formVal.purity || '916 Hallmarked';
    const netWeight = Number(formVal.netWeight ?? 9.5);
    const sellingPrice = Number(formVal.sellingPrice ?? 72000);
    const tagline = this.promoTagline().trim() || `${purity} • ${metalType}`;

    this.isGeneratingReel.set(true);
    this.reelProgress.set(5);

    let audioCtx: AudioContext | null = null;

    try {
      const loaded = await Promise.all(sources.map((src) => this.loadCanvasImage(src)));
      const images = loaded.filter((img): img is HTMLImageElement => !!img);

      const width = 720;
      const height = 720;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');

      const canvasStream = canvas.captureStream(30);
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      // Attach gentle synthesized showroom chime audio if Web Audio is available
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioCtx = new AudioCtx();
          await audioCtx.resume();
          const dest = audioCtx.createMediaStreamDestination();
          this.scheduleAmbientChime(audioCtx, dest);
          for (const track of dest.stream.getAudioTracks()) {
            tracks.push(track);
          }
        }
      } catch {
        // Fallback smoothly to video-only stream if audio capture fails
      }

      const combinedStream = new MediaStream(tracks);
      const mimeType = this.pickSupportedVideoMime();
      const recorder = mimeType ? new MediaRecorder(combinedStream, { mimeType }) : new MediaRecorder(combinedStream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };

      const done = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }));
      });

      recorder.start(200);

      const totalFrames = 135; // 4.5 seconds at 30fps
      for (let frame = 0; frame <= totalFrames; frame++) {
        const t = frame / totalFrames;
        this.renderMarketingFrame(ctx, width, height, images, design, {
          shopName: shop.shopName,
          title: productTitle,
          code: productCode,
          tagline,
          netWeight,
          sellingPrice
        }, t);
        this.reelProgress.set(Math.min(99, Math.round(5 + t * 93)));
        await new Promise((resolve) => window.setTimeout(resolve, 33));
      }

      recorder.stop();
      const blob = await done;
      const url = URL.createObjectURL(blob);
      const label = `${design.name} Marketing Reel`;

      this.videoPreview.set(url);
      this.productForm.patchValue({ videoUrl: url, videoLabel: label });
      this.reelProgress.set(100);
    } catch {
      this.videoError.set('Unable to generate marketing video in this browser.');
    } finally {
      if (audioCtx) {
        void audioCtx.close().catch(() => undefined);
      }
      this.isGeneratingReel.set(false);
      this.reelProgress.set(0);
    }
  }

  private scheduleAmbientChime(audioCtx: AudioContext, dest: MediaStreamAudioDestinationNode) {
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const start = now + idx * 0.65;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.15);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(start);
      osc.stop(start + 1.2);
    });
  }

  private pickSupportedVideoMime(): string | undefined {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];
    return candidates.find((type) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type));
  }

  private loadCanvasImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  private renderMarketingFrame(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    images: HTMLImageElement[],
    design: MarketingDesignOption,
    info: {
      shopName: string;
      title: string;
      code: string;
      tagline: string;
      netWeight: number;
      sellingPrice: number;
    },
    t: number
  ) {
    const isEditorial = design.id === 'minimal-editorial';
    const isCrimson = design.id === 'bridal-crimson';
    const isFestive = design.id === 'festival-spotlight';
    const isPrism = design.id === 'diamond-prism';
    const isCatalog = design.id === 'classic-showroom';
    const isRoyal = design.id === 'royal-gold';

    // Backdrop fill
    if (isEditorial) {
      ctx.fillStyle = '#fafaf9';
    } else if (isCrimson) {
      ctx.fillStyle = '#25060d';
    } else if (isFestive) {
      ctx.fillStyle = '#042f2e';
    } else if (isPrism) {
      ctx.fillStyle = '#0a1128';
    } else if (isCatalog) {
      ctx.fillStyle = '#09090b';
    } else {
      ctx.fillStyle = '#120d05';
    }
    ctx.fillRect(0, 0, w, h);

    // Multi-photo slideshow with fancy transitions per template
    const count = Math.max(1, images.length);
    const segmentFloat = t * count;
    const activeIdx = Math.min(count - 1, Math.floor(segmentFloat));
    const localProgress = segmentFloat - activeIdx;
    const nextIdx = (activeIdx + 1) % count;

    const frameMargin = isEditorial ? 44 : isCatalog ? 48 : 0;
    const photoX = frameMargin;
    const photoY = isEditorial ? 82 : isCatalog ? 74 : 0;
    const photoW = w - frameMargin * 2;
    const photoH = isEditorial ? h - 248 : isCatalog ? h - 220 : h;

    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoW, photoH);
    ctx.clip();

    if (images.length > 0) {
      const primaryImg = images[activeIdx];
      const slideTransition = images.length > 1 && localProgress > 0.7;
      const transP = slideTransition ? (localProgress - 0.7) / 0.3 : 0;
      const easedTrans = 1 - Math.pow(1 - transP, 3);

      if (isEditorial || isCatalog) {
        // Horizontal slide-wipe transition
        const offsetX = slideTransition ? -easedTrans * photoW : 0;
        this.drawZoomedCoverImage(ctx, primaryImg, photoX + offsetX, photoY, photoW, photoH, 1.03 + localProgress * 0.08, 1);
        if (slideTransition) {
          this.drawZoomedCoverImage(ctx, images[nextIdx], photoX + photoW + offsetX, photoY, photoW, photoH, 1.03, 1);
        }
      } else {
        // Crossfade + zoom burst
        this.drawZoomedCoverImage(ctx, primaryImg, photoX, photoY, photoW, photoH, 1.04 + localProgress * 0.14, 1);
        if (slideTransition) {
          this.drawZoomedCoverImage(ctx, images[nextIdx], photoX, photoY, photoW, photoH, 1.12 - easedTrans * 0.08, easedTrans);
        }
      }
    }
    ctx.restore();

    // Fancy Design Layer 1: Rotating Mandala Ring (Royal Gold) or Rotating Diamond Shards (Prism)
    if (isRoyal) {
      ctx.save();
      ctx.translate(w / 2, h * 0.43);
      ctx.rotate(t * Math.PI * 0.65);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.32)';
      ctx.lineWidth = 2;
      for (let r = 0; r < 12; r++) {
        ctx.rotate((Math.PI * 2) / 12);
        ctx.beginPath();
        ctx.moveTo(155, 0);
        ctx.lineTo(188, 0);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 170, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (isPrism) {
      ctx.save();
      ctx.translate(w / 2, h * 0.43);
      ctx.rotate(-t * Math.PI * 0.5);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.42)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-145, -145, 290, 290);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = 'rgba(165, 243, 252, 0.32)';
      ctx.strokeRect(-145, -145, 290, 290);
      ctx.restore();
    } else if (isCatalog) {
      // Animated cinema filmstrip sprockets on left & right bars
      ctx.fillStyle = '#27272a';
      const sprocketOffset = (t * 240) % 44;
      for (let sy = -44 + sprocketOffset; sy < h; sy += 44) {
        ctx.fillRect(14, sy, 18, 22);
        ctx.fillRect(w - 32, sy, 18, 22);
      }
    }

    // Sweeping light flare & fancy borders
    if (isEditorial) {
      ctx.strokeStyle = '#d6d3d1';
      ctx.lineWidth = 2;
      ctx.strokeRect(photoX, photoY, photoW, photoH);
    } else {
      const sheenX = -w * 0.35 + t * w * 1.8;
      const sheen = ctx.createLinearGradient(sheenX, 0, sheenX + 190, h);
      sheen.addColorStop(0, 'rgba(255,255,255,0)');
      sheen.addColorStop(0.5, isCrimson ? 'rgba(253, 164, 175, 0.2)' : isFestive ? 'rgba(110, 231, 183, 0.2)' : isPrism ? 'rgba(103, 232, 249, 0.22)' : 'rgba(253, 224, 71, 0.2)');
      sheen.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = isCrimson ? 'rgba(251, 113, 133, 0.55)' : isFestive ? 'rgba(52, 211, 153, 0.55)' : isPrism ? 'rgba(56, 189, 248, 0.55)' : 'rgba(245, 158, 11, 0.55)';
      ctx.lineWidth = 3;
      ctx.strokeRect(18, 18, w - 36, h - 36);
    }

    // Floating sparkle / bokeh particles
    if (isRoyal || isCrimson || isFestive || isPrism) {
      for (let i = 0; i < 14; i++) {
        const px = ((i * 73 + 45 + Math.sin(t * 6 + i) * 14) % (w - 80)) + 40;
        const py = h - (((t * 480 + i * 67) % (h - 140)) + 60);
        const radius = isCrimson ? 4 + (i % 4) * 2.2 : 2 + (i % 3);
        ctx.fillStyle = isCrimson
          ? 'rgba(254, 205, 211, 0.28)'
          : isFestive
            ? 'rgba(167, 243, 208, 0.65)'
            : isPrism
              ? 'rgba(186, 230, 253, 0.68)'
              : 'rgba(253, 224, 71, 0.68)';
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Bottom overlay scrim for dark photo-full layouts
    if (!isEditorial && !isCatalog) {
      const scrim = ctx.createLinearGradient(0, h * 0.45, 0, h);
      scrim.addColorStop(0, 'rgba(0,0,0,0)');
      scrim.addColorStop(0.52, isCrimson ? 'rgba(37, 6, 13, 0.78)' : isFestive ? 'rgba(4, 47, 46, 0.82)' : isPrism ? 'rgba(10, 17, 40, 0.82)' : 'rgba(12, 10, 9, 0.8)');
      scrim.addColorStop(1, isCrimson ? 'rgba(25, 3, 9, 0.96)' : isFestive ? 'rgba(2, 24, 23, 0.96)' : isPrism ? 'rgba(6, 11, 28, 0.96)' : 'rgba(10, 8, 4, 0.96)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, w, h);
    }

    // Segmented Reel Timeline Bar at Very Top (Stories/Reels UI)
    const barGap = 8;
    const barTotalW = w - 64;
    const barW = (barTotalW - barGap * (count - 1)) / count;
    for (let i = 0; i < count; i++) {
      const bx = 32 + i * (barW + barGap);
      ctx.fillStyle = isEditorial ? 'rgba(28, 25, 23, 0.2)' : 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(bx, 10, barW, 4);
      const fillRatio = i < activeIdx ? 1 : i === activeIdx ? localProgress : 0;
      ctx.fillStyle = design.accentHex;
      ctx.fillRect(bx, 10, barW * fillRatio, 4);
    }

    // Top Header Bar
    ctx.fillStyle = isEditorial ? '#1c1917' : 'rgba(15, 15, 18, 0.84)';
    ctx.fillRect(32, 24, w - 64, 40);
    ctx.fillStyle = isEditorial ? '#fef3c7' : design.accentHex;
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(info.shopName.toUpperCase(), 48, 50);

    const badgeText = count > 1 ? `${design.badge}  •  0${activeIdx + 1}/0${count}` : design.badge;
    ctx.font = 'bold 12px sans-serif';
    const badgeWidth = ctx.measureText(badgeText).width;
    ctx.fillStyle = isEditorial ? '#e7e5e4' : '#ffffff';
    ctx.fillText(badgeText, w - badgeWidth - 48, 49);

    // Kinetic Intro Slide-Up Motion for Title & Price
    const enterP = Math.min(1, t / 0.16);
    const enterEase = 1 - Math.pow(1 - enterP, 3);
    const slideOffset = (1 - enterEase) * 28;

    const titleColor = isEditorial ? '#1c1917' : '#ffffff';
    const subColor = isEditorial ? '#57534e' : '#e5e5e5';
    const accentColor = isEditorial ? '#b45309' : design.accentHex;

    ctx.save();
    ctx.globalAlpha = enterEase;

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 17px monospace';
    ctx.fillText(`${info.code}  •  ${info.tagline.toUpperCase().slice(0, 34)}`, 36, h - 126 + slideOffset);

    ctx.fillStyle = titleColor;
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(info.title.slice(0, 30), 36, h - 82 + slideOffset);

    ctx.fillStyle = subColor;
    ctx.font = '600 21px sans-serif';
    ctx.fillText(`Net Wt: ${info.netWeight}g`, 36, h - 42 + slideOffset);

    // Subtle Festive Price Pulse
    const pricePulse = isFestive ? 1 + Math.sin(t * Math.PI * 6) * 0.04 : 1;
    const priceText = `₹${Math.round(info.sellingPrice).toLocaleString('en-IN')}`;
    ctx.font = 'bold 34px sans-serif';
    const priceW = ctx.measureText(priceText).width;
    ctx.save();
    ctx.translate(w - 36 - priceW / 2, h - 40 + slideOffset);
    ctx.scale(pricePulse, pricePulse);
    ctx.fillStyle = accentColor;
    ctx.fillText(priceText, -priceW / 2, 0);
    ctx.restore();

    ctx.restore();

    // Intro Golden Curtain Reveal (first 0.45s)
    if (t < 0.1) {
      const curtainAlpha = 1 - t / 0.1;
      ctx.fillStyle = `rgba(12, 10, 9, ${curtainAlpha * 0.75})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private drawZoomedCoverImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    scale: number,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    const imgRatio = img.width / Math.max(1, img.height);
    const boxRatio = w / h;
    let drawW = w * scale;
    let drawH = h * scale;
    if (imgRatio > boxRatio) {
      drawH = h * scale;
      drawW = drawH * imgRatio;
    } else {
      drawW = w * scale;
      drawH = drawW / imgRatio;
    }
    const dx = x + (w - drawW) / 2;
    const dy = y + (h - drawH) / 2;
    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.restore();
  }

  onVideoSelected(event: Event, label: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      this.videoError.set('Please select a valid video file.');
      input.value = '';
      return;
    }

    this.videoError.set(null);
    const objectUrl = URL.createObjectURL(file);
    this.videoPreview.set(objectUrl);
    this.productForm.patchValue({ videoUrl: objectUrl, videoLabel: label });
    input.value = '';
  }

  clearSelectedVideo() {
    this.videoPreview.set(null);
    this.videoError.set(null);
    this.productForm.patchValue({ videoUrl: undefined, videoLabel: undefined });
  }

  showItemDropdown = signal<boolean>(false);
  itemSearchQuery = signal<string>('');

  readonly jewelleryItemSuggestions = JEWELLERY_ITEM_SUGGESTIONS;

  readonly filteredItemSuggestions = computed(() => {
    const q = this.itemSearchQuery().toLowerCase().trim();
    if (!q) return this.jewelleryItemSuggestions;
    return this.jewelleryItemSuggestions.filter(item => item.toLowerCase().includes(q));
  });

  onItemNameFocus() {
    this.showItemDropdown.set(this.filteredItemSuggestions().length > 0);
  }

  onItemNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const val = input?.value ?? '';
    this.itemSearchQuery.set(val);
    this.showItemDropdown.set(this.filteredItemSuggestions().length > 0);
  }

  selectItemSuggestion(item: string) {
    this.productForm.patchValue({ name: item });
    this.showItemDropdown.set(false);
    this.itemSearchQuery.set('');
  }

  toggleItemDropdown() {
    this.showItemDropdown.update(v => !v && this.filteredItemSuggestions().length > 0);
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    const nameControl = this.productForm.get('name');
    const name = String(nameControl?.value ?? '').trim();
    nameControl?.setValue(name);
    const val = this.productForm.value;
    const prod = this.editProduct();

    if (prod) {
      this.service.updateProduct(prod.id, val);
    } else {
      this.service.addProduct(val);
    }
    this.dismiss.emit();
  }
}
