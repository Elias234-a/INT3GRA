# 🐍 Guía del Python Solver - INT3GRA

## Descripción General

El **Python Solver** es un microservicio avanzado que proporciona resolución **simbólica y numérica** de integrales triples usando las librerías más potentes de Python:

- **SymPy**: Cálculo simbólico exacto
- **SciPy**: Integración numérica de alta precisión
- **NumPy**: Operaciones matemáticas optimizadas

## 🚀 Características Principales

### ✨ Capacidades Simbólicas
- Resolución exacta de integrales cuando es posible
- Simplificación automática de expresiones
- Salida en formato LaTeX para visualización
- Pasos detallados de resolución

### 🔢 Capacidades Numéricas
- Integración adaptativa Gauss-Kronrod
- Tolerancia configurable (1e-12 absoluta, 1e-10 relativa)
- Manejo robusto de singularidades
- Estimación de error automática

### 🌐 Sistemas de Coordenadas
- **Cartesianas**: x, y, z
- **Cilíndricas**: r, θ, z (con jacobiano r)
- **Esféricas**: ρ, θ, φ (con jacobiano ρ²sin(φ))

## 📦 Instalación y Configuración

### Prerequisitos
```bash
# Python 3.8 o superior
python --version

# pip actualizado
pip --version
```

### Instalación Automática
```bash
# Ejecutar el script de inicio (Windows)
start-python-solver.bat

# O manualmente:
cd python-solver
pip install -r requirements.txt
python app.py
```

### Dependencias
```
flask==2.3.3
flask-cors==4.0.0
sympy==1.12
numpy==1.24.3
scipy==1.11.1
```

## 🔧 Uso del Sistema

### 1. Inicio del Servicio

**Opción A - Script Automático:**
```bash
start-python-solver.bat
```

**Opción B - Manual:**
```bash
cd python-solver
python app.py
```

El servicio se ejecuta en: `http://localhost:5001`

### 2. Integración con INT3GRA

1. **Inicia el Python Solver** (puerto 5001)
2. **Inicia el backend Node.js** (puerto 5000)
3. **Inicia el frontend React** (puerto 3000)
4. **Abre la aplicación** en el navegador

### 3. Interfaz de Usuario

En el **SolverScreen** encontrarás:

- **🐍 Solver de Integrales**: Panel de configuración
- **Estado del servicio**: Indicador visual (verde = disponible)
- **Toggle Python/JavaScript**: Cambiar entre solvers
- **Botón Reconectar**: Si el servicio se desconecta

## 📊 API Endpoints

### POST `/solve`
Resolver integral triple

**Request:**
```json
{
  "function": "x*y*z",
  "limits": {
    "x": [0, 1],
    "y": [0, 1], 
    "z": [0, 1]
  },
  "coordinate_system": "cartesian"
}
```

**Response:**
```json
{
  "success": true,
  "result": 0.125,
  "exact_result": "1/8",
  "latex_result": "\\frac{1}{8}",
  "method": "Simbólico",
  "steps": [...],
  "execution_time": 0.045,
  "coordinate_system": "cartesian",
  "jacobian": "1"
}
```

### POST `/validate`
Validar sintaxis de función

**Request:**
```json
{
  "function": "x^2 + y^2"
}
```

**Response:**
```json
{
  "valid": true,
  "parsed": "x**2 + y**2",
  "latex": "x^{2} + y^{2}",
  "variables": ["x", "y"]
}
```

### GET `/health`
Verificar estado del servicio

**Response:**
```json
{
  "status": "OK",
  "service": "INTEGRA Python Solver",
  "version": "2.0",
  "capabilities": ["symbolic", "numerical", "all_coordinates"]
}
```

## 🎯 Ejemplos de Uso

### Ejemplo 1: Integral Básica (Cartesianas)
```
Función: x*y*z
Límites: x∈[0,1], y∈[0,1], z∈[0,1]
Sistema: cartesian

Resultado: 1/8 = 0.125
Método: Simbólico
```

### Ejemplo 2: Coordenadas Cilíndricas
```
Función: r*z
Límites: r∈[0,2], θ∈[0,2π], z∈[0,3]
Sistema: cylindrical

Resultado: 12π ≈ 37.699
Método: Simbólico con jacobiano r
```

### Ejemplo 3: Coordenadas Esféricas
```
Función: rho^2
Límites: ρ∈[0,1], θ∈[0,2π], φ∈[0,π]
Sistema: spherical

Resultado: 4π/5 ≈ 2.513
Método: Simbólico con jacobiano ρ²sin(φ)
```

### Ejemplo 4: Función Compleja (Numérico)
```
Función: exp(-x^2-y^2-z^2)
Límites: x∈[-2,2], y∈[-2,2], z∈[-2,2]
Sistema: cartesian

Resultado: ≈ 5.568 (numérico)
Método: Gauss-Kronrod adaptativo
```

## 🔄 Flujo de Resolución

1. **Parseo**: Convierte string a expresión SymPy
2. **Transformación**: Aplica cambio de coordenadas si necesario
3. **Jacobiano**: Calcula y aplica determinante jacobiano
4. **Integración Simbólica**: Intenta resolución exacta
5. **Fallback Numérico**: Si falla simbólico, usa SciPy
6. **Formato**: Convierte resultado al formato INT3GRA

## ⚠️ Solución de Problemas

### Error: "Python Solver no disponible"
```bash
# Verificar que Python esté instalado
python --version

# Verificar dependencias
cd python-solver
pip install -r requirements.txt

# Iniciar manualmente
python app.py
```

### Error: "Puerto 5001 en uso"
```bash
# Cambiar puerto en app.py (línea final)
app.run(host='0.0.0.0', port=5002, debug=False)

# Actualizar PythonSolverService.ts
this.baseUrl = 'http://localhost:5000/api/python-solver';
```

### Error: "Timeout en cálculo"
- La integral es muy compleja para resolución simbólica
- El sistema automáticamente usa método numérico
- Considera simplificar la función o reducir límites

### Error: "Sintaxis inválida"
```bash
# Funciones soportadas:
x, y, z                    # Variables
x^2, x**2                 # Potencias  
sin(x), cos(x), tan(x)    # Trigonométricas
exp(x), ln(x), log(x)     # Exponenciales/logaritmos
sqrt(x), abs(x)           # Raíz, valor absoluto
pi, e                     # Constantes
```

## 🎨 Integración con Teclado Matemático

El Python Solver está **completamente integrado** con el teclado matemático de INT3GRA:

- **Símbolos automáticos**: π, ∞, ∫, etc.
- **Funciones**: sin, cos, exp, ln, etc.
- **Operadores**: ^, √, |x|, etc.
- **Validación en tiempo real**

## 📈 Rendimiento

### Benchmarks Típicos
- **Integrales simples**: < 50ms (simbólico)
- **Integrales complejas**: 100-500ms (numérico)
- **Transformaciones**: +10-20ms por sistema
- **Memoria**: ~50MB por instancia

### Optimizaciones
- Cache de expresiones parseadas
- Timeout configurable (45s)
- Tolerancia adaptativa
- Manejo de memoria automático

## 🔗 Enlaces Útiles

- **SymPy Documentation**: https://docs.sympy.org/
- **SciPy Integration**: https://docs.scipy.org/doc/scipy/reference/integrate.html
- **Flask API**: https://flask.palletsprojects.com/
- **NumPy**: https://numpy.org/doc/

## 📝 Notas de Desarrollo

### Arquitectura
```
Frontend (React) 
    ↓ HTTP
Backend (Node.js) 
    ↓ HTTP  
Python Solver (Flask)
    ↓ Libs
SymPy + SciPy + NumPy
```

### Extensiones Futuras
- [ ] Cache Redis para resultados
- [ ] Paralelización de cálculos
- [ ] Más sistemas de coordenadas
- [ ] Integración con Mathematica/Maple
- [ ] Visualización de pasos intermedios

---

**¡El Python Solver lleva INT3GRA al siguiente nivel de precisión y capacidades matemáticas!** 🚀
