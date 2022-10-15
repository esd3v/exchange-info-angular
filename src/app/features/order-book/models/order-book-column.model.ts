export interface OrderBookColumn {
  id: 'price' | 'amount' | 'total';
  numeric: boolean;
  label: string;
}
