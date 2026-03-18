import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const CodigoDeBarras = () => {
  const [barcode, setBarcode] = useState('');
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!barcode.trim()) return;
    setLoading(true);
    setProductInfo(null);

    try {
      // This is a placeholder for the actual API call.
      // You would replace this with a call to a real barcode lookup API.
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      if (!response.ok) {
        throw new Error('Produto não encontrado');
      }
      const data = await response.json();
      if (data.status === 0) {
        throw new Error(data.status_verbose || 'Produto não encontrado');
      }
      setProductInfo(data.product);
      toast.success('Produto encontrado!');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao buscar produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">Consulta por Código de Barras</h1>
        <p className="text-sm text-muted-foreground mb-4 md:mb-6">Consulte informações de produtos usando o código de barras.</p>

        <div className="max-w-lg mx-auto bg-card rounded-lg shadow-premium p-4 md:p-6 space-y-4">
          <div>
            <Label htmlFor="barcode" className="text-sm font-medium text-foreground">Código de Barras</Label>
            <Input
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Digite o código de barras"
              className="mt-1.5 h-11 bg-background text-base"
              required
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !barcode.trim()}
            className="w-full h-11 min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {loading ? 'Buscando...' : 'Buscar Produto'}
          </Button>
        </div>

        {productInfo && (
          <div className="mt-8 max-w-lg mx-auto bg-card rounded-lg shadow-premium p-4 md:p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Informações do Produto</h2>
            <p><strong>Nome:</strong> {productInfo.product_name}</p>
            <p><strong>Marca:</strong> {productInfo.brands}</p>
            <p><strong>Categorias:</strong> {productInfo.categories}</p>
            {productInfo.image_url && <img src={productInfo.image_url} alt={productInfo.product_name} className="mt-4 rounded-lg" />}
          </div>
        )}
      </main>
    </div>
  );
};

export default CodigoDeBarras;
