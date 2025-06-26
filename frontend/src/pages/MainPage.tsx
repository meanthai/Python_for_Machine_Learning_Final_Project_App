import React, { useState } from 'react';
import { AlertCircle, Brain, Loader2 } from 'lucide-react';

interface InputSample {
  SDS_Score_Weighted: number;
  Internet_Hours_Age: number;
  Physical_Height_Age: number;
  Basic_Demos_Sex: number;
  PreInt_FGC_CU_PU: number;
}

interface PredictionResponse {
  success: boolean;
  prediction: number;
}

interface FormErrors {
  [key: string]: string;
}

export const PredictionPage: React.FC = () => {
  const [formData, setFormData] = useState<InputSample>({
    SDS_Score_Weighted: 0.0,
    Internet_Hours_Age: 0.0,
    Physical_Height_Age: 0.0,
    Basic_Demos_Sex: 0.0,
    PreInt_FGC_CU_PU: 0.0,
  });

  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Basic validation - you can customize these rules based on your requirements
    if (formData.SDS_Score_Weighted < 0) {
      newErrors.SDS_Score_Weighted = 'SDS Score must be non-negative';
    }
    
    if (formData.Internet_Hours_Age < 0) {
      newErrors.Internet_Hours_Age = 'Internet Hours Age must be non-negative';
    }
    
    if (formData.Physical_Height_Age < 0) {
      newErrors.Physical_Height_Age = 'Physical Height Age must be non-negative';
    }
    
    if (![0, 1].includes(formData.Basic_Demos_Sex)) {
      newErrors.Basic_Demos_Sex = 'Sex must be 0 or 1';
    }
    
    if (formData.PreInt_FGC_CU_PU < 0) {
      newErrors.PreInt_FGC_CU_PU = 'PreInt FGC CU PU must be non-negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof InputSample, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await fetch('http://localhost:8053/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PredictionResponse = await response.json();
      
      if (result.success) {
        setPrediction(result.prediction);
      } else {
        setError('Prediction failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      SDS_Score_Weighted: 0.0,
      Internet_Hours_Age: 0.0,
      Physical_Height_Age: 0.0,
      Basic_Demos_Sex: 0.0,
      PreInt_FGC_CU_PU: 0.0,
    });
    setPrediction(null);
    setError('');
    setErrors({});
  };

  const getPredictionLabel = (pred: number): string => {
    const labels = {
      0: 'No symptoms',
      1: 'Mild symptoms', 
      2: 'Moderate symptoms',
      3: 'Severe symptoms'
    };
    return labels[pred as keyof typeof labels] || 'Unknown';
  };

  const getPredictionColor = (pred: number): string => {
    const colors = {
      0: 'text-green-600 bg-green-100',
      1: 'text-yellow-600 bg-yellow-100',
      2: 'text-orange-600 bg-orange-100',
      3: 'text-red-600 bg-red-100'
    };
    return colors[pred as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ML Prediction Model</h1>
            <p className="text-gray-600">Enter the parameters below to get a prediction</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sds-score" className="block text-sm font-medium text-gray-700 mb-2">
                  SDS Score Weighted
                </label>

                <input
                  id="sds-score"
                  type="number"
                  step="0.01"
                  value={formData.SDS_Score_Weighted}
                  onChange={(e) => handleInputChange('SDS_Score_Weighted', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.SDS_Score_Weighted ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                
                {errors.SDS_Score_Weighted && (
                  <p className="mt-1 text-sm text-red-600">{errors.SDS_Score_Weighted}</p>
                )}
              </div>

              <div>
                <label htmlFor="internet-hours" className="block text-sm font-medium text-gray-700 mb-2">
                  Internet Hours Age
                </label>
                <input
                  id="internet-hours"
                  type="number"
                  step="0.01"
                  value={formData.Internet_Hours_Age}
                  onChange={(e) => handleInputChange('Internet_Hours_Age', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.Internet_Hours_Age ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {errors.Internet_Hours_Age && (
                  <p className="mt-1 text-sm text-red-600">{errors.Internet_Hours_Age}</p>
                )}
              </div>

              <div>
                <label htmlFor="physical-height" className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Height Age
                </label>
                <input
                  id="physical-height"
                  type="number"
                  step="0.01"
                  value={formData.Physical_Height_Age}
                  onChange={(e) => handleInputChange('Physical_Height_Age', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.Physical_Height_Age ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {errors.Physical_Height_Age && (
                  <p className="mt-1 text-sm text-red-600">{errors.Physical_Height_Age}</p>
                )}
              </div>

              <div>
                <label htmlFor="basic-demos-sex" className="block text-sm font-medium text-gray-700 mb-2">
                  Basic Demos Sex
                </label>
                <select
                  id="basic-demos-sex"
                  value={formData.Basic_Demos_Sex}
                  onChange={(e) => handleInputChange('Basic_Demos_Sex', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.Basic_Demos_Sex ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value={0}>0 (Female)</option>
                  <option value={1}>1 (Male)</option>
                </select>
                {errors.Basic_Demos_Sex && (
                  <p className="mt-1 text-sm text-red-600">{errors.Basic_Demos_Sex}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="preint-fgc" className="block text-sm font-medium text-gray-700 mb-2">
                  PreInt FGC CU PU
                </label>
                <input
                  id="preint-fgc"
                  type="number"
                  step="0.01"
                  value={formData.PreInt_FGC_CU_PU}
                  onChange={(e) => handleInputChange('PreInt_FGC_CU_PU', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.PreInt_FGC_CU_PU ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {errors.PreInt_FGC_CU_PU && (
                  <p className="mt-1 text-sm text-red-600">{errors.PreInt_FGC_CU_PU}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Predicting...
                  </div>
                ) : (
                  'Get Prediction'
                )}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Reset
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {prediction !== null && (
            <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Prediction Result</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Predicted Category:</span>
                <span className={`px-4 py-2 rounded-full font-semibold ${getPredictionColor(prediction)}`}>
                  {prediction} - {getPredictionLabel(prediction)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;