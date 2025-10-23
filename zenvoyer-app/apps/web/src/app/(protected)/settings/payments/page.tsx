'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const GATEWAYS = [
  { id: 'midtrans', name: 'Midtrans', description: 'Indonesia payment gateway', fields: ['serverKey', 'clientKey'] },
  { id: 'xendit', name: 'Xendit', description: 'Southeast Asia payments', fields: ['apiKey', 'webhookToken'] },
  { id: 'stripe', name: 'Stripe', description: 'Global payment processor', fields: ['secretKey', 'publishableKey'] },
  { id: 'paypal', name: 'PayPal', description: 'Worldwide payments', fields: ['clientId', 'clientSecret'] },
];

export default function PaymentSettingsPage() {
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<any>({});
  const [configuredGateways, setConfiguredGateways] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchConfiguredGateways();
  }, []);

  const fetchConfiguredGateways = async () => {
    try {
      const response = await fetch('/api/payments/gateway/list');
      if (response.ok) {
        const data = await response.json();
        setConfiguredGateways(data.map((g: any) => g.gateway));
      }
    } catch (err) {
      console.error('Failed to fetch gateways');
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/payments/gateway/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gateway: selectedGateway,
          credentials,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save gateway');
      }

      setSuccess(`${selectedGateway} configured successfully!`);
      fetchConfiguredGateways();
      setSelectedGateway(null);
      setCredentials({});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const gateway = GATEWAYS.find(g => g.id === selectedGateway);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Gateways</h1>
        <p className="text-gray-600 mt-2">
          Configure payment gateways to accept online payments (Pro feature)
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {GATEWAYS.map((gw) => {
          const isConfigured = configuredGateways.includes(gw.id);
          
          return (
            <Card
              key={gw.id}
              className={`cursor-pointer hover:border-blue-500 transition-colors ${
                selectedGateway === gw.id ? 'border-blue-500 ring-2 ring-blue-200' : ''
              }`}
              onClick={() => setSelectedGateway(gw.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      {gw.name}
                    </CardTitle>
                    <CardDescription className="mt-1">{gw.description}</CardDescription>
                  </div>
                  {isConfigured && (
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {gateway && (
        <Card>
          <CardHeader>
            <CardTitle>Configure {gateway.name}</CardTitle>
            <CardDescription>
              Enter your {gateway.name} API credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gateway.fields.map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                </Label>
                <Input
                  id={field}
                  type="password"
                  placeholder={`Enter ${field}`}
                  value={credentials[field] || ''}
                  onChange={(e) => setCredentials({ ...credentials, [field]: e.target.value })}
                />
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Configuration'}
              </Button>
              <Button variant="outline" onClick={() => {
                setSelectedGateway(null);
                setCredentials({});
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
