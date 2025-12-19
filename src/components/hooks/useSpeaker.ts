"use client";

export function useSpeaker() {
  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN"; // hi-IN / mr-IN
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.cancel(); // stop previous
    window.speechSynthesis.speak(utterance);
  };

  return { speak };
}
