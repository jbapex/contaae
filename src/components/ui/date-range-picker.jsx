import React from 'react';
import { format, startOfToday, endOfToday, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const presets = [
  { label: 'Hoje', range: { from: startOfToday(), to: endOfToday() } },
  { label: 'Ontem', range: { from: subDays(startOfToday(), 1), to: subDays(endOfToday(), 1) } },
  { label: 'Últimos 7 dias', range: { from: subDays(startOfToday(), 6), to: endOfToday() } },
  { label: 'Últimos 15 dias', range: { from: subDays(startOfToday(), 14), to: endOfToday() } },
  { label: 'Últimos 30 dias', range: { from: subDays(startOfToday(), 29), to: endOfToday() } },
  { label: 'Este Mês', range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
  { label: 'Mês Passado', range: { from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) } },
];

export function DateRangePicker({ className, date, onDateChange }) {
  const [open, setOpen] = React.useState(false);

  const handlePresetClick = (range) => {
    onDateChange(range);
    setOpen(false);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full md:w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yy", { locale: ptBR })
              )
            ) : (
              <span>Escolha um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex" align="start">
          <div className="flex flex-col space-y-2 border-r border-slate-700 p-4">
              <span className="font-semibold text-sm text-white">Atalhos</span>
              <div className="flex flex-col items-start gap-1">
                  {presets.map(({ label, range }) => (
                      <Button
                          key={label}
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={() => handlePresetClick(range)}
                      >
                          {label}
                      </Button>
                  ))}
              </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}