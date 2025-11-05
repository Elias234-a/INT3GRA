#!/usr/bin/env python3
"""
INTEGRA - Microservicio Python para Resolución Simbólica de Integrales Triples
Utiliza SymPy para cálculos exactos y precisos
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sympy as sp
from sympy import symbols, integrate, diff, simplify, latex, sympify
from sympy import sin, cos, tan, exp, log, sqrt, pi, E, oo
import numpy as np
from scipy import integrate as scipy_integrate
import time
import traceback
import re

app = Flask(__name__)
CORS(app)

# Símbolos matemáticos
x, y, z = symbols('x y z', real=True)
r, theta, phi = symbols('r theta phi', real=True, positive=True)
rho = symbols('rho', real=True, positive=True)

class IntegralSolver:
    """Clase principal para resolver integrales triples simbólicamente"""
    
    def __init__(self):
        self.timeout = 30  # 30 segundos máximo por integral
        
    def parse_function(self, func_str):
        """Parsea función de string a expresión SymPy"""
        try:
            # Reemplazos comunes para compatibilidad
            replacements = {
                '^': '**',
                'sin': 'sin',
                'cos': 'cos', 
                'tan': 'tan',
                'exp': 'exp',
                'log': 'log',
                'ln': 'log',
                'sqrt': 'sqrt',
                'pi': 'pi',
                'e': 'E'
            }
            
            parsed = func_str
            for old, new in replacements.items():
                if old == '^':
                    parsed = parsed.replace(old, new)
            
            # Convertir a expresión SymPy
            expr = sympify(parsed, locals={'x': x, 'y': y, 'z': z, 'r': r, 
                                         'theta': theta, 'phi': phi, 'rho': rho,
                                         'sin': sin, 'cos': cos, 'tan': tan,
                                         'exp': exp, 'log': log, 'sqrt': sqrt,
                                         'pi': pi, 'E': E})
            return expr
            
        except Exception as e:
            raise ValueError(f"Error parseando función: {str(e)}")
    
    def parse_limits(self, limits_dict):
        """Parsea límites de integración"""
        try:
            parsed_limits = {}
            for var, bounds in limits_dict.items():
                if isinstance(bounds, list) and len(bounds) == 2:
                    lower = sympify(bounds[0]) if bounds[0] != '' else 0
                    upper = sympify(bounds[1]) if bounds[1] != '' else 1
                    parsed_limits[var] = (lower, upper)
                else:
                    parsed_limits[var] = (0, 1)  # Default
            return parsed_limits
        except Exception as e:
            raise ValueError(f"Error parseando límites: {str(e)}")
    
    def transform_to_cylindrical(self, expr):
        """Transforma expresión a coordenadas cilíndricas"""
        # x = r*cos(theta), y = r*sin(theta), z = z
        # Jacobiano = r
        transformed = expr.subs([(x, r*cos(theta)), (y, r*sin(theta))])
        return transformed * r  # Multiplicar por Jacobiano
    
    def transform_to_spherical(self, expr):
        """Transforma expresión a coordenadas esféricas"""
        # x = rho*sin(phi)*cos(theta)
        # y = rho*sin(phi)*sin(theta) 
        # z = rho*cos(phi)
        # Jacobiano = rho^2 * sin(phi)
        transformed = expr.subs([
            (x, rho*sin(phi)*cos(theta)),
            (y, rho*sin(phi)*sin(theta)),
            (z, rho*cos(phi))
        ])
        return transformed * rho**2 * sin(phi)  # Multiplicar por Jacobiano
    
    def solve_symbolic(self, func_expr, limits, coordinate_system='cartesian'):
        """Resuelve integral simbólicamente paso a paso"""
        start_time = time.time()
        steps = []
        
        try:
            # Aplicar transformación de coordenadas
            if coordinate_system == 'cylindrical':
                integrand = self.transform_to_cylindrical(func_expr)
                var_order = [z, r, theta]
                limit_order = ['z', 'r', 'theta']
            elif coordinate_system == 'spherical':
                integrand = self.transform_to_spherical(func_expr)
                var_order = [rho, phi, theta]
                limit_order = ['rho', 'phi', 'theta']
            else:  # cartesian
                integrand = func_expr
                var_order = [z, y, x]
                limit_order = ['z', 'y', 'x']
            
            steps.append({
                'step': 1,
                'description': f'Función original en coordenadas {coordinate_system}',
                'equation': latex(integrand),
                'result': str(integrand),
                'explanation': f'Jacobiano aplicado para {coordinate_system}'
            })
            
            current_expr = integrand
            
            # Integrar paso a paso
            for i, (var, limit_key) in enumerate(zip(var_order, limit_order)):
                if limit_key in limits:
                    lower, upper = limits[limit_key]
                    
                    step_num = i + 2
                    steps.append({
                        'step': step_num,
                        'description': f'Integrar respecto a {var}',
                        'equation': f'∫[{lower} to {upper}] ({latex(current_expr)}) d{var}',
                        'result': 'Calculando...',
                        'explanation': f'Integración en la variable {var}'
                    })
                    
                    # Realizar integración
                    try:
                        current_expr = integrate(current_expr, (var, lower, upper))
                        current_expr = simplify(current_expr)
                        
                        steps[-1]['result'] = str(current_expr)
                        steps[-1]['equation'] = latex(current_expr)
                        
                    except Exception as e:
                        # Si falla simbólica, intentar numérica
                        steps[-1]['result'] = f'Integración simbólica falló: {str(e)}'
                        steps[-1]['explanation'] += ' (requiere método numérico)'
                        break
            
            # Resultado final
            try:
                if current_expr.is_number:
                    exact_result = str(current_expr)
                    numerical_result = float(current_expr.evalf())
                else:
                    exact_result = str(current_expr)
                    numerical_result = float(current_expr.evalf()) if current_expr.is_real else None
            except:
                exact_result = str(current_expr)
                numerical_result = None
            
            computation_time = (time.time() - start_time) * 1000
            
            return {
                'success': True,
                'exact_result': exact_result,
                'numerical_result': numerical_result,
                'steps': steps,
                'computation_time': computation_time,
                'coordinate_system': coordinate_system,
                'jacobian': self.get_jacobian_info(coordinate_system)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'steps': steps,
                'computation_time': (time.time() - start_time) * 1000
            }
    
    def solve_numerical(self, func_str, limits, coordinate_system='cartesian'):
        """Resuelve integral numéricamente como fallback"""
        try:
            # Crear función evaluable
            def integrand(z_val, y_val, x_val):
                try:
                    # Reemplazar variables en la función
                    expr = func_str.replace('x', str(x_val))
                    expr = expr.replace('y', str(y_val))
                    expr = expr.replace('z', str(z_val))
                    expr = expr.replace('^', '**')
                    expr = expr.replace('sin', 'np.sin')
                    expr = expr.replace('cos', 'np.cos')
                    expr = expr.replace('tan', 'np.tan')
                    expr = expr.replace('exp', 'np.exp')
                    expr = expr.replace('log', 'np.log')
                    expr = expr.replace('sqrt', 'np.sqrt')
                    expr = expr.replace('pi', 'np.pi')
                    
                    result = eval(expr)
                    
                    # Aplicar Jacobiano
                    if coordinate_system == 'cylindrical':
                        result *= x_val  # r en coordenadas cilíndricas
                    elif coordinate_system == 'spherical':
                        result *= x_val**2 * np.sin(y_val)  # rho^2 * sin(phi)
                    
                    return result
                except:
                    return 0
            
            # Obtener límites numéricos
            x_limits = limits.get('x', [0, 1])
            y_limits = limits.get('y', [0, 1])
            z_limits = limits.get('z', [0, 1])
            
            x_min, x_max = float(x_limits[0]), float(x_limits[1])
            y_min, y_max = float(y_limits[0]), float(y_limits[1])
            z_min, z_max = float(z_limits[0]), float(z_limits[1])
            
            # Integración numérica
            result, error = scipy_integrate.tplquad(
                integrand,
                x_min, x_max,
                lambda x: y_min, lambda x: y_max,
                lambda x, y: z_min, lambda x, y: z_max
            )
            
            return {
                'success': True,
                'numerical_result': result,
                'error_estimate': error,
                'method': 'scipy.integrate.tplquad',
                'coordinate_system': coordinate_system
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_jacobian_info(self, coordinate_system):
        """Retorna información sobre el Jacobiano"""
        jacobians = {
            'cartesian': {
                'value': '1',
                'description': 'Jacobiano trivial para coordenadas cartesianas',
                'transformation': 'x=x, y=y, z=z'
            },
            'cylindrical': {
                'value': 'r',
                'description': 'Jacobiano para coordenadas cilíndricas',
                'transformation': 'x=r·cos(θ), y=r·sin(θ), z=z'
            },
            'spherical': {
                'value': 'ρ²·sin(φ)',
                'description': 'Jacobiano para coordenadas esféricas',
                'transformation': 'x=ρ·sin(φ)·cos(θ), y=ρ·sin(φ)·sin(θ), z=ρ·cos(φ)'
            }
        }
        return jacobians.get(coordinate_system, jacobians['cartesian'])

# Instancia global del solver
solver = IntegralSolver()

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de salud"""
    return jsonify({
        'status': 'healthy',
        'service': 'INTEGRA Python Solver',
        'version': '1.0.0'
    })

@app.route('/symbolic-solve', methods=['POST'])
def symbolic_solve():
    """Endpoint principal para resolución simbólica"""
    try:
        data = request.json
        
        # Validar datos de entrada
        if not data or 'function' not in data:
            return jsonify({
                'success': False,
                'error': 'Función requerida'
            }), 400
        
        function_str = data['function']
        limits = data.get('limits', {'x': [0, 1], 'y': [0, 1], 'z': [0, 1]})
        coordinate_system = data.get('coordinate_system', 'cartesian')
        
        # Parsear función
        func_expr = solver.parse_function(function_str)
        parsed_limits = solver.parse_limits(limits)
        
        # Resolver simbólicamente
        result = solver.solve_symbolic(func_expr, parsed_limits, coordinate_system)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/numerical-solve', methods=['POST'])
def numerical_solve():
    """Endpoint para resolución numérica (fallback)"""
    try:
        data = request.json
        
        function_str = data['function']
        limits = data.get('limits', {'x': [0, 1], 'y': [0, 1], 'z': [0, 1]})
        coordinate_system = data.get('coordinate_system', 'cartesian')
        
        result = solver.solve_numerical(function_str, limits, coordinate_system)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/analyze-function', methods=['POST'])
def analyze_function():
    """Analiza función y recomienda mejor sistema de coordenadas"""
    try:
        data = request.json
        function_str = data['function']
        
        func_expr = solver.parse_function(function_str)
        
        # Análisis de la función
        analysis = {
            'function': str(func_expr),
            'variables': [str(var) for var in func_expr.free_symbols],
            'recommended_system': 'cartesian',
            'complexity_score': 1,
            'reasons': []
        }
        
        func_str_lower = str(func_expr).lower()
        
        # Detectar patrones para coordenadas cilíndricas
        if 'x**2 + y**2' in func_str_lower or 'x^2 + y^2' in func_str_lower:
            analysis['recommended_system'] = 'cylindrical'
            analysis['complexity_score'] = 0.3
            analysis['reasons'].append('Contiene x² + y² - ideal para cilíndricas')
        
        # Detectar patrones para coordenadas esféricas
        if 'x**2 + y**2 + z**2' in func_str_lower or 'x^2 + y^2 + z^2' in func_str_lower:
            analysis['recommended_system'] = 'spherical'
            analysis['complexity_score'] = 0.2
            analysis['reasons'].append('Contiene x² + y² + z² - ideal para esféricas')
        
        # Otros patrones
        if 'sqrt(x**2 + y**2)' in func_str_lower:
            analysis['recommended_system'] = 'cylindrical'
            analysis['reasons'].append('Contiene √(x² + y²) - simplifica en cilíndricas')
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🐍 INTEGRA Python Solver iniciando...")
    print("📊 SymPy version:", sp.__version__)
    print("🔗 Endpoints disponibles:")
    print("   POST /symbolic-solve - Resolución simbólica")
    print("   POST /numerical-solve - Resolución numérica")
    print("   POST /analyze-function - Análisis de función")
    print("   GET  /health - Estado del servicio")
    print("🚀 Servidor ejecutándose en http://localhost:8000")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
