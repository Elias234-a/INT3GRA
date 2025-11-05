// Tipos principales para INTEGRA - Solucionador Inteligente de Integrales Triples

export interface IntegralFunction {
  expression: string;
  variables: string[];
  latex?: string;
}

export interface IntegralLimits {
  x: { min: string; max: string };
  y: { min: string; max: string };
  z: { min: string; max: string };
}

export interface CoordinateSystem {
  type: 'cartesian' | 'cylindrical' | 'spherical' | 'custom';
  variables: string[];
  jacobian?: string;
  transformations?: string[];
}

export interface IntegralProblem {
  id: string;
  function: IntegralFunction;
  limits: IntegralLimits;
  coordinateSystem: CoordinateSystem;
  region?: RegionDescription;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'competition';
  category: string;
  realWorldContext?: string;
}

export interface RegionDescription {
  type: 'rectangular' | 'cylindrical' | 'spherical' | 'arbitrary';
  description: string;
  inequalities: string[];
  visualization3D?: any;
}

export interface SolutionStep {
  id: number;
  title: string;
  description: string;
  mathematicalExpression: string;
  latex: string;
  explanation: string;
  visualization?: any;
  hints?: string[];
  commonMistakes?: string[];
}

export interface IntegralSolution {
  problem: IntegralProblem;
  method: 'analytical' | 'numerical' | 'hybrid';
  steps: SolutionStep[];
  finalResult: {
    exact?: string;
    numerical: number;
    units?: string;
    interpretation: string;
  };
  alternativeMethods?: string[];
  complexity: number; // 1-5 stars
  executionTime: number;
}

export interface AIExplanation {
  type: 'rigorous' | 'intuitive' | 'conceptual' | 'practical' | 'comparative';
  content: string;
  visualizations?: any[];
  interactiveElements?: any[];
  relatedConcepts?: string[];
}

export interface ExerciseBank {
  level: 'beginner' | 'intermediate' | 'advanced' | 'competition';
  problems: IntegralProblem[];
  count: number;
  characteristics: string[];
  examples: string[];
}

export interface UserProgress {
  userId: string;
  currentLevel: string;
  problemsSolved: number;
  badges: Badge[];
  streakDays: number;
  totalTime: number;
  favoriteTopics: string[];
  weakAreas: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CaseStudy {
  id: string;
  title: string;
  field: string;
  difficulty: 'easy' | 'medium' | 'hard';
  realWorldContext: string;
  physicalQuantity: string;
  equation: string;
  region: string;
  suggestedCoordinates: string[];
  solution: IntegralSolution;
  numericalResult: number;
  units: string;
  interpretation: string;
  futureApplications: string[];
  industries: string[];
}

export interface TheoreticalConcept {
  id: string;
  title: string;
  definition: string;
  intuition: string;
  formula: string;
  example: string;
  visualization?: any;
  exercises: IntegralProblem[];
  commonMistakes: string[];
  historicalContext: string;
  relatedConcepts: string[];
}

export interface VisualizationConfig {
  engine: 'threejs' | 'babylonjs';
  quality: 'high' | 'medium' | 'low';
  showGrid: boolean;
  showAxes: boolean;
  showRegion: boolean;
  showFunction: boolean;
  animateIntegration: boolean;
  colorScheme: string;
}

export interface JacobianCalculation {
  oldVariables: string[];
  newVariables: string[];
  transformations: string[];
  partialDerivatives: number[][];
  determinant: string;
  numericValue?: number;
  simplificationSteps: string[];
}

// Enums para mejor type safety
export enum IntegralType {
  CARTESIAN_RECTANGULAR = 'cartesian_rectangular',
  CARTESIAN_ARBITRARY = 'cartesian_arbitrary',
  CYLINDRICAL = 'cylindrical',
  SPHERICAL = 'spherical',
  CHANGE_OF_VARIABLES = 'change_of_variables',
  WEIGHTED = 'weighted'
}

export enum ResolutionMethod {
  ANALYTICAL = 'analytical',
  NUMERICAL = 'numerical',
  HYBRID = 'hybrid'
}

export enum ExplanationType {
  RIGOROUS = 'rigorous',
  INTUITIVE = 'intuitive',
  CONCEPTUAL = 'conceptual',
  PRACTICAL = 'practical',
  COMPARATIVE = 'comparative'
}