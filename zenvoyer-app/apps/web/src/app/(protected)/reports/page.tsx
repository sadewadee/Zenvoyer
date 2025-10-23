'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [profitLoss, setProfitLoss] = useState<any>(null);
  const [taxSummary, setTaxSummary] = useState<any>(null);
  const [clientRevenue, setClientRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  }, []);

  const fetchProfitLoss = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/profit-loss?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (response.ok) {
        const data = await response.json();
        setProfitLoss(data);
      }
    } catch (err) {
      console.error('Failed to fetch P&L');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/tax-summary?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (response.ok) {
        const data = await response.json();
        setTaxSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch tax summary');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientRevenue = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/client-revenue?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (response.ok) {
        const data = await response.json();
        setClientRevenue(data);
      }
    } catch (err) {
      console.error('Failed to fetch client revenue');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Reports</h1>
          <p className="text-gray-600 mt-2">
            Detailed financial insights and analytics
          </p>
        </div>
        <Badge className="bg-purple-100 text-purple-800">Pro Feature</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Date Range</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm">From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profit-loss">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="tax">Tax Summary</TabsTrigger>
          <TabsTrigger value="clients">Client Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="profit-loss" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Profit & Loss Report</h2>
            <Button onClick={fetchProfitLoss} disabled={loading}>
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
          </div>

          {profitLoss && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(profitLoss.totalRevenue || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">Total Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(profitLoss.totalCosts || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(profitLoss.netProfit || 0)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Margin: {profitLoss.profitMargin || 0}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tax Summary</h2>
            <Button onClick={fetchTaxSummary} disabled={loading}>
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
          </div>

          {taxSummary && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(taxSummary.totalTaxCollected || 0)}
                </div>
                <p className="text-gray-600">Total Tax Collected</p>
                <p className="text-sm text-gray-500 mt-2">
                  From {taxSummary.invoiceCount || 0} invoices
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Top Clients by Revenue</h2>
            <Button onClick={fetchClientRevenue} disabled={loading}>
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
          </div>

          {clientRevenue.length > 0 && (
            <div className="space-y-2">
              {clientRevenue.slice(0, 10).map((client, index) => (
                <Card key={client.clientId}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{client.clientName}</p>
                        <p className="text-sm text-gray-500">
                          {client.invoiceCount} invoices
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(client.totalRevenue)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
