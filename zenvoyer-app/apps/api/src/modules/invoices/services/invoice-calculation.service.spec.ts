import { InvoiceCalculationService } from './invoice-calculation.service';

describe('InvoiceCalculationService', () => {
  let service: InvoiceCalculationService;

  beforeEach(() => {
    service = new InvoiceCalculationService();
  });

  it('calculates totals with tax and discount', () => {
    const items = [
      { quantity: 2, unitPrice: 50 },
      { quantity: 1, unitPrice: 100 },
    ];
    const { subtotal, taxAmount, discountAmount, total } = service.calculateTotals(items, 10, 5);

    expect(subtotal).toBe(200);
    expect(taxAmount).toBe(20);
    expect(discountAmount).toBe(10);
    expect(total).toBe(210);
  });

  it('returns zero totals when no items', () => {
    const { subtotal, taxAmount, discountAmount, total } = service.calculateTotals([], 10, 5);
    expect(subtotal).toBe(0);
    expect(taxAmount).toBe(0);
    expect(discountAmount).toBe(0);
    expect(total).toBe(0);
  });

  it('calculates profit margin and percentage', () => {
    const { profitMargin, profitMarginPercentage } = service.calculateProfitMargin(200, 150);
    expect(profitMargin).toBe(50);
    expect(profitMarginPercentage).toBeCloseTo(33.33, 2);
  });

  it('calculates remaining amount', () => {
    expect(service.calculateRemainingAmount(200, 50)).toBe(150);
    expect(service.calculateRemainingAmount(200, 250)).toBe(0);
  });

  it('determines invoice status', () => {
    const today = new Date();
    const past = new Date(today.getTime() - 24 * 3600 * 1000);
    const future = new Date(today.getTime() + 24 * 3600 * 1000);

    expect(service.determineInvoiceStatus(200, 200, future)).toBe('paid');
    expect(service.determineInvoiceStatus(200, 100, future)).toBe('partial');
    expect(service.determineInvoiceStatus(200, 0, past)).toBe('overdue');
    expect(service.determineInvoiceStatus(200, 0, future)).toBe('sent');
  });

  it('validates items', () => {
    const valid = service.validateItems([
      { description: 'Item 1', quantity: 1, unitPrice: 10 },
      { description: 'Item 2', quantity: 2, unitPrice: 5 },
    ]);
    const invalid = service.validateItems([
      { description: '', quantity: 0, unitPrice: -1 },
    ]);

    expect(valid).toBe(true);
    expect(invalid).toBe(false);
  });
});