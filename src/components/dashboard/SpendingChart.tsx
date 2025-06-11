
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, Sector } from 'recharts';
import type { Transaction } from '@/types';
import { useTheme } from 'next-themes';
import { useMemo, useState, useEffect } from 'react';
import { CardDescription } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AppUser } from '@/types';

interface SpendingChartProps {
  transactions: Transaction[];
}

const COLORS = ['#73B9BC', '#D98E73', '#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#4682b4', '#dda0dd'];


const renderActiveShape = (props: any, currencySymbol: string) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-headline text-sm">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-xs">{`${currencySymbol}${value.toFixed(2)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
        {`( ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


export default function SpendingChart({ transactions }: SpendingChartProps) {
  const { theme } = useTheme();
  const { user: firebaseUser } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  useEffect(() => {
    if (firebaseUser) {
      const fetchUserProfile = async () => {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          if (userData.country && userData.country.currencySymbol) {
            setCurrencySymbol(userData.country.currencySymbol);
          }
        }
      };
      fetchUserProfile();
    }
  }, [firebaseUser]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const monthlySpendingData = useMemo(() => {
    const expensesByMonth: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const month = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        expensesByMonth[month] = (expensesByMonth[month] || 0) + t.amount;
      });
    
    const sortedMonths = Object.keys(expensesByMonth).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    const last6Months = sortedMonths.slice(-6);
    
    return last6Months.map(month => ({
      name: month.split(' ')[0], 
      total: expensesByMonth[month],
    }));
  }, [transactions]);

  const categorySpendingData = useMemo(() => {
    const expensesByCategory: { [key: string]: { name: string, value: number, icon?: string } } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const categoryName = t.category.name;
        expensesByCategory[categoryName] = {
          name: categoryName,
          value: (expensesByCategory[categoryName]?.value || 0) + t.amount,
          icon: t.category.icon
        };
      });
    return Object.values(expensesByCategory).sort((a,b) => b.value - a.value);
  }, [transactions]);

  const tickColor = theme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))';

  if (transactions.filter(t => t.type === 'expense').length === 0) {
    return <CardDescription className="text-center py-8">No expense data to display chart.</CardDescription>;
  }

  return (
    <Tabs defaultValue="bar" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="bar">Monthly Trend</TabsTrigger>
        <TabsTrigger value="pie">Category Breakdown</TabsTrigger>
      </TabsList>
      <TabsContent value="bar">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlySpendingData}>
            <XAxis dataKey="name" stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencySymbol}${value}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? 'hsl(var(--popover))' : 'hsl(var(--popover))',
                borderColor: theme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--popover-foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
              formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, "Total"]}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
      <TabsContent value="pie">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={(props) => renderActiveShape(props, currencySymbol)}
              data={categorySpendingData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="hsl(var(--primary))"
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {categorySpendingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
             <Legend 
              formatter={(value, entry) => <span style={{ color: tickColor }}>{value}</span>}
             />
          </PieChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  );
}
