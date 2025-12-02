/**
 * Formulário para adicionar teste de água
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Thermometer, FlaskConical, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Aquarium, TankType, WaterTest, PARAMETER_RANGES } from '../types';
import { analyzeParameter, cn } from '../utils/helpers';

interface WaterTestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (test: Partial<WaterTest>) => Promise<{ success: boolean; error?: string }>;
  aquariums: Aquarium[];
  selectedAquariumId?: string;
}

interface FormField {
  key: keyof WaterTest;
  label: string;
  unit: string;
  step: number;
  icon: React.ReactNode;
  tankTypes: TankType[];
  isAdvanced?: boolean;
}

const FORM_FIELDS: FormField[] = [
  { 
    key: 'temperature', 
    label: 'Temperatura', 
    unit: '°C', 
    step: 0.1,
    icon: <Thermometer size={16} />,
    tankTypes: ['Doce', 'Plantado', 'Marinho', 'Reef', 'Jumbo'],
  },
  { 
    key: 'ph', 
    label: 'pH', 
    unit: '', 
    step: 0.1,
    icon: <Droplets size={16} />,
    tankTypes: ['Doce', 'Plantado', 'Marinho', 'Reef', 'Jumbo'],
  },
  { 
    key: 'ammonia', 
    label: 'Amônia (NH3)', 
    unit: 'ppm', 
    step: 0.01,
    icon: <FlaskConical size={16} />,
    tankTypes: ['Doce', 'Plantado', 'Marinho', 'Reef', 'Jumbo'],
  },
  { 
    key: 'nitrite', 
    label: 'Nitrito (NO2)', 
    unit: 'ppm', 
    step: 0.01,
    icon: <FlaskConical size={16} />,
    tankTypes: ['Doce', 'Plantado', 'Marinho', 'Reef', 'Jumbo'],
  },
  { 
    key: 'nitrate', 
    label: 'Nitrato (NO3)', 
    unit: 'ppm', 
    step: 1,
    icon: <FlaskConical size={16} />,
    tankTypes: ['Doce', 'Plantado', 'Marinho', 'Reef', 'Jumbo'],
  },
  // Avançados
  { 
    key: 'salinity', 
    label: 'Salinidade', 
    unit: 'sg', 
    step: 0.001,
    icon: <Droplets size={16} />,
    tankTypes: ['Marinho', 'Reef'],
    isAdvanced: true,
  },
  { 
    key: 'alkalinity', 
    label: 'Alcalinidade', 
    unit: 'dKH', 
    step: 0.1,
    icon: <FlaskConical size={16} />,
    tankTypes: ['Reef'],
    isAdvanced: true,
  },
  { 
    key: 'calcium', 
    label: 'Cálcio', 
    unit: 'ppm', 
    step: 5,
    icon: <FlaskConical size={16} />,
    tankTypes: ['Reef'],
    isAdvanced: true,
  },
  { 
    key: 'magnesium', 
    label: 'Magnésio', 
    unit: 'ppm', 
    step: 10,
    icon: <FlaskConical size={16} />,
    tankTypes: ['Reef'],
    isAdvanced: true,
  },
  { 
    key: 'phosphate', 
    label: 'Fosfato', 
    unit: 'ppm', 
    step: 0.01,
    icon: <FlaskConical size={16} />,
    tankTypes: ['Reef', 'Plantado'],
    isAdvanced: true,
  },
  { 
    key: 'gh', 
    label: 'Dureza Geral (GH)', 
    unit: 'dGH', 
    step: 1,
    icon: <Droplets size={16} />,
    tankTypes: ['Doce', 'Plantado'],
    isAdvanced: true,
  },
  { 
    key: 'kh', 
    label: 'Dureza Carbonatos (KH)', 
    unit: 'dKH', 
    step: 1,
    icon: <Droplets size={16} />,
    tankTypes: ['Doce', 'Plantado'],
    isAdvanced: true,
  },
];

const WaterTestForm: React.FC<WaterTestFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  aquariums,
  selectedAquariumId,
}) => {
  const [formData, setFormData] = useState<Partial<WaterTest>>({
    aquarium_id: selectedAquariumId || '',
    measured_at: new Date().toISOString().slice(0, 16),
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedAquarium = aquariums.find(a => a.id === formData.aquarium_id);
  const tankType = selectedAquarium?.type || 'Doce';

  const handleChange = (key: keyof WaterTest, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFormData(prev => ({ ...prev, [key]: numValue }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aquarium_id) {
      setError('Selecione um aquário');
      return;
    }
    
    // Pelo menos um parâmetro deve ser preenchido
    const hasParameter = FORM_FIELDS.some(f => 
      formData[f.key] !== undefined && formData[f.key] !== null
    );
    
    if (!hasParameter) {
      setError('Preencha pelo menos um parâmetro');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const result = await onSubmit(formData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({ aquarium_id: selectedAquariumId || '', measured_at: new Date().toISOString().slice(0, 16) });
        setSuccess(false);
      }, 1500);
    } else {
      setError(result.error || 'Erro ao salvar teste');
    }
    
    setLoading(false);
  };

  const getFieldAnalysis = (field: FormField, value: number | undefined) => {
    if (value === undefined || value === null) return null;
    return analyzeParameter(field.key, value, tankType);
  };

  const relevantFields = FORM_FIELDS.filter(f => 
    f.tankTypes.includes(tankType) && (!f.isAdvanced || showAdvanced)
  );

  const advancedCount = FORM_FIELDS.filter(f => 
    f.tankTypes.includes(tankType) && f.isAdvanced
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#1a1b3b] p-6 border-b border-white/10 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[#4fb7b3]/20">
                  <FlaskConical className="text-[#4fb7b3]" size={20} />
                </div>
                <h2 className="text-xl font-heading font-bold text-white">Novo Teste de Água</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
              <div className="space-y-6">
                {/* Aquário e Data */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">
                      Aquário
                    </label>
                    <select
                      value={formData.aquarium_id || ''}
                      onChange={e => setFormData(prev => ({ ...prev, aquarium_id: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors"
                      required
                    >
                      <option value="">Selecione...</option>
                      {aquariums.map(aq => (
                        <option key={aq.id} value={aq.id}>{aq.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">
                      Data/Hora
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.measured_at?.slice(0, 16) || ''}
                      onChange={e => setFormData(prev => ({ ...prev, measured_at: e.target.value }))}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Parâmetros */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Parâmetros</h3>
                    {tankType && (
                      <span className="text-xs bg-[#4fb7b3]/20 text-[#4fb7b3] px-2 py-1 rounded">
                        {tankType}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {relevantFields.map(field => {
                      const value = formData[field.key] as number | undefined;
                      const analysis = getFieldAnalysis(field, value);
                      
                      return (
                        <div key={field.key} className="space-y-2">
                          <label className="text-xs text-slate-400 flex items-center gap-2">
                            {field.icon}
                            {field.label}
                            {field.unit && <span className="text-slate-500">({field.unit})</span>}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step={field.step}
                              value={value ?? ''}
                              onChange={e => handleChange(field.key, e.target.value)}
                              placeholder="-"
                              className={cn(
                                "w-full bg-black/30 border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors",
                                analysis ? `border-current ${analysis.color}` : 'border-white/10 focus:border-[#4fb7b3]'
                              )}
                            />
                            {analysis && (
                              <div className={cn(
                                "absolute right-3 top-1/2 -translate-y-1/2",
                                analysis.color
                              )}>
                                {analysis.status === 'ideal' && <CheckCircle size={16} />}
                                {analysis.status === 'critical' && <AlertCircle size={16} />}
                              </div>
                            )}
                          </div>
                          {analysis && (
                            <p className={cn("text-xs", analysis.color)}>
                              {analysis.message}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {advancedCount > 0 && !showAdvanced && (
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(true)}
                      className="w-full py-3 border border-dashed border-white/20 rounded-lg text-slate-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Mostrar {advancedCount} parâmetros avançados
                    </button>
                  )}
                </div>

                {/* Notas */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Ex: Fiz TPA de 20% ontem..."
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white h-20 focus:border-[#4fb7b3] outline-none transition-colors resize-none"
                  />
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-rose-200 text-sm"
                    >
                      <AlertCircle size={16} />
                      {error}
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-emerald-200 text-sm"
                    >
                      <CheckCircle size={16} />
                      Teste salvo com sucesso!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#1a1b3b] p-6 border-t border-white/10 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 border border-white/10 rounded-lg text-slate-300 font-bold uppercase hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || success}
                className="flex-1 py-4 bg-[#4fb7b3] rounded-lg text-black font-bold uppercase hover:bg-white transition-colors shadow-lg shadow-[#4fb7b3]/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle size={18} />
                    Salvo!
                  </>
                ) : (
                  <>
                    <FlaskConical size={18} />
                    Salvar Teste
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WaterTestForm;
