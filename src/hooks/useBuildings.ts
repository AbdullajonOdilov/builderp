import { useState, useEffect } from 'react';
import { Building, BuildingSection, BuildingDocument } from '@/types/building';

const STORAGE_KEY = 'buildings';

export const useBuildings = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setBuildings(JSON.parse(stored));
    }
  }, []);

  const saveBuildings = (newBuildings: Building[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBuildings));
    setBuildings(newBuildings);
  };

  const addBuilding = (building: Omit<Building, 'id' | 'sections' | 'createdAt'>) => {
    const newBuilding: Building = {
      ...building,
      id: crypto.randomUUID(),
      sections: [],
      createdAt: new Date(),
    };
    saveBuildings([...buildings, newBuilding]);
    return newBuilding;
  };

  const updateBuilding = (id: string, updates: Partial<Building>) => {
    const updated = buildings.map(b => 
      b.id === id ? { ...b, ...updates } : b
    );
    saveBuildings(updated);
  };

  const deleteBuilding = (id: string) => {
    saveBuildings(buildings.filter(b => b.id !== id));
  };

  const addSection = (buildingId: string, name: string, options?: { startDate?: Date; expectedEndDate?: Date; sectionPrice?: number }) => {
    const newSection: BuildingSection = {
      id: crypto.randomUUID(),
      buildingId,
      name,
      startDate: options?.startDate,
      expectedEndDate: options?.expectedEndDate,
      sectionPrice: options?.sectionPrice,
      documents: [],
      createdAt: new Date(),
    };
    const updated = buildings.map(b => 
      b.id === buildingId 
        ? { ...b, sections: [...b.sections, newSection] }
        : b
    );
    saveBuildings(updated);
    return newSection;
  };

  const updateSection = (buildingId: string, sectionId: string, updates: Partial<BuildingSection>) => {
    const updated = buildings.map(b => 
      b.id === buildingId 
        ? { 
            ...b, 
            sections: b.sections.map(s => 
              s.id === sectionId ? { ...s, ...updates } : s
            )
          }
        : b
    );
    saveBuildings(updated);
  };

  const deleteSection = (buildingId: string, sectionId: string) => {
    const updated = buildings.map(b => 
      b.id === buildingId 
        ? { ...b, sections: b.sections.filter(s => s.id !== sectionId) }
        : b
    );
    saveBuildings(updated);
  };

  const addDocumentToBuilding = (buildingId: string, doc: BuildingDocument) => {
    const updated = buildings.map(b => 
      b.id === buildingId 
        ? { ...b, documents: [...b.documents, doc] }
        : b
    );
    saveBuildings(updated);
  };

  const addDocumentToSection = (buildingId: string, sectionId: string, doc: BuildingDocument) => {
    const updated = buildings.map(b => 
      b.id === buildingId 
        ? { 
            ...b, 
            sections: b.sections.map(s => 
              s.id === sectionId ? { ...s, documents: [...s.documents, doc] } : s
            )
          }
        : b
    );
    saveBuildings(updated);
  };

  const getBuilding = (id: string) => buildings.find(b => b.id === id);
  
  const getSection = (buildingId: string, sectionId: string) => {
    const building = getBuilding(buildingId);
    return building?.sections.find(s => s.id === sectionId);
  };

  return {
    buildings,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    addSection,
    updateSection,
    deleteSection,
    addDocumentToBuilding,
    addDocumentToSection,
    getBuilding,
    getSection,
  };
};
