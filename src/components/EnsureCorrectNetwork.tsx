import { type PropsWithChildren } from "react";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";
import { Button } from "./ui/Button";
import { Chip } from "./ui/Chip";
import { useSwitchChain } from "wagmi";

export function EnsureCorrectNetwork({ children }: PropsWithChildren) {
  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();
  const { switchChain } = useSwitchChain();
  if (!isCorrectNetwork)
    return (
      <Chip
        onClick={() => switchChain({ chainId: correctNetwork?.id as number })}
      >
        Change network
      </Chip>
    );
  return <>{children}</>;
}
