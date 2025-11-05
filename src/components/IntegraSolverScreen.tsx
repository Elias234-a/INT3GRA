import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calculator,
    Play,
    Pause,
    RotateCcw,
    BookOpen,
    Lightbulb,
    Eye
} from 'lucide-react';
import MathInput from './MathInput';
import Visualizer3D from './Visualizer3D';
import { IntegralSolver } from '../services/IntegralSolver';

interface IntegraSolverScreenProps {
    onNavigate: (screen: string) => void;
}

export const IntegraSolverScreen: React.FC<IntegraSolverScreenProps> = ({ onNavigate }) => {
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState<any>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showVisualization, setShowVisualization] = useState(false);
    const [steps, setSteps] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleSolve = async () => {
        if (!expression.trim()) return;

        setIsCalculating(true);
        try {
            const solver = new IntegralSolver();

            // Crear un problema de integral básico
            const problem = {
                id: Date.now().toString(),
                function: {
                    expression: expression,
                    variables: ['x', 'y', 'z']
                },
                limits: {
                    x: { min: '0', max: '1' },
                    y: { min: '0', max: '1' },
                    z: { min: '0', max: '1' }
                },
                coordinateSystem: {
                    type: 'cartesian' as const,
                    variables: ['x', 'y', 'z']
                },
                difficulty: 'intermediate' as const,
                category: 'basic'
            };

            const solution = await solver.solve(problem);
            setResult(solution);
            setSteps(solution.steps.map(step => step.description));
            setCurrentStep(0);
        } catch (error) {
            console.error('Error solving integral:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    const handleStepAnimation = () => {
        if (steps.length === 0) return;

        setIsAnimating(true);
        const interval = setInterval(() => {
            setCurrentStep((prev: number) => {
                if (prev >= steps.length - 1) {
                    clearInterval(interval);
                    setIsAnimating(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 1500);
    };

    const resetSolution = () => {
        setResult(null);
        setSteps([]);
        setCurrentStep(0);
        setIsAnimating(false);
        setShowVisualization(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center space-x-3">
                        <Calculator className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-800">Integral Solver</h1>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowVisualization(!showVisualization)}
                            className={`p-2 rounded-lg transition-colors ${showVisualization
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onNavigate('ai-tutor')}
                            className="p-2 bg-white rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <Lightbulb className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter Integral</h2>
                            <MathInput
                                value={expression}
                                onChange={setExpression}
                                placeholder="e.g., x^2 + 2*x + 1"
                                colors={{
                                    bg: '#ffffff',
                                    text: '#1f2937',
                                    border: '#d1d5db',
                                    hover: '#f9fafb',
                                    accent1: '#6366f1',
                                    accent2: '#4f46e5',
                                    accent3: '#7c3aed',
                                    accent4: '#059669'
                                }}
                            />

                            <div className="flex space-x-3 mt-4">
                                <button
                                    onClick={handleSolve}
                                    disabled={isCalculating || !expression.trim()}
                                    className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Calculator className="w-5 h-5" />
                                    <span>{isCalculating ? 'Solving...' : 'Solve'}</span>
                                </button>

                                <button
                                    onClick={resetSolution}
                                    className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Solution Steps */}
                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-xl shadow-lg p-6"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-gray-800">Solution</h3>
                                        {steps.length > 0 && (
                                            <button
                                                onClick={handleStepAnimation}
                                                disabled={isAnimating}
                                                className="flex items-center space-x-2 px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                                            >
                                                {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                <span>{isAnimating ? 'Animating' : 'Animate Steps'}</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                            <div className="text-lg font-mono text-green-800">
                                                ∫ {expression} dx = {result.solution}
                                            </div>
                                        </div>

                                        {steps.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-gray-700">Step-by-step solution:</h4>
                                                {steps.map((step: string, index: number) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0.3 }}
                                                        animate={{
                                                            opacity: index <= currentStep ? 1 : 0.3,
                                                            scale: index === currentStep && isAnimating ? 1.02 : 1
                                                        }}
                                                        className={`p-3 rounded-lg border ${index <= currentStep
                                                            ? 'bg-blue-50 border-blue-200'
                                                            : 'bg-gray-50 border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center">
                                                                {index + 1}
                                                            </span>
                                                            <div className="font-mono text-sm text-gray-700">{step}</div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Visualization Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <AnimatePresence>
                            {showVisualization && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-xl shadow-lg p-6"
                                >
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">3D Visualization</h3>
                                    <div className="h-96 bg-gray-50 rounded-lg">
                                        <Visualizer3D
                                            functionExpression={expression}
                                            colors={{
                                                bg: '#ffffff',
                                                text: '#1f2937',
                                                border: '#d1d5db',
                                                hover: '#f9fafb',
                                                accent1: '#6366f1',
                                                accent2: '#4f46e5',
                                                accent3: '#7c3aed',
                                                accent4: '#059669'
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => onNavigate('case-studies')}
                                    className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex flex-col items-center space-y-2"
                                >
                                    <BookOpen className="w-6 h-6" />
                                    <span className="text-sm font-medium">Case Studies</span>
                                </button>

                                <button
                                    onClick={() => onNavigate('ai-tutor')}
                                    className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex flex-col items-center space-y-2"
                                >
                                    <Lightbulb className="w-6 h-6" />
                                    <span className="text-sm font-medium">AI Tutor</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};