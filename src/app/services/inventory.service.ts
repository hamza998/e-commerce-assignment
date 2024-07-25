// src/app/services/inventory.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface InventoryState {
  productId: number;
  quantity: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private inventorySubject = new BehaviorSubject<InventoryState[]>([]);
  private updateSubject = new BehaviorSubject<InventoryState | null>(null);
  private apiUrl = 'https://api.someExampleUrlNeedstobeReplaced.com/inventory';

  constructor(private http: HttpClient) {
    this.inventorySubject.next([
      { productId: 1, quantity: 5, name: 'Shoes' },
      { productId: 2, quantity: 2, name: 'Hats' },
    ]);
  }

  get inventory$(): Observable<InventoryState[]> {
    return this.inventorySubject.asObservable();
  }

  get updates$(): Observable<InventoryState | null> {
    return this.updateSubject.asObservable();
  }

  updateInventory(productId: number, quantity: number) {
    const updatedInventory = this.inventorySubject.value.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    this.inventorySubject.next(updatedInventory);
    const updatedItem = updatedInventory.find(
      (item) => item.productId === productId
    );
    if (updatedItem) {
      this.updateSubject.next(updatedItem);
    }
  }

  purchaseItem(productId: number): Observable<any> {
    const currentInventory = this.inventorySubject.value.find(
      (item) => item.productId === productId
    );
    if (!currentInventory || currentInventory.quantity <= 0) {
      return throwError('Item out of stock');
    }
    this.updateInventory(productId, currentInventory.quantity - 1);

    return this.http.post(`${this.apiUrl}/purchase`, { productId }).pipe(
      tap(() => {
      }),
      catchError((error) => {
        this.updateInventory(productId, currentInventory.quantity);
        return throwError(error);
      })
    );
  }
}
