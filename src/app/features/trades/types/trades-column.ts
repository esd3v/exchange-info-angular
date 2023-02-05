export interface TradesColumn {
  id: 'price' | 'amount' | 'total' | 'time';
  numeric: boolean;
  label: string;
}
