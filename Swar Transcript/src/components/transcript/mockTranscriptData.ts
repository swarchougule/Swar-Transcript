import type { TranscriptData } from '../../types/transcript';

export const sampleTranscriptData: TranscriptData = {
  video: {
    id: 'dQw4w9WgXcQ',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'The Architecture of Large Language Models: Attention, Context & Deep Reasoning',
    channel: 'Stanford AI Frontier Lab',
    duration: '24:18',
    wordCount: 3420,
    characterCount: 21890,
    publishedDate: 'Sep 2024',
  },
  segments: [
    {
      id: 'seg-1',
      timestamp: '00:00',
      seconds: 0,
      speaker: 'Dr. Evelyn Chen',
      text: "Welcome everyone. Today we are unpacking one of the most transformative architectural shifts in machine intelligence over the past decade: the progression from basic self-attention mechanisms to multi-head causal reasoning architectures.",
    },
    {
      id: 'seg-2',
      timestamp: '01:15',
      seconds: 75,
      speaker: 'Dr. Evelyn Chen',
      text: "When the Transformer paper was published back in 2017, the core breakthrough was dispensing with recurrent recurrence entirely. Instead of passing state sequentially across discrete time steps, dot-product attention allowed the model to compute weighted representations across the entire context window in parallel.",
    },
    {
      id: 'seg-3',
      timestamp: '03:42',
      seconds: 222,
      speaker: 'Marcus Vance',
      text: "And that computational parallelism was really the key enabler for modern scaling laws. Suddenly we weren't bottlenecked by the sequential gradient backpropagation through time. Hardware accelerators like GPUs and TPUs could saturate their matrix multiplication units at scale.",
    },
    {
      id: 'seg-4',
      timestamp: '06:10',
      seconds: 370,
      speaker: 'Dr. Evelyn Chen',
      text: "Exactly. But that brought another challenge: the quadratic compute and memory complexity of the attention matrix with respect to context length. For an N-token sequence, computing N-squared interactions becomes prohibitively expensive once you push toward 32k, 128k, or million-token context windows.",
    },
    {
      id: 'seg-5',
      timestamp: '09:25',
      seconds: 565,
      speaker: 'Marcus Vance',
      text: "Which explains the surge in FlashAttention, grouped-query attention (GQA), and linear attention approximations. Modern open weights models rely on these optimisations to keep inference latency manageable and GPU memory footprints within consumer and enterprise hardware limits.",
    },
    {
      id: 'seg-6',
      timestamp: '13:08',
      seconds: 788,
      speaker: 'Dr. Evelyn Chen',
      text: "Beyond context length, let's discuss test-time compute and chain-of-thought inference. The latest generation of reasoning models doesn't just predict the next token immediately. They generate latent reasoning chains—verifying interim hypotheses, correcting dead-ends, and systematically synthesizing logical deductions.",
    },
    {
      id: 'seg-7',
      timestamp: '17:40',
      seconds: 1060,
      speaker: 'Marcus Vance',
      text: "This shifts the paradigm from pure pre-training parameter scale to inference-time verification. When an LLM has the computational freedom to think before delivering the final answer, accuracy across complex mathematical proofs, code synthesis, and analytical reasoning jumps dramatically.",
    },
    {
      id: 'seg-8',
      timestamp: '21:15',
      seconds: 1275,
      speaker: 'Dr. Evelyn Chen',
      text: "To wrap up our initial segment: whether you are processing technical lectures, investor briefings, or long-form discussions, extracting dense transcripts and structuring them for human readability remains the first and most critical step in knowledge synthesis.",
    },
  ],
  fullText: `Welcome everyone. Today we are unpacking one of the most transformative architectural shifts in machine intelligence over the past decade: the progression from basic self-attention mechanisms to multi-head causal reasoning architectures.

When the Transformer paper was published back in 2017, the core breakthrough was dispensing with recurrent recurrence entirely. Instead of passing state sequentially across discrete time steps, dot-product attention allowed the model to compute weighted representations across the entire context window in parallel.

And that computational parallelism was really the key enabler for modern scaling laws. Suddenly we weren't bottlenecked by the sequential gradient backpropagation through time. Hardware accelerators like GPUs and TPUs could saturate their matrix multiplication units at scale.

Exactly. But that brought another challenge: the quadratic compute and memory complexity of the attention matrix with respect to context length. For an N-token sequence, computing N-squared interactions becomes prohibitively expensive once you push toward 32k, 128k, or million-token context windows.

Which explains the surge in FlashAttention, grouped-query attention (GQA), and linear attention approximations. Modern open weights models rely on these optimisations to keep inference latency manageable and GPU memory footprints within consumer and enterprise hardware limits.

Beyond context length, let's discuss test-time compute and chain-of-thought inference. The latest generation of reasoning models doesn't just predict the next token immediately. They generate latent reasoning chains—verifying interim hypotheses, correcting dead-ends, and systematically synthesizing logical deductions.

This shifts the paradigm from pure pre-training parameter scale to inference-time verification. When an LLM has the computational freedom to think before delivering the final answer, accuracy across complex mathematical proofs, code synthesis, and analytical reasoning jumps dramatically.

To wrap up our initial segment: whether you are processing technical lectures, investor briefings, or long-form discussions, extracting dense transcripts and structuring them for human readability remains the first and most critical step in knowledge synthesis.`,
};
