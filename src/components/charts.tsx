
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { CardDescription } from './ui/card';

export type ChartData = {
    name: string;
    value: number;
}

const barChartConfig = {
  checkins: {
    label: 'Check-ins',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const pieChartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function CheckinsByStateChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return <div className="flex h-[250px] w-full items-center justify-center"><CardDescription>No hay datos disponibles para la selección actual.</CardDescription></div>;
  }
  return (
    <ChartContainer config={barChartConfig} className="min-h-[250px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 10)}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-checkins)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

export function CheckinsByCityChart({ data }: { data: ChartData[] }) {
    if (!data || data.length === 0) {
      return <div className="flex h-[250px] w-full items-center justify-center"><CardDescription>No hay datos disponibles para la selección actual.</CardDescription></div>;
    }

    const pieChartConfig = data.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: pieChartColors[index % pieChartColors.length],
        };
        return acc;
    }, {} as ChartConfig);

  return (
    <ChartContainer
      config={pieChartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
            ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}

    

    