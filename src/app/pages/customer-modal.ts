import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JewelleryService } from '../services/jewellery.service';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-amber-500/20 native-sheet">
        <!-- Modal Header -->
        <div class="bg-neutral-900 text-white px-5 pt-2.5 pb-4 sm:p-5 border-b border-amber-500/20">
          <div class="w-10 h-1 bg-neutral-700 rounded-full mx-auto mb-3 sm:hidden"></div>
          <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
              <span class="material-icons">person_add</span>
            </div>
            <div>
              <h3 class="font-bold text-lg text-white">Register New Customer</h3>
              <p class="text-xs text-neutral-400">Save client details for loyalty rewards & invoices</p>
            </div>
          </div>
          <button (click)="dismiss.emit()" class="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition cursor-pointer" type="button">
            <span class="material-icons text-sm">close</span>
          </button>
          </div>
        </div>

        <!-- Form Body -->
        <form [formGroup]="customerForm" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Customer Full Name *
              <input type="text" formControlName="name" placeholder="e.g. Priya Sharma" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>

          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Phone Number *
              <input type="text" formControlName="phone" placeholder="+91 98765 43210" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>

          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Email Address
              <input type="email" formControlName="email" placeholder="priya@gmail.com" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 font-normal">
            </label>
          </div>

          <div>
            <label class="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Residential Address *
              <textarea formControlName="address" rows="3" placeholder="Door No, Street, City, Pincode" 
                class="w-full mt-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm text-neutral-900 resize-none font-normal"></textarea>
            </label>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200 mt-6">
            <button type="button" (click)="dismiss.emit()" class="px-5 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" [disabled]="customerForm.invalid" class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer">
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CustomerModal {
  readonly service = inject(JewelleryService);
  readonly fb = inject(FormBuilder);
  readonly dismiss = output<void>();

  customerForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    address: ['', Validators.required]
  });

  onSubmit() {
    if (this.customerForm.invalid) return;
    const val = this.customerForm.value;
    this.service.addCustomer({
      name: val.name || '',
      phone: val.phone || '',
      email: val.email || '',
      address: val.address || ''
    });
    this.dismiss.emit();
  }
}
