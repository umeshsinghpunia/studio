
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, Sector, LineChart, Line, AreaChart, Area, CartesianGrid } from 'recharts';
import type { Transaction } from '@/types';
import { useTheme } from 'next-themes';
import { useMemo, useState, useEffect } from 'react';
import { CardDescription } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AppUser } from '@/types';
import { appConfig } from '@/config/app';
import { getCountryByCode } from '@/lib/countries';

interface SpendingChartProps {
  transactions: Transaction[];
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', '#ff7f50', '#4682b4', '#dda0dd'];


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
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


export default function SpendingChart({ transactions }: SpendingChartProps) {
  const { theme } = useTheme();
  const { user: firebaseUser } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState(appConfig.defaultCurrencySymbol);
  const [trendChartType, setTrendChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [categoryChartType, setCategoryChartType] = useState<'pie' | 'donut'>('pie');

  useEffect(() => {
    if (firebaseUser) {
      const fetchUserProfile = async () => {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          if (userData.country) {
            if (userData.country.currencySymbol) {
              setCurrencySymbol(userData.country.currencySymbol);
            } else if (userData.country.code) {
              const countryFromList = getCountryByCode(userData.country.code);
              if (countryFromList && countryFromList.currencySymbol) {
                setCurrencySymbol(countryFromList.currencySymbol);
              } else {
                setCurrencySymbol(appConfig.defaultCurrencySymbol);
              }
            } else {
              setCurrencySymbol(appConfig.defaultCurrencySymbol);
            }
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
    
    const last12Months = sortedMonths.slice(-12); // Show up to 12 months for better trend visibility
    
    return last12Months.map(month => ({
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

  const commonChartProps = {
    width: "100%",
    height: 350,
  };

  const commonCartesianProps = {
    data: monthlySpendingData,
    margin: { top: 5, right: 20, left: -20, bottom: 5 }, // Adjusted left margin for YAxis
  };
  
  const commonTooltipProps = {
    contentStyle: {
      backgroundColor: popoverBgColor,
      borderColor: popoverBorderColor,
      borderRadius: 'var(--radius)',
      color: popoverTextColor
    },
    labelStyle: { color: popoverTextColor },
    itemStyle: { color: popoverTextColor },
    cursor: { fill: 'hsl(var(--accent))', fillOpacity: 0.1 },
    formatter: (value: number) => [`${currencySymbol}${value.toFixed(2)}`, "Total"],
  };


  return (
    <Tabs defaultValue="bar" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="bar">Monthly Trend</TabsTrigger>
        <TabsTrigger value="pie">Category Breakdown</TabsTrigger>
      </TabsList>
      <TabsContent value="bar">
        <div className="mb-4 w-full sm:w-1/3">
            <Select value={trendChartType} onValueChange={(value) => setTrendChartType(value as 'bar' | 'line' | 'area')}>
                <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <ResponsiveContainer {...commonChartProps}>
          {trendChartType === 'bar' && (
            <BarChart {...commonCartesianProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={popoverBorderColor} />
              <XAxis dataKey="name" stroke={tickColor} fontSize={12} tickLine={false} axisLine={{stroke: popoverBorderColor}} />
              <YAxis stroke={tickColor} fontSize={12} tickLine={false} axisLine={{stroke: popoverBorderColor}} tickFormatter={(value) => `${currencySymbol}${value}`} />
              <Tooltip {...commonTooltipProps} />
              <Legend wrapperStyle={{ fontSize: '12px', color: tickColor }} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
          {trendChartType === 'line' && (
            <LineChart {...commonCartesianProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={popoverBorderColor} />
              <XAxis dataKey="name" stroke={tickColor} fontSize={12} tickLine={false} axisLine={{stroke: popoverBorderColor}} />
              <YAxis stroke={tickColor} fontSize={12} tickLine={false} axisLine={{stroke: popoverBorderColor}} tickFormatter={(value) => `${currencySymbol}${value}`} />
              <Tooltip {...commonTooltipProps} />
              <Legend wrapperStyle={{ fontSize: '12px', color: tickColor }}/>
              <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6, fill: 'hsl(var(--primary))' }} />
            </LineChart>
          )}
          {trendChartType === 'area' && (
            <AreaChart {...commonCartesianProps}>
              <CartesianGrid strokeDasharray="3 3" stroke={popoverBorderColor} />
              <XAxis dataKey="name" stroke={tickColor} fontSize={12} tickLine={false} axisLine={{stroke: popoverBorderColor}} />
              <YAxis stroke={tickColor} fontSize={12} tickLine={false} axisLine={{stroke: popoverBorderColor}} tickFormatter={(value) => `${currencySymbol}${value}`} />
              <Tooltip {...commonTooltipProps} />
              <Legend wrapperStyle={{ fontSize: '12px', color: tickColor }}/>
              <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </TabsContent>
      <TabsContent value="pie">
         <div className="mb-4 w-full sm:w-1/3">
            <Select value={categoryChartType} onValueChange={(value) => setCategoryChartType(value as 'pie' | 'donut')}>
                <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="donut">Donut Chart</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {categorySpendingData.length > 0 ? (
          <ResponsiveContainer {...commonChartProps}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={(props) => renderActiveShape(props, currencySymbol)}
                data={categorySpendingData}
                cx="50%"
                cy="50%"
                innerRadius={categoryChartType === 'donut' ? 70 : 50} // Adjust innerRadius for Donut
                outerRadius={100}
                fill="hsl(var(--primary))" 
                dataKey="value"
                onMouseEnter={onPieEnter}
                paddingAngle={categorySpendingData.length > 1 ? 2 : 0}
              >
                {categorySpendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={popoverBorderColor} />
                ))}
              </Pie>
               <Legend 
                iconSize={10}
                wrapperStyle={{ fontSize: '12px', color: tickColor, paddingTop: '20px' }} // Added padding top
                formatter={(value, entry) => <span style={{ color: tickColor }}>{value}</span>}
               />
               <Tooltip
                {...commonTooltipProps}
                formatter={(value: number, name: string) => {
                    const percent = totalCategorySpending > 0 
                                    ? ((value / totalCategorySpending) * 100).toFixed(2) 
                                    : "0.00";
                    return [`${currencySymbol}${value.toFixed(2)} (${percent}%)`, name];
                }}
               />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <CardDescription className="text-center py-8">No category spending data available.</CardDescription>
        )}
      </TabsContent>
    </Tabs>
  );
}

