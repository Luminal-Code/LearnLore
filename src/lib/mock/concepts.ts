export interface MemoryHook {
  hook: string;
  target: string;
}

export interface Concept {
  id: number;
  title: string;
  emoji: string;
  date: string;
  story: string;
  hooks: MemoryHook[];
}

export const concepts: Concept[] = [
  {
    id: 1,
    title: "Photosynthesis",
    emoji: "🌿",
    date: "2h ago",
    story:
      "Once upon a time, in the heart of every leaf, there existed a magical green kingdom called Chloroplast. The tiny villagers, the Chlorophyll family, were sun catchers by trade. Every morning they spread their emerald nets wide, catching golden sunbeams that poured through the leaf's translucent ceiling. With each sunbeam caught, they powered their legendary Water Wheel, which split water droplets into breath and sparkling hydrogen gems. These gems traveled along Crystal Bridge, an electron chain that produced shimmering ATP coins. Next door, at the Calvin Bakery, baker molecules kneaded air and ATP together, producing sweet glucose loaves that fed the entire plant kingdom above.",
    hooks: [
      { hook: "🌿 Sun Catchers", target: "Chlorophyll absorbs light energy" },
      { hook: "💧 Water Wheel", target: "Photolysis splits H₂O into O₂, H+ and e-" },
      { hook: "🌉 Crystal Bridge", target: "Electron transport chain makes ATP" },
      { hook: "🍞 Calvin Bakery", target: "Calvin Cycle turns CO₂ into glucose" },
      { hook: "💨 Breath Chimney", target: "Stomata release oxygen to the atmosphere" },
    ],
  },
  {
    id: 2,
    title: "Quantum Entanglement",
    emoji: "✨",
    date: "1d ago",
    story:
      "Deep in the quantum realm, particles play by different rules. When two particles become entangled, they form an invisible bond that transcends space and time. Measure one particle's spin, and its twin instantly reveals the opposite spin, regardless of the distance between them. It is like having two coins that always land on opposite sides, even when flipped on different continents at the same moment. Einstein famously called this spooky action at a distance, refusing to accept that information could travel faster than light. Yet experiment after experiment confirms it: entangled particles are bound in a shared quantum state, their fates intertwined forever.",
    hooks: [
      { hook: "✨ Quantum Twins", target: "Entangled particles share correlated states" },
      { hook: "👻 Spooky Action", target: "Einstein's famous objection to entanglement" },
      { hook: "🪙 Opposite Coins", target: "Measuring one instantly determines the other" },
      { hook: "🌍 Beyond Distance", target: "The link holds across any distance" },
    ],
  },
  {
    id: 3,
    title: "Mitochondria",
    emoji: "🔬",
    date: "3d ago",
    story:
      "Long ago, a wandering bacterium swam into a larger cell. Instead of being eaten, it was welcomed in as a guest, then as family. Over billions of years, it became the mitochondria, the powerhouse of the cell. This tiny organelle has its own circular DNA, a relic of its independent past, passed down only through the maternal line. Every second, thousands of mitochondria churn out ATP, the energy currency that powers every heartbeat, every thought, every blink. Without them, complex life would never have evolved. We are, quite literally, powered by ancient bacteria.",
    hooks: [
      { hook: "🔬 Ancient Guest", target: "Mitochondria began as an independent bacterium" },
      { hook: "⚡ Powerhouse", target: "It generates ATP from glucose and oxygen" },
      { hook: "👩 Maternal DNA", target: "Mitochondrial DNA is inherited from your mother" },
      { hook: "💎 Energy Currency", target: "ATP powers nearly every cellular process" },
    ],
  },
  {
    id: 4,
    title: "Neural Networks",
    emoji: "🧠",
    date: "1w ago",
    story:
      "In the architecture of intelligence, neurons are the workers and synapses are the connections between them. When you learn something new, pathways strengthen: neurons that fire together, wire together. Neural networks in computers mimic this with layers of artificial neurons. Each connection has a weight that adjusts through training. Show a network enough pictures of cats, and it learns to recognize cats not through rules, but through patterns extracted from millions of examples. The deeper the network, the more complex the patterns it can perceive.",
    hooks: [
      { hook: "🧠 Neural Architects", target: "Layers of artificial neurons process information" },
      { hook: "🔗 Synaptic Weights", target: "Connection strengths are learned from data" },
      { hook: "📚 Pattern Learning", target: "The model learns from examples, not rules" },
      { hook: "📈 Deep Layers", target: "More layers can capture more complex patterns" },
    ],
  },
  {
    id: 5,
    title: "DNA Replication",
    emoji: "🧬",
    date: "2w ago",
    story:
      "Before a cell can divide, it must copy its instructions: a precise molecular photocopying job. The enzyme helicase unzips the double helix, splitting it into two strands. Then DNA polymerase reads each strand and builds a new complementary strand. Adenine always pairs with thymine, and cytosine always pairs with guanine in a perfect molecular dance. The result is two identical DNA molecules, each containing one original strand and one new copy. This semi-conservative method ensures genetic information passes faithfully from generation to generation.",
    hooks: [
      { hook: "🧬 Master Copier", target: "DNA polymerase builds accurate matching strands" },
      { hook: "🌀 Helicase", target: "Helicase unzips the double helix" },
      { hook: "A-T, C-G", target: "Base pairs always match in fixed pairs" },
      { hook: "📋 Semi-Conservative", target: "Each new DNA keeps one old and one new strand" },
    ],
  },
];
