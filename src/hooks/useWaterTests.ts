/**
 * Hook para gerenciamento de testes de água
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { WaterTest, Aquarium, TankType } from '../types';
import { analyzeParameter, getOverallHealth } from '../utils/helpers';

interface UseWaterTestsOptions {
  aquariumId?: string;
  limit?: number;
}

interface UseWaterTestsReturn {
  tests: WaterTest[];
  loading: boolean;
  error: string | null;
  addTest: (test: Partial<WaterTest>) => Promise<{ success: boolean; error?: string }>;
  deleteTest: (id: string) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
  latestTest: WaterTest | null;
  getAnalysis: (test: WaterTest, tankType: TankType) => ReturnType<typeof getOverallHealth>;
}

export function useWaterTests(
  userId: string | undefined,
  options: UseWaterTestsOptions = {}
): UseWaterTestsReturn {
  const { aquariumId, limit = 50 } = options;
  
  const [tests, setTests] = useState<WaterTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('water_tests')
        .select('*')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
        .limit(limit);
      
      if (aquariumId) {
        query = query.eq('aquarium_id', aquariumId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setTests(data || []);
    } catch (err: any) {
      console.error('Error fetching water tests:', err);
      setError(err.message || 'Erro ao carregar testes');
    } finally {
      setLoading(false);
    }
  }, [userId, aquariumId, limit]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const addTest = async (
    testData: Partial<WaterTest>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    try {
      const payload = {
        ...testData,
        user_id: userId,
        measured_at: testData.measured_at || new Date().toISOString(),
      };
      
      const { error: insertError } = await supabase
        .from('water_tests')
        .insert([payload]);
      
      if (insertError) throw insertError;
      
      await fetchTests();
      return { success: true };
    } catch (err: any) {
      console.error('Error adding water test:', err);
      return { success: false, error: err.message || 'Erro ao salvar teste' };
    }
  };

  const deleteTest = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: deleteError } = await supabase
        .from('water_tests')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      setTests(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting water test:', err);
      return { success: false, error: err.message || 'Erro ao excluir teste' };
    }
  };

  const getAnalysis = (test: WaterTest, tankType: TankType) => {
    const params: Record<string, number> = {};
    
    if (test.temperature !== undefined) params.temperature = test.temperature;
    if (test.ph !== undefined) params.ph = test.ph;
    if (test.ammonia !== undefined) params.ammonia = test.ammonia;
    if (test.nitrite !== undefined) params.nitrite = test.nitrite;
    if (test.nitrate !== undefined) params.nitrate = test.nitrate;
    if (test.alkalinity !== undefined) params.alkalinity = test.alkalinity;
    if (test.calcium !== undefined) params.calcium = test.calcium;
    if (test.magnesium !== undefined) params.magnesium = test.magnesium;
    
    return getOverallHealth(params, tankType);
  };

  return {
    tests,
    loading,
    error,
    addTest,
    deleteTest,
    refresh: fetchTests,
    latestTest: tests[0] || null,
    getAnalysis,
  };
}

/**
 * Hook para estatísticas de testes de água
 */
export function useWaterTestStats(tests: WaterTest[]) {
  const getAverages = useCallback(() => {
    if (tests.length === 0) return null;
    
    const sums: Record<string, { total: number; count: number }> = {};
    
    const params = [
      'temperature', 'ph', 'ammonia', 'nitrite', 'nitrate',
      'alkalinity', 'calcium', 'magnesium', 'salinity', 'phosphate'
    ];
    
    params.forEach(param => {
      sums[param] = { total: 0, count: 0 };
    });
    
    tests.forEach(test => {
      params.forEach(param => {
        const value = (test as any)[param];
        if (value !== undefined && value !== null) {
          sums[param].total += value;
          sums[param].count += 1;
        }
      });
    });
    
    const averages: Record<string, number | null> = {};
    
    params.forEach(param => {
      if (sums[param].count > 0) {
        averages[param] = sums[param].total / sums[param].count;
      } else {
        averages[param] = null;
      }
    });
    
    return averages;
  }, [tests]);

  const getTrend = useCallback((param: string, days: number = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const recentTests = tests.filter(
      t => new Date(t.measured_at) >= cutoff
    );
    
    if (recentTests.length < 2) return 'stable';
    
    const values = recentTests
      .map(t => (t as any)[param])
      .filter(v => v !== undefined && v !== null)
      .reverse(); // oldest first
    
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const diff = avgSecond - avgFirst;
    const threshold = avgFirst * 0.05; // 5% change
    
    if (diff > threshold) return 'rising';
    if (diff < -threshold) return 'falling';
    return 'stable';
  }, [tests]);

  return {
    averages: getAverages(),
    getTrend,
    totalTests: tests.length,
  };
}
