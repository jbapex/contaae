import React from 'react';
import { Input } from '@/components/ui/input';

const formatCurrency = (value) => {
  if (isNaN(value)) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const CurrencyInput = React.forwardRef(({ value, onValueChange, className, ...props }, ref) => {
  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/\D/g, '');
    const numericValue = Number(digitsOnly) / 100;
    
    if (onValueChange) {
      onValueChange(numericValue);
    }
  };

  const formattedValue = formatCurrency(value);

  return (
    <Input
      {...props}
      ref={ref}
      value={formattedValue}
      onChange={handleInputChange}
      className={className}
      type="text"
      inputMode="decimal"
    />
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };