import { Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  steps: { label: string; description?: string }[];
}

export function WizardProgress({ currentStep, steps }: WizardProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
                    transition-all duration-200
                    ${isCompleted
                      ? 'bg-primary-600 text-white'
                      : isCurrent
                        ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600 ring-offset-2'
                        : 'bg-neutral-100 text-neutral-400'
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-neutral-900' : 'text-neutral-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-neutral-400 mt-0.5 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                    h-0.5 flex-1 mx-4 transition-colors duration-200
                    ${isCompleted ? 'bg-primary-600' : 'bg-neutral-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
