type BynProps = {
  amount: number;
  fraction?: 0 | 2;
  className?: string;
};

export function Byn({ amount, fraction = 2, className }: BynProps) {
  const formatted = amount.toLocaleString('be-BY', {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  });
  return (
    <span className={className} data-testid="price-byn">
      {formatted}
      <span className="byn-symbol" aria-label="белорусских рублей"> Br</span>
    </span>
  );
}

export function formatByn(amount: number, fraction: 0 | 2 = 2): string {
  return `${amount.toLocaleString('be-BY', {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  })} Br`;
}
