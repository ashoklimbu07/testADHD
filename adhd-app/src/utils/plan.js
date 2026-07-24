// Hardcoded stand-in for the future LLM call: transcript in -> structured task out.
// The transcript itself is still shown verbatim in the quote above the plan card;
// this fixed example is what a real breakdown/scheduling call would eventually replace.
export function planFromTranscript() {
  return {
    title: 'Finish quarterly report',
    emoji: '📝',
    estimateMin: 90,
    deadline: 'Friday',
    energyLevel: 'Deep work',
    subs: [
      { t: 'Outline key sections', d: '20m' },
      { t: 'Draft the content', d: '45m' },
      { t: 'Proofread & send', d: '25m' },
    ],
  };
}
