
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, Sector, LineChart, Line, AreaChart, Area, CartesianGrid } from 'recharts';
import type { Transaction } from '@/types';
import { useTheme } from 'next-themes';
import { useMemo, useState, useEffect } from 'react';
import { CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AppUser } from '@/types';
import { appConfig } from '@/config/app';
import { getCountryByCode } from '@/lib/countries';
import { formatCurrency } from '@/lib/utils';

interface SpendingChartProps {
  transactions: Transaction[];
  chartType: 'bar' | 'pie'; // To select which chart section to render primarily
}

const PIE_CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(20, 80%, 60%)', 'hsl(160, 70%, 50%)'];


const renderActiveShape = (props: any, currencySymbol: string) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 6) * cos;
  const sy = cy + (outerRadius + 6) * sin;
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 18;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-headline text-xs">
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
        cornerRadius={5}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 8}
        fill={fill}
        cornerRadius={3}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 10} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-2xs">{`${currencySymbol}${value.toFixed(2)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 10} y={ey} dy={14} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-2xs">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};


export default function SpendingChart({ transactions, chartType }: SpendingChartProps) {
  const { theme } = useTheme();
  const { user: firebaseUser } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState(appConfig.defaultCurrencySymbol);
  const [trendChartType, setTrendChartType] = useState<'bar' | 'line' | 'area'>('bar');
  // const [categoryChartType, setCategoryChartType] = useState<'pie' | 'donut'>('pie'); // Dribbble shows pie/donut, not selector

  useEffect(() => {
    if (firebaseUser) {
      const fetchUserProfile = async () => {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          if (userData.country) {
            const countryDetails = getCountryByCode(userData.country.code);
            setCurrencySymbol(countryDetails?.currencySymbol || appConfig.defaultCurrencySymbol);
          } else {
            setCurrencySymbol(appConfig.defaultCurrencySymbol);
          }
        } else {
          setCurrencySymbol(appConfig.defaultCurrencySymbol);
        }
      };
      fetchUserProfile();
    } else {
      setCurrencySymbol(appConfig.defaultCurrencySymbol);
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
    
    const sortedMonths = Object.keys(expensesByMonth).sort((a,b) => {
        const dateA = new Date(a.replace(/(\w{3})\s(\d{4})/, '$1 1, $2')); 
        const dateB = new Date(b.replace(/(\w{3})\s(\d{4})/, '$1 1, $2'));
        return dateA.getTime() - dateB.getTime();
    });
    
    const last12Months = sortedMonths.slice(-12);
    
    return last12Months.map(month => ({
      name: month.split(' ')[0], 
      total: expensesByMonth[month],
    }));
  }, [transactions]);

  const categorySpendingData = useMemo(() => {
    const expensesByCategory: { [key: string]: { name: string, value: number, icon?: string, fill: string } } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach((t, index) => {
        const categoryName = t.category.name;
        expensesByCategory[categoryName] = {
          name: categoryName,
          value: (expensesByCategory[categoryName]?.value || 0) + t.amount,
          icon: t.category.icon,
          fill: PIE_CHART_COLORS[Object.keys(expensesByCategory).length % PIE_CHART_COLORS.length] // Assign color here
        };
      });
    return Object.values(expensesByCategory).sort((a,b) => b.value - a.value).slice(0, 6); // Show top 6 categories for clarity
  }, [transactions]);

  const totalCategorySpending = useMemo(() => {
    return categorySpendingData.reduce((sum, item) => sum + item.value, 0);
  }, [categorySpendingData]);

  const tickColor = theme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))';
  const popoverBgColor = theme === 'dark' ? 'hsl(var(--popover))' : 'hsl(var(--popover))';
  const popoverBorderColor = theme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))';
  const popoverTextColor = 'hsl(var(--popover-foreground))';

  if (transactions.filter(t => t.type === 'expense').length === 0) {
    return <CardDescription className="text-center py-8">No expense data to display chart.</CardDescription>;
  }

  const barChartContainerProps = {
    width: "100%",
    height: 280, // Adjusted height for Dribbble design
  };
  
  const pieChartContainerProps = {
      width: "100%",
      height: 200, // Adjusted for Dribbble design with list
  };

  const commonCartesianProps = {
    data: monthlySpendingData,
    margin: { top: 5, right: 5, left: -25, bottom: 0 }, // Adjusted margins
  };
  
  const commonTooltipProps = {
    contentStyle: {
      backgroundColor: popoverBgColor,
      borderColor: popoverBorderColor,
      borderRadius: 'var(--radius)',
      color: popoverTextColor,
      padding: '8px 12px',
      fontSize: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    labelStyle: { color: popoverTextColor, marginBottom: '4px', fontWeight: '500' },
    itemStyle: { color: popoverTextColor },
    cursor: { fill: 'hsl(var(--primary))', fillOpacity: 0.1 },
    formatter: (value: number) => [`${currencySymbol}${value.toFixed(2)}`, "Total"],
  };

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer {...barChartContainerProps}>
        <BarChart {...commonCartesianProps} barGap={8} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke={popoverBorderColor} vertical={false} />
          <XAxis dataKey="name" stroke={tickColor} fontSize={10} tickLine={false} axisLine={{stroke: popoverBorderColor, strokeWidth: 0.5}} dy={5}/>
          <YAxis stroke={tickColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencySymbol}${value/1000}k`} />
          <Tooltip {...commonTooltipProps} />
          {/* <Legend wrapperStyle={{ fontSize: '12px', color: tickColor }} /> */}
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'pie') {
     if (categorySpendingData.length === 0) {
        return <CardDescription className="text-center py-8">No category spending data available.</CardDescription>;
     }
    return (
      <div className="flex flex-col md:flex-row items-center gap-0 md:gap-4">
        <ResponsiveContainer {...pieChartContainerProps} className="flex-shrink-0 md:w-1/2">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={(props) => renderActiveShape(props, currencySymbol)}
                data={categorySpendingData}
                cx="50%"
                cy="50%"
                innerRadius={50} // For Donut
                outerRadius={75}
                fill="hsl(var(--primary))" 
                dataKey="value"
                onMouseEnter={onPieEnter}
                paddingAngle={2}
                cornerRadius={5}
              >
                {categorySpendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke={'hsl(var(--card))'} strokeWidth={2}/>
                ))}
              </Pie>
               <Tooltip
                {...commonTooltipProps}
                formatter={(value: number, name: string) => {
                    const percent = totalCategorySpending > 0 
                                    ? ((value / totalCategorySpending) * 100).toFixed(1) 
                                    : "0.0";
                    return [`${currencySymbol}${value.toFixed(2)} (${percent}%)`, name];
                }}
               />
            </PieChart>
          </ResponsiveContainer>
           <div className="w-full md:w-1/2 space-y-1.5 text-xs mt-2 md:mt-0">
            {categorySpendingData.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <span className="font-medium text-foreground">{formatCurrency(entry.value, currencySymbol)}</span>
              </div>
            ))}
          </div>
        </div>
    );
  }
  
  return null; // Should not reach here
}
