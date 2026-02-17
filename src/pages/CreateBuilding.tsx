import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { DocumentUpload } from '@/components/buildings/DocumentUpload';
import { DocumentCard } from '@/components/buildings/DocumentCard';
import { useBuildings } from '@/hooks/useBuildings';
import { BuildingDocument, BUILDING_COLORS } from '@/types/building';
import { toast } from 'sonner';

const CreateBuilding = () => {
  const navigate = useNavigate();
  const { addBuilding } = useBuildings();
  
  const [objectName, setObjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(BUILDING_COLORS[0].value);
  const [contractNumber, setContractNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [usedMoney, setUsedMoney] = useState('');
  const [documents, setDocuments] = useState<BuildingDocument[]>([]);

  const leftMoney = (parseFloat(totalPrice) || 0) - (parseFloat(usedMoney) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!objectName.trim()) {
      toast.error('Please enter an object name');
      return;
    }

    addBuilding({
      objectName: objectName.trim(),
      color: selectedColor,
      contractNumber: contractNumber.trim() || undefined,
      startDate: startDate ? new Date(startDate) : new Date(),
      expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : new Date(),
      totalPrice: parseFloat(totalPrice) || 0,
      usedMoney: parseFloat(usedMoney) || 0,
      pendingMoney: 0,
      documents,
    });

    toast.success('Building created successfully');
    navigate('/buildings');
  };

  const handleDocumentUpload = (doc: BuildingDocument) => {
    setDocuments(prev => [...prev, doc]);
  };

  const handleDocumentDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/buildings')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">New Building</h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-6">
            {/* Object Name */}
            <div className="space-y-2">
              <Label htmlFor="objectName">Object Name *</Label>
              <Input
                id="objectName"
                placeholder="e.g., Office Tower A"
                value={objectName}
                onChange={(e) => setObjectName(e.target.value)}
                required
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Building Color</Label>
              <div className="flex flex-wrap gap-2 items-center">
                {BUILDING_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      selectedColor === c.value ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setSelectedColor(c.value)}
                    title={c.name}
                  />
                ))}
                <label
                  className={`w-9 h-9 rounded-full border-2 border-dashed border-muted-foreground cursor-pointer flex items-center justify-center transition-all hover:scale-105 overflow-hidden ${
                    !BUILDING_COLORS.some(c => c.value === selectedColor) ? 'border-foreground scale-110 shadow-md' : ''
                  }`}
                  title="Custom color"
                  style={!BUILDING_COLORS.some(c => c.value === selectedColor) ? { backgroundColor: selectedColor } : undefined}
                >
                  <span className={`text-xs text-muted-foreground ${!BUILDING_COLORS.some(c => c.value === selectedColor) ? 'hidden' : ''}`}>+</span>
                  <input
                    type="color"
                    className="sr-only"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  />
                </label>
              </div>
            </div>

            {/* Contract Number */}
            <div className="space-y-2">
              <Label htmlFor="contractNumber">Contract Number</Label>
              <Input
                id="contractNumber"
                placeholder="e.g., CT-2024-001"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedEndDate">Expected End Date</Label>
                <Input
                  id="expectedEndDate"
                  type="date"
                  value={expectedEndDate}
                  onChange={(e) => setExpectedEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Money */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalPrice">Total Price ($)</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usedMoney">Used Money ($)</Label>
                <Input
                  id="usedMoney"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={usedMoney}
                  onChange={(e) => setUsedMoney(e.target.value)}
                />
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Left Money</span>
                  <span className={`text-lg font-bold ${leftMoney >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    ${leftMoney.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-3">
              <Label>Documents</Label>
              <DocumentUpload onUpload={handleDocumentUpload} />
              {documents.length > 0 && (
                <div className="space-y-2 mt-3">
                  {documents.map(doc => (
                    <DocumentCard 
                      key={doc.id} 
                      document={doc} 
                      onDelete={() => handleDocumentDelete(doc.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full mt-6">
            Create Building
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateBuilding;
