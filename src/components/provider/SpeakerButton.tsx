"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeaker } from "@/components/hooks/useSpeaker";

export default function SpeakerButton({ text }: { text: string }) {
  const { speak } = useSpeaker();

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={() => speak(text)}
    >
      <Volume2 />
    </Button>
  );
}
