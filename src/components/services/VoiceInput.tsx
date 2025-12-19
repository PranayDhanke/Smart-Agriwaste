"use client";

import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceInput } from "@/components/hooks/useVoiceInput";

export default function VoiceInput({
  onText,
}: {
  onText: (text: string) => void;
}) {
  const { startListening, listening } = useVoiceInput(onText);

  return (
    <Button
      type="button"
      size="icon"
      variant={listening ? "destructive" : "outline"}
      onClick={startListening}
    >
      {listening ? <MicOff /> : <Mic />}
    </Button>
  );
}
