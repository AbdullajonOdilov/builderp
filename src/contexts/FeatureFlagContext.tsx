import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
  category: string;
}

interface FeatureFlagContextType {
  flags: Record<string, boolean>;
  allFlags: FeatureFlag[];
  isLoading: boolean;
  isEnabled: (key: string) => boolean;
  toggleFlag: (key: string, enabled: boolean) => Promise<void>;
  addFlag: (flag: Omit<FeatureFlag, 'id'>) => Promise<void>;
  deleteFlag: (key: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [allFlags, setAllFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('category', { ascending: true })
      .order('label', { ascending: true });

    if (!error && data) {
      setAllFlags(data as FeatureFlag[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchFlags();

    const channel = supabase
      .channel('feature-flags-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_flags' }, () => {
        fetchFlags();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchFlags]);

  const flags = allFlags.reduce<Record<string, boolean>>((acc, f) => {
    acc[f.key] = f.enabled;
    return acc;
  }, {});

  const isEnabled = useCallback((key: string) => flags[key] ?? true, [flags]);

  const toggleFlag = useCallback(async (key: string, enabled: boolean) => {
    await supabase.from('feature_flags').update({ enabled }).eq('key', key);
  }, []);

  const addFlag = useCallback(async (flag: Omit<FeatureFlag, 'id'>) => {
    await supabase.from('feature_flags').insert(flag as any);
  }, []);

  const deleteFlag = useCallback(async (key: string) => {
    await supabase.from('feature_flags').delete().eq('key', key);
  }, []);

  return (
    <FeatureFlagContext.Provider value={{ flags, allFlags, isLoading, isEnabled, toggleFlag, addFlag, deleteFlag, refetch: fetchFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagContext);
  if (!ctx) throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  return ctx;
}
