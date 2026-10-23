// The seven pigments of MEC 7, newest on top. Depths in micrometres are the cross-section's own; the colours are
// screen approximations (data, never tokens); grain is the typical particle size the shader draws, in µm.
export const LAYERS = [
  { name: 'Mummy brown', top: 0, bottom: 110, hex: '#5c3b26', grain: 9, ended: 'ended in the 1960s' },
  { name: 'Uranium red', top: 110, bottom: 150, hex: '#d4482b', grain: 7, ended: 'ended in 1943' },
  { name: 'Indian yellow', top: 150, bottom: 235, hex: '#e2a51c', grain: 11, ended: 'ended c. 1910' },
  { name: "Scheele's green", top: 235, bottom: 290, hex: '#6f9a35', grain: 2.6, ended: 'ended c. 1900' },
  { name: 'Lead-tin yellow', top: 290, bottom: 385, hex: '#efd86c', grain: 4.2, ended: 'ended c. 1750' },
  { name: 'Tyrian purple', top: 385, bottom: 420, hex: '#6a1043', grain: 2.2, ended: 'ended 1453' },
  { name: 'Egyptian blue', top: 420, bottom: 550, hex: '#2b5fae', grain: 22, ended: 'lost after Rome' },
];
