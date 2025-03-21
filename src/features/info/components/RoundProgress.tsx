import { tv } from "tailwind-variants";
import { createComponent } from "~/components/ui";
import { cn } from "~/utils/classNames";
import { formatDate } from "~/utils/time";

export function RoundProgress({
  steps = [],
}: {
  steps: { label: string; date: Date }[];
}) {
  const { progress, currentStepIndex } = calculateProgress(steps);

  return (
    <div className="relative my-2">
      <ProgressWrapper
        className={cn({
          ["w-full"]: currentStepIndex === steps.length,
        })}
      >
        <ProgressBar style={{ width: `${progress * 100}%` }} />
      </ProgressWrapper>
      <div className="rounded-xl border border-primary-600 md:flex">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "z-10 flex-1  rounded-xl border-l border-primary-600 p-4 transition-opacity",
              {
                ["opacity-50"]: currentStepIndex <= i,
              },
            )}
          >
            <h3 className="font-semibold">{step.label}</h3>
            <div>{formatDate(step.date)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ProgressWrapper = createComponent(
  "div",
  tv({
    base: "absolute hidden h-full w-4/5 overflow-hidden rounded-xl border-y border-primary-600 md:block",
  }),
);
const ProgressBar = createComponent(
  "div",
  tv({
    base: "h-full  bg-gradient-to-r from-[#FFFFFF] to-primary-600 transition-all",
  }),
);

function calculateProgress(steps: { label: string; date: Date }[]) {
  const now = Number(new Date());

  let currentStepIndex = steps.findIndex(
    (step, index) =>
      now < Number(step.date) &&
      (index === 0 || now >= Number(steps[index - 1]?.date)),
  );

  if (currentStepIndex === -1) {
    currentStepIndex = steps.length;
  }

  let progress = 0;

  if (currentStepIndex > 0) {
    // Calculate progress for completed segments
    for (let i = 0; i < currentStepIndex - 1; i++) {
      progress += 1 / (steps.length - 1);
    }

    // Calculate progress within the current segment
    const segmentStart =
      currentStepIndex === 0 ? 0 : Number(steps[currentStepIndex - 1]?.date);
    const segmentEnd = Number(steps[currentStepIndex]?.date);
    const segmentDuration = segmentEnd - segmentStart;
    const timeElapsedInSegment = now - segmentStart;

    progress +=
      Math.min(timeElapsedInSegment, segmentDuration) /
      segmentDuration /
      (steps.length - 1);
  }

  progress = Math.min(Math.max(progress, 0), 1);

  return { progress, currentStepIndex };
}
