#!/usr/bin/env python3
"""
INTEGRA - Microservicio Python Avanzado para Resolución de Integrales Triples
Utiliza SymPy para cálculos simbólicos exactos y SciPy para cálculos numéricos de alta precisión
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sympy as sp
from sympy import symbols, integrate, diff, simplify, latex, sympify, N
from sympy import sin, cos, tan, exp, log, sqrt, pi, E, oo, Abs
from sympy.abc import x, y, z, r, theta, phi, rho
import numpy as np
from scipy import integrate as scipy_integrate
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import plotly.io as pio
import time
import traceback
import re
import json
from typing import Dict, List, Tuple, Any, Optional
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

class AdvancedIntegralSolver:
    """Solver avanzado para integrales triples con capacidades simbólicas y numéricas"""
    
    def __init__(self):
        self.timeout = 45  # 45 segundos máximo por integral
        self.max_iterations = 1000000
        self.precision_digits = 15
        
    def parse_function(self, func_str: str) -> sp.Expr:
        """Parsea función de string a expresión SymPy con soporte extendido"""
        try:
            # Normalizar la función
            func_str = func_str.strip().replace(' ', '')
            
            # Reemplazos avanzados para compatibilidad
            replacements = {
                '^': '**',
                'sen': 'sin',
                'ln': 'log',
                'π': 'pi',
                'e^': 'exp',
                'sqrt': 'sqrt',
                'abs': 'Abs',
                'arcsin': 'asin',
                'arccos': 'acos',
                'arctan': 'atan',
                'sinh': 'sinh',
                'cosh': 'cosh',
                'tanh': 'tanh'
            }
            
            parsed = func_str
            for old, new in replacements.items():
                parsed = parsed.replace(old, new)
            
            # Manejar multiplicación implícita
            parsed = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', parsed)
            parsed = re.sub(r'([a-zA-Z])(\d)', r'\1*\2', parsed)
            parsed = re.sub(r'\)([a-zA-Z\(])', r')*\1', parsed)
            parsed = re.sub(r'([a-zA-Z])\(', r'\1*(', parsed)
            
            # Convertir a expresión SymPy
            expr = sympify(parsed, locals={'x': x, 'y': y, 'z': z, 'r': r, 
                                         'theta': theta, 'phi': phi, 'rho': rho,
                                         'pi': pi, 'E': E})
            return expr
            
        except Exception as e:
            raise ValueError(f"Error parseando función '{func_str}': {str(e)}")
    
    def coordinate_transform(self, expr: sp.Expr, coord_system: str) -> Tuple[sp.Expr, sp.Expr]:
        """Transforma coordenadas y calcula jacobiano"""
        if coord_system == 'cartesian':
            return expr, sp.Integer(1)
        
        elif coord_system == 'cylindrical':
            # x = r*cos(theta), y = r*sin(theta), z = z
            transformed = expr.subs([(x, r*cos(theta)), (y, r*sin(theta))])
            jacobian = r  # |J| = r
            return transformed, jacobian
        
        elif coord_system == 'spherical':
            # x = rho*sin(phi)*cos(theta), y = rho*sin(phi)*sin(theta), z = rho*cos(phi)
            transformed = expr.subs([
                (x, rho*sin(phi)*cos(theta)),
                (y, rho*sin(phi)*sin(theta)),
                (z, rho*cos(phi))
            ])
            jacobian = rho**2 * sin(phi)  # |J| = ρ²sin(φ)
            return transformed, jacobian
        
        else:
            raise ValueError(f"Sistema de coordenadas no soportado: {coord_system}")
    
    def solve_symbolic(self, func_expr: sp.Expr, limits: Dict, coord_system: str) -> Dict[str, Any]:
        """Intenta resolver la integral simbólicamente"""
        try:
            start_time = time.time()
            
            # Transformar coordenadas
            transformed_expr, jacobian = self.coordinate_transform(func_expr, coord_system)
            integrand = transformed_expr * jacobian
            
            # Definir variables y límites según el sistema
            if coord_system == 'cartesian':
                vars_order = [z, y, x]
                limits_order = [(z, limits['z'][0], limits['z'][1]),
                              (y, limits['y'][0], limits['y'][1]),
                              (x, limits['x'][0], limits['x'][1])]
            elif coord_system == 'cylindrical':
                vars_order = [z, theta, r]
                limits_order = [(z, limits['z'][0], limits['z'][1]),
                              (theta, limits['y'][0], limits['y'][1]),  # theta en y
                              (r, limits['x'][0], limits['x'][1])]      # r en x
            else:  # spherical
                vars_order = [phi, theta, rho]
                limits_order = [(phi, limits['z'][0], limits['z'][1]),    # phi en z
                              (theta, limits['y'][0], limits['y'][1]),   # theta en y
                              (rho, limits['x'][0], limits['x'][1])]     # rho en x
            
            steps = []
            steps.append(f"**Configuración Inicial**")
            steps.append(f"Función: f = {func_expr}")
            steps.append(f"Sistema: {coord_system}")
            steps.append(f"Jacobiano: |J| = {jacobian}")
            steps.append(f"Integrando: f·|J| = {integrand}")
            
            # Resolver paso a paso
            current_expr = integrand
            
            for i, (var, lower, upper) in enumerate(limits_order):
                steps.append(f"**Paso {i+1}: Integrar respecto a {var}**")
                steps.append(f"∫[{lower} → {upper}] ({current_expr}) d{var}")
                
                # Intentar integración simbólica con timeout
                try:
                    integral_result = integrate(current_expr, (var, lower, upper))
                    current_expr = simplify(integral_result)
                    steps.append(f"Resultado: {current_expr}")
                    
                    if time.time() - start_time > self.timeout:
                        raise TimeoutError("Tiempo límite excedido")
                        
                except Exception as e:
                    steps.append(f"Error en integración simbólica: {str(e)}")
                    return {'success': False, 'error': f'Error simbólico en paso {i+1}', 'steps': steps}
            
            # Evaluar resultado final
            try:
                if current_expr.is_number:
                    final_value = float(N(current_expr, self.precision_digits))
                else:
                    final_value = float(N(current_expr.evalf(), self.precision_digits))
                
                steps.append(f"**Resultado Final**")
                steps.append(f"Valor numérico: {final_value}")
                
                return {
                    'success': True,
                    'result': final_value,
                    'exact_result': str(current_expr),
                    'latex_result': latex(current_expr),
                    'method': 'Simbólico',
                    'steps': steps,
                    'execution_time': time.time() - start_time,
                    'coordinate_system': coord_system,
                    'jacobian': str(jacobian)
                }
                
            except Exception as e:
                steps.append(f"Error evaluando resultado: {str(e)}")
                return {'success': False, 'error': 'Error evaluando resultado final', 'steps': steps}
                
        except Exception as e:
            return {'success': False, 'error': f'Error en resolución simbólica: {str(e)}', 'steps': []}
    
    def solve_numerical(self, func_expr: sp.Expr, limits: Dict, coord_system: str) -> Dict[str, Any]:
        """Resolver numéricamente con alta precisión"""
        try:
            start_time = time.time()
            
            # Transformar a función numérica
            transformed_expr, jacobian = self.coordinate_transform(func_expr, coord_system)
            integrand = transformed_expr * jacobian
            
            # Convertir a función lambda para SciPy
            if coord_system == 'cartesian':
                func_lambda = sp.lambdify((x, y, z), integrand, 'numpy')
                
                def integrand_func(z_val, y_val, x_val):
                    try:
                        result = func_lambda(x_val, y_val, z_val)
                        return np.real(result) if np.isfinite(result) else 0.0
                    except:
                        return 0.0
                        
            elif coord_system == 'cylindrical':
                func_lambda = sp.lambdify((r, theta, z), integrand, 'numpy')
                
                def integrand_func(z_val, theta_val, r_val):
                    try:
                        result = func_lambda(r_val, theta_val, z_val)
                        return np.real(result) if np.isfinite(result) else 0.0
                    except:
                        return 0.0
                        
            else:  # spherical
                func_lambda = sp.lambdify((rho, theta, phi), integrand, 'numpy')
                
                def integrand_func(phi_val, theta_val, rho_val):
                    try:
                        result = func_lambda(rho_val, theta_val, phi_val)
                        return np.real(result) if np.isfinite(result) else 0.0
                    except:
                        return 0.0
            
            # Integración numérica triple
            result, error = scipy_integrate.tplquad(
                integrand_func,
                limits['x'][0], limits['x'][1],
                lambda x: limits['y'][0], lambda x: limits['y'][1],
                lambda x, y: limits['z'][0], lambda x, y: limits['z'][1],
                epsabs=1e-12, epsrel=1e-10
            )
            
            steps = [
                f"**Método Numérico de Alta Precisión**",
                f"Función: f = {func_expr}",
                f"Sistema: {coord_system}",
                f"Jacobiano: |J| = {jacobian}",
                f"Integrando: f·|J| = {integrand}",
                f"Límites: x∈[{limits['x'][0]}, {limits['x'][1]}], y∈[{limits['y'][0]}, {limits['y'][1]}], z∈[{limits['z'][0]}, {limits['z'][1]}]",
                f"Algoritmo: Cuadratura adaptativa de Gauss-Kronrod",
                f"Tolerancia absoluta: 1e-12",
                f"Tolerancia relativa: 1e-10",
                f"**Resultado: {result:.12f}**",
                f"Error estimado: ±{error:.2e}"
            ]
            
            return {
                'success': True,
                'result': float(result),
                'error_estimate': float(error),
                'method': 'Numérico (Gauss-Kronrod)',
                'steps': steps,
                'execution_time': time.time() - start_time,
                'coordinate_system': coord_system,
                'jacobian': str(jacobian)
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Error en resolución numérica: {str(e)}', 'steps': []}
    
    def solve_triple_integral(self, function: str, limits: Dict, coord_system: str = 'cartesian') -> Dict[str, Any]:
        """Método principal para resolver integrales triples"""
        try:
            # Parsear función
            func_expr = self.parse_function(function)
            
            # Intentar resolución simbólica primero
            symbolic_result = self.solve_symbolic(func_expr, limits, coord_system)
            
            if symbolic_result['success']:
                return symbolic_result
            
            # Si falla simbólico, usar numérico
            print(f"Resolución simbólica falló, usando método numérico...")
            numerical_result = self.solve_numerical(func_expr, limits, coord_system)
            
            if numerical_result['success']:
                # Combinar información de ambos métodos
                numerical_result['symbolic_attempt'] = symbolic_result.get('error', 'No disponible')
                return numerical_result
            
            return {'success': False, 'error': 'Ambos métodos fallaron', 'steps': []}
            
        except Exception as e:
            return {'success': False, 'error': f'Error general: {str(e)}', 'steps': []}

# Instancia global del solver
solver = AdvancedIntegralSolver()

@app.route('/health', methods=['GET'])
def health_check():
    """Verificar estado del servicio"""
    return jsonify({
        'status': 'OK',
        'service': 'INTEGRA Python Solver',
        'version': '2.0',
        'capabilities': ['symbolic', 'numerical', 'all_coordinates']
    })

@app.route('/solve', methods=['POST'])
def solve_integral():
    """Endpoint principal para resolver integrales"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No se recibieron datos'}), 400
        
        # Validar parámetros requeridos
        required_fields = ['function', 'limits']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Campo requerido: {field}'}), 400
        
        function = data['function']
        limits = data['limits']
        coord_system = data.get('coordinate_system', 'cartesian')
        
        # Validar límites
        for coord in ['x', 'y', 'z']:
            if coord not in limits or len(limits[coord]) != 2:
                return jsonify({'success': False, 'error': f'Límites inválidos para {coord}'}), 400
        
        # Resolver integral
        result = solver.solve_triple_integral(function, limits, coord_system)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error del servidor: {str(e)}',
            'traceback': traceback.format_exc()
        }), 500

@app.route('/validate', methods=['POST'])
def validate_function():
    """Validar sintaxis de función matemática"""
    try:
        data = request.get_json()
        function = data.get('function', '')
        
        if not function:
            return jsonify({'valid': False, 'error': 'Función vacía'})
        
        try:
            expr = solver.parse_function(function)
            return jsonify({
                'valid': True,
                'parsed': str(expr),
                'latex': latex(expr),
                'variables': [str(var) for var in expr.free_symbols]
            })
        except Exception as e:
            return jsonify({'valid': False, 'error': str(e)})
            
    except Exception as e:
        return jsonify({'valid': False, 'error': f'Error del servidor: {str(e)}'}), 500

@app.route('/generate-plot-data', methods=['POST'])
def generate_plot_data():
    """Generar datos optimizados para visualización 3D"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No se recibieron datos'}), 400
        
        function = data['function']
        limits = data['limits']
        coord_system = data.get('coordinate_system', 'cartesian')
        resolution = data.get('resolution', 30)
        
        # Parsear función
        func_expr = solver.parse_function(function)
        
        # Transformar coordenadas
        transformed_expr, jacobian = solver.coordinate_transform(func_expr, coord_system)
        
        # Generar datos para visualización
        plot_data = generate_visualization_data(
            transformed_expr, 
            limits, 
            coord_system, 
            resolution
        )
        
        return jsonify({
            'success': True,
            'plot_data': plot_data,
            'function_info': {
                'original': str(func_expr),
                'transformed': str(transformed_expr),
                'jacobian': str(jacobian),
                'latex': latex(func_expr),
                'coordinate_system': coord_system
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error generando datos de visualización: {str(e)}',
            'traceback': traceback.format_exc()
        }), 500

def generate_visualization_data(func_expr, limits, coord_system, resolution):
    """Generar datos optimizados para gráficas 3D"""
    try:
        # Crear función lambda para evaluación rápida
        if coord_system == 'cartesian':
            func_lambda = sp.lambdify((x, y, z), func_expr, 'numpy')
            var_names = ['x', 'y', 'z']
        elif coord_system == 'cylindrical':
            func_lambda = sp.lambdify((r, theta, z), func_expr, 'numpy')
            var_names = ['r', 'theta', 'z']
        else:  # spherical
            func_lambda = sp.lambdify((rho, theta, phi), func_expr, 'numpy')
            var_names = ['rho', 'theta', 'phi']
        
        # Generar malla de puntos
        x_vals = np.linspace(limits['x'][0], limits['x'][1], resolution)
        y_vals = np.linspace(limits['y'][0], limits['y'][1], resolution)
        z_vals = np.linspace(limits['z'][0], limits['z'][1], resolution)
        
        # Datos para superficie de la función
        surface_data = []
        
        # Generar planos de corte en diferentes valores de Z
        num_planes = min(8, resolution // 4)
        z_planes = np.linspace(limits['z'][0], limits['z'][1], num_planes)
        
        for z_val in z_planes:
            X, Y = np.meshgrid(x_vals, y_vals)
            Z = np.full_like(X, z_val)
            
            # Evaluar función
            try:
                if coord_system == 'cartesian':
                    F = func_lambda(X, Y, Z)
                elif coord_system == 'cylindrical':
                    # Convertir a cilíndricas: r, theta, z
                    R = X  # r está en x
                    THETA = Y  # theta está en y
                    F = func_lambda(R, THETA, Z)
                else:  # spherical
                    # Convertir a esféricas: rho, theta, phi
                    RHO = X  # rho está en x
                    THETA = Y  # theta está en y
                    PHI = Z  # phi está en z
                    F = func_lambda(RHO, THETA, PHI)
                
                # Filtrar valores finitos
                mask = np.isfinite(F)
                
                surface_data.append({
                    'type': 'surface_slice',
                    'z_level': float(z_val),
                    'x': X[mask].flatten().tolist(),
                    'y': Y[mask].flatten().tolist(),
                    'z': Z[mask].flatten().tolist(),
                    'values': F[mask].flatten().tolist(),
                    'coordinate_system': coord_system
                })
                
            except Exception as e:
                print(f"Error evaluando plano z={z_val}: {e}")
                continue
        
        # Generar puntos de muestra aleatorios
        num_samples = min(500, resolution * 5)
        sample_points = []
        
        for _ in range(num_samples):
            x_sample = np.random.uniform(limits['x'][0], limits['x'][1])
            y_sample = np.random.uniform(limits['y'][0], limits['y'][1])
            z_sample = np.random.uniform(limits['z'][0], limits['z'][1])
            
            try:
                if coord_system == 'cartesian':
                    f_val = func_lambda(x_sample, y_sample, z_sample)
                elif coord_system == 'cylindrical':
                    f_val = func_lambda(x_sample, y_sample, z_sample)
                else:  # spherical
                    f_val = func_lambda(x_sample, y_sample, z_sample)
                
                if np.isfinite(f_val):
                    sample_points.append({
                        'x': float(x_sample),
                        'y': float(y_sample),
                        'z': float(z_sample),
                        'value': float(f_val)
                    })
                    
            except Exception:
                continue
        
        # Generar wireframe de la región de integración
        region_wireframe = generate_region_wireframe(limits, coord_system)
        
        return {
            'surface_data': surface_data,
            'sample_points': sample_points,
            'region_wireframe': region_wireframe,
            'limits': limits,
            'resolution': resolution,
            'coordinate_system': coord_system,
            'statistics': {
                'num_surface_slices': len(surface_data),
                'num_sample_points': len(sample_points),
                'function_range': {
                    'min': float(min([p['value'] for p in sample_points])) if sample_points else 0,
                    'max': float(max([p['value'] for p in sample_points])) if sample_points else 0
                }
            }
        }
        
    except Exception as e:
        raise Exception(f"Error en generate_visualization_data: {str(e)}")

def generate_region_wireframe(limits, coord_system):
    """Generar wireframe de la región de integración"""
    x_min, x_max = limits['x']
    y_min, y_max = limits['y'] 
    z_min, z_max = limits['z']
    
    # Vértices del paralelepípedo
    vertices = [
        [x_min, y_min, z_min], [x_max, y_min, z_min],
        [x_max, y_max, z_min], [x_min, y_max, z_min],
        [x_min, y_min, z_max], [x_max, y_min, z_max],
        [x_max, y_max, z_max], [x_min, y_max, z_max]
    ]
    
    # Aristas del paralelepípedo
    edges = [
        [0,1], [1,2], [2,3], [3,0],  # Base inferior
        [4,5], [5,6], [6,7], [7,4],  # Base superior  
        [0,4], [1,5], [2,6], [3,7]   # Aristas verticales
    ]
    
    wireframe_lines = []
    for edge in edges:
        start_vertex = vertices[edge[0]]
        end_vertex = vertices[edge[1]]
        wireframe_lines.append({
            'start': start_vertex,
            'end': end_vertex
        })
    
    return {
        'lines': wireframe_lines,
        'vertices': vertices,
        'coordinate_system': coord_system
    }

@app.route('/generate-plotly-3d', methods=['POST'])
def generate_plotly_3d():
    """Generar gráfica 3D completa usando Plotly Python"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No se recibieron datos'}), 400
        
        function = data['function']
        limits = data['limits']
        coord_system = data.get('coordinate_system', 'cartesian')
        resolution = data.get('resolution', 30)
        plot_type = data.get('plot_type', 'surface')  # surface, scatter, mesh
        
        # Parsear función
        func_expr = solver.parse_function(function)
        
        # Transformar coordenadas
        transformed_expr, jacobian = solver.coordinate_transform(func_expr, coord_system)
        
        # Generar gráfica 3D con Plotly
        plotly_data = create_plotly_3d_visualization(
            transformed_expr, 
            limits, 
            coord_system, 
            resolution,
            plot_type,
            function
        )
        
        return jsonify({
            'success': True,
            'plotly_data': plotly_data,
            'function_info': {
                'original': str(func_expr),
                'transformed': str(transformed_expr),
                'jacobian': str(jacobian),
                'latex': latex(func_expr),
                'coordinate_system': coord_system
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error generando gráfica Plotly 3D: {str(e)}',
            'traceback': traceback.format_exc()
        }), 500

def create_plotly_3d_visualization(func_expr, limits, coord_system, resolution, plot_type, original_function):
    """Crear visualización 3D completa con Plotly"""
    try:
        # Crear función lambda para evaluación
        if coord_system == 'cartesian':
            func_lambda = sp.lambdify((x, y, z), func_expr, 'numpy')
        elif coord_system == 'cylindrical':
            func_lambda = sp.lambdify((r, theta, z), func_expr, 'numpy')
        else:  # spherical
            func_lambda = sp.lambdify((rho, theta, phi), func_expr, 'numpy')
        
        # Generar datos para la gráfica
        traces = []
        
        # 1. Superficie de la función (si es posible)
        if plot_type in ['surface', 'all']:
            surface_traces = create_function_surface(func_lambda, limits, coord_system, resolution)
            traces.extend(surface_traces)
        
        # 2. Región de integración (wireframe)
        if plot_type in ['wireframe', 'all']:
            wireframe_trace = create_integration_region_plotly(limits, coord_system)
            traces.append(wireframe_trace)
        
        # 3. Puntos de muestra con colores
        if plot_type in ['scatter', 'all']:
            scatter_trace = create_sample_points_plotly(func_lambda, limits, coord_system, resolution)
            traces.append(scatter_trace)
        
        # 4. Planos de corte
        if plot_type in ['slices', 'all']:
            slice_traces = create_function_slices_plotly(func_lambda, limits, coord_system, resolution)
            traces.extend(slice_traces)
        
        # Configurar layout
        layout = create_plotly_layout(limits, coord_system, original_function)
        
        # Configurar opciones
        config = {
            'displayModeBar': True,
            'displaylogo': False,
            'modeBarButtonsToRemove': ['pan2d', 'lasso2d', 'select2d'],
            'responsive': True,
            'toImageButtonOptions': {
                'format': 'png',
                'filename': f'integral_3d_{coord_system}',
                'height': 800,
                'width': 1200,
                'scale': 2
            }
        }
        
        return {
            'data': [trace for trace in traces if trace is not None],
            'layout': layout,
            'config': config,
            'metadata': {
                'coordinate_system': coord_system,
                'resolution': resolution,
                'plot_type': plot_type,
                'num_traces': len([t for t in traces if t is not None])
            }
        }
        
    except Exception as e:
        raise Exception(f"Error en create_plotly_3d_visualization: {str(e)}")

def create_function_surface(func_lambda, limits, coord_system, resolution):
    """Crear superficie 3D de la función"""
    traces = []
    
    try:
        # Generar malla de puntos
        if coord_system == 'cartesian':
            x_vals = np.linspace(limits['x'][0], limits['x'][1], resolution)
            y_vals = np.linspace(limits['y'][0], limits['y'][1], resolution)
            X, Y = np.meshgrid(x_vals, y_vals)
            
            # Crear superficies en diferentes valores de Z
            z_levels = np.linspace(limits['z'][0], limits['z'][1], 5)
            
            for i, z_val in enumerate(z_levels):
                Z = np.full_like(X, z_val)
                try:
                    F = func_lambda(X, Y, Z)
                    # Filtrar valores finitos
                    mask = np.isfinite(F)
                    
                    if np.any(mask):
                        trace = {
                            'type': 'surface',
                            'x': X,
                            'y': Y, 
                            'z': Z,
                            'surfacecolor': F,
                            'colorscale': 'Viridis',
                            'opacity': 0.7,
                            'name': f'f(x,y,{z_val:.2f})',
                            'showscale': i == 0,
                            'colorbar': {
                                'title': 'f(x,y,z)',
                                'titleside': 'right'
                            } if i == 0 else None
                        }
                        traces.append(trace)
                except Exception:
                    continue
                    
        elif coord_system == 'cylindrical':
            # Para cilíndricas: r, theta, z
            r_vals = np.linspace(limits['x'][0], limits['x'][1], resolution)
            theta_vals = np.linspace(limits['y'][0], limits['y'][1], resolution)
            R, THETA = np.meshgrid(r_vals, theta_vals)
            
            z_levels = np.linspace(limits['z'][0], limits['z'][1], 5)
            
            for i, z_val in enumerate(z_levels):
                Z = np.full_like(R, z_val)
                try:
                    F = func_lambda(R, THETA, Z)
                    
                    # Convertir a coordenadas cartesianas para visualización
                    X = R * np.cos(THETA)
                    Y = R * np.sin(THETA)
                    
                    mask = np.isfinite(F)
                    
                    if np.any(mask):
                        trace = {
                            'type': 'surface',
                            'x': X,
                            'y': Y,
                            'z': Z,
                            'surfacecolor': F,
                            'colorscale': 'Plasma',
                            'opacity': 0.7,
                            'name': f'f(r,θ,{z_val:.2f})',
                            'showscale': i == 0
                        }
                        traces.append(trace)
                except Exception:
                    continue
                    
        else:  # spherical
            # Para esféricas: rho, theta, phi
            rho_vals = np.linspace(limits['x'][0], limits['x'][1], resolution)
            theta_vals = np.linspace(limits['y'][0], limits['y'][1], resolution)
            RHO, THETA = np.meshgrid(rho_vals, theta_vals)
            
            phi_levels = np.linspace(limits['z'][0], limits['z'][1], 5)
            
            for i, phi_val in enumerate(phi_levels):
                PHI = np.full_like(RHO, phi_val)
                try:
                    F = func_lambda(RHO, THETA, PHI)
                    
                    # Convertir a coordenadas cartesianas
                    X = RHO * np.sin(PHI) * np.cos(THETA)
                    Y = RHO * np.sin(PHI) * np.sin(THETA)
                    Z = RHO * np.cos(PHI)
                    
                    mask = np.isfinite(F)
                    
                    if np.any(mask):
                        trace = {
                            'type': 'surface',
                            'x': X,
                            'y': Y,
                            'z': Z,
                            'surfacecolor': F,
                            'colorscale': 'Cividis',
                            'opacity': 0.7,
                            'name': f'f(ρ,θ,{phi_val:.2f})',
                            'showscale': i == 0
                        }
                        traces.append(trace)
                except Exception:
                    continue
                    
    except Exception as e:
        print(f"Error creando superficie: {e}")
    
    return traces

def create_integration_region_plotly(limits, coord_system):
    """Crear wireframe de la región de integración"""
    try:
        x_min, x_max = limits['x']
        y_min, y_max = limits['y']
        z_min, z_max = limits['z']
        
        # Vértices del paralelepípedo
        vertices = np.array([
            [x_min, y_min, z_min], [x_max, y_min, z_min],
            [x_max, y_max, z_min], [x_min, y_max, z_min],
            [x_min, y_min, z_max], [x_max, y_min, z_max],
            [x_max, y_max, z_max], [x_min, y_max, z_max]
        ])
        
        # Aristas del paralelepípedo
        edges = [
            [0,1], [1,2], [2,3], [3,0],  # Base inferior
            [4,5], [5,6], [6,7], [7,4],  # Base superior
            [0,4], [1,5], [2,6], [3,7]   # Aristas verticales
        ]
        
        # Crear líneas para el wireframe
        x_lines, y_lines, z_lines = [], [], []
        
        for edge in edges:
            start, end = vertices[edge[0]], vertices[edge[1]]
            x_lines.extend([start[0], end[0], None])
            y_lines.extend([start[1], end[1], None])
            z_lines.extend([start[2], end[2], None])
        
        return {
            'type': 'scatter3d',
            'mode': 'lines',
            'x': x_lines,
            'y': y_lines,
            'z': z_lines,
            'line': {
                'color': 'rgb(16, 185, 129)',
                'width': 6
            },
            'name': 'Región de Integración',
            'showlegend': True,
            'hoverinfo': 'name'
        }
        
    except Exception as e:
        print(f"Error creando región: {e}")
        return None

def create_sample_points_plotly(func_lambda, limits, coord_system, resolution):
    """Crear puntos de muestra con colores"""
    try:
        num_samples = min(1000, resolution * 10)
        
        # Generar puntos aleatorios
        if coord_system == 'cartesian':
            x_samples = np.random.uniform(limits['x'][0], limits['x'][1], num_samples)
            y_samples = np.random.uniform(limits['y'][0], limits['y'][1], num_samples)
            z_samples = np.random.uniform(limits['z'][0], limits['z'][1], num_samples)
            
            f_values = func_lambda(x_samples, y_samples, z_samples)
            
        elif coord_system == 'cylindrical':
            r_samples = np.random.uniform(limits['x'][0], limits['x'][1], num_samples)
            theta_samples = np.random.uniform(limits['y'][0], limits['y'][1], num_samples)
            z_samples = np.random.uniform(limits['z'][0], limits['z'][1], num_samples)
            
            f_values = func_lambda(r_samples, theta_samples, z_samples)
            
            # Convertir a cartesianas para visualización
            x_samples = r_samples * np.cos(theta_samples)
            y_samples = r_samples * np.sin(theta_samples)
            
        else:  # spherical
            rho_samples = np.random.uniform(limits['x'][0], limits['x'][1], num_samples)
            theta_samples = np.random.uniform(limits['y'][0], limits['y'][1], num_samples)
            phi_samples = np.random.uniform(limits['z'][0], limits['z'][1], num_samples)
            
            f_values = func_lambda(rho_samples, theta_samples, phi_samples)
            
            # Convertir a cartesianas
            x_samples = rho_samples * np.sin(phi_samples) * np.cos(theta_samples)
            y_samples = rho_samples * np.sin(phi_samples) * np.sin(theta_samples)
            z_samples = rho_samples * np.cos(phi_samples)
        
        # Filtrar valores finitos
        mask = np.isfinite(f_values)
        
        if not np.any(mask):
            return None
            
        return {
            'type': 'scatter3d',
            'mode': 'markers',
            'x': x_samples[mask],
            'y': y_samples[mask],
            'z': z_samples[mask],
            'marker': {
                'size': 4,
                'color': f_values[mask],
                'colorscale': 'RdYlBu',
                'opacity': 0.8,
                'colorbar': {
                    'title': 'Valor de f',
                    'titleside': 'right',
                    'x': 1.1
                },
                'line': {
                    'color': 'rgb(0,0,0)',
                    'width': 1
                }
            },
            'name': f'Puntos Muestra ({coord_system})',
            'showlegend': True,
            'hovertemplate': 'f = %{marker.color:.3f}<br>x = %{x:.3f}<br>y = %{y:.3f}<br>z = %{z:.3f}<extra></extra>'
        }
        
    except Exception as e:
        print(f"Error creando puntos de muestra: {e}")
        return None

def create_function_slices_plotly(func_lambda, limits, coord_system, resolution):
    """Crear planos de corte de la función"""
    traces = []
    
    try:
        # Crear planos de corte en Z
        z_levels = np.linspace(limits['z'][0], limits['z'][1], 3)
        
        for z_val in z_levels:
            if coord_system == 'cartesian':
                x_vals = np.linspace(limits['x'][0], limits['x'][1], resolution//2)
                y_vals = np.linspace(limits['y'][0], limits['y'][1], resolution//2)
                X, Y = np.meshgrid(x_vals, y_vals)
                Z = np.full_like(X, z_val)
                
                F = func_lambda(X, Y, Z)
                mask = np.isfinite(F)
                
                if np.any(mask):
                    trace = {
                        'type': 'scatter3d',
                        'mode': 'markers',
                        'x': X[mask].flatten(),
                        'y': Y[mask].flatten(),
                        'z': Z[mask].flatten(),
                        'marker': {
                            'size': 3,
                            'color': F[mask].flatten(),
                            'colorscale': 'Turbo',
                            'opacity': 0.6,
                            'showscale': False
                        },
                        'name': f'Corte z={z_val:.2f}',
                        'showlegend': False,
                        'hoverinfo': 'skip'
                    }
                    traces.append(trace)
                    
    except Exception as e:
        print(f"Error creando planos de corte: {e}")
    
    return traces

def create_plotly_layout(limits, coord_system, original_function):
    """Crear layout para la gráfica Plotly"""
    
    # Títulos de ejes según el sistema de coordenadas
    if coord_system == 'cartesian':
        x_title, y_title, z_title = 'X', 'Y', 'Z'
    elif coord_system == 'cylindrical':
        x_title, y_title, z_title = 'X (r·cos θ)', 'Y (r·sin θ)', 'Z'
    else:  # spherical
        x_title, y_title, z_title = 'X (ρ·sin φ·cos θ)', 'Y (ρ·sin φ·sin θ)', 'Z (ρ·cos φ)'
    
    return {
        'title': {
            'text': f'Integral Triple: ∫∫∫ {original_function} dV ({coord_system})',
            'x': 0.5,
            'font': {'size': 18, 'color': 'rgb(50, 50, 50)'}
        },
        'scene': {
            'xaxis': {
                'title': x_title,
                'range': [limits['x'][0] - 0.5, limits['x'][1] + 0.5],
                'gridcolor': 'rgb(200, 200, 200)',
                'showbackground': True,
                'backgroundcolor': 'rgb(245, 245, 245)'
            },
            'yaxis': {
                'title': y_title,
                'range': [limits['y'][0] - 0.5, limits['y'][1] + 0.5],
                'gridcolor': 'rgb(200, 200, 200)',
                'showbackground': True,
                'backgroundcolor': 'rgb(245, 245, 245)'
            },
            'zaxis': {
                'title': z_title,
                'range': [limits['z'][0] - 0.5, limits['z'][1] + 0.5],
                'gridcolor': 'rgb(200, 200, 200)',
                'showbackground': True,
                'backgroundcolor': 'rgb(245, 245, 245)'
            },
            'camera': {
                'eye': {'x': 1.8, 'y': 1.8, 'z': 1.8},
                'center': {'x': 0, 'y': 0, 'z': 0}
            },
            'aspectmode': 'cube'
        },
        'paper_bgcolor': 'rgb(255, 255, 255)',
        'plot_bgcolor': 'rgb(255, 255, 255)',
        'font': {'color': 'rgb(50, 50, 50)', 'size': 12},
        'margin': {'l': 0, 'r': 0, 't': 50, 'b': 0},
        'legend': {
            'x': 0,
            'y': 1,
            'bgcolor': 'rgba(255, 255, 255, 0.8)',
            'bordercolor': 'rgb(0, 0, 0)',
            'borderwidth': 1
        }
    }

if __name__ == '__main__':
    print("🐍 INTEGRA Python Solver v2.0 iniciando...")
    print("📊 Capacidades: Resolución simbólica y numérica de integrales triples")
    print("🔧 Sistemas soportados: Cartesianas, Cilíndricas, Esféricas")
    app.run(host='0.0.0.0', port=5002, debug=False)
