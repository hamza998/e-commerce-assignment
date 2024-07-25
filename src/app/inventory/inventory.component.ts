// src/app/components/inventory/inventory.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
 public Inventory: Observable<any[]> | undefined;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.Inventory = this.inventoryService.inventory$;
    this.inventoryService.updates$.subscribe(update => {
      if (update) {
        console.log('Inventory update:', update);
      }
    });
  }

  purchaseItem(productId: number) {
    this.inventoryService.purchaseItem(productId).subscribe({
      next: () => console.log('Purchase successful'),
      error: err => console.error('Purchase failed', err)
    });
  }
}
