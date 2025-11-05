import React, { useState, useEffect } from 'react';
import { parse, evaluate } from 'mathjs';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface FunctionValidatorProps {
  functionInput: string;
  coordinateSystem: 'cartesian' | 'cylindrical' | 'spherical';
  colors: any;
  onValidationChange?: (isValid: boolean, suggestions?: string[]) => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  complexity: 'simple' | 'medium' | 'complex';
  recommendedSystem: 'cartesian' | 'cylindrical' | 'spherical';
}

const FunctionValidator: React.FC<FunctionValidatorProps> = ({
  functionInput,
  coordinateSystem,
  colors,
  onValidationChange
}) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    complexity: 'simple',
    recommendedSystem: 'cartesian'
  });

  // Validar función matemática
  const validateFunction = (func: string): ValidationResult => {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      complexity: 'simple',
      recommendedSystem: 'cartesian'
    };

    if (!func.trim()) {
      return result;
    }

    try {
      // Preparar función para validación
      const testFunc = func
        .toLowerCase()
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/exp/g, 'Math.exp')
        .replace(/ln/g, 'Math.log')
        .replace(/log/g, 'Math.log10')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/pi/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/x/g, '1')
        .replace(/y/g, '1')
        .replace(/z/g, '1')
        .replace(/r/g, '1')
        .replace(/theta/g, '1')
        .replace(/phi/g, '1')
        .replace(/rho/g, '1');

      // Intentar parsear con mathjs
      const parsed = parse(testFunc);
      evaluate(testFunc);

      // Análisis de complejidad
      result.complexity = analyzeComplexity(func);
      
      // Análisis de sistema recomendado
      result.recommendedSystem = analyzeRecommendedSystem(func);
      
      // Verificar sintaxis específica
      validateSyntax(func, result);
      
      // Sugerencias de optimización
      generateSuggestions(func, coordinateSystem, result);
      
      // Advertencias sobre funciones especiales
      checkSpecialFunctions(func, result);

    } catch (error) {
      result.isValid = false;
      result.errors.push(getErrorMessage(error));
    }

    return result;
  };

  // Analizar complejidad de la función
  const analyzeComplexity = (func: string): 'simple' | 'medium' | 'complex' => {
    const complexPatterns = [
      /sin|cos|tan|exp|log|ln/i,
      /\^[3-9]|\*\*[3-9]/,
      /sqrt|abs/i,
      /\//
    ];

    const complexCount = complexPatterns.reduce((count, pattern) => 
      count + (pattern.test(func) ? 1 : 0), 0
    );

    if (complexCount === 0) return 'simple';
    if (complexCount <= 2) return 'medium';
    return 'complex';
  };

  // Analizar sistema de coordenadas recomendado
  const analyzeRecommendedSystem = (func: string): 'cartesian' | 'cylindrical' | 'spherical' => {
    const lowerFunc = func.toLowerCase();
    
    // Detectar patrones esféricos
    if (lowerFunc.includes('x^2 + y^2 + z^2') || 
        lowerFunc.includes('x**2 + y**2 + z**2') ||
        lowerFunc.includes('rho') ||
        lowerFunc.includes('ρ')) {
      return 'spherical';
    }
    
    // Detectar patrones cilíndricos
    if (lowerFunc.includes('x^2 + y^2') || 
        lowerFunc.includes('x**2 + y**2') ||
        lowerFunc.includes('theta') ||
        lowerFunc.includes('θ')) {
      return 'cylindrical';
    }
    
    return 'cartesian';
  };

  // Validar sintaxis específica
  const validateSyntax = (func: string, result: ValidationResult) => {
    // Verificar paréntesis balanceados
    const openParens = (func.match(/\(/g) || []).length;
    const closeParens = (func.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
      result.errors.push('Paréntesis no balanceados');
      result.isValid = false;
    }

    // Verificar operadores consecutivos
    if (/[\+\-\*\/\^]{2,}/.test(func)) {
      result.errors.push('Operadores consecutivos detectados');
      result.isValid = false;
    }

    // Verificar variables válidas
    const validVars = ['x', 'y', 'z', 'r', 'theta', 'phi', 'rho', 'π', 'pi', 'e'];
    const variables = func.match(/[a-zA-Z]+/g) || [];
    const invalidVars = variables.filter(v => 
      !validVars.includes(v.toLowerCase()) && 
      !['sin', 'cos', 'tan', 'exp', 'ln', 'log', 'sqrt', 'abs'].includes(v.toLowerCase())
    );
    
    if (invalidVars.length > 0) {
      result.warnings.push(`Variables no reconocidas: ${invalidVars.join(', ')}`);
    }
  };

  // Generar sugerencias de optimización
  const generateSuggestions = (func: string, currentSystem: string, result: ValidationResult) => {
    const lowerFunc = func.toLowerCase();
    
    // Sugerencia de sistema de coordenadas
    if (result.recommendedSystem !== currentSystem) {
      const systemNames = {
        cartesian: 'cartesianas',
        cylindrical: 'cilíndricas',
        spherical: 'esféricas'
      };
      
      result.suggestions.push(
        `Considera usar coordenadas ${systemNames[result.recommendedSystem]} para esta función`
      );
    }

    // Sugerencias de simplificación
    if (lowerFunc.includes('x^2 + y^2') && currentSystem === 'cartesian') {
      result.suggestions.push('En cilíndricas: x² + y² = r²');
    }
    
    if (lowerFunc.includes('x^2 + y^2 + z^2') && currentSystem !== 'spherical') {
      result.suggestions.push('En esféricas: x² + y² + z² = ρ²');
    }

    // Sugerencias de funciones
    if (lowerFunc.includes('x*x')) {
      result.suggestions.push('Usa x^2 en lugar de x*x');
    }
    
    if (lowerFunc.includes('**')) {
      result.suggestions.push('Puedes usar ^ en lugar de ** para potencias');
    }
  };

  // Verificar funciones especiales
  const checkSpecialFunctions = (func: string, result: ValidationResult) => {
    const lowerFunc = func.toLowerCase();
    
    if (lowerFunc.includes('1/') || lowerFunc.includes('/')) {
      result.warnings.push('Función con división: verifica que no haya singularidades');
    }
    
    if (lowerFunc.includes('sqrt')) {
      result.warnings.push('Función con raíz cuadrada: asegúrate de que el argumento sea positivo');
    }
    
    if (lowerFunc.includes('log') || lowerFunc.includes('ln')) {
      result.warnings.push('Función logarítmica: el argumento debe ser positivo');
    }
    
    if (lowerFunc.includes('tan')) {
      result.warnings.push('Función tangente: cuidado con las discontinuidades');
    }
  };

  // Obtener mensaje de error legible
  const getErrorMessage = (error: any): string => {
    const message = error.message || error.toString();
    
    if (message.includes('Unexpected')) {
      return 'Sintaxis inválida: carácter inesperado';
    }
    if (message.includes('Expected')) {
      return 'Sintaxis incompleta: se esperaba más contenido';
    }
    if (message.includes('undefined')) {
      return 'Variable o función no definida';
    }
    
    return 'Error de sintaxis en la función';
  };

  // Actualizar validación cuando cambia la función
  useEffect(() => {
    const result = validateFunction(functionInput);
    setValidation(result);
    
    if (onValidationChange) {
      onValidationChange(result.isValid, result.suggestions);
    }
  }, [functionInput, coordinateSystem, onValidationChange]);

  // No mostrar nada si no hay función
  if (!functionInput.trim()) {
    return null;
  }

  return (
    <div style={{
      marginTop: '12px',
      padding: '16px',
      backgroundColor: validation.isValid ? colors.success + '20' : colors.error + '20',
      border: `2px solid ${validation.isValid ? colors.success : colors.error}`,
      borderRadius: '12px',
      fontSize: '14px'
    }}>
      {/* Estado de validación */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: validation.errors.length > 0 || validation.warnings.length > 0 || validation.suggestions.length > 0 ? '12px' : '0'
      }}>
        {validation.isValid ? (
          <CheckCircle size={20} color={colors.success} />
        ) : (
          <AlertCircle size={20} color={colors.error} />
        )}
        
        <span style={{
          fontWeight: 700,
          color: validation.isValid ? colors.success : colors.error
        }}>
          {validation.isValid ? 'Función válida' : 'Error en la función'}
        </span>
        
        <span style={{
          marginLeft: 'auto',
          fontSize: '12px',
          opacity: 0.8,
          textTransform: 'capitalize'
        }}>
          Complejidad: {validation.complexity}
        </span>
      </div>

      {/* Errores */}
      {validation.errors.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          {validation.errors.map((error, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: colors.error,
              fontSize: '13px',
              marginBottom: '4px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Advertencias */}
      {validation.warnings.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          {validation.warnings.map((warning, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: colors.warning,
              fontSize: '13px',
              marginBottom: '4px'
            }}>
              <Info size={16} />
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Sugerencias */}
      {validation.suggestions.length > 0 && (
        <div>
          <div style={{
            fontWeight: 600,
            color: colors.info,
            marginBottom: '6px',
            fontSize: '13px'
          }}>
            Sugerencias:
          </div>
          {validation.suggestions.map((suggestion, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: colors.info,
              fontSize: '12px',
              marginBottom: '4px',
              paddingLeft: '8px'
            }}>
              <span>•</span>
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FunctionValidator;
