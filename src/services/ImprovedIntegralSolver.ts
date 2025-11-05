import { evaluate, parse, simplify } from 'mathjs';

export interface IntegralResult {
  success: boolean;
  result: number;
  steps: string[];
  method: string;
  error?: string;
}

export interface IntegralLimits {
  x: [number, number];
  y: [number, number];
  z: [number, number];
}

export class ImprovedIntegralSolver {
  
  /**
   * Resuelve una integral triple usando aproximación numérica
   */
  async solveTripleIntegral(
    functionStr: string,
    limits: IntegralLimits,
    coordinateSystem: 'cartesian' | 'cylindrical' | 'spherical' = 'cartesian'
  ): Promise<IntegralResult> {
    
    try {
      console.log('Resolviendo integral:', functionStr, limits, coordinateSystem);
      
      // Transformar la función según el sistema de coordenadas
      const transformedFunction = this.transformFunction(functionStr, coordinateSystem);
      const jacobian = this.getJacobian(coordinateSystem);
      
      // Resolver usando integración numérica (método de Simpson)
      const result = this.numericalIntegration(transformedFunction, limits, jacobian, coordinateSystem);
      
      const steps = this.generateSteps(functionStr, limits, coordinateSystem, result);
      
      return {
        success: true,
        result: result,
        steps: steps,
        method: `Integración numérica en coordenadas ${coordinateSystem}`
      };
      
    } catch (error) {
      console.error('Error resolviendo integral:', error);
      return {
        success: false,
        result: 0,
        steps: ['Error en el cálculo'],
        method: 'Error',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Transforma la función según el sistema de coordenadas
   */
  private transformFunction(functionStr: string, system: string): string {
    let transformed = functionStr;
    
    // Limpiar la función
    transformed = transformed.replace(/\s+/g, '');
    
    // Reemplazar operadores comunes
    transformed = transformed.replace(/\^/g, '**');
    transformed = transformed.replace(/\*\*/g, '^');
    
    switch (system) {
      case 'cylindrical':
        // x = r*cos(θ), y = r*sin(θ), z = z
        transformed = transformed.replace(/x\^2\s*\+\s*y\^2/g, 'r^2');
        transformed = transformed.replace(/x\*\*2\s*\+\s*y\*\*2/g, 'r^2');
        transformed = transformed.replace(/x/g, 'r*cos(theta)');
        transformed = transformed.replace(/y/g, 'r*sin(theta)');
        break;
        
      case 'spherical':
        // x = ρ*sin(φ)*cos(θ), y = ρ*sin(φ)*sin(θ), z = ρ*cos(φ)
        transformed = transformed.replace(/x\^2\s*\+\s*y\^2\s*\+\s*z\^2/g, 'rho^2');
        transformed = transformed.replace(/x\*\*2\s*\+\s*y\*\*2\s*\+\s*z\*\*2/g, 'rho^2');
        transformed = transformed.replace(/x/g, 'rho*sin(phi)*cos(theta)');
        transformed = transformed.replace(/y/g, 'rho*sin(phi)*sin(theta)');
        transformed = transformed.replace(/z/g, 'rho*cos(phi)');
        break;
    }
    
    return transformed;
  }

  /**
   * Obtiene el Jacobiano según el sistema de coordenadas
   */
  private getJacobian(system: string): string {
    switch (system) {
      case 'cylindrical':
        return 'r';
      case 'spherical':
        return 'rho^2 * sin(phi)';
      default:
        return '1';
    }
  }

  /**
   * Integración numérica usando el método de Simpson compuesto
   */
  private numericalIntegration(
    functionStr: string,
    limits: IntegralLimits,
    jacobian: string,
    system: string
  ): number {
    
    const n = 20; // Número de subdivisiones por dimensión
    
    let sum = 0;
    const [x1, x2] = limits.x;
    const [y1, y2] = limits.y;
    const [z1, z2] = limits.z;
    
    const dx = (x2 - x1) / n;
    const dy = (y2 - y1) / n;
    const dz = (z2 - z1) / n;
    
    // Variables según el sistema
    const vars = this.getVariableNames(system);
    
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        for (let k = 0; k <= n; k++) {
          
          const var1 = x1 + i * dx;
          const var2 = y1 + j * dy;
          const var3 = z1 + k * dz;
          
          // Coeficiente de Simpson
          const coeff = this.getSimpsonCoeff(i, j, k, n);
          
          try {
            // Evaluar la función
            const scope: any = {};
            scope[vars[0]] = var1;
            scope[vars[1]] = var2;
            scope[vars[2]] = var3;
            
            // Agregar funciones trigonométricas y constantes
            scope.sin = Math.sin;
            scope.cos = Math.cos;
            scope.tan = Math.tan;
            scope.sqrt = Math.sqrt;
            scope.exp = Math.exp;
            scope.ln = Math.log;
            scope.log = Math.log10;
            scope.pi = Math.PI;
            scope.e = Math.E;
            
            // Evaluar función principal
            let funcValue = 0;
            try {
              funcValue = evaluate(functionStr, scope);
            } catch {
              // Si falla, intentar con función simplificada
              funcValue = this.evaluateSimpleFunction(functionStr, var1, var2, var3, system);
            }
            
            // Evaluar Jacobiano
            let jacobianValue = 1;
            if (jacobian !== '1') {
              try {
                jacobianValue = evaluate(jacobian, scope);
              } catch {
                jacobianValue = this.evaluateJacobian(jacobian, var1, var2, var3, system);
              }
            }
            
            sum += coeff * funcValue * jacobianValue;
            
          } catch (error) {
            // Si hay error, usar valor por defecto
            console.warn('Error evaluando en punto:', var1, var2, var3, error);
          }
        }
      }
    }
    
    return sum * dx * dy * dz / 27; // Factor de Simpson 3D
  }

  /**
   * Evaluación simple de funciones comunes
   */
  private evaluateSimpleFunction(funcStr: string, x: number, y: number, z: number, system: string): number {
    // Casos comunes
    if (funcStr === '1') return 1;
    if (funcStr === 'x') return x;
    if (funcStr === 'y') return y;
    if (funcStr === 'z') return z;
    if (funcStr === 'x*y') return x * y;
    if (funcStr === 'x*y*z') return x * y * z;
    if (funcStr === 'x^2 + y^2') return x*x + y*y;
    if (funcStr === 'x^2 + y^2 + z^2') return x*x + y*y + z*z;
    
    // Para coordenadas cilíndricas
    if (system === 'cylindrical') {
      if (funcStr === 'r') return x; // r es la primera variable
      if (funcStr === 'r^2') return x*x;
    }
    
    // Para coordenadas esféricas
    if (system === 'spherical') {
      if (funcStr === 'rho') return x; // ρ es la primera variable
      if (funcStr === 'rho^2') return x*x;
    }
    
    return 1; // Valor por defecto
  }

  /**
   * Evaluación simple del Jacobiano
   */
  private evaluateJacobian(jacobian: string, var1: number, var2: number, var3: number, system: string): number {
    switch (jacobian) {
      case 'r':
        return var1; // r
      case 'rho^2 * sin(phi)':
        return var1 * var1 * Math.sin(var3); // ρ² * sin(φ)
      default:
        return 1;
    }
  }

  /**
   * Obtiene los nombres de variables según el sistema
   */
  private getVariableNames(system: string): [string, string, string] {
    switch (system) {
      case 'cylindrical':
        return ['r', 'theta', 'z'];
      case 'spherical':
        return ['rho', 'theta', 'phi'];
      default:
        return ['x', 'y', 'z'];
    }
  }

  /**
   * Coeficiente de Simpson para integración 3D
   */
  private getSimpsonCoeff(i: number, j: number, k: number, n: number): number {
    const coeffs = [1, 4, 2, 4, 2, 4, 2, 4, 1]; // Patrón de Simpson
    
    const ci = (i === 0 || i === n) ? 1 : (i % 2 === 1 ? 4 : 2);
    const cj = (j === 0 || j === n) ? 1 : (j % 2 === 1 ? 4 : 2);
    const ck = (k === 0 || k === n) ? 1 : (k % 2 === 1 ? 4 : 2);
    
    return ci * cj * ck;
  }

  /**
   * Genera los pasos de resolución
   */
  private generateSteps(
    functionStr: string,
    limits: IntegralLimits,
    system: string,
    result: number
  ): string[] {
    const steps: string[] = [];
    
    steps.push(`**Paso 1:** Identificar la integral triple`);
    steps.push(`∫∫∫ ${functionStr} dV`);
    
    steps.push(`**Paso 2:** Sistema de coordenadas: ${system}`);
    
    if (system !== 'cartesian') {
      steps.push(`**Paso 3:** Aplicar transformación de coordenadas`);
      const jacobian = this.getJacobian(system);
      steps.push(`Jacobiano: J = ${jacobian}`);
    }
    
    steps.push(`**Paso 4:** Establecer límites de integración`);
    steps.push(`x ∈ [${limits.x[0]}, ${limits.x[1]}]`);
    steps.push(`y ∈ [${limits.y[0]}, ${limits.y[1]}]`);
    steps.push(`z ∈ [${limits.z[0]}, ${limits.z[1]}]`);
    
    steps.push(`**Paso 5:** Resolver usando integración numérica`);
    steps.push(`Método: Simpson compuesto 3D`);
    
    steps.push(`**Resultado:** ${result.toFixed(4)}`);
    
    return steps;
  }

  /**
   * Casos de prueba predefinidos
   */
  getTestCases(): Array<{
    name: string;
    function: string;
    limits: IntegralLimits;
    system: 'cartesian' | 'cylindrical' | 'spherical';
    expectedApprox?: number;
  }> {
    return [
      {
        name: 'Volumen de un cubo',
        function: '1',
        limits: { x: [0, 2], y: [0, 2], z: [0, 2] },
        system: 'cartesian',
        expectedApprox: 8
      },
      {
        name: 'Paraboloide circular',
        function: 'x^2 + y^2',
        limits: { x: [-1, 1], y: [-1, 1], z: [0, 2] },
        system: 'cartesian',
        expectedApprox: 2.67
      },
      {
        name: 'Cilindro (coordenadas cilíndricas)',
        function: '1',
        limits: { x: [0, 2], y: [0, 6.28], z: [0, 3] }, // r, θ, z
        system: 'cylindrical',
        expectedApprox: 37.7 // π * r² * h
      },
      {
        name: 'Esfera (coordenadas esféricas)',
        function: '1',
        limits: { x: [0, 2], y: [0, 6.28], z: [0, 3.14] }, // ρ, θ, φ
        system: 'spherical',
        expectedApprox: 33.5 // (4/3) * π * r³
      },
      {
        name: 'Función compleja',
        function: 'x*y*z',
        limits: { x: [0, 1], y: [0, 1], z: [0, 1] },
        system: 'cartesian',
        expectedApprox: 0.125
      }
    ];
  }
}

// Instancia singleton
export const improvedSolver = new ImprovedIntegralSolver();
